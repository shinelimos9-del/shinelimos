import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getNotifications, markNotificationsRead, sendPaymentLink } from "../../utils/api";
import { Search, Mail, MailOpen, User, CarFront, MapPin, Banknote, Clock, Loader2, Send, CreditCard } from "lucide-react";

export default function AdminNotifications() {
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingPaymentId, setSendingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      if (response.success) {
          const mapped = response.notifications.map((n: any) => ({
          id: n._id,
          bookingId: n.booking_id,
          title: n.type === "Booking" ? "New Booking Request" : 
                 (n.type === "Payment Request" || (n.message && n.message.toLowerCase().includes('payment'))) ? "Payment Request Received" : "System Notification",
          message: n.message,
          time: n.time,
          date: n.date,
          read: n.is_read,
          userName: n.booker_name || "Unknown User",
          vehicleName: n.vehicle_name || "N/A",
          source: n.pickup || "N/A",
          destination: n.dropoff || "N/A",
          amount: n.estimated_price ? `$${n.estimated_price}` : "N/A",
          paymentStatus: n.payment_status || "Pending",
          type: (n.type === "Payment Request" || (n.message && n.message.toLowerCase().includes('payment'))) ? "Payment Request" : (n.type || "Notification")
        }));
        setNotifications(mapped);

        const idParam = searchParams.get('id');
        if (idParam) {
          setSelectedId(idParam);
        } else if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPaymentLink = async (bookingId: string) => {
    try {
      setSendingPaymentId(bookingId);
      const response = await sendPaymentLink(bookingId);
      if (response.success) {
        alert("Payment link sent to customer!");
        fetchNotifications();
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

  const handleSelectNotification = (id: string) => {
    setSelectedId(id);
    // Optimistically mark as read in UI
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // In a real app, you might want to call an API to mark a specific notification as read
    // For now, the "Mark all as read" button handles the backend sync
  };

  const selectedNotification = notifications.find(n => n.id === selectedId);

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#050505]/50 border border-white/10 rounded-2xl overflow-hidden glass-dark">
      {/* Left Pane - Inbox List */}
      <div className="w-full md:w-1/3 border-r border-white/10 flex flex-col bg-black/40">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-serif-lux text-white mb-4">Notifications</h2>
          <div className="flex items-center bg-[#111] border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/30 transition-all">
            <Search size={16} className="text-white/40" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                onClick={() => handleSelectNotification(notification.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${selectedId === notification.id ? 'bg-white/10 border-l-2 border-l-gold' : 'hover:bg-white/5 border-l-2 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm flex items-center gap-2 ${!notification.read ? 'text-white font-semibold' : 'text-white/70'}`}>
                    {!notification.read ? <Mail size={14} className="text-gold" /> : <MailOpen size={14} className="text-white/40" />}
                    {notification.title}
                  </h4>
                  <span className="text-[10px] text-white/40 whitespace-nowrap ml-2">{notification.time}</span>
                </div>
                <div className="text-xs text-white/50 truncate mb-1"><span className="text-white/70 font-medium">{notification.userName}</span></div>
                <p className="text-xs text-white/40 line-clamp-2">{notification.message}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-white/50">
              No notifications found.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Detail View */}
      <div className="hidden md:flex flex-1 flex-col bg-[#0a0a0a]/80 relative overflow-y-auto no-scrollbar">
        {selectedNotification ? (
          <div className="p-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-serif-lux text-white mb-2">{selectedNotification.title}</h2>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span className="flex items-center gap-1"><Clock size={14} /> {selectedNotification.date}</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium uppercase tracking-wider border border-gold/20">
                {selectedNotification.type}
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-8 text-white/70">
              <p className="text-[15px] leading-relaxed">{selectedNotification.message}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">User Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold border border-white/10 text-white">
                    {selectedNotification.userName[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium">{selectedNotification.userName}</div>
                    <div className="text-xs text-white/50 flex items-center gap-1 mt-1"><User size={12} /> Customer</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">Vehicle Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 border border-white/10">
                    <CarFront size={18} />
                  </div>
                  <div>
                    <div className="text-white font-medium">{selectedNotification.vehicleName}</div>
                    <div className="text-xs text-white/50 mt-1">Requested Model</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 lg:col-span-2">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">Trip Information</h3>
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  <div className="flex-1">
                    <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><MapPin size={12} /> Pick-up</div>
                    <div className="text-white font-medium">{selectedNotification.source}</div>
                  </div>
                  <div className="hidden md:flex items-center text-white/20">
                    <div className="w-full h-px bg-white/10 relative">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white/20 bg-black"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><MapPin size={12} /> Drop-off</div>
                    <div className="text-white font-medium">{selectedNotification.destination}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 lg:col-span-2">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">Payment Details</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Banknote size={18} />
                    </div>
                    <div>
                      <div className="text-white font-medium">Payment Status: <span className={selectedNotification.paymentStatus === 'completed' || selectedNotification.paymentStatus === 'Paid' ? 'text-emerald-400' : selectedNotification.paymentStatus === 'requested' ? 'text-blue-400' : 'text-orange-400'}>{selectedNotification.paymentStatus}</span></div>
                      <div className="text-xs text-white/50 mt-1">Amount: {selectedNotification.amount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(selectedNotification.type === "Payment Request" || selectedNotification.message?.toLowerCase().includes("payment")) && 
                     (selectedNotification.paymentStatus === "requested" || selectedNotification.paymentStatus === "Pending") && (
                      <button 
                        onClick={() => handleSendPaymentLink(selectedNotification.bookingId)}
                        disabled={sendingPaymentId === selectedNotification.bookingId}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        {sendingPaymentId === selectedNotification.bookingId ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Send Payment Link
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm rounded-lg transition-colors font-medium">
                      View Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <Mail size={48} className="mb-4 opacity-20" />
            <p>Select a notification to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
