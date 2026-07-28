import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { verifyAdminOtp } from "../../utils/api";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminResetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!otp) {
      setError("Please enter the OTP code.");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyAdminOtp(email, otp);
      if (data.success) {
        setStatus(data.message || "OTP verified successfully. Proceeding to password reset...");
        setTimeout(() => {
          navigate("/reset-password");
        }, 1000);
      } else {
        setError(data.message || "OTP verification failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-left">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 mb-8 transition-colors uppercase tracking-widest font-mono">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="font-serif-lux text-3xl text-white font-bold">Verify OTP</h1>
          <p className="text-white/60 mt-3 text-sm">Enter the 6-digit code sent to your email.</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl bg-black/60">
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            {status && (
              <div className="text-emerald-300 text-xs bg-emerald-300/10 border border-emerald-300/20 p-3 rounded-lg text-center">
                {status}
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">6-Digit Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                maxLength={6}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-white text-center tracking-[0.5em] text-lg focus:outline-none focus:border-purple-500/60 focus:bg-white/5 transition-all placeholder-white/20 disabled:opacity-50"
                placeholder="••••••"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying OTP...
                </>
              ) : (
                "Confirm OTP"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
