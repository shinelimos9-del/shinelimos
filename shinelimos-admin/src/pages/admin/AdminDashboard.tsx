import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, CheckSquare, DollarSign, Loader2, Bell, Send, FileText, Car, Play, Square, X } from "lucide-react";
import { getDashboardData, updateBookingStatus, notifyVehicleArrival, sendPaymentLink, sendFinalInvoice, toggleVehicleTracking, toggleStopTimer } from "../../utils/api";
import { calculateQuote, parseHours } from "../../utils/pricingEngine";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [sendingPaymentId, setSendingPaymentId] = useState<string | null>(null);

  // Final Invoice Modal State
  const [finalModalBooking, setFinalModalBooking] = useState<any | null>(null);
  const [finalOptions, setFinalOptions] = useState({
    stopsCount: 0,
    waitingMinutes: 0,
    childSeatsCount: 0,
    hasCleaningFee: false,
    cleaningFeeAmount: 150,
    tolls: 0,
    parking: 0,
    isHoliday: false,
    isLateNight: false,
  });
  const [sendingFinalInvoiceState, setSendingFinalInvoiceState] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenFinalModal = (bookingRow: any) => {
    const bookingObj = {
      _id: bookingRow.id || bookingRow._id,
      contact_details: {
        booker: {
          first_name: bookingRow.name ? bookingRow.name.split(' ')[0] : 'Customer',
          last_name: bookingRow.name ? bookingRow.name.split(' ').slice(1).join(' ') : '',
          email: bookingRow.email || '',
        }
      },
      vehicle_details: bookingRow.vehicle_details || { vehicle_name: bookingRow.vehicle_name || 'Luxury Vehicle' },
      trip_details: bookingRow.trip_details || [{ trip_type: bookingRow.trip || 'One Way' }],
      waiting_minutes: bookingRow.waiting_minutes || 0,
      additional_stops_count: bookingRow.additional_stops_count || 0,
      price_breakdown: bookingRow.price_breakdown || {},
    };

    setFinalModalBooking(bookingObj);
    setFinalOptions({
      stopsCount: bookingObj.additional_stops_count || 0,
      waitingMinutes: bookingObj.waiting_minutes || 0,
      childSeatsCount: bookingObj.price_breakdown?.childSeatsCount || 0,
      hasCleaningFee: Boolean(bookingObj.price_breakdown?.cleaningFee > 0),
      cleaningFeeAmount: bookingObj.price_breakdown?.cleaningFee || 150,
      tolls: bookingObj.price_breakdown?.tolls || 0,
      parking: bookingObj.price_breakdown?.parking || 0,
      isHoliday: Boolean(bookingObj.price_breakdown?.isHoliday),
      isLateNight: Boolean(bookingObj.price_breakdown?.isLateNight),
    });
  };

  const handleSendFinalInvoiceSubmit = async () => {
    if (!finalModalBooking) return;
    try {
      setSendingFinalInvoiceState(true);
      const response = await sendFinalInvoice(finalModalBooking._id, finalOptions);
      if (response.success) {
        alert(`Final trip invoice and payment link sent successfully!\nGrand Total: $${response.quote?.formattedGrandTotal || ''}`);
        setFinalModalBooking(null);
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to send final invoice");
      }
    } catch (error: any) {
      console.error("Error sending final invoice:", error);
      alert(error.response?.data?.message || "Failed to send final invoice.");
    } finally {
      setSendingFinalInvoiceState(false);
    }
  };

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
        <Loader2 className="animate-spin mb-4 text-purple-400" size={32} />
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
          <p className="text-white/60 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <select className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500/40 appearance-none min-w-[120px]">
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
          icon={<CheckSquare className="text-purple-400" size={20} />} 
          bg="bg-white/5 border-white/10"
        />
        <StatCard 
          title="Total New Customers" 
          value={data.overview.total_new_customers.value} 
          change={data.overview.total_new_customers.trend} 
          isPositive={data.overview.total_new_customers.trend.startsWith('+')} 
          icon={<Users className="text-purple-400" size={20} />} 
          bg="bg-white/5 border-white/10"
        />
        <StatCard 
          title="Total Earning" 
          value={`$${data.overview.total_earning.value.toLocaleString()}`} 
          change={data.overview.total_earning.trend} 
          isPositive={data.overview.total_earning.trend.startsWith('+')} 
          icon={<DollarSign className="text-purple-400" size={20} />} 
          bg="bg-white/5 border-white/10"
        />
      </div>

      {/* Revenue Overview */}
      <div className="glass-dark rounded-2xl border border-white/10 p-6 hover:border-purple-500/20 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-white/80">This Year</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white/20"></span>
              <span className="text-white/80">Last Year</span>
            </div>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 mt-4 relative pl-10">
          <div className="absolute inset-0 left-10 flex flex-col justify-between pointer-events-none border-b border-white/10 pb-6">
            <div className="border-t border-white/5 w-full h-0"></div>
            <div className="border-t border-white/5 w-full h-0"></div>
            <div className="border-t border-white/5 w-full h-0"></div>
            <div className="border-t border-white/5 w-full h-0"></div>
          </div>
          
          <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] text-white/50 pb-6">
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
                  <div 
                    className="w-full max-w-3 bg-white/20 rounded-t-sm group-hover:bg-white/30 transition-colors"
                    style={{ height: `${lastYearHeight}%` }}
                  ></div>
                  <div 
                    className="w-full max-w-3 bg-purple-500 rounded-t-sm group-hover:bg-purple-400 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                    style={{ height: `${thisYearHeight}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-white/50 mt-2 absolute bottom-0">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Trips */}
        <div className="lg:col-span-2 glass-dark rounded-2xl border border-white/10 p-6 hover:border-purple-500/20 transition-colors">
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

        {/* Top Destination Pie Chart */}
        <div className="glass-dark rounded-2xl border border-white/10 p-6 hover:border-purple-500/20 transition-colors flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Top Destination</h2>
          <div className="flex-1 flex items-center justify-center">
             <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
                  {(() => {
                    const hexColors = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e'];
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
                
                <div className="text-center z-10 bg-black/60 backdrop-blur-sm rounded-full w-24 h-24 flex flex-col items-center justify-center border border-white/10 shadow-lg">
                  <div className="text-xl font-bold text-white leading-tight">{data.top_destinations[0]?.percentage || "0"}%</div>
                  <div className="text-[9px] text-purple-300 uppercase tracking-widest px-2 truncate w-full text-center">{data.top_destinations[0]?.name || "N/A"}</div>
                </div>
             </div>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            {data.top_destinations.map((dest: any, i: number) => {
              const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
              return (
                <div key={i} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></span>
                    <span className="text-white/80">{dest.name}</span>
                  </span>
                  <span className="text-white font-medium">{dest.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Table (Recent) */}
      <div className="glass-dark rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/60 text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-white/10 text-white">
              {data.recent_bookings.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold">{row.name?.[0] || "?"}</div>
                      <div>
                        <div className="text-white font-medium">{row.name || "Unknown"}</div>
                        <div className="text-[11px] text-white/50">{row.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{row.trip || "N/A"}</td>
                  <td className="p-4 text-white/80">{row.date || "N/A"}</td>
                  <td className="p-4 text-purple-300 font-mono">{row.price || "N/A"}</td>
                  <td className="p-4 text-white/80">{row.phone || "N/A"}</td>
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
                        onClick={() => handleOpenFinalModal(row)}
                        disabled={sendingPaymentId === row.id}
                        className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        title="Open interactive invoice form to add extra charges & send final invoice with payment link"
                      >
                        <FileText size={12} />
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

      {/* FINAL INVOICE & TRIP EXTRAS TRACKING MODAL */}
      {finalModalBooking && (() => {
        const tripSegment = finalModalBooking.trip_details?.[0] || {};
        const distance = tripSegment.distance_miles || tripSegment.miles || finalModalBooking.price_breakdown?.effectiveMiles || 0;
        const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (finalModalBooking.price_breakdown?.durationMinutes || 0);

        const rawPriceStr = typeof finalModalBooking.price === 'string' ? finalModalBooking.price.replace(/[^0-9.]/g, '') : finalModalBooking.price;
        const initialSubtotal = finalModalBooking.price_breakdown?.mainBookingPrice
          || finalModalBooking.price_breakdown?.subtotal
          || finalModalBooking.price_breakdown?.rawSubtotal
          || finalModalBooking.vehicle_details?.estimated_price
          || parseFloat(rawPriceStr)
          || 0;

        const liveQuote = calculateQuote({
          vehicle: finalModalBooking.vehicle_details,
          bookingType: tripSegment.trip_type || 'one-way',
          distanceMiles: distance,
          durationMinutes: durationMins,
          durationHours: parseHours(tripSegment.duration) || finalModalBooking.price_breakdown?.durationHours || 0,
          pickupLocation: tripSegment.pickup_location,
          pickupTime: tripSegment.start_time,
          pickupDate: tripSegment.date,
          flightInfo: tripSegment.flight_details,
          occasion: tripSegment.occasion,
          waitingMinutes: finalOptions.waitingMinutes,
          additionalStopsCount: finalOptions.stopsCount,
          childSeatsCount: finalOptions.childSeatsCount,
          hasCleaningFee: finalOptions.hasCleaningFee,
          cleaningFeeAmount: finalOptions.cleaningFeeAmount,
          tolls: finalOptions.tolls,
          parking: finalOptions.parking,
          isHoliday: finalOptions.isHoliday,
          isLateNight: finalOptions.isLateNight,
          initialBookingSubtotal: initialSubtotal,
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto text-left">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                <div className="flex items-center gap-2 text-purple-400">
                  <FileText size={20} />
                  <div>
                    <h3 className="font-semibold text-lg text-white">Final Trip Invoice & Extras Tracking</h3>
                    <p className="text-xs text-white/50">Track trip extras and send final invoice payment link after drop-off.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFinalModalBooking(null)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white">
                {/* Trip & Booker Info Header */}
                <div className="grid sm:grid-cols-2 gap-3 glass p-4 rounded-xl border border-white/5 text-xs">
                  <div><span className="text-white/50">Customer:</span> <strong className="text-white">{finalModalBooking.contact_details?.booker?.first_name} {finalModalBooking.contact_details?.booker?.last_name}</strong></div>
                  <div><span className="text-white/50">Email:</span> <span className="text-purple-300 font-mono">{finalModalBooking.contact_details?.booker?.email}</span></div>
                  <div><span className="text-white/50">Vehicle:</span> <span className="text-white font-medium">{finalModalBooking.vehicle_details?.vehicle_name}</span></div>
                  <div><span className="text-white/50">Service:</span> <span className="text-purple-300 font-medium">{finalModalBooking.trip_details?.[0]?.trip_type || 'One Way'}</span></div>
                </div>

                {/* Extras Tracking Controls */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2">
                    🎛️ Trip Extras & Surcharges Tracking
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    {/* Additional Stops */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Additional Stops Count:</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.additionalStopsFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.stopsCount}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, stopsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                      <span className="text-[10px] text-white/40">Rate: Sedan $15 / SUV $20 / Sprinter $30 per stop</span>
                    </div>

                    {/* Waiting Time Mins */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Waiting Time (Minutes):</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.waitingMinutes}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, waitingMinutes: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                      <span className="text-[10px] text-white/40">First 15 mins FREE. After 15 mins: Sedan $1/m, SUV $1.50/m, Sprinter $2/m</span>
                    </div>

                    {/* Child Seats */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Total Child Seats:</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.childSeatsCount}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, childSeatsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                      <span className="text-[10px] text-white/40">First seat FREE. Additional seats $15 each</span>
                    </div>

                    {/* Tolls */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Tolls Amount ($):</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.tolls.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.tolls}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, tolls: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                    </div>

                    {/* Parking */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="font-medium text-white/80 flex justify-between">
                        <span>Parking Amount ($):</span>
                        <span className="text-purple-300 font-mono">${liveQuote.breakdown.parking.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.parking}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, parking: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-purple-500/60 outline-none"
                      />
                    </div>

                    {/* Cleaning Fee */}
                    <div className="space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                      <label className="flex items-center gap-2 font-medium text-white/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={finalOptions.hasCleaningFee}
                          onChange={(e) => setFinalOptions(prev => ({ ...prev, hasCleaningFee: e.target.checked }))}
                          className="rounded accent-purple-500 w-4 h-4"
                        />
                        <span>Apply Cleaning Fee</span>
                      </label>
                      {finalOptions.hasCleaningFee && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/50">$</span>
                          <input
                            type="number"
                            min={150}
                            value={finalOptions.cleaningFeeAmount}
                            onChange={(e) => setFinalOptions(prev => ({ ...prev, cleaningFeeAmount: Math.max(0, parseFloat(e.target.value) || 150) }))}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs outline-none"
                            placeholder="150"
                          />
                        </div>
                      )}
                      <span className="text-[10px] text-white/40 block">Starts at $150 if vehicle cleaning required</span>
                    </div>
                  </div>

                  {/* Manual Surcharge Toggles */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                      <input
                        type="checkbox"
                        checked={finalOptions.isLateNight || liveQuote.breakdown.isLateNight}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, isLateNight: e.target.checked }))}
                        className="rounded accent-purple-500 w-4 h-4"
                      />
                      <span>🌙 Late Night Surcharge (15% for 12 AM - 5 AM)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                      <input
                        type="checkbox"
                        checked={finalOptions.isHoliday || liveQuote.breakdown.isHoliday}
                        onChange={(e) => setFinalOptions(prev => ({ ...prev, isHoliday: e.target.checked }))}
                        className="rounded accent-purple-500 w-4 h-4"
                      />
                      <span>🎆 Holiday Surcharge (20%)</span>
                    </label>
                  </div>
                </div>

                {/* Live Itemized Breakdown Table */}
                <div className="bg-black/60 border border-white/10 rounded-xl p-5 space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2 mb-3">
                    📊 Live Final Invoice Calculation Breakdown
                  </h4>
                  <div className="flex justify-between font-medium text-white/90"><span>Main Booking Price (Booked Base):</span><span>${liveQuote.breakdown.mainBookingPrice.toFixed(2)}</span></div>
                  {liveQuote.isAirportPickup && <div className="flex justify-between text-emerald-400"><span>Airport Pickup Fee (Meet & Greet Included):</span><span>${liveQuote.breakdown.airportPickupFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.additionalStopsFee > 0 && <div className="flex justify-between text-white/70"><span>Additional Stops Fee:</span><span>${liveQuote.breakdown.additionalStopsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.waitingTimeFee > 0 && <div className="flex justify-between text-amber-300"><span>Waiting Time Fee:</span><span>${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.childSeatsFee > 0 && <div className="flex justify-between text-white/70"><span>Child Seats Fee:</span><span>${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.cleaningFee > 0 && <div className="flex justify-between text-rose-300"><span>Cleaning Fee:</span><span>${liveQuote.breakdown.cleaningFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.tolls > 0 && <div className="flex justify-between text-white/70"><span>Tolls:</span><span>${liveQuote.breakdown.tolls.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.parking > 0 && <div className="flex justify-between text-white/70"><span>Parking:</span><span>${liveQuote.breakdown.parking.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2"><span>Subtotal:</span><span>${liveQuote.breakdown.subtotal.toFixed(2)}</span></div>
                  {liveQuote.breakdown.lateNightSurcharge > 0 && <div className="flex justify-between text-amber-300"><span>Late Night Surcharge (15%):</span><span>${liveQuote.breakdown.lateNightSurcharge.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.holidaySurcharge > 0 && <div className="flex justify-between text-amber-300"><span>Holiday Surcharge (20%):</span><span>${liveQuote.breakdown.holidaySurcharge.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-white/70"><span>Gratuity (20%):</span><span>${liveQuote.breakdown.gratuity.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white/70"><span>Credit Card Fee (3%):</span><span>${liveQuote.breakdown.creditCardFee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-lg text-purple-400 border-t-2 border-purple-500/50 pt-3 mt-2">
                    <span>Final Total Due:</span>
                    <span>${liveQuote.formattedGrandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/2 shrink-0">
                <button
                  onClick={() => setFinalModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendFinalInvoiceSubmit}
                  disabled={sendingFinalInvoiceState}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {sendingFinalInvoiceState ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Final Invoice & Payment Link
                </button>
              </div>
            </div>
          </div>
        );
      })()}
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
