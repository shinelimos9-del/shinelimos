import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, CreditCard, Send, CheckCircle2 } from "lucide-react";
import { getAllBookings, updateBookingStatus, sendPaymentLink } from "../../utils/api";
import moment from "moment";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingPaymentId, setSendingPaymentId] = useState<string | null>(null);
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.payment_status === 'requested' && (
                          <button 
                            onClick={() => handleSendPaymentLink(b._id)}
                            disabled={sendingPaymentId === b._id}
                            className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                            title="Send Stripe Payment Link"
                          >
                            {sendingPaymentId === b._id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Send Link
                          </button>
                        )}
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
    </div>
  );
}
