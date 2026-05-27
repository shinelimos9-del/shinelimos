import { useState } from "react";
import { ArrowRight, MapPin, Calendar, Users, Car } from "lucide-react";
import { GoldButton } from "./ui";
import TimePicker from "./TimePicker";
import { FLEET } from "../data";
import { useNavigate } from "react-router-dom";

export const LOCATIONS = [
  "Washington",
  "Arlington",
  "Alexandria",
  "Tysons",
  "Fairfax",
  "Reston",
  "Herndon",
  "Bethesda",
  "Rockville",
  "Silver Spring",
  "Dulles International Airport",
  "Ronald Reagan Washington National Airport"
];

export default function BookingWidget({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"one-way" | "round-trip" | "hourly">("one-way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pax, setPax] = useState(2);
  const [vehicle, setVehicle] = useState(FLEET[0].slug);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = (val: string) => LOCATIONS.some(loc => val.toLowerCase().includes(loc.toLowerCase()));
    
    if (!isValid(pickup) || !isValid(dropoff)) {
      alert("We only provide service in specific areas (e.g. Washington, Arlington, Alexandria, Dulles Airport, etc.). Please ensure your address includes one of our supported cities/airports.");
      return;
    }

    const q = new URLSearchParams({
      type: tab,
      pickup,
      dropoff,
      date,
      time,
      pax: String(pax),
      vehicle,
    });
    navigate(`/booking?${q.toString()}`);
  };

  return (
    <div className={`glass-dark rounded-3xl ${compact ? "p-5" : "p-7 md:p-9"}`}>
      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 p-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
        {(["one-way", "round-trip", "hourly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 sm:px-5 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase font-medium transition-all ${
              tab === t ? "bg-gold text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {t === "one-way" ? "One Way" : t === "round-trip" ? "Round Trip" : "As Directed/Hourly"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <Field icon={<MapPin />} label="Pickup Location">
          <select value={pickup} onChange={(e) => setPickup(e.target.value)} required className="field">
            <option value="" disabled>Select pickup location</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-[#1a1a1a]">{loc}</option>)}
          </select>
        </Field>
        <Field icon={<MapPin />} label="Drop-off Location">
          <select value={dropoff} onChange={(e) => setDropoff(e.target.value)} required className="field">
            <option value="" disabled>Select drop-off location</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-[#1a1a1a]">{loc}</option>)}
          </select>
        </Field>
        <Field icon={<Calendar />} label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="field" />
        </Field>
        <Field icon={<Calendar />} label="Time">
          <TimePicker value={time} onChange={(v) => setTime(v)} className="field" />
        </Field>
        <Field icon={<Users />} label="Passengers">
          <input type="number" min={1} max={56} value={pax} onChange={(e) => setPax(Number(e.target.value))} required className="field" />
        </Field>
        <Field icon={<Car />} label="Vehicle">
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="field">
            {FLEET.map((v) => (
              <option key={v.slug} value={v.slug} className="bg-black">
                {v.name} — {v.category}
              </option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-2 flex justify-center pt-2">
          <GoldButton type="submit">
            Get Instant Quote <ArrowRight className="h-4 w-4" />
          </GoldButton>
        </div>
      </form>

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
        select.field { padding-left: 0.9rem; }
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