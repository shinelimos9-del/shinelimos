import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { verifyOtp } from "../../utils/api";


export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email: string } | null)?.email || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!email) {
      setError("Email not found. Please go back and re-enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (!res || !res.success) {
        setError(res?.message || "Invalid OTP");
        return;
      }
      setSuccess(true);
      // Store token for password reset
      if (res.token) {
        localStorage.setItem('resetToken', res.token);
      }
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-fade bg-black/40 min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white mb-8 transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="font-serif-lux text-3xl md:text-4xl text-white">Verify OTP</h1>
          <p className="text-white/50 mt-3 text-sm">Enter the code sent to your email.</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">6-Digit Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-center tracking-[0.5em] text-lg focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all placeholder-white/20"
                placeholder="••••••"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading || success}
              className={`w-full mt-2 ${success ? 'bg-green-500 hover:bg-green-600' : loading ? 'opacity-60 cursor-wait' : 'bg-white hover:bg-gray-200'} ${success ? 'text-white' : 'text-black'} px-6 py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5`}
            >
              {success ? '✓ Verified!' : loading ? 'Verifying…' : 'Confirm OTP'}
            </button>
            {error && <div className="mt-3 text-sm text-red-400 text-center">{error}</div>}
            {success && <div className="mt-3 text-sm text-green-400 text-center">OTP verified successfully. Redirecting…</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
