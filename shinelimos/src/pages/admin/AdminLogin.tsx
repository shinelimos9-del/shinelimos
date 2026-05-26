import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Set a mock authentication token
      localStorage.setItem("adminToken", "mock-token-123");
      navigate("/admin-dashboard");
    }
  };

  return (
    <div className="route-fade bg-black/40 min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="text-[10px] tracking-[0.4em] text-white/50 uppercase mb-3 font-semibold">Shine Limo Portal</div>
          <h1 className="font-serif-lux text-3xl md:text-4xl text-white">Admin Login</h1>
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all placeholder-white/30"
                placeholder="admin@shinelimos.com"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] uppercase tracking-widest text-white/60">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-white/50 hover:text-white transition-colors underline-offset-4 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all placeholder-white/30"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 bg-white hover:bg-gray-200 text-black px-6 py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
