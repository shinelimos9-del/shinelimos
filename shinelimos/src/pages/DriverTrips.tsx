import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, MapPin, Calendar, Clock, User, CarFront } from "lucide-react";
import { getDriverTrips, updateDriverTripStatus } from "../utils/api";

// Phase 2 — driver trip list. Drivers see ONLY their assigned trips, and
// each trip shows pickup, drop-off, date, time and passenger contact —
// never a price (the API strips all price/payment fields before sending).
// Status moves forward only, one tap at a time:
// Assigned -> On the way to passenger -> Arrived -> Trip complete.
interface DriverTrip {
  booking_id: string;
  date: string | null;
  start_time: string;
  pickup_location: string;
  dropoff_location: string;
  stops: { location: string }[];
  vehicle_name: string;
  passenger_name: string;
  passenger_phone: string;
  special_requests: string;
  driver_status: string;
  booking_status: string;
}

const NEXT_STEP: Record<string, { status: string; label: string } | null> = {
  assigned: { status: "on_the_way", label: "On the way to passenger" },
  on_the_way: { status: "arrived", label: "Arrived" },
  arrived: { status: "completed", label: "Trip complete" },
  completed: null,
};

const STATUS_LABEL: Record<string, string> = {
  assigned: "Assigned",
  on_the_way: "On the way to passenger",
  arrived: "Arrived",
  completed: "Trip complete",
};

export default function DriverTrips() {
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await getDriverTrips();
      if (res.success) {
        setTrips(res.trips || []);
      } else {
        setError(res.message || "Failed to load trips");
      }
    } catch (e: any) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        localStorage.removeItem("driverToken");
        sessionStorage.removeItem("driverToken");
        navigate("/driver-login", { replace: true });
        return;
      }
      setError("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("driverToken") || sessionStorage.getItem("driverToken");
    if (!token) {
      navigate("/driver-login", { replace: true });
      return;
    }
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("driverToken");
    sessionStorage.removeItem("driverToken");
    navigate("/driver-login");
  };

  const handleNextStep = async (trip: DriverTrip) => {
    const next = NEXT_STEP[trip.driver_status];
    if (!next) return;
    setUpdating(trip.booking_id);
    setError(null);
    try {
      const res = await updateDriverTripStatus(trip.booking_id, next.status);
      if (res.success && res.trip) {
        setTrips((prev) => prev.map((t) => (t.booking_id === trip.booking_id ? res.trip : t)));
      } else {
        setError(res.message || "Could not update trip status");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not update trip status");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center text-white/70">
        <Loader2 className="animate-spin mr-2" /> Loading your trips...
      </div>
    );
  }

  return (
    <div className="route-fade min-h-screen pt-28 pb-20 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-2 font-semibold">Shine Limo Portal</div>
            <h1 className="font-serif-lux text-3xl text-white">My Trips</h1>
            <p className="text-white/50 text-sm mt-1">Only trips assigned to you are shown here.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-white">
            <LogOut size={15} /> Log out
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

        {trips.length === 0 ? (
          <div className="glass-dark rounded-3xl p-10 text-center text-white/60">
            No trips assigned to you yet. New assignments arrive by email as well.
          </div>
        ) : (
          <div className="space-y-5">
            {trips.map((trip) => {
              const next = NEXT_STEP[trip.driver_status];
              return (
                <div key={trip.booking_id} className="glass-dark rounded-3xl p-6 border border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-gold text-sm">
                      <CarFront size={16} /> {trip.vehicle_name || "Vehicle to be confirmed"}
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${trip.driver_status === "completed" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-gold/10 border-gold/30 text-gold"}`}>
                      {STATUS_LABEL[trip.driver_status] || trip.driver_status}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-white/80">
                    <div className="flex items-start gap-2"><MapPin size={16} className="text-gold shrink-0 mt-0.5" /><span><span className="text-white/50">Pickup: </span>{trip.pickup_location}</span></div>
                    <div className="flex items-start gap-2"><MapPin size={16} className="text-white/40 shrink-0 mt-0.5" /><span><span className="text-white/50">Drop-off: </span>{trip.dropoff_location}</span></div>
                    {trip.stops.length > 0 && <div className="text-white/50 text-xs pl-6">Stops: {trip.stops.map((s) => s.location).join(" · ")}</div>}
                    <div className="flex flex-wrap gap-4 text-white/60 text-xs pt-1">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {trip.date ? new Date(trip.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Date to be confirmed"}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {trip.start_time}</span>
                      <span className="flex items-center gap-1"><User size={13} /> {trip.passenger_name}{trip.passenger_phone ? ` · ${trip.passenger_phone}` : ""}</span>
                    </div>
                    {trip.special_requests && <div className="text-white/50 text-xs pt-1">Notes: {trip.special_requests}</div>}
                  </div>
                  {next ? (
                    <button onClick={() => handleNextStep(trip)} disabled={updating === trip.booking_id} className="mt-5 w-full bg-gold text-black py-3 rounded-xl font-semibold disabled:opacity-50">
                      {updating === trip.booking_id ? "Updating..." : next.label}
                    </button>
                  ) : (
                    <div className="mt-5 text-center text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-xl py-3">Trip complete</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
