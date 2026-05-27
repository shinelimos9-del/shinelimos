import { useState, useRef, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CarFront, LogOut, Bell, Menu, X, CheckSquare } from "lucide-react";
import { getAdminProfile, getNotifications, markNotificationsRead, logoutAdmin } from "../../utils/api";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<any>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchAdminProfile();
    fetchNotifications();
    
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await getAdminProfile();
      if (response.success) {
        setAdminData(response.admin);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = (id: string) => {
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

  const markAllAsRead = async () => {
    try {
      const response = await markNotificationsRead();
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminToken");
      sessionStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const navItems = [
    { name: "Overview", path: "/admin-dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Vehicle", path: "/admin-dashboard/vehicles", icon: <CarFront size={18} /> },
    { name: "Booking", path: "/admin-dashboard/bookings", icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="h-screen bg-transparent text-white flex overflow-hidden selection:bg-white/10">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/60 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-20 flex items-center justify-between lg:justify-center px-6 border-b border-white/5">
          <Link to="/">
            <img src="/logo/logo.png" alt="Shine Limo" className="h-10 object-contain hover:opacity-80 transition-opacity" />
          </Link>
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
                          key={notification._id} 
                          onClick={() => handleNotificationClick(notification._id)}
                          className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${!notification.is_read ? 'bg-white/3' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notification.is_read ? 'text-white font-medium' : 'text-white'}`}>{notification.message}</h4>
                            <span className="text-[10px] text-white">{notification.time}</span>
                          </div>
                          <p className="text-xs text-white line-clamp-2">
                            {notification.booker_name} - {notification.pickup} to {notification.dropoff}
                          </p>
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
                <div className="text-sm font-medium text-white">{adminData?.admin_name || "Admin User"}</div>
                <div className="text-[10px] text-white tracking-wider uppercase">Superadmin</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gold to-yellow-600 p-0.5">
                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center border border-black">
                  <span className="font-serif-lux text-sm text-white">
                    {adminData?.admin_name ? adminData.admin_name[0] : "A"}
                  </span>
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