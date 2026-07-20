import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { PageHero, GoldButton } from "../components/ui";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you might want to verify the session with the backend here
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
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
                A receipt has been sent to your email address.
              </p>
              
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/50 text-xs uppercase tracking-widest">Status</span>
                  <span className="text-green-400 text-xs font-bold uppercase">Paid</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-xs uppercase tracking-widest">Reference</span>
                  <span className="text-white text-xs font-mono">{sessionId?.slice(-12) || "N/A"}</span>
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
