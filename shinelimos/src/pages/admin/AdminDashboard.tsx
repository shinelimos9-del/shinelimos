import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, CheckSquare, DollarSign, Loader2, Bell, Send, FileText, Car, Play, Square } from "lucide-react";
import { getDashboardData, updateBookingStatus, notifyVehicleArrival, sendPaymentLink, sendFinalInvoice, toggleVehicleTracking, toggleStopTimer } from "../../utils/api";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [sendingPaymentId, setSendingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardData();
      if (response.success) {
        setData(response);
      } else {
        setError(response.message || "Failed to fetch dashboard data");
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("An unexpected error occurred while fetching dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await updateBookingStatus(id, status);
      if (response.success) {
        fetchDashboardData();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  const handleNotifyArrival = async (bookingId: string) => {
    try {
      setNotifyingId(bookingId);
      const response = await notifyVehicleArrival(bookingId, 0);
      if (response.success) {
        alert("Vehicle arrival notification with waiting policy sent successfully to customer!");
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to send arrival notification");
      }
    } catch (error: any) {
      console.error("Error sending arrival notification:", error);
      alert(error.response?.data?.message || "Error sending arrival notification.");
    } finally {
      setNotifyingId(null);
    }
  };

  const handleSendPayment = async (bookingId: string) => {
    try {
      setSendingPaymentId(bookingId);
      const response = await sendPaymentLink(bookingId);
      if (response.success) {
        alert("Stripe payment link sent to customer!");
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to send payment link");
      }
    } catch (error: any) {
      console.error("Error sending payment link:", error);
      alert(error.response?.data?.message || "Failed to send payment link.");
    } finally {
      setSendingPaymentId(null);
    }
  };

  const handleSendFinalInvoiceQuick = async (bookingId: string) => {
    try {
      setSendingPaymentId(bookingId);
      const response = await sendFinalInvoice(bookingId, {});
      if (response.success) {
        alert(`Final trip invoice and payment link sent successfully to booker & passenger!\nGrand Total: $${response.quote?.formattedGrandTotal || ''}`);
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to send final invoice");
      }
    } catch (error: any) {
      console.error("Error sending final invoice:", error);
      alert(error.response?.data?.message || "Failed to send final invoice.");
    } finally {
      setSendingPaymentId(null);
    }
  };

  const handleToggleTracking = async (bookingId: string, updates: { vehicle_running?: boolean; stop_in_progress?: boolean }) => {
    setData((prev: any) => {
      if (!prev || !prev.recent_bookings) return prev;
      return {
        ...prev,
        recent_bookings: prev.recent_bookings.map((r: any) =>
          (r.id === bookingId || r._id === bookingId) ? { ...r, ...updates } : r
        ),
      };
    });

    try {
      const response = await toggleVehicleTracking(bookingId, updates);
      if (response && response.success) {
        fetchDashboardData();
      } else {
        alert(response?.message || "Failed to update vehicle tracking status");
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error("Error updating tracking:", err);
      alert(err.response?.data?.message || err.message || "Error updating vehicle tracking status");
      fetchDashboardData();
    }
  };

  const handleToggleStopTimer = async (bookingId: string, currentStopInProgress: boolean) => {
    const nextState = !currentStopInProgress;
    setData((prev: any) => {
      if (!prev || !prev.recent_bookings) return prev;
      return {
        ...prev,
        recent_bookings: prev.recent_bookings.map((r: any) =>
          (r.id === bookingId || r._id === bookingId) ? { ...r, stop_in_progress: nextState } : r
        ),
      };
    });

    try {
      const action = currentStopInProgress ? 'end' : 'start';
      const response = await toggleStopTimer(bookingId, action);
      if (response && response.success) {
        if (action === 'end') {
          alert(response.message || "Stop ended and pricing added to invoice!");
        }
        fetchDashboardData();
      } else {
        alert(response?.message || "Failed to update stop timer");
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error("Error toggling stop timer:", err);
      alert(err.response?.data?.message || err.message || "Error updating stop timer");
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-white text-black px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif-lux text-white">Overview</h1>
          <p className="text-white text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <select className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-white/20 appearance-none min-w-[120px]">
          <option value="today" className="bg-[#111]">Today</option>
          <option value="week" className="bg-[#111]">This Week</option>
          <option value="month" className="bg-[#111]">This Month</option>
          <option value="year" className="bg-[#111]">This Year</option>
        </select>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Booking" 
          value={data.overview.total_booking.value} 
          change={data.overview.total_booking.trend} 
          isPositive={data.overview.total_booking.trend.startsWith('+')} 
          icon={<CheckSquare className="text-white" size={20} />} 
          bg="bg-white/5 border-white/20"
        />
        <StatCard 
          title="Total New Customers" 
          value={data.overview.total_new_customers.value} 
          change={data.overview.total_new_customers.trend} 
          isPositive={data.overview.total_new_customers.trend.startsWith('+')} 
          icon={<Users className="text-white" size={20} />} 
          bg="bg-white/5 border-white/20"
        />
        <StatCard 
          title="Total Earning" 
          value={`$${data.overview.total_earning.value.toLocaleString()}`} 
          change={data.overview.total_earning.trend} 
          isPositive={data.overview.total_earning.trend.startsWith('+')} 
          icon={<DollarSign className="text-white" size={20} />} 
          bg="bg-white/5 border-white/20"
        />
      </div>

      {/* Revenue Overview */}
      <div className="glass-dark rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white"></span>
              <span className="text-white">This Year</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white/20"></span>
              <span className="text-white">Last Year</span>
            </div>
          </div>
        </div>
        
        {/* Placeholder for a Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 mt-4 relative pl-10">
          {/* Y-axis lines */}
          <div className="absolute inset-0 left-10 flex flex-col justify-between pointer-events-none border-b border-white/10 pb-6">
            <div className="border-t border-white/5 w-full h-0"></div>
            <div className="border-t border-white/5 w-full h-0"></div>
            <div className="border-t border-white/5 w-full h-0"></div>
            <div className="border-t border-white/5 w-full h-0"></div>
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] text-white pb-6">
            <span>${Math.ceil(Math.max(
              ...(data.revenue_overview.this_year.map((r: any) => r.revenue) || []), 
              ...(data.revenue_overview.last_year.map((r: any) => r.revenue) || []), 
              40000
            ) / 1000)}k</span>
            <span>$30k</span>
            <span>$20k</span>
            <span>$10k</span>
            <span>$0</span>
          </div>

          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => {
            const thisYearData = data.revenue_overview.this_year.find((r: any) => r.month === month)?.revenue || 0;
            const lastYearData = data.revenue_overview.last_year.find((r: any) => r.month === month)?.revenue || 0;
            
            const maxRevenue = Math.max(
              ...(data.revenue_overview.this_year.map((r: any) => r.revenue) || []), 
              ...(data.revenue_overview.last_year.map((r: any) => r.revenue) || []), 
              40000
            );
            
            const thisYearHeight = (thisYearData / maxRevenue) * 100;
            const lastYearHeight = (lastYearData / maxRevenue) * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group relative z-10 h-full pb-6">
                <div className="w-full flex items-end justify-center gap-1 px-1 h-full">
                  {/* Last Year Bar */}
                <div 
                  className="w-full max-w-3 bg-white/20 rounded-t-sm group-hover:bg-white/30 transition-colors"
                  style={{ height: `${lastYearHeight}%` }}
                ></div>
                {/* This Year Bar */}
                <div 
                  className="w-full max-w-3 bg-white rounded-t-sm group-hover:bg-white transition-colors shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                  style={{ height: `${thisYearHeight}%` }}
                ></div>
                </div>
                <span className="text-[10px] text-white mt-2 absolute bottom-0">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Trips */}
        <div className="lg:col-span-2 glass-dark rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
          <h2 className="text-lg font-semibold text-white mb-6">Total Trips - {data.overview.total_booking.value}</h2>
          <div className="space-y-6">
            {data.trip_summary.map((trip: any, i: number) => (
              <TripProgress 
                key={i} 
                label={trip.name} 
                value={parseInt(trip.sales)} 
                color={trip.name === "Pending" ? "bg-orange-500" : "bg-green-500"} 
              />
            ))}
          </div>
        </div>

        {/* Top Destination Pie Chart Placeholder */}
        <div className="glass-dark rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Top Destination</h2>
          <div className="flex-1 flex items-center justify-center">
             <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Dynamic SVG Donut Chart */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
                  {(() => {
                    const hexColors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];
                    let currentAngle = 0;
                    return data.top_destinations.map((dest: any, i: number) => {
                      const percentage = parseFloat(dest.percentage) || 0;
                      if (percentage === 0) return null;
                      
                      const dasharray = `${percentage} 100`;
                      const dashoffset = -currentAngle;
                      currentAngle += percentage;
                      
                      return (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={hexColors[i % hexColors.length]}
                          strokeWidth="16"
                          strokeDasharray={dasharray}
                          strokeDashoffset={dashoffset}
                          pathLength="100"
                          className="transition-all duration-1000 ease-out"
                        />
                      );
                    });
                  })()}
                </svg>
                
                <div className="text-center z-10 bg-black/40 backdrop-blur-sm rounded-full w-24 h-24 flex flex-col items-center justify-center border border-white/10 shadow-lg">
                  <div className="text-xl font-bold text-white leading-tight">{data.top_destinations[0]?.percentage || "0"}%</div>
                  <div className="text-[9px] text-white/70 uppercase tracking-widest px-2 truncate w-full text-center">{data.top_destinations[0]?.name || "N/A"}</div>
                </div>
             </div>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            {data.top_destinations.map((dest: any, i: number) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
              return (
                <div key={i} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></span>
                    {dest.name}
                  </span>
                  <span className="text-white">{dest.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Table (Recent) */}
      <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
          <button className="text-xs text-white hover:text-white transition-colors uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Trip Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Number</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Live Tracking</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {data.recent_bookings.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{row.name?.[0] || "?"}</div>
                      <div>
                        <div className="text-white font-medium">{row.name || "Unknown"}</div>
                        <div className="text-[11px] text-white">{row.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{row.trip || "N/A"}</td>
                  <td className="p-4 text-white">{row.date || "N/A"}</td>
                  <td className="p-4 text-white">{row.price || "N/A"}</td>
                  <td className="p-4 text-white">{row.phone || "N/A"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${row.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {row.status === 'completed' ? 'Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-[10px]">
                      <button
                        onClick={() => handleToggleTracking(row.id || row._id, { vehicle_running: !row.vehicle_running })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                          row.vehicle_running
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 animate-pulse"
                            : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                        title="Toggle Vehicle Running status"
                      >
                        <Car size={11} />
                        {row.vehicle_running ? "Running" : "Idle"}
                      </button>
                      <button
                        onClick={() => handleToggleStopTimer(row.id || row._id, row.stop_in_progress)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                          row.stop_in_progress
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse"
                            : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                        title={row.stop_in_progress ? "Click to END stop & calculate stop duration pricing onto invoice" : "Click to START tracking an additional stop"}
                      >
                        {row.stop_in_progress ? <Square size={11} className="text-amber-400 fill-amber-400" /> : <Play size={11} className="text-emerald-400 fill-emerald-400" />}
                        {row.stop_in_progress ? "End Stop & Price" : "Start Stop"}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleNotifyArrival(row.id)}
                        disabled={notifyingId === row.id}
                        className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        title="Notify booker & passenger that vehicle has arrived at pickup location"
                      >
                        {notifyingId === row.id ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                        Notify Arrival
                      </button>

                      <button
                        onClick={() => handleSendPayment(row.id)}
                        disabled={sendingPaymentId === row.id}
                        className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        title="Send Stripe Payment Link for trip / waiting time"
                      >
                        {sendingPaymentId === row.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        Send Payment Link
                      </button>

                      <button
                        onClick={() => handleSendFinalInvoiceQuick(row.id)}
                        disabled={sendingPaymentId === row.id}
                        className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        title="Send final itemized trip invoice & payment link after drop-off"
                      >
                        {sendingPaymentId === row.id ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                        Send Final Invoice
                      </button>

                      {row.status === 'completed' ? (
                        <button 
                          onClick={() => handleUpdateStatus(row.id, 'pending')}
                          className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          Pending
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateStatus(row.id, 'completed')}
                          className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon, bg }: any) {
  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${bg}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white font-sans">{value}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-white" : "text-white"}`}>
          {change} {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>
    </div>
  );
}

function TripProgress({ label, value, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white">{label}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${color} bg-opacity-20 text-white`}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}