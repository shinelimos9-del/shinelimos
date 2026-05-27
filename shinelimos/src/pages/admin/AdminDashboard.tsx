import { TrendingUp, TrendingDown, Users, CheckSquare, DollarSign } from "lucide-react";

export default function AdminDashboard() {
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
          value="7,265" 
          change="+11.01%" 
          isPositive={true} 
          icon={<CheckSquare className="text-white" size={20} />} 
          bg="bg-white/5 border-white/20"
        />
        <StatCard 
          title="Total New Customers" 
          value="3,671" 
          change="-0.03%" 
          isPositive={false} 
          icon={<Users className="text-white" size={20} />} 
          bg="bg-white/5 border-white/20"
        />
        <StatCard 
          title="Total Earning" 
          value="$22,318" 
          change="+6.08%" 
          isPositive={true} 
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
            <span>$40k</span>
            <span>$30k</span>
            <span>$20k</span>
            <span>$10k</span>
            <span>$0</span>
          </div>

          {[
            { month: "Jan", thisYear: 60, lastYear: 40 },
            { month: "Feb", thisYear: 45, lastYear: 55 },
            { month: "Mar", thisYear: 80, lastYear: 60 },
            { month: "Apr", thisYear: 65, lastYear: 50 },
            { month: "May", thisYear: 90, lastYear: 75 },
            { month: "Jun", thisYear: 70, lastYear: 65 },
            { month: "Jul", thisYear: 85, lastYear: 70 },
            { month: "Aug", thisYear: 55, lastYear: 60 },
            { month: "Sep", thisYear: 75, lastYear: 65 },
            { month: "Oct", thisYear: 60, lastYear: 55 },
            { month: "Nov", thisYear: 80, lastYear: 70 },
            { month: "Dec", thisYear: 95, lastYear: 85 },
          ].map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group relative z-10 h-full pb-6">
              <div className="w-full flex items-end justify-center gap-1 px-1 h-full">
                {/* Last Year Bar */}
                <div 
                  className="w-full max-w-[12px] bg-white/20 rounded-t-sm group-hover:bg-white/30 transition-colors"
                  style={{ height: `${data.lastYear}%` }}
                ></div>
                {/* This Year Bar */}
                <div 
                  className="w-full max-w-[12px] bg-white rounded-t-sm group-hover:bg-white transition-colors shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                  style={{ height: `${data.thisYear}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-white mt-2 absolute bottom-0">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Trips */}
        <div className="lg:col-span-2 glass-dark rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors">
          <h2 className="text-lg font-semibold text-white mb-6">Total Trips - 7,265</h2>
          <div className="space-y-6">
            <TripProgress label="Done Trips" value={46} color="bg-white" />
            <TripProgress label="Booked" value={17} color="bg-white" />
            <TripProgress label="Cancelled" value={19} color="bg-white" />
          </div>
        </div>

        {/* Top Destination Pie Chart Placeholder */}
        <div className="glass-dark rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Top Destination</h2>
          <div className="flex-1 flex items-center justify-center">
             <div className="relative w-48 h-48 rounded-full border-16 border-white/5 flex items-center justify-center">
                {/* Simulated pie chart segments */}
                <div className="absolute inset-0 rounded-full border-16 border-transparent border-t-white border-r-white rotate-45"></div>
                <div className="absolute inset-0 rounded-full border-16 border-transparent border-t-white/60 -rotate-30"></div>
                <div className="absolute inset-0 rounded-full border-16 border-transparent border-l-white/20 -rotate-12"></div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">52%</div>
                  <div className="text-[10px] text-white uppercase tracking-widest">US</div>
                </div>
             </div>
          </div>
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span>United States</span><span className="text-white">52.1%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span>Canada</span><span className="text-white">22.8%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20"></span>Mexico</span><span className="text-white">13.9%</span></div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {[
                { name: "Ashwin", email: "a@email.com", trip: "Airport Transfer", date: "16 Jul 2026", price: "$120", phone: "+1 (555) 123-4567" },
                { name: "Deeksha", email: "deeksha@email.com", trip: "Corporate Hourly", date: "15 Jul 2026", price: "$450", phone: "+1 (555) 987-6543" },
                { name: "Prem", email: "prem@email.com", trip: "Wedding Package", date: "14 Jul 2026", price: "$1,200", phone: "+1 (555) 345-6789" },
                { name: "Ashwin", email: "a@email.com", trip: "Point to Point", date: "16 Jul 2026", price: "$85", phone: "+1 (555) 123-4567" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{row.name[0]}</div>
                      <div>
                        <div className="text-white font-medium">{row.name}</div>
                        <div className="text-[11px] text-white">{row.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{row.trip}</td>
                  <td className="p-4 text-white">{row.date}</td>
                  <td className="p-4 text-white">{row.price}</td>
                  <td className="p-4 text-white">{row.phone}</td>
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