import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../../utils/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Email and password are required.");
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      if (!res || !res.success) {
        setError(res?.message || "Login failed");
        setLoading(false);
        return;
      }
      if (res.token) localStorage.setItem("adminToken", res.token);
      navigate("/admin-dashboard");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-left">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-xl mx-auto mb-4 text-lg">
            SL
          </div>
          <div className="text-[10px] tracking-[0.4em] text-purple-400 uppercase mb-2 font-mono font-semibold">ShineLimos Portal</div>
          <h1 className="font-serif-lux text-3xl text-white font-bold">Admin Portal Sign In</h1>
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl bg-black/60">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/5 transition-all placeholder-white/30"
                placeholder="admin@shinelimos.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] uppercase tracking-widest text-white/60">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/5 transition-all placeholder-white/30"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-2 ${loading ? 'opacity-60 cursor-wait' : 'bg-purple-600 hover:bg-purple-500'} text-white px-6 py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:-translate-y-0.5`}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
