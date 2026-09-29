import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, Send, CheckCircle2, Clock, X, Bell, FileText, Play, Trash2, Eye, Edit2 } from "lucide-react";
import { getAllBookings, updateBookingStatus, notifyVehicleArrival, sendFinalInvoice, startRide, deleteBooking } from "../../utils/api";
import { calculateQuote, parseHours } from "../../utils/pricingEngine";
import BookingDetailModal from "../../components/BookingDetailModal";
import moment from "moment";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [arrivalModalBooking, setArrivalModalBooking] = useState<any | null>(null);
  const [waitingMinutes, setWaitingMinutes] = useState<number>(0);
  const [notifyingArrival, setNotifyingArrival] = useState(false);
  const [startingRideId, setStartingRideId] = useState<string | null>(null);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Final Invoice Modal State
  const [finalModalBooking, setFinalModalBooking] = useState<any | null>(null);
  const [isEditingSubtotal, setIsEditingSubtotal] = useState(false);
  const [finalOptions, setFinalOptions] = useState<any>({
    subtotal: '',
    stopsCount: 0,
    waitingMinutes: 0,
    childSeatsCount: 0,
    hasCleaningFee: false,
    cleaningFeeAmount: 150,
    tolls: 0,
    parking: 0,
    isHoliday: false,
    isLateNight: false,
    discount: 0,
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

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this booking from the database?")) {
      try {
        const response = await deleteBooking(id);
        if (response.success) {
          fetchBookings();
        } else {
          alert(response.message || "Failed to delete booking");
        }
      } catch (error) {
        console.error(error);
        alert("Error deleting booking");
      }
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

  const getLiveWaitMins = (arrivalTime?: string | Date) => {
    if (!arrivalTime) return 0;
    const arrivalMs = new Date(arrivalTime).getTime();
    if (isNaN(arrivalMs)) return 0;
    const elapsedMs = Math.max(0, now - arrivalMs);
    return Math.floor(elapsedMs / 60000);
  };

  const handleStartRide = async (bookingId: string) => {
    try {
      setStartingRideId(bookingId);
      const response = await startRide(bookingId);
      if (response && response.success) {
        alert(`Ride started successfully!\nTotal waiting time locked at ${response.waiting_minutes || 0} mins (Wait Fee: $${response.waiting_fee || 0}).`);
        fetchBookings();
      } else {
        alert(response?.message || "Failed to start ride");
      }
    } catch (error: any) {
      console.error("Error starting ride:", error);
      alert(error.response?.data?.message || "Failed to start ride.");
    } finally {
      setStartingRideId(null);
    }
  };



  const handleOpenFinalModal = (booking: any) => {
    const bookingObj = {
      ...booking,
      _id: booking.id || booking._id,
      contact_details: booking.contact_details || {
        booker: {
          first_name: booking.name ? booking.name.split(' ')[0] : 'Customer',
          last_name: booking.name ? booking.name.split(' ').slice(1).join(' ') : '',
          email: booking.email || '',
        }
      },
      vehicle_details: booking.vehicle_details || { vehicle_name: booking.vehicle_name || 'Executive Sedan' },
      trip_details: booking.trip_details || [{ trip_type: booking.trip || 'One Way' }],
      waiting_minutes: booking.waiting_minutes || 0,
      additional_stops_count: booking.additional_stops_count || 0,
      price_breakdown: booking.price_breakdown || {},
    };

    const tripSegment = bookingObj.trip_details?.[0] || {};
    const distance = tripSegment.distance_miles || tripSegment.miles || bookingObj.price_breakdown?.effectiveMiles || 0;
    const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (bookingObj.price_breakdown?.durationMinutes || 0);

    const rawPriceStr = typeof booking.price === 'string' ? booking.price.replace(/[^0-9.]/g, '') : (booking.price || booking.vehicle_details?.estimated_price || booking.estimated_price);
    let initialSubtotal = booking.price_breakdown?.originalSubtotal
      || booking.price_breakdown?.mainBookingPrice
      || booking.price_breakdown?.rawSubtotal
      || booking.vehicle_details?.estimated_price
      || booking.price_breakdown?.subtotal
      || parseFloat(rawPriceStr)
      || 0;

    // If no stored subtotal or <= 0, dynamically calculate actual price from trip details
    if (initialSubtotal <= 0) {
      const autoQuote = calculateQuote({
        vehicle: bookingObj.vehicle_details || { vehicle_name: 'Executive Sedan' },
        bookingType: tripSegment.trip_type || 'one-way',
        distanceMiles: distance,
        durationMinutes: durationMins,
        durationHours: parseHours(tripSegment.duration) || 0,
        pickupLocation: tripSegment.pickup_location,
        pickupTime: tripSegment.start_time,
        pickupDate: tripSegment.date,
        flightInfo: tripSegment.flight_details,
        occasion: tripSegment.occasion,
      });
      initialSubtotal = autoQuote.breakdown.mainBookingPrice || autoQuote.breakdown.subtotal || 0;
    }

    setFinalModalBooking(bookingObj);
    setIsEditingSubtotal(false);
    setFinalOptions({
      subtotal: bookingObj.price_breakdown?.isSubtotalEdited && bookingObj.price_breakdown?.effectiveSubtotal > 0
        ? Number(bookingObj.price_breakdown.effectiveSubtotal).toFixed(2)
        : '',
      stopsCount: booking.trip_details?.length > 1 ? booking.trip_details.length - 1 : (bookingObj.additional_stops_count || 0),
      waitingMinutes: booking.waiting_minutes || 0,
      childSeatsCount: bookingObj.price_breakdown?.childSeatsCount || 0,
      hasCleaningFee: Boolean(bookingObj.price_breakdown?.cleaningFee > 0),
      cleaningFeeAmount: bookingObj.price_breakdown?.cleaningFee || 150,
      tolls: bookingObj.price_breakdown?.tolls || 0,
      parking: bookingObj.price_breakdown?.parking || 0,
      isHoliday: Boolean(bookingObj.price_breakdown?.isHoliday),
      isLateNight: Boolean(bookingObj.price_breakdown?.isLateNight),
      discount: bookingObj.price_breakdown?.discount || 0,
    });
  };

  const handleSendFinalInvoiceSubmit = async () => {
    if (!finalModalBooking) return;

    const tripSegment = finalModalBooking.trip_details?.[0] || {};
    const distance = tripSegment.distance_miles || tripSegment.miles || finalModalBooking.price_breakdown?.effectiveMiles || 0;
    const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (finalModalBooking.price_breakdown?.durationMinutes || 0);

    const rawPriceStr = typeof finalModalBooking.price === 'string' ? finalModalBooking.price.replace(/[^0-9.]/g, '') : (finalModalBooking.price || finalModalBooking.vehicle_details?.estimated_price || finalModalBooking.estimated_price);
    let initialSubtotal = finalModalBooking.price_breakdown?.originalSubtotal
      || finalModalBooking.price_breakdown?.mainBookingPrice
      || finalModalBooking.price_breakdown?.rawSubtotal
      || finalModalBooking.vehicle_details?.estimated_price
      || finalModalBooking.price_breakdown?.subtotal
      || parseFloat(rawPriceStr)
      || 0;

    if (initialSubtotal <= 0) {
      const autoQuote = calculateQuote({
        vehicle: finalModalBooking.vehicle_details || { vehicle_name: 'Executive Sedan' },
        bookingType: tripSegment.trip_type || 'one-way',
        distanceMiles: distance,
        durationMinutes: durationMins,
        durationHours: parseHours(tripSegment.duration) || 0,
        pickupLocation: tripSegment.pickup_location,
        pickupTime: tripSegment.start_time,
        pickupDate: tripSegment.date,
        flightInfo: tripSegment.flight_details,
        occasion: tripSegment.occasion,
      });
      initialSubtotal = autoQuote.breakdown.mainBookingPrice || autoQuote.breakdown.subtotal || 0;
    }

    let subtotalToSend = initialSubtotal;
    if (finalOptions.subtotal !== '' && finalOptions.subtotal !== null && finalOptions.subtotal !== undefined) {
      const parsedSubtotal = Number(finalOptions.subtotal);
      if (isNaN(parsedSubtotal) || !isFinite(parsedSubtotal)) {
        alert("Invalid subtotal amount: must be a valid number.");
        return;
      }
      if (parsedSubtotal < 0) {
        alert("Subtotal amount cannot be negative.");
        return;
      }
      const subtotalStr = String(finalOptions.subtotal).trim();
      const dotIndex = subtotalStr.indexOf('.');
      if (dotIndex !== -1 && subtotalStr.length - dotIndex - 1 > 2) {
        alert("Subtotal amount cannot exceed 2 decimal places.");
        return;
      }
      subtotalToSend = parsedSubtotal;
    }

    try {
      setSendingFinalInvoice(true);
      const extraOptions = {
        subtotal: subtotalToSend,
        additionalStopsCount: finalOptions.stopsCount,
        waitingMinutes: finalOptions.waitingMinutes,
        childSeatsCount: finalOptions.childSeatsCount,
        hasCleaningFee: finalOptions.hasCleaningFee,
        cleaningFeeAmount: finalOptions.cleaningFeeAmount,
        tolls: finalOptions.tolls,
        parking: finalOptions.parking,
        isHoliday: finalOptions.isHoliday,
        isLateNight: finalOptions.isLateNight,
        discount: finalOptions.discount,
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
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {currentBookings.length > 0 ? (
                currentBookings.map((b) => (
                  <tr 
                    key={b._id} 
                    onClick={() => setSelectedDetailBooking(b)}
                    className="hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold border border-white/10">
                          {b.contact_details?.booker?.first_name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="text-white font-medium group-hover:text-gold transition-colors flex items-center gap-1.5">
                            {b.contact_details?.booker?.first_name || "Unknown"} {b.contact_details?.booker?.last_name || ""}
                          </div>
                          <div className="text-[11px] text-white/60">{b.contact_details?.booker?.email || "No email"}</div>
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

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailBooking(b);
                          }}
                          className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Open full details view for this booking"
                        >
                          <Eye size={12} />
                          View Details
                        </button>

                        {!b.ride_started && !b.vehicle_arrived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setArrivalModalBooking(b);
                              setWaitingMinutes(b.waiting_minutes || 0);
                            }}
                            className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                            title="Notify booker & passenger that vehicle has arrived at pickup location"
                          >
                            <Bell size={12} />
                            Notify Arrival
                          </button>
                        )}

                        {b.vehicle_arrived && !b.ride_started && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRide(b._id);
                            }}
                            disabled={startingRideId === b._id}
                            className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 animate-pulse"
                            title="Click to START RIDE and STOP waiting timer calculation"
                          >
                            {startingRideId === b._id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            Start Ride ({getLiveWaitMins(b.arrival_time)}m wait)
                          </button>
                        )}

                        {b.ride_started && (
                          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                            <CheckCircle2 size={12} />
                            Ride Started ({b.waiting_minutes || 0}m wait)
                          </div>
                        )}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFinalModal(b);
                          }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(b._id, 'pending');
                            }}
                            className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          >
                            Mark Pending
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(b._id, 'completed');
                            }}
                            className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          >
                            Mark Complete
                          </button>
                        )}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(b._id);
                          }}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Delete booking permanently from database"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
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



      {/* FINAL INVOICE & TRIP EXTRAS TRACKING MODAL */}
      {finalModalBooking && (() => {
        const tripSegment = finalModalBooking.trip_details?.[0] || {};
        const distance = tripSegment.distance_miles || tripSegment.miles || finalModalBooking.price_breakdown?.effectiveMiles || 0;
        const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (finalModalBooking.price_breakdown?.durationMinutes || 0);

        // Stored initial main booking subtotal from database creation time
        const rawPriceStr = typeof finalModalBooking.price === 'string' ? finalModalBooking.price.replace(/[^0-9.]/g, '') : (finalModalBooking.price || finalModalBooking.vehicle_details?.estimated_price || finalModalBooking.estimated_price);
        let initialSubtotal = finalModalBooking.price_breakdown?.originalSubtotal
          || finalModalBooking.price_breakdown?.mainBookingPrice
          || finalModalBooking.price_breakdown?.rawSubtotal
          || finalModalBooking.vehicle_details?.estimated_price
          || finalModalBooking.price_breakdown?.subtotal
          || parseFloat(rawPriceStr)
          || 0;

        // If no stored subtotal or <= 0, dynamically calculate actual price from trip details
        if (initialSubtotal <= 0) {
          const autoQuote = calculateQuote({
            vehicle: finalModalBooking.vehicle_details || { vehicle_name: 'Executive Sedan' },
            bookingType: tripSegment.trip_type || 'one-way',
            distanceMiles: distance,
            durationMinutes: durationMins,
            durationHours: parseHours(tripSegment.duration) || 0,
            pickupLocation: tripSegment.pickup_location,
            pickupTime: tripSegment.start_time,
            pickupDate: tripSegment.date,
            flightInfo: tripSegment.flight_details,
            occasion: tripSegment.occasion,
          });
          initialSubtotal = autoQuote.breakdown.mainBookingPrice || autoQuote.breakdown.subtotal || 0;
        }

        const effectiveSubtotal = (finalOptions.subtotal !== undefined && finalOptions.subtotal !== null && finalOptions.subtotal !== '' && !isNaN(Number(finalOptions.subtotal)) && Number(finalOptions.subtotal) >= 0)
          ? Number(finalOptions.subtotal)
          : initialSubtotal;

        const isSubtotalModified = (finalOptions.subtotal !== '' && finalOptions.subtotal !== null && finalOptions.subtotal !== undefined) && Math.abs(effectiveSubtotal - initialSubtotal) > 0.001;

        const liveQuote = calculateQuote({
          vehicle: finalModalBooking.vehicle_details || { vehicle_name: 'Executive Sedan' },
          bookingType: tripSegment.trip_type || 'one-way',
          distanceMiles: distance,
          durationMinutes: durationMins,
          durationHours: parseHours(tripSegment.duration) || finalModalBooking.price_breakdown?.durationHours || 0,
          pickupLocation: tripSegment.pickup_location,
          pickupTime: tripSegment.start_time,
          pickupDate: tripSegment.date,
          flightInfo: tripSegment.flight_details,
          occasion: tripSegment.occasion,
          waitingMinutes: finalOptions.waitingMinutes,
          additionalStopsCount: finalOptions.stopsCount,
          childSeatsCount: finalOptions.childSeatsCount,
          hasCleaningFee: finalOptions.hasCleaningFee,
          cleaningFeeAmount: finalOptions.cleaningFeeAmount,
          tolls: finalOptions.tolls,
          parking: finalOptions.parking,
          isHoliday: finalOptions.isHoliday,
          isLateNight: finalOptions.isLateNight,
          discount: finalOptions.discount,
          initialBookingSubtotal: effectiveSubtotal,
          originalSubtotal: initialSubtotal,
          isExplicitSubtotal: isSubtotalModified,
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#141416] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/90 my-auto text-left">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.03] shrink-0">
                <div className="flex items-center gap-3 text-purple-400">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <FileText size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-white tracking-wide">Final Trip Invoice & Extras Tracking</h3>
                    <p className="text-sm text-white/60 mt-0.5">Track trip extras and send final invoice payment link after drop-off.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFinalModalBooking(null)}
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-7 flex-1 text-white">
                {/* Trip & Booker Info Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-sm">
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Customer</span>
                    <strong className="text-white text-sm font-medium mt-1 block truncate">
                      {finalModalBooking.contact_details?.booker?.first_name} {finalModalBooking.contact_details?.booker?.last_name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Email</span>
                    <span className="text-purple-300 font-mono text-sm mt-1 block truncate">
                      {finalModalBooking.contact_details?.booker?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Vehicle</span>
                    <span className="text-white font-medium text-sm mt-1 block truncate">
                      {finalModalBooking.vehicle_details?.vehicle_name || 'Executive Sedan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Service</span>
                    <span className="text-gold font-medium text-sm mt-1 block truncate">
                      {finalModalBooking.trip_details?.[0]?.trip_type || 'One Way'}
                    </span>
                  </div>
                </div>

                {/* Extras Tracking Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2.5 flex items-center gap-2">
                    <span>🎛️</span> Trip Extras & Surcharges Tracking
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {/* Waiting Time Mins */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Waiting Time (Minutes):</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.waitingMinutes}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, waitingMinutes: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                      <span className="text-xs text-white/50 block">First 15 mins FREE. After 15 mins: Sedan $1/m, SUV $1.50/m, Sprinter $2/m</span>
                    </div>

                    {/* Child Seats */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Total Child Seats:</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.childSeatsCount}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, childSeatsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                      <span className="text-xs text-white/50 block">First seat FREE. Additional seats $15 each</span>
                    </div>

                    {/* Tolls */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Tolls Amount ($):</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.tolls.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.tolls}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, tolls: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                    </div>

                    {/* Parking */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Parking Amount ($):</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.parking.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.parking}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, parking: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                    </div>

                    {/* Cleaning Fee */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="flex items-center gap-3 font-semibold text-white cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={finalOptions.hasCleaningFee}
                          onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, hasCleaningFee: e.target.checked }))}
                          className="rounded accent-purple-500 w-5 h-5 cursor-pointer"
                        />
                        <span>Apply Cleaning Fee</span>
                      </label>
                      {finalOptions.hasCleaningFee && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/60 font-mono text-base">$</span>
                          <input
                            type="number"
                            min={150}
                            value={finalOptions.cleaningFeeAmount}
                            onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, cleaningFeeAmount: Math.max(0, parseFloat(e.target.value) || 150) }))}
                            className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2 text-white font-mono text-sm outline-none"
                            placeholder="150"
                          />
                        </div>
                      )}
                      <span className="text-xs text-white/50 block">Starts at $150 if vehicle cleaning required</span>
                    </div>

                    {/* Discount */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Discount ($):</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm">-${((liveQuote.breakdown.discount || 0)).toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.discount === 0 ? '' : finalOptions.discount}
                        placeholder="0.00"
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setFinalOptions((prev: any) => ({ ...prev, discount: isNaN(val) ? 0 : Math.max(0, val) }));
                        }}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                      <span className="text-xs text-white/50 block">Custom discount deducted from invoice total</span>
                    </div>
                  </div>

                  {/* Manual Surcharge Toggles */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-3 text-sm text-white/90 font-medium cursor-pointer bg-white/[0.03] p-4 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-colors">
                      <input
                        type="checkbox"
                        checked={finalOptions.isLateNight || liveQuote.breakdown.isLateNight}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, isLateNight: e.target.checked }))}
                        className="rounded accent-purple-500 w-5 h-5 cursor-pointer"
                      />
                      <span>🌙 Late Night Surcharge (15% for 12 AM - 5 AM)</span>
                    </label>

                    <label className="flex items-center gap-3 text-sm text-white/90 font-medium cursor-pointer bg-white/[0.03] p-4 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-colors">
                      <input
                        type="checkbox"
                        checked={finalOptions.isHoliday || liveQuote.breakdown.isHoliday}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, isHoliday: e.target.checked }))}
                        className="rounded accent-purple-500 w-5 h-5 cursor-pointer"
                      />
                      <span>🎆 Holiday Surcharge (20%)</span>
                    </label>
                  </div>
                </div>

                {/* Live Itemized Breakdown Table */}
                <div className="bg-black/70 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3.5 text-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gold border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                    <span>📊</span> Live Final Invoice Calculation Breakdown
                  </h4>

                  {/* Booking Subtotal (Actual trip price, manually editable only if needed) */}
                  <div className="flex justify-between items-center font-medium text-white/90 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white text-base">Booking Subtotal:</span>
                      {!isEditingSubtotal ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingSubtotal(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-medium px-3 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer"
                          title="Only if needed, click to edit subtotal"
                        >
                          <Edit2 size={12} />
                          <span>Edit Price</span>
                        </button>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Editing</span>
                      )}
                    </div>

                    {!isEditingSubtotal ? (
                      <div className="flex items-center gap-2.5">
                        {isSubtotalModified && (
                          <span className="text-xs text-amber-400 line-through">
                            ${initialSubtotal.toFixed(2)}
                          </span>
                        )}
                        <span className="font-mono text-purple-300 font-bold text-lg">
                          ${effectiveSubtotal.toFixed(2)}
                        </span>
                        {isSubtotalModified && (
                          <button
                            type="button"
                            onClick={() => setFinalOptions((prev: any) => ({ ...prev, subtotal: '' }))}
                            className="text-xs text-amber-400 hover:text-amber-300 underline ml-1.5 cursor-pointer"
                            title="Reset to calculated actual price"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-mono text-base">$</span>
                        <input
                          id="final-invoice-subtotal-input"
                          type="number"
                          min={0}
                          step="0.01"
                          value={finalOptions.subtotal !== '' ? finalOptions.subtotal : initialSubtotal.toFixed(2)}
                          onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, subtotal: e.target.value }))}
                          placeholder={initialSubtotal.toFixed(2)}
                          className="w-32 bg-black border-2 border-purple-500 focus:border-purple-400 rounded-xl px-3 py-1.5 text-white font-mono text-base text-right outline-none ring-2 ring-purple-500/30"
                          autoFocus
                        />
                        {finalOptions.subtotal !== '' && (
                          <button
                            type="button"
                            onClick={() => setFinalOptions((prev: any) => ({ ...prev, subtotal: '' }))}
                            className="text-xs text-amber-400 hover:text-amber-300 underline px-1 cursor-pointer"
                            title="Reset to calculated actual price"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsEditingSubtotal(false)}
                          className="px-3.5 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>

                  {liveQuote.isAirportPickup && <div className="flex justify-between text-emerald-400 text-sm"><span>Airport Pickup Fee (Meet & Greet Included):</span><span className="font-mono">${liveQuote.breakdown.airportPickupFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.additionalStopsFee > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Additional Stops Fee:</span><span className="font-mono text-white">${liveQuote.breakdown.additionalStopsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.waitingTimeFee > 0 && <div className="flex justify-between text-amber-300 text-sm"><span>Waiting Time Fee:</span><span className="font-mono">${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.childSeatsFee > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Child Seats Fee:</span><span className="font-mono text-white">${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.cleaningFee > 0 && <div className="flex justify-between text-rose-300 text-sm"><span>Cleaning Fee:</span><span className="font-mono">${liveQuote.breakdown.cleaningFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.tolls > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Tolls:</span><span className="font-mono text-white">${liveQuote.breakdown.tolls.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.parking > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Parking:</span><span className="font-mono text-white">${liveQuote.breakdown.parking.toFixed(2)}</span></div>}
                  
                  <div className="flex justify-between font-bold text-base text-white border-t border-white/10 pt-3 mt-1">
                    <span>Subtotal (Base + Extras):</span>
                    <span className="font-mono">${liveQuote.breakdown.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {liveQuote.breakdown.lateNightSurcharge > 0 && <div className="flex justify-between text-amber-300 text-sm"><span>Late Night Surcharge (15%):</span><span className="font-mono">${liveQuote.breakdown.lateNightSurcharge.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.holidaySurcharge > 0 && <div className="flex justify-between text-amber-300 text-sm"><span>Holiday Surcharge (20%):</span><span className="font-mono">${liveQuote.breakdown.holidaySurcharge.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-white/80 text-sm"><span>Gratuity (20%):</span><span className="font-mono text-white">${liveQuote.breakdown.gratuity.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white/80 text-sm"><span>Credit Card Fee (3%):</span><span className="font-mono text-white">${liveQuote.breakdown.creditCardFee.toFixed(2)}</span></div>
                  
                  {Boolean(liveQuote.breakdown.discount && liveQuote.breakdown.discount > 0) && (
                    <div className="flex justify-between text-white/60 text-sm">
                      <span>Original Total:</span>
                      <span className="line-through">${(liveQuote.breakdown.calculatedGrandTotal || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {Boolean(liveQuote.breakdown.discount && liveQuote.breakdown.discount > 0) && (
                    <div className="flex justify-between text-emerald-400 font-medium text-sm">
                      <span>Discount:</span>
                      <span className="font-mono">-${(liveQuote.breakdown.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center font-bold text-xl sm:text-2xl text-gold border-t-2 border-gold/40 pt-4 mt-3">
                    <span className="tracking-wide">Final Total Due:</span>
                    <span className="font-mono text-2xl sm:text-3xl text-gold">${liveQuote.formattedGrandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-white/[0.02] shrink-0">
                <button
                  onClick={() => setFinalModalBooking(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendFinalInvoiceSubmit}
                  disabled={sendingFinalInvoice}
                  className="px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all flex items-center gap-2.5 disabled:opacity-50 shadow-xl shadow-purple-600/30 cursor-pointer"
                >
                  {sendingFinalInvoice ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Send Final Invoice & Payment Link
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Booking Detail & Customer Information Modal */}
      {selectedDetailBooking && (
        <BookingDetailModal
          booking={selectedDetailBooking}
          onClose={() => setSelectedDetailBooking(null)}
          onNotifyArrival={(b) => {
            setSelectedDetailBooking(null);
            setArrivalModalBooking(b);
            setWaitingMinutes(b.waiting_minutes || 0);
          }}
          onStartRide={(id) => handleStartRide(id)}
          onOpenFinalModal={(b) => {
            setSelectedDetailBooking(null);
            handleOpenFinalModal(b);
          }}
          onUpdateStatus={(id, status) => handleUpdateStatus(id, status)}
          onDeleteBooking={(id) => {
            setSelectedDetailBooking(null);
            handleDeleteBooking(id);
          }}
          startingRideId={startingRideId}
        />
      )}
    </div>
  );
}
