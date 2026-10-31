import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { driverLogin } from "../utils/api";

// Phase 2 — driver login. Separate from the admin login: a driver signs
// in with the email on their driver record + the password the admin set
// for them, and lands on /driver-trips with only their assigned trips.
// Driver accounts cannot reach the admin dashboard.
export default function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Email and password are required.");
    setLoading(true);
    try {
      const res = await driverLogin(email, password);
      if (!res || !res.success) {
        setError(res?.message || "Login failed");
        setLoading(false);
        return;
      }
      if (res.token) localStorage.setItem("driverToken", res.token);
      navigate("/driver-trips");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-fade bg-black/40 min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-3 font-semibold">Shine Limo Portal</div>
          <h1 className="font-serif-lux text-3xl md:text-4xl text-white">Driver Login</h1>
          <p className="text-white/50 text-sm mt-3">Sign in with the email and password your dispatcher gave you to see your assigned trips.</p>
        </div>
        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/40" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-gold text-black py-3.5 rounded-xl font-semibold disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
