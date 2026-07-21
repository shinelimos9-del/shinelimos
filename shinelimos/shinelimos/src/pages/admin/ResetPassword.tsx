import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminForgotPassword } from "../../utils/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminResetEmail");
    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const data = await adminForgotPassword(email, password);
      if (data.success) {
        localStorage.removeItem("adminResetEmail");
        setStatus("Password updated successfully.");
        navigate("/admin-login");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to reset your password. Please try again.");
    }
  };

  return (
    <div className="route-fade bg-black/40 min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="font-serif-lux text-3xl md:text-4xl text-white">Create New Password</h1>
          <p className="text-white/50 mt-3 text-sm">Secure your account with a new password.</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleReset} className="space-y-6">
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
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all placeholder-white/30"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all placeholder-white/30"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 bg-white hover:bg-gray-200 text-black px-6 py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5"
            >
              Confirm Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
