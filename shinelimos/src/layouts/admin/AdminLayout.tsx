import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CarFront, LogOut, Bell, Search, Menu, X, CheckSquare } from "lucide-react";
import Logo from "../../components/Logo";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication tokens or session data
    localStorage.removeItem("adminToken");
    sessionStorage.clear();
    // Redirect to login page and prevent going back
    navigate("/admin-login", { replace: true });
  };

  const navItems = [
    { name: "Overview", path: "/admin-dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Vehicle", path: "/admin-dashboard/vehicles", icon: <CarFront size={18} /> },
    { name: "Booking", path: "/admin-dashboard/bookings", icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white flex overflow-hidden selection:bg-gold/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/60 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link to="/" className="scale-75 origin-left">
            <Logo />
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar space-y-1">
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-4 px-2 font-semibold">Dashboards</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <span className={isActive ? "text-gold" : ""}>{item.icon}</span>
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black/40 backdrop-blur-sm">
        {/* Header */}
        <header className="h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
              <Search size={16} className="text-white/40" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-white/70 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">Admin User</div>
                <div className="text-[10px] text-white/50 tracking-wider uppercase">Superadmin</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gold to-yellow-600 p-[2px]">
                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center border border-black">
                  <span className="font-serif-lux text-sm text-gold">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
