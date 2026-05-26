import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHero, GoldButton, GoldDivider } from "../components/ui";
import SectionBackground from "../components/SectionBackground";
import TimePicker from "../components/TimePicker";
import { initiateBooking, finalizeBooking } from "../utils/api";

const BG = "https://images.pexels.com/photos/8605325/pexels-photo-8605325.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400";
import { CheckCircle, ArrowRight, ArrowLeft, MapPin, Calendar, Users, Car, User, Mail, Phone, Clock, Trash2, Plus, Briefcase } from "lucide-react";

const STEPS = ["Trip Itinerary", "Vehicle Selection", "Summary", "Contact Info"];

interface Segment {
  id: number;
  date: string;
  time: string;
  duration: string;
  pickup: string;
  dropoff: string;
  comments: string;
  total_passengers: string;
  total_luggage: string;
}

interface Vehicle {
  _id: string;
  vehicle_name: string;
  image: string;
  passenger_capacity: number;
  luggage_capacity: number;
  estimated_price: string;
}

interface BookingData {
  type: string;
  pax: number;
  bags: number;
  bagSize: string;
  occasion: string;
  segments: Segment[];
  vehicle_id: string;
  vehicle_details: any;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  primaryPhone: string;
  primaryPhoneType: string;
  secondaryPhone: string;
  secondaryPhoneType: string;
  isPassenger: boolean;
  passengerFirstName: string;
  passengerLastName: string;
  passengerEmail: string;
  passengerPhone: string;
  notes: string;
  userLocation: string;
}

export default function Booking() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  // use loading to avoid unused-variable warning
  if (loading) {
    // no-op
  }

  const initialData: BookingData = {
    type: (params.get("type") || "one-way") as string,
    pax: Number(params.get("pax")) || 2,
    bags: 0,
    bagSize: "",
    occasion: "",
    segments: [
      {
        id: 1,
        date: params.get("date") || "",
        time: params.get("time") || "",
        duration: "",
        pickup: params.get("pickup") || "",
        dropoff: params.get("dropoff") || "",
        comments: "",
        total_passengers: String(Number(params.get("pax")) || 2),
        total_luggage: "0",
      }
    ],
    vehicle_id: params.get("vehicle") || "",
    vehicle_details: null,
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    primaryPhone: "",
    primaryPhoneType: "Cellular",
    secondaryPhone: "",
    secondaryPhoneType: "Home",
    isPassenger: true,
    passengerFirstName: "",
    passengerLastName: "",
    passengerEmail: "",
    passengerPhone: "",
    notes: "",
    userLocation: "",
  };

  const [data, setData] = useState<BookingData>(initialData);

  useEffect(() => {
    document.title = "Book Your Chauffeur | ShineLimos LLC";
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          update("userLocation", `${pos.coords.latitude},${pos.coords.longitude}`);
        },
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, []);

  const selectedVehicle: Vehicle | null = data.vehicle_details ?? availableVehicles.find((v) => v._id === data.vehicle_id) ?? null;
  const update = (k: keyof BookingData, v: any) => {
    setError(null);
    setData((prev) => ({ ...prev, [k]: v } as BookingData));
  };
  
  const next = async () => {
    if (step === 0) {
      if (!data.type) {
        setError("Please select a Trip Type.");
        return;
      }
      for (let i = 0; i < data.segments.length; i++) {
        const seg = data.segments[i];
        if (!seg.date || !seg.time || !seg.pickup || !seg.dropoff) {
          setError(`Please fill in Date, Start Time, Pick-up, and Drop-off for Segment ${i + 1}.`);
          return;
        }
      }

      setError(null);
      setLoading(true);
      try {
        const tripDetails = data.segments.map((s: Segment) => ({
          trip_type: data.type === "hourly" ? "Hourly" : data.type === "round-trip" ? "Round Trip" : "One Way",
          occasion: data.occasion || "Business",
          total_passengers: s.total_passengers || String(data.pax),
          total_luggage: s.total_luggage || String(data.bags),
          date: s.date,
          start_time: s.time,
          duration: s.duration,
          pickup_location: s.pickup,
          dropoff_location: s.dropoff,
          comment: s.comments || "",
        }));

        const result = await initiateBooking(tripDetails);
        if (!result.success) {
          setError(result.message || "Unable to fetch vehicles.");
          return;
        }

        setBookingId(result.booking_id);
        setAvailableVehicles(result.available_vehicles || []);
        setData((current) => ({
          ...current,
          vehicle_id: "",
          vehicle_details: null,
        }));
        setStep((s: number) => Math.min(STEPS.length - 1, s + 1));
      } catch (err: any) {
        setError(err?.message || "Could not connect to the booking service.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 1) {
      if (!data.vehicle_id) {
        setError("Please select a vehicle to continue.");
        return;
      }
    }

    setError(null);
    setStep((s: number) => Math.min(STEPS.length - 1, s + 1));
  };
  
  const prev = () => {
    setError(null);
    setStep((s: number) => Math.max(0, s - 1));
  };

  const submit = async () => {
    if (!bookingId) {
      setError("Unable to confirm booking. Please restart the booking flow.");
      return;
    }
    if (!data.firstName || !data.email || !data.primaryPhone) {
      setError("Please enter your name, email, and primary phone number.");
      return;
    }
    if (!data.vehicle_details) {
      setError("Please select a vehicle before confirming.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const contact_details = {
        booker: {
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          email: data.email,
          primary_phone: {
            number: data.primaryPhone,
            type: data.primaryPhoneType,
          },
          secondary_phone: {
            number: data.secondaryPhone,
            type: data.secondaryPhoneType,
          },
          is_passenger: data.isPassenger,
        },
        passenger: data.isPassenger
          ? {
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              primary_phone: {
                number: data.primaryPhone,
                type: data.primaryPhoneType,
              },
              secondary_phone: {
                number: data.secondaryPhone,
                type: data.secondaryPhoneType,
              },
            }
          : {
              first_name: data.passengerFirstName,
              last_name: data.passengerLastName,
              email: data.passengerEmail,
              primary_phone: {
                number: data.passengerPhone,
                type: "Cellular",
              },
              secondary_phone: {
                number: "",
                type: "",
              },
            },
      };

      const result = await finalizeBooking({
        booking_id: bookingId,
        vehicle_details: data.vehicle_details,
        contact_details,
        special_requests: data.notes,
      });

      if (!result.success) {
        setError(result.message || "Booking confirmation failed.");
        return;
      }

      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Booking confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="route-fade">
        <PageHero image="https://images.pexels.com/photos/8425047/pexels-photo-8425047.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000" eyebrow="Confirmed" title={<>Your reservation is <em className="text-white not-italic">confirmed</em></>} />
        <section className="py-20 px-6">
          <div className="mx-auto max-w-2xl glass-dark rounded-3xl p-10 text-center">
            <div className="w-20 h-20 rounded-full glass-gold flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-gold" />
            </div>
            <h2 className="font-serif-lux text-3xl gradient-gold-text">Thank you, {data.firstName || "guest"}!</h2>
            <p className="text-white/70 mt-3">Confirmation #CN-{Math.floor(100000 + Math.random() * 900000)}</p>
            <p className="text-sm text-white/60 mt-4 leading-relaxed">
              A reservation specialist will contact you within 15 minutes at <span className="text-gold">{data.primaryPhone}</span> to
              confirm details and process a soft authorization on your card. No charge until 24 hours before pickup.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4 text-left text-sm">
              <Detail label="Vehicle" value={selectedVehicle?.vehicle_name || "Not selected"} />
              <Detail label="Passengers" value={`${data.pax}`} />
              <Detail label="Luggage" value={data.bags > 0 ? `${data.bags} ${data.bagSize ? `(${data.bagSize})` : ""}` : "None"} />
              <Detail label="Pickup" value={data.segments[0]?.pickup} />
              <Detail label="Drop-off" value={data.segments[0]?.dropoff} />
              <Detail label="Date" value={data.segments[0]?.date} />
              <Detail label="Time" value={data.segments[0]?.time} />
            </div>
            <div className="mt-8">
              <GoldButton to="/">Return Home</GoldButton>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="route-fade">
      <PageHero
        image="https://images.pexels.com/photos/5288741/pexels-photo-5288741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2000"
        eyebrow="Reservations"
        title={<>Book Your <em className="text-white not-italic">Chauffeur</em></>}
        subtitle="Four short steps. Instant confirmation. Available 24/7."
      />

      <SectionBackground image={BG} overlay="dark" parallax className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-10 glass-dark rounded-full p-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i < step && setStep(i)}
                className={`flex-1 px-1 sm:px-3 py-2.5 rounded-full text-[9px] sm:text-[11px] tracking-wider sm:tracking-[0.2em] uppercase transition-all ${
                  i === step ? "bg-gold text-black font-semibold" : i < step ? "text-gold" : "text-white/40"
                }`}
              >
                {i + 1}. <span className="hidden sm:inline">{s}</span><span className="sm:hidden">{s.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="glass-dark rounded-3xl p-6 md:p-10 min-h-[520px]">
            {step === 0 && <Step1 data={data} update={update} />}
            {step === 1 && <Step2 data={data} availableVehicles={availableVehicles} onSelectVehicle={(vehicle: Vehicle) => {
              update("vehicle_id", vehicle._id);
              update("vehicle_details", vehicle);
            }} />}
            {step === 2 && <Step3Summary data={data} vehicle={selectedVehicle} />}
            {step === 3 && <Step4Contact data={data} update={update} />}

            {error && (
              <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {/* Nav */}
            <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
              {step > 0 ? (
                <button onClick={prev} className="text-sm text-white/60 hover:text-gold flex items-center gap-2 tracking-widest uppercase">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <span />}
              {step < STEPS.length - 1 ? (
                <GoldButton onClick={next}>
                  Continue <ArrowRight className="h-4 w-4" />
                </GoldButton>
              ) : (
                <GoldButton onClick={submit}>
                  Confirm Reservation <CheckCircle className="h-4 w-4" />
                </GoldButton>
              )}
            </div>
          </div>
        </div>
      </SectionBackground>

      <GoldDivider />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] tracking-[0.25em] text-white/45 uppercase">{label}</div>
      <div className="text-white text-sm mt-0.5">{value || "—"}</div>
    </div>
  );
}

function inputCls() {
  return "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-gold/5 transition-all";
}

function Step1({ data, update }: { data: BookingData; update: (k: keyof BookingData, v: any) => void }) {
  const addSegment = () => {
    update("segments", [
      ...data.segments,
      { id: Date.now(), date: "", time: "", duration: "", pickup: "", dropoff: "", comments: "", total_passengers: "2", total_luggage: "0" }
    ]);
  };

  const removeSegment = (id: number) => {
    if (data.segments.length > 1) {
      update("segments", data.segments.filter((s: Segment) => s.id !== id));
    }
  };

  const updateSegment = (id: number, key: keyof Segment, value: string) => {
    update("segments", data.segments.map((s: Segment) => s.id === id ? { ...s, [key]: value } : s));
  };

  const addReverseRoute = () => {
    const lastSeg = data.segments[data.segments.length - 1];
    update("segments", [
      ...data.segments,
      { 
        id: Date.now(), 
        date: lastSeg.date, 
        time: "", 
        duration: lastSeg.duration, 
         pickup: lastSeg.dropoff, 
         dropoff: lastSeg.pickup, 
         comments: "",
         total_passengers: lastSeg.total_passengers || String(data.pax),
         total_luggage: lastSeg.total_luggage || String(data.bags),
      }
    ]);
  };

  return (
    <>
      <div className="text-[10px] tracking-[0.25em] text-gold uppercase py-3 px-5 rounded-t-2xl border border-white/10 border-b-0 bg-white/5 font-medium">Itinerary</div>
      <div className="space-y-6 mb-8 border border-white/10 border-t-0 rounded-b-2xl p-5 bg-white/5">
        {data.segments.map((seg: any, index: number) => (
          <div key={seg.id} className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
            <div className="bg-white/5 text-white py-3 px-5 flex justify-between items-center border-b border-white/10">
              <span className="font-semibold text-[11px] tracking-widest uppercase text-gold">Segment {index + 1}</span>
              {data.segments.length > 1 && (
                <button onClick={() => removeSegment(seg.id)} className="text-white/50 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field icon={Calendar} label="Date *">
                  <input type="date" className={inputCls()} value={seg.date} onChange={(e) => updateSegment(seg.id, "date", e.target.value)} style={{ colorScheme: "dark" }} />
                </Field>
                <Field icon={Clock} label="Start Time *">
                  <TimePicker className={inputCls()} value={seg.time} onChange={(v) => updateSegment(seg.id, "time", v)} />
                </Field>
                <Field icon={Clock} label="Duration">
                  <select className={inputCls()} value={seg.duration} onChange={(e) => updateSegment(seg.id, "duration", e.target.value)}>
                    <option className="bg-[#1a1a1a]" value="">— Not Selected —</option>
                    <option className="bg-[#1a1a1a]" value="1 hour">1 Hour</option>
                    <option className="bg-[#1a1a1a]" value="2 hours">2 Hours</option>
                    <option className="bg-[#1a1a1a]" value="3 hours">3 Hours</option>
                    <option className="bg-[#1a1a1a]" value="4 hours">4 Hours</option>
                    <option className="bg-[#1a1a1a]" value="5+ hours">5+ Hours</option>
                  </select>
                </Field>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 mt-5 shrink-0 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm border border-gold/30">
                    {index + 1}A
                  </div>
                  <div className="flex-1">
                    <Field icon={MapPin} label="Address (Pick-up) *">
                      <input className={inputCls()} value={seg.pickup} onChange={(e) => updateSegment(seg.id, "pickup", e.target.value)} placeholder="Enter a location" />
                    </Field>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 mt-5 shrink-0 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm border border-gold/30">
                    {index + 1}B
                  </div>
                  <div className="flex-1">
                    <Field icon={MapPin} label="Address (Drop-off) *">
                      <input className={inputCls()} value={seg.dropoff} onChange={(e) => updateSegment(seg.id, "dropoff", e.target.value)} placeholder="Enter a location" />
                    </Field>
                    {(seg.pickup && seg.dropoff) ? (
                      <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(seg.pickup)}&destination=${encodeURIComponent(seg.dropoff)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 mt-2">
                        <MapPin className="w-3 h-3 inline" /> Preview on Google Maps
                      </a>
                    ) : (
                      <a href={data.userLocation ? `https://www.google.com/maps?q=${data.userLocation}` : "#"} onClick={(e) => !data.userLocation && e.preventDefault()} target={data.userLocation ? "_blank" : undefined} rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 mt-2 opacity-80">
                        <MapPin className="w-3 h-3 inline" /> Preview on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <input className={inputCls()} value={seg.comments} onChange={(e) => updateSegment(seg.id, "comments", e.target.value)} placeholder="Comments..." />
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={addSegment} className="flex items-center justify-center gap-2 border border-white/20 hover:border-gold/50 hover:bg-gold/10 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Add Segment
          </button>
          <button onClick={addReverseRoute} className="flex items-center justify-center gap-2 border border-white/20 hover:border-gold/50 hover:bg-gold/10 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
            <ArrowLeft className="w-4 h-4" /> Add Reverse Route
          </button>
        </div>
      </div>

      <div className="text-[10px] tracking-[0.25em] text-gold uppercase py-3 px-5 rounded-t-2xl border border-white/10 border-b-0 bg-white/5 font-medium mt-4">Details</div>
      <div className="p-5 border border-white/10 rounded-b-2xl bg-white/5 border-t-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field icon={Car} label="Trip Type *">
            <select className={inputCls()} value={data.type} onChange={(e) => update("type", e.target.value)}>
              <option className="bg-[#1a1a1a]" value="one-way">— Trip Type —</option>
              <option className="bg-[#1a1a1a]" value="one-way">One Way</option>
              <option className="bg-[#1a1a1a]" value="round-trip">Round Trip</option>
              <option className="bg-[#1a1a1a]" value="hourly">As Directed/Hourly</option>
            </select>
          </Field>
          <Field icon={Calendar} label="Occasion">
            <select className={inputCls()} value={data.occasion} onChange={(e) => update("occasion", e.target.value)}>
              <option className="bg-[#1a1a1a]" value="">— Occasion —</option>
              <option className="bg-[#1a1a1a]" value="business">Business</option>
              <option className="bg-[#1a1a1a]" value="wedding">Wedding</option>
              <option className="bg-[#1a1a1a]" value="prom">Prom</option>
              <option className="bg-[#1a1a1a]" value="airport">Airport Transfer</option>
              <option className="bg-[#1a1a1a]" value="other">Other</option>
            </select>
          </Field>
          <Field icon={Users} label="Total Passengers">
            <select className={inputCls()} value={data.pax} onChange={(e) => update("pax", Number(e.target.value))}>
              <option className="bg-[#1a1a1a]" value={0}>— Total Passengers —</option>
              {[...Array(56)].map((_, i) => (
                <option key={i+1} className="bg-[#1a1a1a]" value={i+1}>{i+1}</option>
              ))}
            </select>
          </Field>
          <Field icon={Briefcase} label="Total Bags">
            <select className={inputCls()} value={data.bags} onChange={(e) => update("bags", Number(e.target.value))}>
              <option className="bg-[#1a1a1a]" value={0}>— No Bags —</option>
              {[...Array(20)].map((_, i) => (
                <option key={i+1} className="bg-[#1a1a1a]" value={i+1}>{i+1}</option>
              ))}
            </select>
          </Field>
          {data.bags > 0 && (
            <Field icon={Briefcase} label="Bag Size">
              <select className={inputCls()} value={data.bagSize} onChange={(e) => update("bagSize", e.target.value)}>
                <option className="bg-[#1a1a1a]" value="">— Select Size —</option>
                <option className="bg-[#1a1a1a]" value="Small">Small (Carry-on)</option>
                <option className="bg-[#1a1a1a]" value="Medium">Medium (Standard)</option>
                <option className="bg-[#1a1a1a]" value="Large">Large (Checked)</option>
                <option className="bg-[#1a1a1a]" value="Mixed">Mixed Sizes</option>
              </select>
            </Field>
          )}
        </div>
      </div>
    </>
  );
}

function Step2({ data, availableVehicles, onSelectVehicle }: { data: BookingData; availableVehicles: Vehicle[]; onSelectVehicle: (vehicle: Vehicle) => void }) {
  return (
    <>
      <h3 className="font-serif-lux text-3xl gradient-gold-text">Select Your Vehicle</h3>
      <p className="text-white/55 mt-1 text-sm">Available vehicles that fit your itinerary.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {availableVehicles.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center text-white/75">
            No vehicles available for the selected itinerary. Please go back and adjust your trip details.
          </div>
        ) : (
          availableVehicles.map((v) => {
            const active = data.vehicle_id === v._id;
            return (
              <button
                key={v._id}
                onClick={() => onSelectVehicle(v)}
                className={`text-left rounded-2xl overflow-hidden border transition-all ${
                  active ? "border-gold/60 bg-gold/5 scale-[1.01]" : "border-white/10 hover:border-white/30 bg-white/2"
                }`}
              >
                <div className="flex gap-4 p-4">
                  <img src={v.image} alt={v.vehicle_name} className="w-28 h-20 object-cover rounded-lg shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] tracking-[0.25em] text-gold uppercase">Vehicle</div>
                    <div className="font-serif-lux text-lg text-white mt-0.5">{v.vehicle_name}</div>
                    <div className="text-xs text-white/55 mt-1 flex gap-3">
                      <span><Users className="inline h-3 w-3 mr-1 text-gold" />Fits {v.passenger_capacity} Passengers</span>
                      <span><Car className="inline h-3 w-3 mr-1 text-gold" />{v.luggage_capacity} Bags</span>
                    </div>
                    <div className="mt-3 text-sm text-white/70">Estimated price: ${v.estimated_price}</div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}

function Step3Summary({ data, vehicle }: any) {
  return (
    <>
      <h3 className="font-serif-lux text-3xl gradient-gold-text">Summary</h3>
      <p className="text-white/55 mt-1 text-sm">Please review your itinerary details below.</p>
      
      <div className="mt-6 space-y-4">
        {data.segments.map((seg: Segment, idx: number) => (
          <div key={seg.id} className="glass rounded-xl p-4 border border-white/5">
            <h4 className="text-gold font-semibold text-sm mb-3">Segment {idx + 1}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <Detail label="Date" value={seg.date} />
              <Detail label="Time" value={seg.time} />
              <Detail label="Pickup" value={seg.pickup} />
              <Detail label="Drop-off" value={seg.dropoff} />
              {seg.duration && <Detail label="Duration" value={seg.duration} />}
              {seg.comments && <Detail label="Comments" value={seg.comments} />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
        <Detail label="Service Type" value={data.type === "one-way" ? "Point-to-Point" : data.type === "hourly" ? "By the Hour" : "Airport Transfer"} />
        <Detail label="Vehicle" value={vehicle?.vehicle_name || vehicle?.name || "Not selected"} />
        <Detail label="Passengers" value={String(data.pax)} />
        <Detail label="Luggage" value={data.bags > 0 ? `${data.bags} ${data.bagSize ? `(${data.bagSize})` : ""}` : "None"} />
        <Detail label="Occasion" value={data.occasion || "Not specified"} />
      </div>
    </>
  );
}

function Step4Contact({ data, update }: { data: BookingData; update: (k: keyof BookingData, v: any) => void }) {
  return (
    <>
      <div className="text-[10px] tracking-[0.25em] text-gold uppercase py-3 px-5 rounded-t-2xl border border-white/10 border-b-0 bg-white/5 font-medium">Your Information</div>
      <div className="p-5 border border-white/10 rounded-b-2xl bg-white/5 border-t-0 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field icon={User} label="First Name *">
            <input className={inputCls()} value={data.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("firstName", e.target.value)} placeholder="First name" />
          </Field>
          <Field icon={User} label="Last Name">
            <input className={inputCls()} value={data.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("lastName", e.target.value)} placeholder="Last name" />
          </Field>
          <Field icon={Briefcase} label="Company Name">
            <input className={inputCls()} value={data.company} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("company", e.target.value)} placeholder="Company name" />
          </Field>
          <Field icon={Mail} label="Email Address *">
            <input type="email" className={inputCls()} value={data.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("email", e.target.value)} placeholder="you@example.com" />
          </Field>
          
          <Field icon={Phone} label="Primary Phone Number">
            <div className="flex gap-2">
              <input type="tel" className={`${inputCls()} flex-1 min-w-0`} value={data.primaryPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("primaryPhone", e.target.value)} placeholder="(202) 555-0000" />
              <div className="relative w-28 shrink-0">
                <span className="absolute -top-4 left-0 text-[9px] uppercase tracking-wider text-white/40">Type</span>
                <select className={`${inputCls()} w-full px-2 text-xs`} value={data.primaryPhoneType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update("primaryPhoneType", e.target.value)}>
                  <option className="bg-[#1a1a1a]" value="Cellular">Cellular</option>
                  <option className="bg-[#1a1a1a]" value="Home">Home</option>
                  <option className="bg-[#1a1a1a]" value="Work">Work</option>
                </select>
              </div>
            </div>
          </Field>

          <Field icon={Phone} label="Secondary Phone Number">
            <div className="flex gap-2">
              <input type="tel" className={`${inputCls()} flex-1 min-w-0`} value={data.secondaryPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("secondaryPhone", e.target.value)} placeholder="(Optional)" />
              <div className="relative w-28 shrink-0">
                <span className="absolute -top-4 left-0 text-[9px] uppercase tracking-wider text-white/40">Type</span>
                <select className={`${inputCls()} w-full px-2 text-xs`} value={data.secondaryPhoneType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update("secondaryPhoneType", e.target.value)}>
                  <option className="bg-[#1a1a1a]" value="Home">Home</option>
                  <option className="bg-[#1a1a1a]" value="Cellular">Cellular</option>
                  <option className="bg-[#1a1a1a]" value="Work">Work</option>
                </select>
              </div>
            </div>
          </Field>
        </div>

        <div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-white/55 mb-2 block">Are you also the passenger?</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => update("isPassenger", true)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${data.isPassenger ? "bg-[#337ab7] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              ✓ Yes
            </button>
            <button
              type="button"
              onClick={() => update("isPassenger", false)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${!data.isPassenger ? "bg-[#337ab7] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              ✕ No
            </button>
          </div>
        </div>
      </div>

      <div className="text-[10px] tracking-[0.25em] text-gold uppercase py-3 px-5 rounded-t-2xl border border-white/10 border-b-0 bg-white/5 font-medium mt-6">Comments</div>
      <div className="p-5 border border-white/10 rounded-b-2xl bg-white/5 border-t-0">
        <span className="text-white/80 text-sm mb-3 block">Do you have any special requests, questions or concerns?</span>
        <textarea className={inputCls()} rows={3} value={data.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("notes", e.target.value)} placeholder="Comments" />
      </div>

      <div className="mt-6 glass-gold rounded-xl p-4 text-sm text-white/80">
        <strong className="text-gold">All-inclusive estimate:</strong> Your final quote includes tolls, gratuity,
        fuel surcharges and 15 minutes of complimentary wait time. No charge will be made until 24 hours before pickup.
      </div>
    </>
  );
}

function Field({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.25em] uppercase text-white/55 mb-1.5 flex items-center gap-2">
        <Icon className="h-3 w-3 text-gold" /> {label}
      </span>
      {children}
    </label>
  );
}
