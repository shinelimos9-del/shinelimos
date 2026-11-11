import { useRef, useState } from "react";
import { ArrowRight, Calendar, Car, Clock, Loader2, MapPin, Users } from "lucide-react";
import { GoldButton } from "./ui";
import TimePicker from "./TimePicker";
import AddressSearch from "./AddressSearch";
import { getQuote, ADMIN_BASE_URL } from "../utils/api";
import { COMPANY } from "../data";
import { useNavigate } from "react-router-dom";

interface QuoteVehicle {
  _id: string;
  vehicle_name: string;
  image: string;
  passenger_capacity: number;
  luggage_capacity: number;
  estimated_price: string;
}

const DURATION_OPTIONS = [
  "",
  "2 hours",
  "3 hours",
  "4 hours",
  "5 hours",
  "6 hours",
  "7 hours",
  "8 hours",
  "9 hours",
  "10 hours",
  "11 hours",
  "12 hours",
];

// Homepage quick quote: pickup, drop-off, date and time in, real
// per-vehicle prices out — no name, email or payment needed to see a
// price. Prices come from POST /bookings/quote, which runs the exact
// same trip processing + pricing as a real booking, without creating
// a Booking row. "Book this car" carries the trip into /booking with
// the chosen vehicle preselected.
export default function QuickQuote() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"one-way" | "hourly">("one-way");
  const [pickup, setPickup] = useState("");
  const [pickupDetails, setPickupDetails] = useState<any>(null);
  const [dropoff, setDropoff] = useState("");
  const [dropoffDetails, setDropoffDetails] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("2 hours");
  const [pax, setPax] = useState(2);
  const [vehicles, setVehicles] = useState<QuoteVehicle[]>([]);
  const [quoted, setQuoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !date || !time || (tab !== "hourly" && !dropoff.trim())) {
      setError(
        tab === "hourly"
          ? "Please enter a pickup, date and time to see your prices."
          : "Please enter a pickup, drop-off, date and time to see your prices."
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Same single-segment trip shape the booking page sends in its
      // step 0 (Booking.tsx), so the quote prices match booking
      // prices exactly.
      const tripDetails = [
        {
          trip_type: tab === "hourly" ? "Hourly" : "One Way",
          occasion: "Business",
          total_passengers: String(pax),
          total_luggage: "0",
          date,
          start_time: time,
          duration: tab === "hourly" ? duration : "",
          pickup_location: pickup,
          pickup_details: pickupDetails || {
            flat_no: "",
            area: "",
            landmark: "",
            postal_code: "",
            city: "",
            state: "",
          },
          stops: [],
          dropoff_location: dropoff,
          dropoff_details: dropoffDetails || {
            flat_no: "",
            area: "",
            landmark: "",
            postal_code: "",
            city: "",
            state: "",
          },
          comment: "",
          flight_details: {
            international: false,
            domestic: false,
            departure: false,
            arrival: false,
            airline_flight_no: "",
            meet_and_greet: false,
          },
        },
      ];

      const result = await getQuote(tripDetails);
      if (!result.success) {
        setError(result.message || "Could not calculate a price — check the addresses and try again.");
        setVehicles([]);
        setQuoted(false);
        return;
      }
      setVehicles(result.available_vehicles || []);
      setQuoted(true);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (err: any) {
      setError(err?.message || "Could not calculate a price — check the addresses and try again.");
      setVehicles([]);
      setQuoted(false);
    } finally {
      setLoading(false);
    }
  };

  const bookVehicle = (vehicle: QuoteVehicle) => {
    // Same URL params the booking widget builds, plus the chosen
    // vehicle by its id so /booking preselects it.
    const q = new URLSearchParams({
      type: tab,
      pickup: pickup,
      pickup_zip: pickupDetails?.postal_code || "",
      pickup_city: pickupDetails?.city || "",
      pickup_state: pickupDetails?.state || "",
      pickup_lat: pickupDetails?.lat || "",
      pickup_lng: pickupDetails?.lng || "",
      dropoff: dropoff,
      dropoff_zip: dropoffDetails?.postal_code || "",
      dropoff_city: dropoffDetails?.city || "",
      dropoff_state: dropoffDetails?.state || "",
      dropoff_lat: dropoffDetails?.lat || "",
      dropoff_lng: dropoffDetails?.lng || "",
      date,
      time,
      duration: tab === "hourly" ? duration : "",
      pax: String(pax),
      vehicle: vehicle._id,
    });
    navigate(`/booking?${q.toString()}`);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
      <div className="text-center mb-5">
        <span className="text-[10px] tracking-[0.4em] text-white/90 uppercase font-orbitron font-bold">
          Instant Quote
        </span>
        <div className="text-xl font-serif-lux text-white mt-1">See your price in seconds</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-full bg-white/5 border border-white/10 w-full overflow-x-auto no-scrollbar">
        {(["one-way", "hourly"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 min-w-fit px-3 py-2 rounded-full text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.18em] uppercase font-medium transition-all whitespace-nowrap ${
              tab === t ? "bg-gold text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {t === "one-way" ? "One Way" : "Hourly"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-4 grid-cols-1">
        <Field icon={<MapPin />} label="Pickup Location">
          <AddressSearch
            value={pickup}
            onChange={(addr, details) => {
              setPickup(addr);
              setPickupDetails(details);
            }}
            placeholder="Enter pickup address"
            hint={false}
            className="field"
          />
        </Field>
        {tab === "hourly" ? (
          <p className="text-xs text-white/50 -mt-2">
            You do not need a destination for hourly bookings — the chauffeur stays with you.
          </p>
        ) : (
          <Field icon={<MapPin />} label="Drop-off Location">
            <AddressSearch
              value={dropoff}
              onChange={(addr, details) => {
                setDropoff(addr);
                setDropoffDetails(details);
              }}
              placeholder="Enter drop-off address"
              hint={false}
              className="field"
            />
          </Field>
        )}
        <Field icon={<Calendar />} label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="field"
            style={{ colorScheme: "dark" }}
          />
        </Field>
        <Field icon={<Calendar />} label="Time">
          <TimePicker value={time} onChange={(v) => setTime(v)} className="field" />
        </Field>
        {tab === "hourly" && (
          <Field icon={<Clock />} label="Duration">
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="field">
              <option value="" className="bg-black">
                — Select duration —
              </option>
              {DURATION_OPTIONS.filter(Boolean).map((d) => (
                <option key={d} value={d} className="bg-black">
                  {d}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field icon={<Users />} label="Passengers">
          <input
            type="number"
            min={1}
            max={56}
            value={pax}
            onChange={(e) => setPax(Number(e.target.value))}
            required
            className="field"
          />
        </Field>

        <div className="flex justify-center pt-1">
          <GoldButton type="submit" className={loading ? "opacity-70 pointer-events-none" : ""}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Getting your prices…
              </>
            ) : (
              <>
                See My Prices <ArrowRight className="h-4 w-4" />
              </>
            )}
          </GoldButton>
        </div>
      </form>

      {error && (
        <p className="mt-4 text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {quoted && vehicles.length === 0 && !error && (
        <p className="mt-4 text-center text-sm text-white/70">
          No vehicle fits {pax} passengers for this trip — call us at {COMPANY.phone} for a custom option.
        </p>
      )}

      {vehicles.length > 0 && (
        <div ref={resultsRef} className="mt-6">
          <div className="text-center text-[10px] tracking-[0.3em] text-gold uppercase font-semibold mb-3">
            Your vehicles &amp; prices
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center p-2">
                    <img
                      src={v.image.startsWith("http") ? v.image : `${ADMIN_BASE_URL}${v.image}`}
                      alt={v.vehicle_name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-semibold">Vehicle</span>
                    <span className="text-sm font-semibold text-gold font-mono">${v.estimated_price}</span>
                  </div>
                  <h4 className="font-serif-lux text-lg text-white mt-1">{v.vehicle_name}</h4>
                  <div className="text-xs text-white/70 mt-2 flex items-center gap-4 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gold shrink-0" />
                      Fits {v.passenger_capacity} Passengers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-gold shrink-0" />
                      {v.luggage_capacity} Bags
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    Estimated price: <strong className="text-white font-mono">${v.estimated_price}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => bookVehicle(v)}
                    className="text-xs px-4 py-1.5 rounded-lg font-medium bg-gold text-black hover:scale-105 transition-all"
                  >
                    Book this car
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-white/50 text-center">
            All-inclusive estimate: Your final quote includes tolls, gratuity, and fuel surcharges. Airport
            pickups include 60 minutes of complimentary wait time; all other pickups include 15 minutes. No
            charge will be made until 24 hours before pickup.
          </p>
        </div>
      )}

      <style>{`
        .field {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.7rem 0.9rem 0.7rem 2.5rem;
          color: white;
          font-size: 0.92rem;
          transition: all 0.3s;
          color-scheme: dark;
        }
        .field:focus {
          outline: none;
          border-color: rgba(212,175,55,0.5);
          background: rgba(212,175,55,0.05);
        }
        .field::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.25em] uppercase text-white/55 mb-1.5 block">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none">
          {icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
        </span>
        {children}
      </div>
    </label>
  );
}
