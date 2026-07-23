import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { PageHero, GoldButton } from "../components/ui";
import { verifyPaymentSession } from "../utils/api";

const getSessionIdFromUrl = (searchParams: URLSearchParams): string | null => {
  let id = searchParams.get("session_id");
  if (!id && typeof window !== "undefined") {
    // Extract session_id from hash URL e.g. /#/payment-success?session_id=cs_live_...
    const hashMatch = window.location.hash.match(/[?&]session_id=([^&]+)/);
    if (hashMatch) {
      id = decodeURIComponent(hashMatch[1]);
    } else {
      const searchMatch = window.location.search.match(/[?&]session_id=([^&]+)/);
      if (searchMatch) {
        id = decodeURIComponent(searchMatch[1]);
      }
    }
  }
  return id;
};

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = getSessionIdFromUrl(params);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (sessionId) {
        try {
          const res = await verifyPaymentSession(sessionId);
          if (isMounted && res.success && res.booking) {
            setBooking(res.booking);
          }
        } catch (error) {
          console.error("Payment session verification error:", error);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <div className="route-fade">
      <PageHero 
        image="/images/pexels-photo-8425047.webp" 
        eyebrow="Payment Successful" 
        title={<>Your payment is <em className="text-white not-italic">confirmed</em></>} 
      />
      
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl glass-dark rounded-3xl p-10 text-center border border-white/5">
          {loading ? (
            <div className="py-10">
              <Loader2 className="h-12 w-12 text-gold animate-spin mx-auto mb-4" />
              <p className="text-white/70">Verifying your payment details...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full glass-gold flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-gold" />
              </div>
              <h2 className="font-serif-lux text-3xl gradient-gold-text">Payment Confirmed!</h2>
              <p className="text-white/70 mt-4 leading-relaxed">
                Thank you for your payment. Your reservation is now fully confirmed. 
                A confirmation email with full receipt details has been sent to your inbox.
              </p>
              
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-left space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-white/50 text-xs uppercase tracking-widest">Payment Status</span>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Paid & Confirmed</span>
                </div>

                {booking && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-xs uppercase tracking-widest">Booking Ref</span>
                      <span className="text-white text-xs font-mono font-semibold">#{booking._id}</span>
                    </div>
                    {booking.vehicle_details?.vehicle_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-xs uppercase tracking-widest">Vehicle</span>
                        <span className="text-white text-xs font-medium">{booking.vehicle_details.vehicle_name}</span>
                      </div>
                    )}
                    {booking.trip_details?.[0]?.pickup_location && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-xs uppercase tracking-widest">Pickup</span>
                        <span className="text-white text-xs font-medium truncate max-w-[250px]">{booking.trip_details[0].pickup_location}</span>
                      </div>
                    )}
                    {booking.trip_details?.[0]?.dropoff_location && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-xs uppercase tracking-widest">Drop-off</span>
                        <span className="text-white text-xs font-medium truncate max-w-[250px]">{booking.trip_details[0].dropoff_location}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-xs uppercase tracking-widest">Stripe Reference</span>
                  <span className="text-white/70 text-xs font-mono">{sessionId ? sessionId.slice(-18) : "N/A"}</span>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <GoldButton to="/">Return Home</GoldButton>
                <Link to="/contact" className="px-8 py-3 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all">
                  Contact Support
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
