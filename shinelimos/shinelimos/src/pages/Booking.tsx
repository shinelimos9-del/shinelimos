import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHero, GoldButton, GoldDivider } from "../components/ui";
import SectionBackground from "../components/SectionBackground";
import TimePicker from "../components/TimePicker";
import { initiateBooking, finalizeBooking, requestPayment, ADMIN_BASE_URL } from "../utils/api";
import AddressSearch from "../components/AddressSearch";

const BG = "/images/pexels-photo-8605325.webp";
import { CheckCircle, ArrowRight, ArrowLeft, MapPin, Calendar, Users, Car, User, Mail, Phone, Clock, Trash2, Plus, Briefcase, Download, Plane, Globe, X, CreditCard, Loader2 } from "lucide-react";
import SEO from "../components/SEO";

const STEPS = ["Trip Itinerary", "Vehicle Selection", "Summary", "Contact Info"];

interface LocationDetails {
  flat_no: string;
  area: string;
  landmark: string;
  postal_code: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

interface FlightInfo {
  international: boolean;
  domestic: boolean;
  departure: boolean;
  arrival: boolean;
  airline_flight_no: string;
}

interface Segment {
  id: number;
  date: string;
  time: string;
  duration: string;
  pickup: string;
  pickup_details: LocationDetails;
  dropoff: string;
  dropoff_details: LocationDetails;
  comments: string;
  total_passengers: string;
  total_luggage: string;
  flight_info?: FlightInfo;
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
  passengerPrimaryPhoneType: string;
  passengerSecondaryPhone: string;
  passengerSecondaryPhoneType: string;
  notes: string;
  marketingConsent: boolean;
}

export default function Booking() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [activeFlightSegmentId, setActiveFlightSegmentId] = useState<number | null>(null);
  const [paymentRequested, setPaymentRequested] = useState(false);
  const [requestingPayment, setRequestingPayment] = useState(false);

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
        pickup_details: { 
          flat_no: "", 
          area: "", 
          landmark: "", 
          postal_code: params.get("pickup_zip") || "", 
          city: params.get("pickup_city") || "",
          state: params.get("pickup_state") || "",
          lat: Number(params.get("pickup_lat")) || undefined,
          lng: Number(params.get("pickup_lng")) || undefined
        },
        dropoff: params.get("dropoff") || "",
        dropoff_details: { 
          flat_no: "", 
          area: "", 
          landmark: "", 
          postal_code: params.get("dropoff_zip") || "", 
          city: params.get("dropoff_city") || "",
          state: params.get("dropoff_state") || "",
          lat: Number(params.get("dropoff_lat")) || undefined,
          lng: Number(params.get("dropoff_lng")) || undefined
        },
        comments: "",
        total_passengers: String(Number(params.get("pax")) || 2),
        total_luggage: "0",
        flight_info: { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" }
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
    passengerPrimaryPhoneType: "Cellular",
    passengerSecondaryPhone: "",
    passengerSecondaryPhoneType: "Home",
    notes: "",
    marketingConsent: false,
  };

  const [data, setData] = useState<BookingData>(initialData);

  useEffect(() => {
    document.title = "Book Your Chauffeur | ShineLimos LLC";
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
          pickup_details: s.pickup_details,
          dropoff_location: s.dropoff,
          dropoff_details: s.dropoff_details,
          comment: s.comments || "",
          flight_details: s.flight_info || { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" },
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

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
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

    if (!isValidPhone(data.primaryPhone)) {
      setError("Please enter a valid 10-digit US primary phone number.");
      return;
    }
    if (data.secondaryPhone && !isValidPhone(data.secondaryPhone)) {
      setError("Please enter a valid 10-digit US secondary phone number.");
      return;
    }

    if (!data.isPassenger) {
      if (!data.passengerFirstName || !data.passengerPhone) {
        setError("Please enter the passenger's first name and phone number.");
        return;
      }
      if (!isValidPhone(data.passengerPhone)) {
        setError("Please enter a valid 10-digit US passenger phone number.");
        return;
      }
      if (data.passengerSecondaryPhone && !isValidPhone(data.passengerSecondaryPhone)) {
        setError("Please enter a valid 10-digit US passenger secondary phone number.");
        return;
      }
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
                type: data.passengerPrimaryPhoneType,
              },
              secondary_phone: {
                number: data.passengerSecondaryPhone,
                type: data.passengerSecondaryPhoneType,
              },
            },
        marketing_consent: data.marketingConsent,
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

  const handleRequestPayment = async () => {
    if (!bookingId) return;
    
    setRequestingPayment(true);
    setError(null);
    try {
      const result = await requestPayment(bookingId);
      if (result.success) {
        setPaymentRequested(true);
      } else {
        setError(result.message || "Failed to send payment request.");
      }
    } catch (err: any) {
      setError(err?.message || "Could not connect to the payment service.");
    } finally {
      setRequestingPayment(false);
    }
  };

  const handleDownloadInvoice = () => {
    const html = `
      <html>
        <head>
          <title>Invoice - CN-${bookingId || 'PENDING'}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 800px; margin: auto; }
            h1 { color: #d4af37; margin-bottom: 5px; }
            .header { border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px; text-align: center; }
            .section { margin-bottom: 30px; }
            .section h2 { font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .label { font-weight: bold; width: 35%; color: #666; }
            .val { width: 65%; font-weight: 500; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ShineLimos LLC</h1>
            <p style="margin:0; color:#666;">Premium Chauffeur Service</p>
            <h3 style="margin-top:20px;">Booking Invoice</h3>
            <p><strong>Confirmation Number:</strong> CN-${bookingId || Math.floor(100000 + Math.random() * 900000)}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Contact Information</h2>
            <div class="row"><div class="label">Booker Name:</div><div class="val">${data.firstName} ${data.lastName}</div></div>
            <div class="row"><div class="label">Email:</div><div class="val">${data.email}</div></div>
            <div class="row"><div class="label">Primary Phone:</div><div class="val">+1 ${data.primaryPhone} (${data.primaryPhoneType})</div></div>
            ${data.secondaryPhone ? `<div class="row"><div class="label">Secondary Phone:</div><div class="val">+1 ${data.secondaryPhone} (${data.secondaryPhoneType})</div></div>` : ''}
          </div>

          <div class="section">
            <h2>Passenger Information</h2>
            <div class="row"><div class="label">Passenger Name:</div><div class="val">${data.isPassenger ? `${data.firstName} ${data.lastName}` : `${data.passengerFirstName} ${data.passengerLastName}`}</div></div>
            ${!data.isPassenger && data.passengerEmail ? `<div class="row"><div class="label">Passenger Email:</div><div class="val">${data.passengerEmail}</div></div>` : ''}
            <div class="row"><div class="label">Passenger Phone:</div><div class="val">+1 ${data.isPassenger ? data.primaryPhone : data.passengerPhone}</div></div>
          </div>

          <div class="section">
            <h2>Trip Details</h2>
            <div class="row"><div class="label">Service Type:</div><div class="val">${data.type === "one-way" ? "Point-to-Point" : data.type === "hourly" ? "By the Hour" : "Round Trip"}</div></div>
            <div class="row"><div class="label">Vehicle:</div><div class="val">${selectedVehicle?.vehicle_name || "Not selected"}</div></div>
            <div class="row"><div class="label">Total Passengers:</div><div class="val">${data.pax}</div></div>
            <div class="row"><div class="label">Total Luggage:</div><div class="val">${data.bags > 0 ? `${data.bags} ${data.bagSize ? `(${data.bagSize})` : ""}` : "None"}</div></div>
            <div class="row"><div class="label">Occasion:</div><div class="val">${data.occasion || "Not specified"}</div></div>
          </div>

          <div class="section">
            <h2>Itinerary</h2>
            ${data.segments.map((seg, idx) => {
              const formatAddr = (loc: string, details: LocationDetails) => {
                const parts = [
                  details.flat_no,
                  details.area,
                  details.landmark ? `(Near ${details.landmark})` : '',
                  loc,
                  details.city,
                  details.postal_code
                ].filter(Boolean);
                return parts.join(", ") || loc;
              };
              return `
              <div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                <h4 style="margin-top:0; color:#d4af37;">Segment ${idx + 1}</h4>
                <div class="row"><div class="label">Date:</div><div class="val">${seg.date}</div></div>
                <div class="row"><div class="label">Time:</div><div class="val">${seg.time}</div></div>
                <div class="row"><div class="label">Pickup Location:</div><div class="val">${formatAddr(seg.pickup, seg.pickup_details)}</div></div>
                <div class="row"><div class="label">Drop-off Location:</div><div class="val">${formatAddr(seg.dropoff, seg.dropoff_details)}</div></div>
                ${seg.duration ? `<div class="row"><div class="label">Duration:</div><div class="val">${seg.duration}</div></div>` : ''}
                ${seg.comments ? `<div class="row"><div class="label">Comments:</div><div class="val">${seg.comments}</div></div>` : ''}
              </div>
            `}).join('')}
          </div>

          <div class="section">
            <h2>Estimated Price</h2>
            <div class="row"><div class="label">Vehicle Estimate:</div><div class="val" style="font-weight:bold; color:#d4af37; font-size:18px;">$${selectedVehicle?.estimated_price || "0.00"}</div></div>
            <p style="font-size:12px; color:#888; margin-top:10px;">* Includes tolls, gratuity, fuel surcharges and 15 minutes of complimentary wait time. Final charges may vary based on actual trip duration and additional stops.</p>
          </div>

          <div class="footer">
            <p>Thank you for choosing ShineLimos LLC. We look forward to serving you.</p>
            <p>For support, contact us at info@shinelimos.com</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (done) {
    return (
      <div className="route-fade">
        <PageHero image="/images/pexels-photo-8425047.webp" eyebrow="Confirmed" title={<>Your reservation is <em className="text-white not-italic">confirmed</em></>} />
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
              <Detail label="Pickup" value={`${data.segments[0]?.pickup_details?.flat_no ? data.segments[0].pickup_details.flat_no + ', ' : ''}${data.segments[0]?.pickup}`} />
              <Detail label="Drop-off" value={`${data.segments[0]?.dropoff_details?.flat_no ? data.segments[0].dropoff_details.flat_no + ', ' : ''}${data.segments[0]?.dropoff}`} />
              <Detail label="Date" value={data.segments[0]?.date} />
              <Detail label="Time" value={data.segments[0]?.time} />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button onClick={handleDownloadInvoice} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-medium transition-all border border-white/20">
                <Download className="w-4 h-4" /> Download Invoice
              </button>
              
              {paymentRequested ? (
                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-6 py-3 rounded-full text-sm font-medium border border-green-500/20">
                  <CheckCircle className="w-4 h-4" /> Payment Requested
                </div>
              ) : (
                <button 
                  onClick={handleRequestPayment} 
                  disabled={requestingPayment}
                  className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {requestingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Make Payment Request
                </button>
              )}
            </div>
            
            {paymentRequested && (
              <p className="mt-4 text-[11px] text-white/50 animate-in fade-in slide-in-from-top-2">
                Your request has been sent to our billing department. You will receive a secure Stripe payment link via email shortly.
              </p>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="route-fade">
      <SEO pageKey="booking" />
      <PageHero
        image="/images/pexels-photo-5288741.webp"
        eyebrow="Reservations"
        title={<>Online Limo <em className="text-white not-italic">Reservation</em></>}
        subtitle="Limousine bus online booking and instant reservation. Four short steps. Available 24/7."
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
            {step === 0 && (
              <Step1 
                data={data} 
                update={update} 
                onOpenFlightInfo={(id) => setActiveFlightSegmentId(id)} 
              />
            )}
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

      {/* Flight Info Modal */}
      {activeFlightSegmentId !== null && (
        <FlightInfoModal
          isOpen={activeFlightSegmentId !== null}
          onClose={() => setActiveFlightSegmentId(null)}
          data={data.segments.find(s => s.id === activeFlightSegmentId)?.flight_info || { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" }}
          onSave={(flightData) => {
            update("segments", data.segments.map(s => s.id === activeFlightSegmentId ? { ...s, flight_info: flightData } : s));
            setActiveFlightSegmentId(null);
          }}
          onClear={() => {
            update("segments", data.segments.map(s => s.id === activeFlightSegmentId ? { ...s, flight_info: { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" } } : s));
            setActiveFlightSegmentId(null);
          }}
        />
      )}

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

function Step1({ data, update, onOpenFlightInfo }: { data: BookingData; update: (k: keyof BookingData, v: any) => void; onOpenFlightInfo: (id: number) => void }) {
  const addSegment = () => {
    update("segments", [
      ...data.segments,
      { 
        id: Date.now(), 
        date: "", 
        time: "", 
        duration: "", 
        pickup: "", 
        pickup_details: { flat_no: "", area: "", landmark: "", postal_code: "", city: "", state: "" },
        dropoff: "", 
        dropoff_details: { flat_no: "", area: "", landmark: "", postal_code: "", city: "", state: "" },
        comments: "", 
        total_passengers: "2", 
        total_luggage: "0",
        flight_info: { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" }
      }
    ]);
  };

  const removeSegment = (id: number) => {
    if (data.segments.length > 1) {
      update("segments", data.segments.filter((s: Segment) => s.id !== id));
    }
  };

  const updateSegment = (id: number, key: keyof Segment, value: any) => {
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
         pickup_details: { ...lastSeg.dropoff_details },
         dropoff: lastSeg.pickup, 
         dropoff_details: { ...lastSeg.pickup_details },
         comments: "",
         total_passengers: lastSeg.total_passengers || String(data.pax),
         total_luggage: lastSeg.total_luggage || String(data.bags),
         flight_info: lastSeg.flight_info ? { ...lastSeg.flight_info } : { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" }
      }
    ]);
  };

  const updateSegmentLocation = (id: number, type: 'pickup' | 'dropoff', address: string, details: any) => {
    update("segments", data.segments.map((s: Segment) => {
      if (s.id === id) {
        const detailsKey = type === 'pickup' ? 'pickup_details' : 'dropoff_details';
        return {
          ...s,
          [type]: address,
          [detailsKey]: {
            ...s[detailsKey],
            city: details?.city || "",
            state: details?.state || "",
            postal_code: details?.postal_code || "",
            lat: details?.lat || undefined,
            lng: details?.lng || undefined
          }
        };
      }
      return s;
    }));
  };

  return (
    <>
      <div className="text-[10px] tracking-[0.25em] text-gold uppercase py-3 px-5 rounded-t-2xl border border-white/10 border-b-0 bg-white/5 font-medium">Itinerary</div>
      <div className="space-y-6 mb-8 border border-white/10 border-t-0 rounded-b-2xl p-5 bg-white/5">
        {data.segments.map((seg: any, index: number) => (
          <div key={seg.id} className="border border-white/10 rounded-2xl bg-black/20 relative">
            <div className="bg-white/5 text-white py-3 px-5 flex justify-between items-center border-b border-white/10 rounded-t-2xl">
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
                  <div className="flex gap-2">
                    <select className={inputCls()} value={seg.duration} onChange={(e) => updateSegment(seg.id, "duration", e.target.value)}>
                      <option className="bg-[#1a1a1a]" value="">— Not Selected —</option>
                      <option className="bg-[#1a1a1a]" value="1 hour">1 Hour</option>
                      <option className="bg-[#1a1a1a]" value="2 hours">2 Hours</option>
                      <option className="bg-[#1a1a1a]" value="3 hours">3 Hours</option>
                      <option className="bg-[#1a1a1a]" value="4 hours">4 Hours</option>
                      <option className="bg-[#1a1a1a]" value="5+ hours">5+ Hours</option>
                    </select>
                    <button 
                      onClick={() => onOpenFlightInfo(seg.id)}
                      className={`shrink-0 aspect-square w-[46px] border rounded-xl flex items-center justify-center transition-all ${
                        seg.flight_info?.airline_flight_no ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 hover:border-white/30 text-white/50 hover:text-white'
                      }`}
                      title="Add Flight Info"
                    >
                      <Plane className="w-5 h-5" />
                    </button>
                  </div>
                </Field>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 mt-5 shrink-0 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm border border-gold/30">
                    {index + 1}A
                  </div>
                  <div className="flex-1">
                    <Field icon={MapPin} label="Address (Pick-up) *">
                      <AddressSearch
                        value={seg.pickup}
                        onChange={(addr, details) => updateSegmentLocation(seg.id, "pickup", addr, details)}
                        placeholder="Enter pickup address"
                        className={inputCls()}
                      />
                    </Field>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 mt-5 shrink-0 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm border border-gold/30">
                    {index + 1}B
                  </div>
                  <div className="flex-1">
                    <Field icon={MapPin} label="Address (Drop-off) *">
                      <AddressSearch
                        value={seg.dropoff}
                        onChange={(addr, details) => updateSegmentLocation(seg.id, "dropoff", addr, details)}
                        placeholder="Enter drop-off address"
                        className={inputCls()}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <input className={inputCls()} value={seg.comments} onChange={(e) => updateSegment(seg.id, "comments", e.target.value)} placeholder="Comments (Optional)" />
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
              <option className="bg-[#1a1a1a]" value="">— Trip Type —</option>
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
                  <img 
                    src={v.image.startsWith('http') ? v.image : `${ADMIN_BASE_URL}${v.image}`} 
                    alt={v.vehicle_name} 
                    className="w-28 h-20 object-cover rounded-lg shrink-0" 
                    loading="lazy" 
                  />
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
  const formatAddress = (loc: string, details: LocationDetails) => {
    const parts = [
      details.flat_no,
      details.area,
      details.landmark ? `(Near ${details.landmark})` : '',
      loc,
      details.city,
      details.postal_code
    ].filter(Boolean);
    return parts.join(", ") || loc;
  };

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
              <Detail label="Pickup" value={formatAddress(seg.pickup, seg.pickup_details)} />
              <Detail label="Drop-off" value={formatAddress(seg.dropoff, seg.dropoff_details)} />
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

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function Step4Contact({ data, update }: { data: BookingData; update: (k: keyof BookingData, v: any) => void }) {
  const handlePhoneChange = (key: keyof BookingData, value: string) => {
    // Only allow digits to be processed
    const digits = value.replace(/\D/g, "").slice(0, 10);
    update(key, formatPhoneNumber(digits));
  };

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
          <Field icon={Mail} label="Email Address *">
            <input type="email" className={inputCls()} value={data.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("email", e.target.value)} placeholder="you@example.com" />
          </Field>
          
          <Field icon={Phone} label="Primary Phone Number *">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-white/50 text-sm">🇺🇸 +1</span>
                </div>
                <input 
                  type="tel" 
                  className={`${inputCls()} pl-[60px] w-full`} 
                  value={data.primaryPhone} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange("primaryPhone", e.target.value)} 
                  placeholder="(202) 555-0000" 
                  maxLength={14}
                />
              </div>
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
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-white/50 text-sm">🇺🇸 +1</span>
                </div>
                <input 
                  type="tel" 
                  className={`${inputCls()} pl-[60px] w-full`} 
                  value={data.secondaryPhone} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange("secondaryPhone", e.target.value)} 
                  placeholder="(Optional)" 
                  maxLength={14}
                />
              </div>
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

        {!data.isPassenger && (
          <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-gold text-[11px] tracking-widest uppercase font-semibold mb-5">Passenger Information</h4>
            <div className="grid gap-5 md:grid-cols-2">
              <Field icon={User} label="Passenger First Name *">
                <input className={inputCls()} value={data.passengerFirstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("passengerFirstName", e.target.value)} placeholder="Passenger first name" />
              </Field>
              <Field icon={User} label="Passenger Last Name">
                <input className={inputCls()} value={data.passengerLastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("passengerLastName", e.target.value)} placeholder="Passenger last name" />
              </Field>
              <Field icon={Mail} label="Passenger Email">
                <input type="email" className={inputCls()} value={data.passengerEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("passengerEmail", e.target.value)} placeholder="passenger@example.com" />
              </Field>
              <Field icon={Phone} label="Primary Phone Number *">
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-white/50 text-sm">🇺🇸 +1</span>
                    </div>
                    <input 
                      type="tel" 
                      className={`${inputCls()} pl-[60px] w-full`} 
                      value={data.passengerPhone} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange("passengerPhone", e.target.value)} 
                      placeholder="(202) 555-0000" 
                      maxLength={14}
                    />
                  </div>
                  <div className="relative w-28 shrink-0">
                    <span className="absolute -top-4 left-0 text-[9px] uppercase tracking-wider text-white/40">Type</span>
                    <select className={`${inputCls()} w-full px-2 text-xs`} value={data.passengerPrimaryPhoneType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update("passengerPrimaryPhoneType", e.target.value)}>
                      <option className="bg-[#1a1a1a]" value="Cellular">Cellular</option>
                      <option className="bg-[#1a1a1a]" value="Home">Home</option>
                      <option className="bg-[#1a1a1a]" value="Work">Work</option>
                    </select>
                  </div>
                </div>
              </Field>

              <Field icon={Phone} label="Secondary Phone Number">
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-white/50 text-sm">🇺🇸 +1</span>
                    </div>
                    <input 
                      type="tel" 
                      className={`${inputCls()} pl-[60px] w-full`} 
                      value={data.passengerSecondaryPhone} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange("passengerSecondaryPhone", e.target.value)} 
                      placeholder="(Optional)" 
                      maxLength={14}
                    />
                  </div>
                  <div className="relative w-28 shrink-0">
                    <span className="absolute -top-4 left-0 text-[9px] uppercase tracking-wider text-white/40">Type</span>
                    <select className={`${inputCls()} w-full px-2 text-xs`} value={data.passengerSecondaryPhoneType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update("passengerSecondaryPhoneType", e.target.value)}>
                      <option className="bg-[#1a1a1a]" value="Home">Home</option>
                      <option className="bg-[#1a1a1a]" value="Cellular">Cellular</option>
                      <option className="bg-[#1a1a1a]" value="Work">Work</option>
                    </select>
                  </div>
                </div>
              </Field>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-1">
              <input 
                type="checkbox" 
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/20 bg-white/5 transition-all checked:border-gold checked:bg-gold/20 hover:border-gold/50"
                checked={data.marketingConsent}
                onChange={(e) => update("marketingConsent", e.target.checked)}
              />
              <span className="absolute text-gold opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </span>
            </div>
            <span className="text-xs text-white/70 leading-relaxed select-none group-hover:text-white/90 transition-colors">
              I agree to receive recurring promotional and marketing text messages from Shine Limos at the phone number provided. Consent is not a condition of purchase. Reply STOP to opt out.
            </span>
          </label>
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

function FlightInfoModal({ 
  isOpen, 
  onClose, 
  data, 
  onSave, 
  onClear 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: FlightInfo; 
  onSave: (newData: FlightInfo) => void;
  onClear: () => void;
}) {
  const [localData, setLocalData] = useState<FlightInfo>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] w-full max-w-[320px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-[#2d3748] px-4 py-2 flex justify-between items-center border-b border-white/5">
          <span className="text-white font-semibold text-sm">Flight Info</span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setLocalData({ ...localData, international: true, domestic: false })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded text-[11px] font-medium transition-all ${localData.international ? 'bg-[#337ab7] text-white shadow-lg' : 'bg-[#2d3748] text-white/70 hover:bg-[#3d485a]'}`}
            >
              <Globe className="w-3 h-3" /> International
            </button>
            <button 
              type="button"
              onClick={() => setLocalData({ ...localData, international: false, domestic: true })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded text-[11px] font-medium transition-all ${localData.domestic ? 'bg-[#337ab7] text-white shadow-lg' : 'bg-[#2d3748] text-white/70 hover:bg-[#3d485a]'}`}
            >
              <Globe className="w-3 h-3" /> Domestic
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setLocalData({ ...localData, departure: true, arrival: false })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded text-[11px] font-medium transition-all ${localData.departure ? 'bg-[#337ab7] text-white shadow-lg' : 'bg-[#2d3748] text-white/70 hover:bg-[#3d485a]'}`}
            >
              <Plane className="w-3 h-3 -rotate-45" /> Departure
            </button>
            <button 
              type="button"
              onClick={() => setLocalData({ ...localData, departure: false, arrival: true })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded text-[11px] font-medium transition-all ${localData.arrival ? 'bg-[#337ab7] text-white shadow-lg' : 'bg-[#2d3748] text-white/70 hover:bg-[#3d485a]'}`}
            >
              <Plane className="w-3 h-3 rotate-45" /> Arrival
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Plane className="w-4 h-4 text-[#333]/40" />
            </div>
            <input 
              type="text"
              placeholder="Airline & Flight #"
              className="w-full bg-white text-[#333] rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none placeholder:text-gray-400"
              value={localData.airline_flight_no}
              onChange={(e) => setLocalData({ ...localData, airline_flight_no: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={() => onSave(localData)}
              className="flex-1 bg-[#5cb85c] hover:bg-[#4cae4c] text-white py-2 rounded font-medium text-sm transition-colors shadow-md active:scale-95"
            >
              Save & Close
            </button>
            <button 
              type="button"
              onClick={() => {
                const cleared = { international: false, domestic: false, departure: false, arrival: false, airline_flight_no: "" };
                setLocalData(cleared);
                onClear();
              }}
              className="bg-[#c9302c] hover:bg-[#ac2925] text-white px-4 py-2 rounded font-medium text-sm transition-colors shadow-md active:scale-95"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}