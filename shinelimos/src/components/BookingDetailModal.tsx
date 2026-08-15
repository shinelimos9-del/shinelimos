import { useState } from "react";
import { 
  X, User, Mail, Phone, Building, Car, Calendar, Plane, 
  Users, Luggage, DollarSign, CheckCircle2, Bell, Play, 
  FileText, Trash2, Printer, Copy, Check, ShieldCheck, Navigation, 
  Info
} from "lucide-react";
import moment from "moment";

interface BookingDetailModalProps {
  booking: any;
  onClose: () => void;
  onNotifyArrival?: (booking: any) => void;
  onStartRide?: (bookingId: string) => void;
  onOpenFinalModal?: (booking: any) => void;
  onUpdateStatus?: (bookingId: string, status: string) => void;
  onDeleteBooking?: (bookingId: string) => void;
  startingRideId?: string | null;
}

export default function BookingDetailModal({
  booking,
  onClose,
  onNotifyArrival,
  onStartRide,
  onOpenFinalModal,
  onUpdateStatus,
  onDeleteBooking,
  startingRideId
}: BookingDetailModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "customer" | "trip" | "pricing">("overview");

  if (!booking) return null;

  const bookingId = booking._id || booking.id || "N/A";
  const booker = booking.contact_details?.booker || {};
  const passenger = booking.contact_details?.passenger || {};
  const vehicle = booking.vehicle_details || {};
  const tripSegments = booking.trip_details || [];
  const primaryTrip = tripSegments[0] || {};
  const priceBreakdown = booking.price_breakdown || {};

  const bookerFullName = `${booker.first_name || ""} ${booker.last_name || ""}`.trim() || booking.name || "Unknown Customer";
  const passengerFullName = `${passenger.first_name || ""} ${passenger.last_name || ""}`.trim();
  const isPassengerSameAsBooker = booker.is_passenger !== false && (!passengerFullName || passengerFullName === bookerFullName);

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getLiveWaitMins = (arrivalTime?: string | Date) => {
    if (!arrivalTime) return 0;
    const arrivalMs = new Date(arrivalTime).getTime();
    if (isNaN(arrivalMs)) return 0;
    const elapsedMs = Math.max(0, Date.now() - arrivalMs);
    return Math.floor(elapsedMs / 60000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex flex-wrap justify-between items-center bg-white/5 shrink-0 print:border-b-2 print:border-black print:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-lg shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif-lux text-xl font-bold text-white print:text-black">
                  Booking Details
                </h2>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white/80 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border border-white/10 print:hidden"
                  title="Click to copy ID"
                >
                  <span>#{bookingId.slice(-8)}</span>
                  {copiedId ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-xs text-white/50 print:text-gray-600 mt-0.5">
                Created on {booking.created_at ? moment(booking.created_at).format("MMMM DD, YYYY [at] hh:mm A") : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
              title="Print Booking Details"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Summary Badges & Nav Tabs */}
        <div className="bg-black/40 border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-gold text-black font-bold shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("customer")}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "customer"
                  ? "bg-gold text-black font-bold shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Customer Info
            </button>
            <button
              onClick={() => setActiveTab("trip")}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "trip"
                  ? "bg-gold text-black font-bold shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Trip & Vehicle
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === "pricing"
                  ? "bg-gold text-black font-bold shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Pricing & Extras
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                booking.booking_status === "completed"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              Status: {booking.booking_status || "Pending"}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                booking.payment_status === "completed"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : booking.payment_status === "requested"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              Payment: {booking.payment_status || "Pending"}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white print:text-black print:p-0">
          
          {/* TAB 1: OVERVIEW */}
          {(activeTab === "overview" || window.matchMedia("print").matches) && (
            <div className="space-y-6">
              {/* Highlight Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold block">Booker Name</span>
                  <div className="font-semibold text-white truncate flex items-center gap-2">
                    <User size={16} className="text-gold" />
                    <span>{bookerFullName}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold block">Vehicle Requested</span>
                  <div className="font-semibold text-white truncate flex items-center gap-2">
                    <Car size={16} className="text-gold" />
                    <span>{vehicle.vehicle_name || booking.vehicle_name || "Luxury Vehicle"}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold block">Service Date & Time</span>
                  <div className="font-semibold text-white truncate flex items-center gap-2">
                    <Calendar size={16} className="text-gold" />
                    <span>
                      {primaryTrip.date ? moment(primaryTrip.date).format("MMM DD, YYYY") : booking.date || "N/A"}
                      {primaryTrip.start_time ? ` @ ${primaryTrip.start_time}` : ""}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-semibold block">Estimated Price</span>
                  <div className="font-semibold text-gold text-lg flex items-center gap-1">
                    <DollarSign size={18} />
                    <span>
                      {vehicle.estimated_price || booking.price || priceBreakdown.grandTotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ride Tracking Banner (if arrived / started) */}
              {(booking.vehicle_arrived || booking.ride_started) && (
                <div className="bg-linear-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 size={18} />
                      <span>
                        {booking.ride_started
                          ? "Ride Active / In Progress"
                          : "Chauffeur Arrived at Pickup Location"}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/80">
                      {booking.arrival_time && `Arrival Time: ${moment(booking.arrival_time).format("hh:mm:ss A")} • `}
                      Waiting Time: <strong className="text-white">{booking.waiting_minutes || getLiveWaitMins(booking.arrival_time)} mins</strong>
                      {booking.waiting_fee > 0 && ` (Wait Fee: $${booking.waiting_fee.toFixed(2)})`}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Route Summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
                  <Navigation size={16} /> Route & Location Details
                </h3>

                <div className="space-y-4 relative pl-4 border-l-2 border-dashed border-white/20">
                  {/* Pickup */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black"></div>
                    <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Pickup Location</div>
                    <div className="text-sm font-medium text-white mt-0.5">{primaryTrip.pickup_location || "N/A"}</div>
                    {primaryTrip.pickup_details && (
                      <div className="text-xs text-white/50 mt-1 flex flex-wrap gap-x-3">
                        {primaryTrip.pickup_details.flat_no && <span>Apt/Flat: {primaryTrip.pickup_details.flat_no}</span>}
                        {primaryTrip.pickup_details.area && <span>Area: {primaryTrip.pickup_details.area}</span>}
                        {primaryTrip.pickup_details.landmark && <span>Landmark: {primaryTrip.pickup_details.landmark}</span>}
                        {primaryTrip.pickup_details.city && <span>City: {primaryTrip.pickup_details.city}</span>}
                        {primaryTrip.pickup_details.postal_code && <span>Zip: {primaryTrip.pickup_details.postal_code}</span>}
                      </div>
                    )}
                  </div>

                  {/* Intermediate Stops */}
                  {Array.isArray(primaryTrip.stops) && primaryTrip.stops.length > 0 && (
                    primaryTrip.stops.map((stop: any, idx: number) => (
                      <div key={idx} className="relative pt-2">
                        <div className="absolute -left-[23px] top-2.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-black"></div>
                        <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Stop #{idx + 1}</div>
                        <div className="text-sm font-medium text-white mt-0.5">{typeof stop === "string" ? stop : stop.location}</div>
                      </div>
                    ))
                  )}

                  {/* Dropoff */}
                  <div className="relative pt-2">
                    <div className="absolute -left-[23px] top-2.5 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-black"></div>
                    <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Dropoff Location</div>
                    <div className="text-sm font-medium text-white mt-0.5">{primaryTrip.dropoff_location || "N/A"}</div>
                    {primaryTrip.dropoff_details && (
                      <div className="text-xs text-white/50 mt-1 flex flex-wrap gap-x-3">
                        {primaryTrip.dropoff_details.flat_no && <span>Apt/Flat: {primaryTrip.dropoff_details.flat_no}</span>}
                        {primaryTrip.dropoff_details.area && <span>Area: {primaryTrip.dropoff_details.area}</span>}
                        {primaryTrip.dropoff_details.landmark && <span>Landmark: {primaryTrip.dropoff_details.landmark}</span>}
                        {primaryTrip.dropoff_details.city && <span>City: {primaryTrip.dropoff_details.city}</span>}
                        {primaryTrip.dropoff_details.postal_code && <span>Zip: {primaryTrip.dropoff_details.postal_code}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests / Notes */}
              {(booking.special_requests || primaryTrip.comment) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={14} /> Special Requests / Customer Notes
                  </span>
                  <p className="text-sm text-amber-100/90 whitespace-pre-line">
                    {booking.special_requests || primaryTrip.comment}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMER INFORMATION */}
          {(activeTab === "customer" || window.matchMedia("print").matches) && (
            <div className="space-y-6">
              {/* Booker Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-gold">
                    <User size={20} />
                    <h3 className="font-bold text-base text-white">Booker Information</h3>
                  </div>
                  <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    Primary Account Contact
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-white/40 block">Full Name:</span>
                    <p className="font-semibold text-white text-base">{bookerFullName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-white/40 block">Email Address:</span>
                    <a
                      href={`mailto:${booker.email || booking.email}`}
                      className="font-mono text-purple-300 hover:underline flex items-center gap-1.5"
                    >
                      <Mail size={14} /> {booker.email || booking.email || "No email provided"}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-white/40 block">Primary Phone Number:</span>
                    <a
                      href={`tel:${booker.primary_phone?.number || booking.phone}`}
                      className="font-mono text-gold hover:underline flex items-center gap-1.5"
                    >
                      <Phone size={14} />
                      {booker.primary_phone?.number || booking.phone || "No phone provided"}
                      {booker.primary_phone?.type && (
                        <span className="text-[11px] text-white/40 font-sans">({booker.primary_phone.type})</span>
                      )}
                    </a>
                  </div>

                  {booker.secondary_phone?.number && (
                    <div className="space-y-1">
                      <span className="text-xs text-white/40 block">Secondary Phone:</span>
                      <p className="font-mono text-white/80 flex items-center gap-1.5">
                        <Phone size={14} /> {booker.secondary_phone.number}
                        {booker.secondary_phone.type && (
                          <span className="text-[11px] text-white/40">({booker.secondary_phone.type})</span>
                        )}
                      </p>
                    </div>
                  )}

                  {booker.company_name && (
                    <div className="space-y-1">
                      <span className="text-xs text-white/40 block">Company Name:</span>
                      <p className="text-white font-medium flex items-center gap-1.5">
                        <Building size={14} /> {booker.company_name}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-xs text-white/40 block">Marketing Consent:</span>
                    <p className="text-xs font-semibold">
                      {booking.contact_details?.marketing_consent ? (
                        <span className="text-green-400 flex items-center gap-1"><ShieldCheck size={14} /> Opted-in to updates & promotions</span>
                      ) : (
                        <span className="text-white/50">Not opted-in</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger Card (if different or specified) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Users size={20} />
                    <h3 className="font-bold text-base text-white">Passenger Information</h3>
                  </div>
                  <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    {isPassengerSameAsBooker ? "Booker is Passenger" : "Separate Passenger"}
                  </span>
                </div>

                {isPassengerSameAsBooker ? (
                  <p className="text-xs text-white/60 italic">
                    Booker ({bookerFullName}) is travelling as the main passenger.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-white/40 block">Passenger Name:</span>
                      <p className="font-semibold text-white">{passengerFullName || "N/A"}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-white/40 block">Passenger Email:</span>
                      <p className="font-mono text-purple-300">{passenger.email || "N/A"}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-white/40 block">Passenger Phone:</span>
                      <p className="font-mono text-gold">{passenger.primary_phone?.number || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRIP & VEHICLE DETAILS */}
          {(activeTab === "trip" || window.matchMedia("print").matches) && (
            <div className="space-y-6">
              {/* Vehicle Section */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 text-gold border-b border-white/10 pb-3">
                  <Car size={20} />
                  <h3 className="font-bold text-base text-white">Vehicle Assigned / Selected</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.vehicle_name}
                      className="w-full sm:w-48 h-32 object-cover rounded-xl border border-white/10 bg-black/50"
                    />
                  ) : (
                    <div className="w-full sm:w-48 h-32 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/40">
                      <Car size={36} />
                      <span className="text-xs mt-2">No vehicle photo</span>
                    </div>
                  )}

                  <div className="space-y-3 flex-1 text-sm">
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {vehicle.vehicle_name || booking.vehicle_name || "Luxury Limousine"}
                      </h4>
                      <p className="text-xs text-gold">Executive Luxury Fleet</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <Users size={16} className="text-white/50" />
                        <div>
                          <span className="text-white/40 block">Capacity</span>
                          <span className="text-white font-semibold">
                            {vehicle.passenger_capacity || primaryTrip.total_passengers || "4"} Passengers
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        <Luggage size={16} className="text-white/50" />
                        <div>
                          <span className="text-white/40 block">Luggage</span>
                          <span className="text-white font-semibold">
                            {vehicle.luggage_capacity || primaryTrip.total_luggage || "3"} Luggage
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Snapshot Rates */}
                {vehicle.price_snapshot && (
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-xs space-y-2">
                    <span className="font-semibold text-white/60 uppercase tracking-wider block">Vehicle Pricing Matrix Snapshot</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white/80 font-mono">
                      <div>Base Price: <strong className="text-white">${vehicle.price_snapshot.base_price || 0}</strong></div>
                      <div>Per Hour: <strong className="text-white">${vehicle.price_snapshot.price_per_hour || 0}</strong></div>
                      <div>Per Mile: <strong className="text-white">${vehicle.price_snapshot.price_per_mile || 0}</strong></div>
                      <div>Per Minute: <strong className="text-white">${vehicle.price_snapshot.price_per_minute || 0}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Specifications */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 text-gold border-b border-white/10 pb-3">
                  <Calendar size={20} />
                  <h3 className="font-bold text-base text-white">Trip Specifications</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-white/40 uppercase tracking-wider block">Trip Type</span>
                    <span className="font-bold text-white text-sm capitalize">{primaryTrip.trip_type || "One Way"}</span>
                  </div>

                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-white/40 uppercase tracking-wider block">Occasion</span>
                    <span className="font-bold text-white text-sm capitalize">{primaryTrip.occasion || "General Transport"}</span>
                  </div>

                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-white/40 uppercase tracking-wider block">Calculated Distance</span>
                    <span className="font-bold text-gold text-sm">
                      {primaryTrip.distance_miles ? `${primaryTrip.distance_miles.toFixed(1)} miles` : "N/A"}
                    </span>
                  </div>

                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-white/40 uppercase tracking-wider block">Pickup Date</span>
                    <span className="font-bold text-white text-sm">
                      {primaryTrip.date ? moment(primaryTrip.date).format("DD MMMM YYYY") : "N/A"}
                    </span>
                  </div>

                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-white/40 uppercase tracking-wider block">Start Time</span>
                    <span className="font-bold text-white text-sm">{primaryTrip.start_time || "N/A"}</span>
                  </div>

                  {primaryTrip.duration && (
                    <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-white/40 uppercase tracking-wider block">Duration</span>
                      <span className="font-bold text-white text-sm">{primaryTrip.duration}</span>
                    </div>
                  )}
                </div>

                {/* Flight Details if available */}
                {primaryTrip.flight_details && (primaryTrip.flight_details.airline_flight_no || primaryTrip.flight_details.arrival || primaryTrip.flight_details.departure) && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
                    <div className="font-bold text-blue-400 flex items-center gap-2 text-xs uppercase tracking-wider">
                      <Plane size={16} /> Flight Tracking Details
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-blue-200">
                      <div>Airline & Flight #: <strong className="text-white font-mono">{primaryTrip.flight_details.airline_flight_no || "N/A"}</strong></div>
                      <div>Flight Type: <strong className="text-white">{primaryTrip.flight_details.international ? "International" : "Domestic"}</strong></div>
                      <div>Direction: <strong className="text-white">{primaryTrip.flight_details.arrival ? "Arrival (Meet & Greet)" : "Departure"}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRICING & EXTRAS */}
          {(activeTab === "pricing" || window.matchMedia("print").matches) && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-gold">
                    <DollarSign size={20} />
                    <h3 className="font-bold text-base text-white">Itemized Invoice & Price Breakdown</h3>
                  </div>
                  <span className="text-xs text-gold font-mono font-bold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                    Grand Total: ${vehicle.estimated_price || priceBreakdown.grandTotal?.toFixed(2) || booking.price || "0.00"}
                  </span>
                </div>

                {/* Breakdown List */}
                <div className="bg-black/60 rounded-xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between font-medium text-white/90 pb-2 border-b border-white/10">
                    <span>Base Booking Vehicle Fare:</span>
                    <span className="font-mono text-white">${priceBreakdown.mainBookingPrice?.toFixed(2) || vehicle.estimated_price || "0.00"}</span>
                  </div>

                  {priceBreakdown.airportPickupFee > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Airport Meet & Greet Fee:</span>
                      <span className="font-mono">${priceBreakdown.airportPickupFee.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.additionalStopsFee > 0 && (
                    <div className="flex justify-between text-white/80">
                      <span>Additional Stops Fee ({booking.additional_stops_count || 0} stops):</span>
                      <span className="font-mono">${priceBreakdown.additionalStopsFee.toFixed(2)}</span>
                    </div>
                  )}

                  {(priceBreakdown.waitingTimeFee > 0 || booking.waiting_fee > 0) && (
                    <div className="flex justify-between text-amber-300">
                      <span>Waiting Time Fee ({booking.waiting_minutes || priceBreakdown.waitingMinutes || 0} mins):</span>
                      <span className="font-mono">${(priceBreakdown.waitingTimeFee || booking.waiting_fee || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.childSeatsFee > 0 && (
                    <div className="flex justify-between text-white/80">
                      <span>Child Seats Fee:</span>
                      <span className="font-mono">${priceBreakdown.childSeatsFee.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.cleaningFee > 0 && (
                    <div className="flex justify-between text-rose-300">
                      <span>Cleaning Fee:</span>
                      <span className="font-mono">${priceBreakdown.cleaningFee.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.tolls > 0 && (
                    <div className="flex justify-between text-white/80">
                      <span>Tolls:</span>
                      <span className="font-mono">${priceBreakdown.tolls.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.parking > 0 && (
                    <div className="flex justify-between text-white/80">
                      <span>Parking:</span>
                      <span className="font-mono">${priceBreakdown.parking.toFixed(2)}</span>
                    </div>
                  )}

                  {priceBreakdown.lateNightSurcharge > 0 && (
                    <div className="flex justify-between text-amber-300"><span>Late Night Surcharge (15%):</span><span className="font-mono">${priceBreakdown.lateNightSurcharge.toFixed(2)}</span></div>
                  )}

                  {priceBreakdown.holidaySurcharge > 0 && (
                    <div className="flex justify-between text-amber-300"><span>Holiday Surcharge (20%):</span><span className="font-mono">${priceBreakdown.holidaySurcharge.toFixed(2)}</span></div>
                  )}

                  {priceBreakdown.gratuity > 0 && (
                    <div className="flex justify-between text-white/70"><span>Gratuity / Driver Tip (20%):</span><span className="font-mono">${priceBreakdown.gratuity.toFixed(2)}</span></div>
                  )}

                  {priceBreakdown.creditCardFee > 0 && (
                    <div className="flex justify-between text-white/70"><span>Credit Card Processing Fee (3%):</span><span className="font-mono">${priceBreakdown.creditCardFee.toFixed(2)}</span></div>
                  )}

                  <div className="flex justify-between font-bold text-base text-gold border-t-2 border-gold/40 pt-3 mt-2">
                    <span>Grand Total:</span>
                    <span className="font-mono text-lg">${vehicle.estimated_price || priceBreakdown.grandTotal?.toFixed(2) || booking.price || "0.00"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Controls Footer */}
        <div className="p-5 border-t border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Notify Arrival */}
            {!booking.ride_started && !booking.vehicle_arrived && onNotifyArrival && (
              <button
                onClick={() => onNotifyArrival(booking)}
                className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Bell size={14} /> Notify Arrival
              </button>
            )}

            {/* Start Ride */}
            {booking.vehicle_arrived && !booking.ride_started && onStartRide && (
              <button
                onClick={() => onStartRide(bookingId)}
                disabled={startingRideId === bookingId}
                className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 animate-pulse"
              >
                <Play size={14} /> Start Ride
              </button>
            )}

            {/* Send Final Invoice */}
            {onOpenFinalModal && (
              <button
                onClick={() => onOpenFinalModal(booking)}
                className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <FileText size={14} /> Send Final Invoice
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Status */}
            {onUpdateStatus && (
              booking.booking_status === "completed" ? (
                <button
                  onClick={() => onUpdateStatus(bookingId, "pending")}
                  className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                >
                  Mark Pending
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus(bookingId, "completed")}
                  className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                >
                  Mark Complete
                </button>
              )
            )}

            {/* Delete Booking */}
            {onDeleteBooking && (
              <button
                onClick={() => onDeleteBooking(bookingId)}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
