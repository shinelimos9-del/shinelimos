import { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CarFront, LogOut, Bell, Search, Menu, X, CheckSquare } from "lucide-react";
import { mockNotifications } from "../../data/mockNotifications";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: number) => {
    setShowNotifications(false);
    navigate(`/admin-dashboard/notifications?id=${id}`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    // Clear any authentication tokens or session data
    localStorage.removeItem("adminToken");
    sessionStorage.clear();
    // Redirect to login page and prevent going back
    navigate("/", { replace: true });
  };

  const navItems = [
    { name: "Overview", path: "/admin-dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Vehicle", path: "/admin-dashboard/vehicles", icon: <CarFront size={18} /> },
    { name: "Booking", path: "/admin-dashboard/bookings", icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="h-screen pt-[88px] bg-transparent text-white flex overflow-hidden selection:bg-white/10">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/60 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-end px-6 border-b border-white/5">
          <button className="lg:hidden text-white hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar space-y-1">
          <div className="text-[10px] tracking-[0.2em] uppercase text-white mb-4 px-2 font-semibold">Dashboards</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-white/10 text-white font-medium" : "text-white hover:text-white hover:bg-white/5"}`}
              >
                <span className={isActive ? "text-white" : ""}>{item.icon}</span>
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-white hover:text-white hover:bg-white/5 transition-all duration-300"
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
            <button className="lg:hidden text-white hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            

          </div>

          <div className="flex items-center gap-5">
            <div className="relative" ref={notificationRef}>
              <button 
                className="relative text-white hover:text-white transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border border-[#0a0a0a] animate-pulse"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-6 w-80 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-white font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-white hover:text-white/80 transition-colors">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? 'bg-white/3' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-white'}`}>{notification.title}</h4>
                            <span className="text-[10px] text-white">{notification.time}</span>
                          </div>
                          <p className="text-xs text-white line-clamp-2">{notification.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-white">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">Admin User</div>
                <div className="text-[10px] text-white tracking-wider uppercase">Superadmin</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gold to-yellow-600 p-[2px]">
                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center border border-black">
                  <span className="font-serif-lux text-sm text-white">A</span>
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