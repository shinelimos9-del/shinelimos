import { useState } from "react";
import { Loader2, MapPin, Calendar, Clock, CarFront, User } from "lucide-react";
import { getCustomerBooking } from "../utils/api";

// Phase 2 — minimal customer booking lookup. There was no customer-facing
// booking view before: the booking form only shows a confirmation screen
// at booking time, before any driver is assigned. This page lets a
// customer enter their confirmation number + booking email and see their
// trip and, once assigned, their chauffeur's name and phone. It returns
// no prices or payment data.
interface CustomerBooking {
  booking_id: string;
  date: string | null;
  start_time: string;
  pickup_location: string;
  dropoff_location: string;
  vehicle_name: string;
  booking_status: string;
  driver_status: string | null;
  driver_name: string;
  driver_phone: string;
}

const DRIVER_STATUS_LABEL: Record<string, string> = {
  assigned: "Assigned",
  on_the_way: "On the way to you",
  arrived: "Arrived",
  completed: "Trip complete",
};

export default function MyBooking() {
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBooking(null);
    if (!bookingId.trim() || !email.trim()) return setError("Booking ID and email are required.");
    setLoading(true);
    try {
      const res = await getCustomerBooking(bookingId.trim(), email.trim());
      if (res.success) {
        setBooking(res.booking);
      } else {
        setError(res.message || "Booking not found. Check the confirmation number and the email you booked with.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Booking not found. Check the confirmation number and the email you booked with.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-fade min-h-screen pt-28 pb-20 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-2 font-semibold">Shine Limos</div>
          <h1 className="font-serif-lux text-3xl text-white">My Booking</h1>
          <p className="text-white/50 text-sm mt-2">Enter your confirmation number and booking email to see your trip and your assigned chauffeur. Use the short confirmation number from your booking (like ZE34) — older bookings also work with the full booking ID.</p>
        </div>

        <form onSubmit={handleLookup} className="glass-dark rounded-3xl p-6 border border-white/10 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Confirmation number</label>
            <input value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" placeholder="e.g. ZE34" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Booking email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40" placeholder="you@example.com" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gold text-black py-3 rounded-xl font-semibold disabled:opacity-50">
            {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Looking up...</span> : "View my booking"}
          </button>
        </form>

        {booking && (
          <div className="glass-dark rounded-3xl p-6 border border-white/10 mt-6">
            <div className="flex items-center gap-2 text-gold text-sm"><CarFront size={16} /> {booking.vehicle_name || "Vehicle to be confirmed"}</div>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-2"><MapPin size={16} className="text-gold shrink-0 mt-0.5" /><span><span className="text-white/50">Pickup: </span>{booking.pickup_location}</span></div>
              <div className="flex items-start gap-2"><MapPin size={16} className="text-white/40 shrink-0 mt-0.5" /><span><span className="text-white/50">Drop-off: </span>{booking.dropoff_location}</span></div>
              <div className="flex flex-wrap gap-4 text-white/60 text-xs pt-1">
                <span className="flex items-center gap-1"><Calendar size={13} /> {booking.date ? new Date(booking.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {booking.start_time}</span>
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              {booking.driver_name ? (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Your chauffeur</div>
                  <div className="flex items-center gap-2 text-white font-medium"><User size={16} className="text-gold" /> {booking.driver_name}</div>
                  {booking.driver_phone && <div className="text-white/70 text-sm mt-1">{booking.driver_phone}</div>}
                  {booking.driver_status && <div className="text-gold text-xs mt-2">{DRIVER_STATUS_LABEL[booking.driver_status] || booking.driver_status}</div>}
                </div>
              ) : (
                <p className="text-white/50 text-sm">Your chauffeur has not been assigned yet. Check back here — their name and phone number will appear once assigned.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
