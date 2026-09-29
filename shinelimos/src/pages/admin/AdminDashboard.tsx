import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, CheckSquare, DollarSign, Loader2, Bell, Send, FileText, X, Play, CheckCircle2, Trash2, Eye, Edit2 } from "lucide-react";
import { getDashboardData, updateBookingStatus, notifyVehicleArrival, sendFinalInvoice, startRide, deleteBooking } from "../../utils/api";
import { calculateQuote, parseHours } from "../../utils/pricingEngine";
import BookingDetailModal from "../../components/BookingDetailModal";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [startingRideId, setStartingRideId] = useState<string | null>(null);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Final Invoice Modal State
  const [finalModalBooking, setFinalModalBooking] = useState<any | null>(null);
  const [isEditingSubtotal, setIsEditingSubtotal] = useState(false);
  const [finalOptions, setFinalOptions] = useState<any>({
    subtotal: '',
    stopsCount: 0,
    waitingMinutes: 0,
    childSeatsCount: 0,
    hasCleaningFee: false,
    cleaningFeeAmount: 150,
    tolls: 0,
    parking: 0,
    isHoliday: false,
    isLateNight: false,
    discount: 0,
  });
  const [sendingFinalInvoiceState, setSendingFinalInvoiceState] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenFinalModal = (bookingRow: any) => {
    const bookingObj = {
      ...bookingRow,
      _id: bookingRow.id || bookingRow._id,
      contact_details: bookingRow.contact_details || {
        booker: {
          first_name: bookingRow.name ? bookingRow.name.split(' ')[0] : 'Customer',
          last_name: bookingRow.name ? bookingRow.name.split(' ').slice(1).join(' ') : '',
          email: bookingRow.email || '',
        }
      },
      vehicle_details: bookingRow.vehicle_details || { vehicle_name: bookingRow.vehicle_name || 'Executive Sedan' },
      trip_details: bookingRow.trip_details || [{ trip_type: bookingRow.trip || 'One Way' }],
      waiting_minutes: bookingRow.waiting_minutes || 0,
      additional_stops_count: bookingRow.additional_stops_count || 0,
      price_breakdown: bookingRow.price_breakdown || {},
    };

    const tripSegment = bookingObj.trip_details?.[0] || {};
    const distance = tripSegment.distance_miles || tripSegment.miles || bookingObj.price_breakdown?.effectiveMiles || 0;
    const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (bookingObj.price_breakdown?.durationMinutes || 0);

    const rawPriceStr = typeof bookingRow.price === 'string' ? bookingRow.price.replace(/[^0-9.]/g, '') : (bookingRow.price || bookingRow.vehicle_details?.estimated_price || bookingRow.estimated_price);
    let initialSubtotal = bookingRow.price_breakdown?.originalSubtotal
      || bookingRow.price_breakdown?.mainBookingPrice
      || bookingRow.price_breakdown?.rawSubtotal
      || bookingRow.vehicle_details?.estimated_price
      || bookingRow.price_breakdown?.subtotal
      || parseFloat(rawPriceStr)
      || 0;

    // If no stored subtotal or <= 0, dynamically calculate actual price from trip details
    if (initialSubtotal <= 0) {
      const autoQuote = calculateQuote({
        vehicle: bookingObj.vehicle_details || { vehicle_name: 'Executive Sedan' },
        bookingType: tripSegment.trip_type || 'one-way',
        distanceMiles: distance,
        durationMinutes: durationMins,
        durationHours: parseHours(tripSegment.duration) || 0,
        pickupLocation: tripSegment.pickup_location,
        pickupTime: tripSegment.start_time,
        pickupDate: tripSegment.date,
        flightInfo: tripSegment.flight_details,
        occasion: tripSegment.occasion,
      });
      initialSubtotal = autoQuote.breakdown.mainBookingPrice || autoQuote.breakdown.subtotal || 0;
    }

    setFinalModalBooking(bookingObj);
    setIsEditingSubtotal(false);
    setFinalOptions({
      subtotal: bookingObj.price_breakdown?.isSubtotalEdited && bookingObj.price_breakdown?.effectiveSubtotal > 0
        ? Number(bookingObj.price_breakdown.effectiveSubtotal).toFixed(2)
        : '',
      stopsCount: bookingObj.additional_stops_count || 0,
      waitingMinutes: bookingObj.waiting_minutes || 0,
      childSeatsCount: bookingObj.price_breakdown?.childSeatsCount || 0,
      hasCleaningFee: Boolean(bookingObj.price_breakdown?.cleaningFee > 0),
      cleaningFeeAmount: bookingObj.price_breakdown?.cleaningFee || 150,
      tolls: bookingObj.price_breakdown?.tolls || 0,
      parking: bookingObj.price_breakdown?.parking || 0,
      isHoliday: Boolean(bookingObj.price_breakdown?.isHoliday),
      isLateNight: Boolean(bookingObj.price_breakdown?.isLateNight),
      discount: bookingObj.price_breakdown?.discount || 0,
    });
  };

  const handleSendFinalInvoiceSubmit = async () => {
    if (!finalModalBooking) return;

    const tripSegment = finalModalBooking.trip_details?.[0] || {};
    const distance = tripSegment.distance_miles || tripSegment.miles || finalModalBooking.price_breakdown?.effectiveMiles || 0;
    const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (finalModalBooking.price_breakdown?.durationMinutes || 0);

    const rawPriceStr = typeof finalModalBooking.price === 'string' ? finalModalBooking.price.replace(/[^0-9.]/g, '') : (finalModalBooking.price || finalModalBooking.vehicle_details?.estimated_price || finalModalBooking.estimated_price);
    let initialSubtotal = finalModalBooking.price_breakdown?.originalSubtotal
      || finalModalBooking.price_breakdown?.mainBookingPrice
      || finalModalBooking.price_breakdown?.rawSubtotal
      || finalModalBooking.vehicle_details?.estimated_price
      || finalModalBooking.price_breakdown?.subtotal
      || parseFloat(rawPriceStr)
      || 0;

    if (initialSubtotal <= 0) {
      const autoQuote = calculateQuote({
        vehicle: finalModalBooking.vehicle_details || { vehicle_name: 'Executive Sedan' },
        bookingType: tripSegment.trip_type || 'one-way',
        distanceMiles: distance,
        durationMinutes: durationMins,
        durationHours: parseHours(tripSegment.duration) || 0,
        pickupLocation: tripSegment.pickup_location,
        pickupTime: tripSegment.start_time,
        pickupDate: tripSegment.date,
        flightInfo: tripSegment.flight_details,
        occasion: tripSegment.occasion,
      });
      initialSubtotal = autoQuote.breakdown.mainBookingPrice || autoQuote.breakdown.subtotal || 0;
    }

    let subtotalToSend = initialSubtotal;
    if (finalOptions.subtotal !== '' && finalOptions.subtotal !== null && finalOptions.subtotal !== undefined) {
      const parsedSubtotal = Number(finalOptions.subtotal);
      if (isNaN(parsedSubtotal) || !isFinite(parsedSubtotal)) {
        alert("Invalid subtotal amount: must be a valid number.");
        return;
      }
      if (parsedSubtotal < 0) {
        alert("Subtotal amount cannot be negative.");
        return;
      }
      const subtotalStr = String(finalOptions.subtotal).trim();
      const dotIndex = subtotalStr.indexOf('.');
      if (dotIndex !== -1 && subtotalStr.length - dotIndex - 1 > 2) {
        alert("Subtotal amount cannot exceed 2 decimal places.");
        return;
      }
      subtotalToSend = parsedSubtotal;
    }

    try {
      setSendingFinalInvoiceState(true);
      const extraOptions = {
        subtotal: subtotalToSend,
        additionalStopsCount: finalOptions.stopsCount,
        waitingMinutes: finalOptions.waitingMinutes,
        childSeatsCount: finalOptions.childSeatsCount,
        hasCleaningFee: finalOptions.hasCleaningFee,
        cleaningFeeAmount: finalOptions.cleaningFeeAmount,
        tolls: finalOptions.tolls,
        parking: finalOptions.parking,
        isHoliday: finalOptions.isHoliday,
        isLateNight: finalOptions.isLateNight,
        discount: finalOptions.discount,
      };

      const response = await sendFinalInvoice(finalModalBooking._id, extraOptions);
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

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this booking from the database?")) {
      try {
        const response = await deleteBooking(id);
        if (response.success) {
          fetchDashboardData();
        } else {
          alert(response.message || "Failed to delete booking");
        }
      } catch (error) {
        console.error(error);
        alert("Error deleting booking");
      }
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

  const getLiveWaitMins = (arrivalTime?: string | Date) => {
    if (!arrivalTime) return 0;
    const arrivalMs = new Date(arrivalTime).getTime();
    if (isNaN(arrivalMs)) return 0;
    const elapsedMs = Math.max(0, now - arrivalMs);
    return Math.floor(elapsedMs / 60000);
  };

  const handleStartRide = async (bookingId: string) => {
    try {
      setStartingRideId(bookingId);
      const response = await startRide(bookingId);
      if (response && response.success) {
        alert(`Ride started successfully!\nTotal waiting time locked at ${response.waiting_minutes || 0} mins (Wait Fee: $${response.waiting_fee || 0}).`);
        fetchDashboardData();
      } else {
        alert(response?.message || "Failed to start ride");
      }
    } catch (error: any) {
      console.error("Error starting ride:", error);
      alert(error.response?.data?.message || "Failed to start ride.");
    } finally {
      setStartingRideId(null);
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
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {data.recent_bookings.map((row: any, i: number) => {
                const formattedBooking = {
                  _id: row.id || row._id,
                  booking_status: row.status || row.booking_status || 'pending',
                  payment_status: row.payment_status || 'pending',
                  created_at: row.date || row.created_at,
                  contact_details: row.contact_details || {
                    booker: {
                      first_name: row.name ? row.name.split(' ')[0] : 'Customer',
                      last_name: row.name ? row.name.split(' ').slice(1).join(' ') : '',
                      email: row.email || '',
                      primary_phone: { number: row.phone || '' },
                      is_passenger: true
                    }
                  },
                  vehicle_details: row.vehicle_details || { vehicle_name: row.vehicle_name || 'Luxury Vehicle' },
                  trip_details: row.trip_details || [{ trip_type: row.trip || 'One Way', pickup_location: row.source || 'N/A', dropoff_location: row.destination || 'N/A' }],
                  price_breakdown: row.price_breakdown || {},
                  waiting_minutes: row.waiting_minutes || 0,
                  waiting_fee: row.waiting_fee || 0,
                  vehicle_arrived: row.vehicle_arrived,
                  arrival_time: row.arrival_time,
                  ride_started: row.ride_started,
                  ride_start_time: row.ride_start_time
                };

                return (
                  <tr 
                    key={i} 
                    onClick={() => setSelectedDetailBooking(formattedBooking)}
                    className="hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{row.name?.[0] || "?"}</div>
                        <div>
                          <div className="text-white font-medium group-hover:text-gold transition-colors">{row.name || "Unknown"}</div>
                          <div className="text-[11px] text-white/60">{row.email || "No email"}</div>
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

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailBooking(formattedBooking);
                          }}
                          className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Open full details view for this booking"
                        >
                          <Eye size={12} />
                          View Details
                        </button>

                        {!row.ride_started && !row.vehicle_arrived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotifyArrival(row.id || row._id);
                            }}
                            disabled={notifyingId === (row.id || row._id)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                            title="Notify booker & passenger that vehicle has arrived at pickup location"
                          >
                            {notifyingId === (row.id || row._id) ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                            Notify Arrival
                          </button>
                        )}

                        {row.vehicle_arrived && !row.ride_started && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRide(row.id || row._id);
                            }}
                            disabled={startingRideId === (row.id || row._id)}
                            className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 animate-pulse"
                            title="Click to START RIDE and STOP waiting timer calculation"
                          >
                            {startingRideId === (row.id || row._id) ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            Start Ride ({getLiveWaitMins(row.arrival_time)}m wait)
                          </button>
                        )}

                        {row.ride_started && (
                          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                            <CheckCircle2 size={12} />
                            Ride Started ({row.waiting_minutes || 0}m wait)
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFinalModal(row);
                          }}
                          className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Open interactive invoice form to add extra charges & send final invoice with payment link"
                        >
                          <FileText size={12} />
                          Send Final Invoice
                        </button>

                        {row.status === 'completed' ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(row.id, 'pending');
                            }}
                            className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          >
                            Pending
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(row.id, 'completed');
                            }}
                            className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          >
                            Complete
                          </button>
                        )}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(row.id || row._id);
                          }}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                          title="Delete booking permanently from database"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FINAL INVOICE & TRIP EXTRAS TRACKING MODAL */}
      {finalModalBooking && (() => {
        const tripSegment = finalModalBooking.trip_details?.[0] || {};
        const distance = tripSegment.distance_miles || tripSegment.miles || finalModalBooking.price_breakdown?.effectiveMiles || 0;
        const durationMins = tripSegment.duration ? parseHours(tripSegment.duration) * 60 : (finalModalBooking.price_breakdown?.durationMinutes || 0);

        // Stored initial main booking subtotal from database creation time
        const rawPriceStr = typeof finalModalBooking.price === 'string' ? finalModalBooking.price.replace(/[^0-9.]/g, '') : (finalModalBooking.price || finalModalBooking.vehicle_details?.estimated_price || finalModalBooking.estimated_price);
        let initialSubtotal = finalModalBooking.price_breakdown?.originalSubtotal
          || finalModalBooking.price_breakdown?.mainBookingPrice
          || finalModalBooking.price_breakdown?.rawSubtotal
          || finalModalBooking.vehicle_details?.estimated_price
          || finalModalBooking.price_breakdown?.subtotal
          || parseFloat(rawPriceStr)
          || 0;

        // If no stored subtotal or <= 0, dynamically calculate actual price from trip details
        if (initialSubtotal <= 0) {
          const autoQuote = calculateQuote({
            vehicle: finalModalBooking.vehicle_details || { vehicle_name: 'Executive Sedan' },
            bookingType: tripSegment.trip_type || 'one-way',
            distanceMiles: distance,
            durationMinutes: durationMins,
            durationHours: parseHours(tripSegment.duration) || 0,
            pickupLocation: tripSegment.pickup_location,
            pickupTime: tripSegment.start_time,
            pickupDate: tripSegment.date,
            flightInfo: tripSegment.flight_details,
            occasion: tripSegment.occasion,
          });
          initialSubtotal = autoQuote.breakdown.mainBookingPrice || autoQuote.breakdown.subtotal || 0;
        }

        const effectiveSubtotal = (finalOptions.subtotal !== undefined && finalOptions.subtotal !== null && finalOptions.subtotal !== '' && !isNaN(Number(finalOptions.subtotal)) && Number(finalOptions.subtotal) >= 0)
          ? Number(finalOptions.subtotal)
          : initialSubtotal;

        const isSubtotalModified = (finalOptions.subtotal !== '' && finalOptions.subtotal !== null && finalOptions.subtotal !== undefined) && Math.abs(effectiveSubtotal - initialSubtotal) > 0.001;

        const liveQuote = calculateQuote({
          vehicle: finalModalBooking.vehicle_details || { vehicle_name: 'Executive Sedan' },
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
          discount: finalOptions.discount,
          initialBookingSubtotal: effectiveSubtotal,
          originalSubtotal: initialSubtotal,
          isExplicitSubtotal: isSubtotalModified,
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#141416] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-black/90 my-auto text-left">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.03] shrink-0">
                <div className="flex items-center gap-3 text-purple-400">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <FileText size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-white tracking-wide">Final Trip Invoice & Extras Tracking</h3>
                    <p className="text-sm text-white/60 mt-0.5">Track trip extras and send final invoice payment link after drop-off.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFinalModalBooking(null)}
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-7 flex-1 text-white">
                {/* Trip & Booker Info Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-sm">
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Customer</span>
                    <strong className="text-white text-sm font-medium mt-1 block truncate">
                      {finalModalBooking.contact_details?.booker?.first_name} {finalModalBooking.contact_details?.booker?.last_name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Email</span>
                    <span className="text-purple-300 font-mono text-sm mt-1 block truncate">
                      {finalModalBooking.contact_details?.booker?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Vehicle</span>
                    <span className="text-white font-medium text-sm mt-1 block truncate">
                      {finalModalBooking.vehicle_details?.vehicle_name || 'Executive Sedan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">Service</span>
                    <span className="text-gold font-medium text-sm mt-1 block truncate">
                      {finalModalBooking.trip_details?.[0]?.trip_type || 'One Way'}
                    </span>
                  </div>
                </div>

                {/* Extras Tracking Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-2.5 flex items-center gap-2">
                    <span>🎛️</span> Trip Extras & Surcharges Tracking
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {/* Waiting Time Mins */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Waiting Time (Minutes):</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.waitingMinutes}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, waitingMinutes: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                      <span className="text-xs text-white/50 block">First 15 mins FREE. After 15 mins: Sedan $1/m, SUV $1.50/m, Sprinter $2/m</span>
                    </div>

                    {/* Child Seats */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Total Child Seats:</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={finalOptions.childSeatsCount}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, childSeatsCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                      <span className="text-xs text-white/50 block">First seat FREE. Additional seats $15 each</span>
                    </div>

                    {/* Tolls */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Tolls Amount ($):</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.tolls.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.tolls}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, tolls: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                    </div>

                    {/* Parking */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Parking Amount ($):</span>
                        <span className="text-purple-300 font-mono font-bold text-sm">${liveQuote.breakdown.parking.toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.parking}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, parking: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                    </div>

                    {/* Cleaning Fee */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="flex items-center gap-3 font-semibold text-white cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={finalOptions.hasCleaningFee}
                          onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, hasCleaningFee: e.target.checked }))}
                          className="rounded accent-purple-500 w-5 h-5 cursor-pointer"
                        />
                        <span>Apply Cleaning Fee</span>
                      </label>
                      {finalOptions.hasCleaningFee && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/60 font-mono text-base">$</span>
                          <input
                            type="number"
                            min={150}
                            value={finalOptions.cleaningFeeAmount}
                            onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, cleaningFeeAmount: Math.max(0, parseFloat(e.target.value) || 150) }))}
                            className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2 text-white font-mono text-sm outline-none"
                            placeholder="150"
                          />
                        </div>
                      )}
                      <span className="text-xs text-white/50 block">Starts at $150 if vehicle cleaning required</span>
                    </div>

                    {/* Discount */}
                    <div className="space-y-2 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                      <label className="font-medium text-white/90 flex justify-between items-center text-sm">
                        <span className="font-semibold text-white">Discount ($):</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm">-${((liveQuote.breakdown.discount || 0)).toFixed(2)}</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={finalOptions.discount === 0 ? '' : finalOptions.discount}
                        placeholder="0.00"
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          setFinalOptions((prev: any) => ({ ...prev, discount: isNaN(val) ? 0 : Math.max(0, val) }));
                        }}
                        className="w-full bg-black/60 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                      />
                      <span className="text-xs text-white/50 block">Custom discount deducted from invoice total</span>
                    </div>
                  </div>

                  {/* Manual Surcharge Toggles */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-3 text-sm text-white/90 font-medium cursor-pointer bg-white/[0.03] p-4 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-colors">
                      <input
                        type="checkbox"
                        checked={finalOptions.isLateNight || liveQuote.breakdown.isLateNight}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, isLateNight: e.target.checked }))}
                        className="rounded accent-purple-500 w-5 h-5 cursor-pointer"
                      />
                      <span>🌙 Late Night Surcharge (15% for 12 AM - 5 AM)</span>
                    </label>

                    <label className="flex items-center gap-3 text-sm text-white/90 font-medium cursor-pointer bg-white/[0.03] p-4 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-colors">
                      <input
                        type="checkbox"
                        checked={finalOptions.isHoliday || liveQuote.breakdown.isHoliday}
                        onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, isHoliday: e.target.checked }))}
                        className="rounded accent-purple-500 w-5 h-5 cursor-pointer"
                      />
                      <span>🎆 Holiday Surcharge (20%)</span>
                    </label>
                  </div>
                </div>

                {/* Live Itemized Breakdown Table */}
                <div className="bg-black/70 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3.5 text-sm">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gold border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                    <span>📊</span> Live Final Invoice Calculation Breakdown
                  </h4>

                  {/* Booking Subtotal (Actual trip price, manually editable only if needed) */}
                  <div className="flex justify-between items-center font-medium text-white/90 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white text-base">Booking Subtotal:</span>
                      {!isEditingSubtotal ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingSubtotal(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-medium px-3 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer"
                          title="Only if needed, click to edit subtotal"
                        >
                          <Edit2 size={12} />
                          <span>Edit Price</span>
                        </button>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Editing</span>
                      )}
                    </div>

                    {!isEditingSubtotal ? (
                      <div className="flex items-center gap-2.5">
                        {isSubtotalModified && (
                          <span className="text-xs text-amber-400 line-through">
                            ${initialSubtotal.toFixed(2)}
                          </span>
                        )}
                        <span className="font-mono text-purple-300 font-bold text-lg">
                          ${effectiveSubtotal.toFixed(2)}
                        </span>
                        {isSubtotalModified && (
                          <button
                            type="button"
                            onClick={() => setFinalOptions((prev: any) => ({ ...prev, subtotal: '' }))}
                            className="text-xs text-amber-400 hover:text-amber-300 underline ml-1.5 cursor-pointer"
                            title="Reset to calculated actual price"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-mono text-base">$</span>
                        <input
                          id="dashboard-final-invoice-subtotal-input"
                          type="number"
                          min={0}
                          step="0.01"
                          value={finalOptions.subtotal !== '' ? finalOptions.subtotal : initialSubtotal.toFixed(2)}
                          onChange={(e) => setFinalOptions((prev: any) => ({ ...prev, subtotal: e.target.value }))}
                          placeholder={initialSubtotal.toFixed(2)}
                          className="w-32 bg-black border-2 border-purple-500 focus:border-purple-400 rounded-xl px-3 py-1.5 text-white font-mono text-base text-right outline-none ring-2 ring-purple-500/30"
                          autoFocus
                        />
                        {finalOptions.subtotal !== '' && (
                          <button
                            type="button"
                            onClick={() => setFinalOptions((prev: any) => ({ ...prev, subtotal: '' }))}
                            className="text-xs text-amber-400 hover:text-amber-300 underline px-1 cursor-pointer"
                            title="Reset to calculated actual price"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsEditingSubtotal(false)}
                          className="px-3.5 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>

                  {liveQuote.isAirportPickup && <div className="flex justify-between text-emerald-400 text-sm"><span>Airport Pickup Fee (Meet & Greet Included):</span><span className="font-mono">${liveQuote.breakdown.airportPickupFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.additionalStopsFee > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Additional Stops Fee:</span><span className="font-mono text-white">${liveQuote.breakdown.additionalStopsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.waitingTimeFee > 0 && <div className="flex justify-between text-amber-300 text-sm"><span>Waiting Time Fee:</span><span className="font-mono">${liveQuote.breakdown.waitingTimeFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.childSeatsFee > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Child Seats Fee:</span><span className="font-mono text-white">${liveQuote.breakdown.childSeatsFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.cleaningFee > 0 && <div className="flex justify-between text-rose-300 text-sm"><span>Cleaning Fee:</span><span className="font-mono">${liveQuote.breakdown.cleaningFee.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.tolls > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Tolls:</span><span className="font-mono text-white">${liveQuote.breakdown.tolls.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.parking > 0 && <div className="flex justify-between text-white/80 text-sm"><span>Parking:</span><span className="font-mono text-white">${liveQuote.breakdown.parking.toFixed(2)}</span></div>}
                  
                  <div className="flex justify-between font-bold text-base text-white border-t border-white/10 pt-3 mt-1">
                    <span>Subtotal (Base + Extras):</span>
                    <span className="font-mono">${liveQuote.breakdown.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {liveQuote.breakdown.lateNightSurcharge > 0 && <div className="flex justify-between text-amber-300 text-sm"><span>Late Night Surcharge (15%):</span><span className="font-mono">${liveQuote.breakdown.lateNightSurcharge.toFixed(2)}</span></div>}
                  {liveQuote.breakdown.holidaySurcharge > 0 && <div className="flex justify-between text-amber-300 text-sm"><span>Holiday Surcharge (20%):</span><span className="font-mono">${liveQuote.breakdown.holidaySurcharge.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-white/80 text-sm"><span>Gratuity (20%):</span><span className="font-mono text-white">${liveQuote.breakdown.gratuity.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white/80 text-sm"><span>Credit Card Fee (3%):</span><span className="font-mono text-white">${liveQuote.breakdown.creditCardFee.toFixed(2)}</span></div>
                  
                  {Boolean(liveQuote.breakdown.discount && liveQuote.breakdown.discount > 0) && (
                    <div className="flex justify-between text-white/60 text-sm">
                      <span>Original Total:</span>
                      <span className="line-through font-mono">${(liveQuote.breakdown.calculatedGrandTotal || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {Boolean(liveQuote.breakdown.discount && liveQuote.breakdown.discount > 0) && (
                    <div className="flex justify-between text-emerald-400 font-medium text-sm">
                      <span>Discount:</span>
                      <span className="font-mono">-${(liveQuote.breakdown.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center font-bold text-2xl md:text-3xl text-gold border-t-2 border-gold/40 pt-4 mt-3">
                    <span>Final Total Due:</span>
                    <span className="font-mono">${liveQuote.formattedGrandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-white/[0.02] shrink-0">
                <button
                  onClick={() => setFinalModalBooking(null)}
                  className="px-6 py-3 rounded-xl text-sm font-medium border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendFinalInvoiceSubmit}
                  disabled={sendingFinalInvoiceState}
                  className="px-7 py-3.5 rounded-xl text-sm md:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all flex items-center gap-2.5 disabled:opacity-50 shadow-xl shadow-purple-600/30 cursor-pointer"
                >
                  {sendingFinalInvoiceState ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Send Final Invoice & Payment Link
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Booking Detail & Customer Information Modal */}
      {selectedDetailBooking && (
        <BookingDetailModal
          booking={selectedDetailBooking}
          onClose={() => setSelectedDetailBooking(null)}
          onNotifyArrival={(b) => {
            setSelectedDetailBooking(null);
            handleNotifyArrival(b._id || b.id);
          }}
          onStartRide={(id) => handleStartRide(id)}
          onOpenFinalModal={(b) => {
            setSelectedDetailBooking(null);
            handleOpenFinalModal(b);
          }}
          onUpdateStatus={(id, status) => handleUpdateStatus(id, status)}
          onDeleteBooking={(id) => {
            setSelectedDetailBooking(null);
            handleDeleteBooking(id);
          }}
          startingRideId={startingRideId}
        />
      )}
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