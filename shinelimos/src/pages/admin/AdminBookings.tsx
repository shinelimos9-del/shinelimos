import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, Send, CheckCircle2, Clock, X, Bell, FileText, Car, PauseCircle, PlayCircle, Navigation, Play, Square } from "lucide-react";
import { getAllBookings, updateBookingStatus, sendPaymentLink, notifyVehicleArrival, sendFinalInvoice, toggleVehicleTracking, toggleStopTimer } from "../../utils/api";
import { calculateQuote } from "../../utils/pricingEngine";
import moment from "moment";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingPaymentId, setSendingPaymentId] = useState<string | null>(null);
  const [arrivalModalBooking, setArrivalModalBooking] = useState<any | null>(null);
  const [waitingMinutes, setWaitingMinutes] = useState<number>(0);
  const [notifyingArrival, setNotifyingArrival] = useState(false);

  const [paymentModalBooking, setPaymentModalBooking] = useState<any | null>(null);
  const [paymentWaitingMins, setPaymentWaitingMins] = useState<number>(0);
  const [sendingCustomPayment, setSendingCustomPayment] = useState(false);

  // Final Invoice Modal State
  const [finalModalBooking, setFinalModalBooking] = useState<any | null>(null);
  const [finalOptions, setFinalOptions] = useState({
    stopsCount: 0,
    waitingMinutes: 0,
    childSeatsCount: 0,
    hasCleaningFee: false,
    cleaningFeeAmount: 150,
    tolls: 0,
    parking: 0,
    isHoliday: false,
    isLateNight: false,
  });
  const [sendingFinalInvoice, setSendingFinalInvoice] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings();
      if (response.success) {
        setBookings(response.bookings);
      } else {
        setError(response.message || "Failed to fetch bookings");
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("An unexpected error occurred while fetching bookings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await updateBookingStatus(id, status);
      if (response.success) {
        fetchBookings();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  const handleToggleTracking = async (bookingId: string, updates: { vehicle_running?: boolean; stop_in_progress?: boolean }) => {
    try {
      const response = await toggleVehicleTracking(bookingId, updates);
      if (response.success) {
        fetchBookings();
      } else {
        alert("Failed to update vehicle tracking status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating vehicle tracking status");
    }
  };

  const handleToggleStopTimer = async (bookingId: string, currentStopInProgress: boolean) => {
    try {
      const action = currentStopInProgress ? 'end' : 'start';
      const response = await toggleStopTimer(bookingId, action);
      if (response.success) {
        if (action === 'end') {
          alert(response.message || "Stop ended and pricing added to invoice!");
        }
        fetchBookings();
      } else {
        alert(response.message || "Failed to update stop timer");
      }
    } catch (err: any) {
      console.error("Error toggling stop timer:", err);
      alert(err.response?.data?.message || "Error updating stop timer");
    }
  };

  const handleSendPaymentLink = async (bookingId: string) => {
    try {
      setSendingPaymentId(bookingId);
      const response = await sendPaymentLink(bookingId);
      if (response.success) {
        alert("Payment link sent to customer!");
        fetchBookings();
      } else {
        alert(response.message || "Failed to send payment link");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending payment link");
    } finally {
      setSendingPaymentId(null);
    }
  };

  const handleSendArrivalNotification = async () => {
    if (!arrivalModalBooking) return;
    try {
      setNotifyingArrival(true);
      const response = await notifyVehicleArrival(arrivalModalBooking._id, waitingMinutes);
      if (response.success) {
        alert(`Vehicle arrival notification sent successfully to customer!\nWait fee calculated: $${response.waiting_fee || 0}`);
        setArrivalModalBooking(null);
        setWaitingMinutes(0);
        fetchBookings();
      } else {
        alert(response.message || "Failed to send arrival notification");
      }
    } catch (error: any) {
      console.error("Error sending arrival notification:", error);
      alert(error.response?.data?.message || "Failed to send arrival notification.");
    } finally {
      setNotifyingArrival(false);
    }
  };

  const handleSendPaymentLinkWithWait = async () => {
    if (!paymentModalBooking) return;
    try {
      setSendingCustomPayment(true);
      const response = await notifyVehicleArrival(paymentModalBooking._id, paymentWaitingMins);
      if (response.success) {
        alert(`Payment link sent to customer!\nWaiting Time: ${paymentWaitingMins} mins (Chargeable Wait Fee: $${response.waiting_fee || 0})`);
        setPaymentModalBooking(null);
        setPaymentWaitingMins(0);
        fetchBookings();
      } else {
        alert(response.message || "Failed to send payment link");
      }
    } catch (error: any) {
      console.error("Error sending payment link:", error);
      alert(error.response?.data?.message || "Failed to send payment link.");
    } finally {
      setSendingCustomPayment(false);
    }
  };

  const handleOpenFinalModal = (booking: any) => {
    setFinalModalBooking(booking);
    setFinalOptions({
      stopsCount: booking.trip_details?.length > 1 ? booking.trip_details.length - 1 : 0,
      waitingMinutes: booking.waiting_minutes || 0,
      childSeatsCount: 0,
      hasCleaningFee: false,
      cleaningFeeAmount: 150,
      tolls: 0,
      parking: 0,
      isHoliday: false,
      isLateNight: false,
    });
  };

  const handleSendFinalInvoiceSubmit = async () => {
    if (!finalModalBooking) return;
    try {
      setSendingFinalInvoice(true);
      const extraOptions = {
        additionalStopsCount: finalOptions.stopsCount,
        waitingMinutes: finalOptions.waitingMinutes,
        childSeatsCount: finalOptions.childSeatsCount,
        hasCleaningFee: finalOptions.hasCleaningFee,
        cleaningFeeAmount: finalOptions.cleaningFeeAmount,
        tolls: finalOptions.tolls,
        parking: finalOptions.parking,
        isHoliday: finalOptions.isHoliday,
        isLateNight: finalOptions.isLateNight,
      };

      const response = await sendFinalInvoice(finalModalBooking._id, extraOptions);
      if (response.success) {
        alert(`Final invoice and payment link sent successfully to booker & passenger!\nGrand Total: $${response.quote?.formattedGrandTotal || ''}`);
        setFinalModalBooking(null);
        fetchBookings();
      } else {
        alert(response.message || "Failed to send final invoice");
      }
    } catch (error: any) {
      console.error("Error sending final invoice:", error);
      alert(error.response?.data?.message || "Failed to send final invoice.");
    } finally {
      setSendingFinalInvoice(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const searchStr = searchTerm.toLowerCase();
    const firstName = b.contact_details?.booker?.first_name || "";
    const lastName = b.contact_details?.booker?.last_name || "";
    const customerName = `${firstName} ${lastName}`.toLowerCase();
    const vehicleName = b.vehicle_details?.vehicle_name?.toLowerCase() || "";
    const email = b.contact_details?.booker?.email?.toLowerCase() || "";
    
    return customerName.includes(searchStr) || 
           vehicleName.includes(searchStr) || 
           email.includes(searchStr);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchBookings}
            className="bg-white text-black px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif-lux text-white">All Bookings</h1>
          <p className="text-white text-sm mt-1">Manage and track your customer reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#050505] border border-white/10 rounded-xl px-4 py-2 w-64 focus-within:border-white/30 transition-all">
            <Search size={16} className="text-white" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder:text-white"
            />
          </div>
        </div>
      </div>

      <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Vehicle Name</th>
                <th className="p-4 font-medium">Occasion Name</th>
                <th className="p-4 font-medium">Trip Type</th>
                <th className="p-4 font-medium">Enquiry Date</th>
                <th className="p-4 font-medium">Booking Status</th>
                <th className="p-4 font-medium">Payment Status</th>
                <th className="p-4 font-medium">Live Tracking</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {currentBookings.length > 0 ? (
                currentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold border border-white/10">
                          {b.contact_details?.booker?.first_name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {b.contact_details?.booker?.first_name || "Unknown"} {b.contact_details?.booker?.last_name || ""}
                          </div>
                          <div className="text-[11px] text-white">{b.contact_details?.booker?.email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white">{b.vehicle_details?.vehicle_name || "N/A"}</td>
                    <td className="p-4 text-white">{b.trip_details[0]?.occasion || "N/A"}</td>
                    <td className="p-4 text-white">{b.trip_details[0]?.trip_type || "N/A"}</td>
                    <td className="p-4 text-white">{moment(b.created_at).format("DD MMM YYYY")}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.booking_status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {b.booking_status === 'completed' ? 'Complete' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.payment_status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        b.payment_status === 'requested' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {b.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleToggleTracking(b._id, { vehicle_running: !b.vehicle_running })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                            b.vehicle_running
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse"
                              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                          title="Toggle Vehicle Running / En Route status"
                        >
                          <Car size={12} />
                          {b.vehicle_running ? "Running" : "Vehicle Idle"}
                        </button>
                        <button
                          onClick={() => handleToggleStopTimer(b._id, b.stop_in_progress)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                            b.stop_in_progress
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"
                              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                          title={b.stop_in_progress ? "Click to END stop & calculate stop duration pricing onto invoice" : "Click to START tracking an additional stop"}
                        >
                          {b.stop_in_progress ? <Square size={12} className="text-amber-400 fill-amber-400" /> : <Play size={12} className="text-emerald-400 fill-emerald-400" />}
                          {b.stop_in_progress ? "End Stop & Price" : "Start Stop"}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setArrivalModalBooking(b);
                            setWaitingMinutes(b.waiting_minutes || 0);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                            b.vehicle_arrived
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                          }`}
                          title="Notify booker & passenger that vehicle has arrived at pickup location"
                        >
                          <Bell size={12} />
                          {b.vehicle_arrived ? "Vehicle Arrived" : "Notify Arrival"}
                        </button>

                        <button 
                          onClick={() => {
                            setPaymentModalBooking(b);
                            setPaymentWaitingMins(b.waiting_minutes || 0);
                          }}
                          disabled={sendingPaymentId === b._id}
                          className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Send Stripe Payment Link for trip / waiting time"
                        >
                          {sendingPaymentId === b._id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Send Payment Link
                        </button>

                        <button 
                          onClick={() => handleOpenFinalModal(b)}
                          className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Track extra trip charges (stops, waiting, tolls, parking) & send final payment link after drop"
                        >
                          <FileText size={12} />
                          Send Final Invoice
                        </button>

                        {b.payment_status === 'completed' && (
                           <div className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1.5 rounded-lg border border-green-500/20">
                             <CheckCircle2 size={12} /> Paid
                           </div>
                        )}

                        {b.booking_status === 'completed' ? (
                          <button 
                            onClick={() => handleUpdateStatus(b._id, 'pending')}
                            className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          >
                            Mark Pending
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(b._id, 'completed')}
                            className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-white/50">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white">
             <div>
               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBookings.length)} of {filteredBookings.length} results
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium text-white flex items-center gap-1"
                >
                   <ChevronLeft size={14} /> Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-white text-black' : 'border border-white/10 hover:bg-white/5 text-white'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium text-white flex items-center gap-1"
                >
                   Next <ChevronRight size={14} />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Arrival Notification & Waiting Time Modal */}
      {arrivalModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2 text-gold">
                <Bell size={18} />
                <h3 className="font-semibold text-lg text-white">Notify Vehicle Arrival</h3>
              </div>
              <button 
                onClick={() => setArrivalModalBooking(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="glass rounded-xl p-4 space-y-2 border border-white/5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Booker Name:</span>
                  <span className="text-white font-medium">{arrivalModalBooking.contact_details?.booker?.first_name} {arrivalModalBooking.contact_details?.booker?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Recipient Email:</span>
                  <span className="text-gold font-mono text-xs">{arrivalModalBooking.contact_details?.booker?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Vehicle:</span>
                  <span className="text-white">{arrivalModalBooking.vehicle_details?.vehicle_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Pickup Address:</span>
                  <span className="text-white truncate max-w-[220px]">{arrivalModalBooking.trip_details?.[0]?.pickup_location}</span>
                </div>
              </div>

              {/* Waiting Time Policy Reminder */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Clock size={14} /> Waiting Time Policy Rules
                </div>
                <p className="text-amber-200/90">• First 15 minutes: <strong className="text-white">FREE ($0.00)</strong></p>
                <p className="text-amber-200/90">• After 15 minutes:</p>
                <ul className="pl-4 list-disc text-amber-200/80 space-y-0.5">
                  <li>Sedan: $1.00 / minute</li>
                  <li>SUV: $1.50 / minute</li>
                  <li>Sprinter: $2.00 / minute</li>
                </ul>
              </div>

              {/* Waiting Minutes Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/70 uppercase tracking-wider">
                  Total Waiting Time Elapsed (Minutes):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={waitingMinutes}
                    onChange={(e) => setWaitingMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-gold/60"
                    placeholder="0"
                  />
                  <span className="text-xs text-white/50 shrink-0">mins</span>
                </div>
                <p className="text-[11px] text-white/40">
                  {waitingMinutes <= 15 ? (
                    <span className="text-green-400">✓ Within 15 minutes free window ($0.00 extra charge).</span>
                  ) : (
                    <span className="text-amber-400">
                      ⚡ {waitingMinutes - 15} chargeable minutes. New payment link will be sent.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/2">
              <button
                onClick={() => setArrivalModalBooking(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendArrivalNotification}
                disabled={notifyingArrival}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-gold text-black hover:bg-gold/90 transition-all flex items-center gap-2 disabled:opacity-50 font-bold"
              >
                {notifyingArrival ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send Arrival Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEPARATE PAYMENT LINK MODAL */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2 text-blue-400">
                <Send size={18} />
                <h3 className="font-semibold text-lg text-white">Send Stripe Payment Link</h3>
              </div>
              <button 
                onClick={() => setPaymentModalBooking(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="glass rounded-xl p-4 space-y-2 border border-white/5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Booker Name:</span>
                  <span className="text-white font-medium">{paymentModalBooking.contact_details?.booker?.first_name} {paymentModalBooking.contact_details?.booker?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Booker Email:</span>
                  <span className="text-blue-400 font-mono text-xs">{paymentModalBooking.contact_details?.booker?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Trip Base Price:</span>
                  <span className="text-gold font-bold">${paymentModalBooking.vehicle_details?.estimated_price || "0.00"}</span>
                </div>
              </div>

              {/* Waiting Time Fee Calculator Option */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/70 uppercase tracking-wider">
                  Include Waiting Time Charge (Minutes):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={paymentWaitingMins}
                    onChange={(e) => setPaymentWaitingMins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500/60"
                    placeholder="0"
                  />
                  <span className="text-xs text-white/50 shrink-0">mins</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs text-white/70 space-y-1">
                  <p>• First 15 minutes free window.</p>
                  <p>• Charges after 15 mins: Sedan $1.00/m | SUV $1.50/m | Sprinter $2.00/m</p>
                  {paymentWaitingMins > 15 && (
                    <p className="text-blue-400 font-bold mt-1">
                      ⚡ Chargeable waiting time: {paymentWaitingMins - 15} minutes.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/2">
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPaymentLinkWithWait}
                disabled={sendingCustomPayment}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2 disabled:opacity-50 font-bold"
              >
                {sendingCustomPayment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send Payment Link to Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL INVOICE & TRIP EXTRAS TRACKING MODAL */}
      {finalModalBooking && (() => {
        const liveQuote = calculateQuote({
          vehicle: finalModalBooking.vehicle_details,
          bookingType: finalModalBooking.trip_details?.[0]?.trip_type || 'one-way',
          distanceMiles: finalModalBooking.trip_details?.[0]?.distance_miles || 0,
          durationMinutes: 0,
          pickupLocation: finalModalBooking.trip_details?.[0]?.pickup_location,
          pickupTime: finalModalBooking.trip_details?.[0]?.start_time,
          pickupDate: finalModalBooking.trip_details?.[0]?.date,
          flightInfo: finalModalBooking.trip_details?.[0]?.flight_details,
          occasion: finalModalBooking.trip_details?.[0]?.occasion,
          waitingMinutes: finalOptions.waitingMinutes,
          additionalStopsCount: finalOptions.stopsCount,
          childSeatsCount: finalOptions.childSeatsCount,
          hasCleaningFee: finalOptions.hasCleaningFee,
          cleaningFeeAmount: finalOptions.cleaningFeeAmount,
          tolls: finalOptions.tolls,
          parking: finalOptions.parking,
          isHoliday: finalOptions.isHoliday,
          isLateNight: finalOptions.isLateNight,
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <div className="flex items-center gap-2 text-purple-400">
                  <FileText size={20} />
                  <div>
                    <h3 className="font-semibold text-lg text-white">Final Trip Invoice & Extras Tracking</h3>
                    <p className="text-xs text-white/50">Track trip extras and send final invoice payment link after drop-off.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFinalModalBooking(null)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Trip & Booker Info Header */}
                <div className="grid sm:grid-cols-2 gap-3 glass p-4 rounded-xl border border-white/5 text-xs">
                  <div><span className="text-white/50">Customer:</span> <strong className="text-white">{finalModalBooking.contact_details?.booker?.first_name} {finalModalBooking.contact_details?.booker?.last_name}</strong></div>
                  <div><span className="text-white/50">Email:</span> <span className="text-purple-300 font-mono">{finalModalBooking.contact_details?.booker?.email}</span></div>
                  <div><span className="text-white/50">Vehicle:</span> <span className="text-white font-medium">{finalModalBooking.vehicle_details?.vehicle_name}</span></div>
                  <div><span className="text-white/50">Service:</span> <span className="text-gold font-medium">{finalModalBooking.trip_details?.[0]?.trip_type || 'One Way'}</span></div>
                </div>

                {/* Extras Tracking Controls */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2">
                    🎛️ Trip Extras & Surcharges Tracking
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    {/* Additional Stops */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Additional Stops Count:</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.additionalStopsFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.stopsCount}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, stopsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                      <span className="text-[10px] text-white/40">Rate: Sedan $15 / SUV $20 / Sprinter $30 per stop</span>
                    </div>

                    {/* Waiting Time Mins */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Waiting Time (Minutes):</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.waitingMinutes}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, waitingMinutes: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                      <span className="text-[10px] text-white/40">First 15 mins FREE. After 15 mins: Sedan $1/m, SUV $1.50/m, Sprinter $2/m</span>
                    </div>

                    {/* Child Seats */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Total Child Seats:</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.childSeatsCount}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, childSeatsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                      <span className="text-[10px] text-white/40">First seat FREE. Additional seats $15 each</span>
                    </div>

                    {/* Tolls */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Tolls Amount ($):</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.tolls.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.tolls}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, tolls: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                    </div>

                    {/* Parking */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Parking Amount ($):</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.parking.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.parking}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, parking: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                    </div>

                    {/* Cleaning Fee */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="flex items-center gap-2 font-medium text-white/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={finalOptions.hasCleaningFee}
                          onChange={(e) => setFinalOptions(prev => ({ ...prev, hasCleaningFee: e.target.checked }))}
                          className="rounded accent-purple-500 w-4 h-4"
                        />
                        <span>Apply Cleaning Fee</span>
                      </label>
                      {finalOptions.hasCleaningFee && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/50">$</span>
                          <input
                            type="number"
                            min={150}
                            value={finalOptions.cleaningFeeAmount}
                            onChange={(e) => setFinalOptions(prev => ({ ...prev, cleaningFeeAmount: Math.max(0, parseFloat(e.target.value) || 150) }))}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs outline-none"
                            placeholder="150"
                          />
                        </div>
                      )}
                      <span className="text-[10px] text-white/40 block">Starts at $150 if vehicle cleaning required</span>
                    </div>
                  </div>

                  {/* Manual Surcharge Toggles */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                      <input
                        type="checkbox"
                        checked={finalOptions.isLateNight || liveQuote.breakdown.isLateNight}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, isLateNight: e.target.checked }))}
                        className="rounded accent-purple-500 w-4 h-4"
                      />
                      <span>🌙 Late Night Surcharge (15% for 12 AM - 5 AM)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                      <input
                        type="checkbox"
                        checked={finalOptions.isHoliday || liveQuote.breakdown.isHoliday}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, isHoliday: e.target.checked }))}
                        className="rounded accent-purple-500 w-4 h-4"
                      />
                      <span>🎆 Holiday Surcharge (20%)</span>
                    </label>
                  </div>
                </div>

                {/* Live Itemized Breakdown Table */}
                <div className="bg-black/60 border border-white/10 rounded-xl p-5 space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold border-b border-white/10 pb-2 mb-3">
                    📊 Live Final Invoice Calculation Breakdown
                  </h4>
                  <div className="flex justify-between text-white/70"><span>Base Fare:</span><span>${liveQuote.breakdown.baseFare.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white/70"><span>Mileage Charge:</span><span>${liveQuote.breakdown.mileageCharge.toFixed(2)}</span></div>
                  {liveQuote.isHourly && <div className="flex justify-between text-white/70"><span>Hourly Charge:</span><span>${liveQuote.breakdown.hourlyCharge.toFixed(2)}</span></div>}
                  {liveQuote.isAirportPickup && <div className="flex justify-between text-emerald-400"><span>Airport Pickup Fee (Meet & Greet Included):</span><span>${liveQuote.breakdown.airportPickupFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.additionalStopsFee > 0 && <div className="flex justify-between text-white/70"><span>Additional Stops Fee:</span><span>${liveQuote.breakdown.additionalStopsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.waitingTimeFee > 0 && <div className="flex justify-between text-amber-300"><span>Waiting Time Fee:</span><span>${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.childSeatsFee > 0 && <div className="flex justify-between text-white/70"><span>Child Seats Fee:</span><span>${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.cleaningFee > 0 && <div className="flex justify-between text-rose-300"><span>Cleaning Fee:</span><span>${liveQuote.breakdown.cleaningFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.tolls > 0 && <div className="flex justify-between text-white/70"><span>Tolls:</span><span>${liveQuote.breakdown.tolls.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.parking > 0 && <div className="flex justify-between text-white/70"><span>Parking:</span><span>${liveQuote.breakdown.parking.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.minimumFareAdjustment > 0 && <div className="flex justify-between text-blue-300"><span>Minimum Fare Adjustment:</span><span>${liveQuote.breakdown.minimumFareAdjustment.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2"><span>Subtotal:</span><span>${liveQuote.breakdown.subtotal.toFixed(2)}</span></div>
                  {liveQuote.breakdown.lateNightSurcharge > 0 && <div className="flex justify-between text-amber-300"><span>Late Night Surcharge (15%):</span><span>${liveQuote.breakdown.lateNightSurcharge.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.holidaySurcharge > 0 && <div className="flex justify-between text-amber-300"><span>Holiday Surcharge (20%):</span><span>${liveQuote.breakdown.holidaySurcharge.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-white/70"><span>Gratuity (20%):</span><span>${liveQuote.breakdown.gratuity.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white/70"><span>Credit Card Fee (3%):</span><span>${liveQuote.breakdown.creditCardFee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-lg text-gold border-t-2 border-gold/50 pt-3 mt-2">
                    <span>Final Total Due:</span>
                    <span>${liveQuote.formattedGrandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/2 shrink-0">
                <button
                  onClick={() => setFinalModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendFinalInvoiceSubmit}
                  disabled={sendingFinalInvoice}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {sendingFinalInvoice ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Final Invoice & Payment Link
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
