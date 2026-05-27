import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");

  const bookings = [
    { id: 1, customer: "Ashwin", email: "a@email.com", vehicle: "Rolls Royce Phantom", occasion: "Wedding", tripType: "Round Trip", date: "16 Jul 2025", status: "Pending", color: "text-white bg-white/10" },
    { id: 2, customer: "Deeksha", email: "deeksha@email.com", vehicle: "Mercedes Maybach S-Class", occasion: "Business", tripType: "As Directed/Hourly", date: "15 Jul 2025", status: "Confirmed", color: "text-white bg-white/10" },
    { id: 3, customer: "Prem", email: "prem@email.com", vehicle: "Cadillac Escalade", occasion: "Airport Transfer", tripType: "One Way", date: "14 Jul 2025", status: "Cancelled", color: "text-white bg-white/10" },
    { id: 4, customer: "Ashwin", email: "a@email.com", vehicle: "Lincoln Continental", occasion: "Prom", tripType: "Round Trip", date: "16 Jul 2025", status: "Pending", color: "text-white bg-white/10" },
    { id: 5, customer: "Deeksha", email: "deeksha@email.com", vehicle: "Mercedes Sprinter Van", occasion: "Other", tripType: "One Way", date: "15 Jul 2025", status: "Confirmed", color: "text-white bg-white/10" },
    { id: 6, customer: "Prem", email: "prem@email.com", vehicle: "Chevy Suburban", occasion: "Business", tripType: "Round Trip", date: "14 Jul 2025", status: "Cancelled", color: "text-white bg-white/10" },
    { id: 7, customer: "Ashwin", email: "a@email.com", vehicle: "Rolls Royce Ghost", occasion: "Wedding", tripType: "As Directed/Hourly", date: "16 Jul 2025", status: "Pending", color: "text-white bg-white/10" },
    { id: 8, customer: "Deeksha", email: "deeksha@email.com", vehicle: "GMC Yukon", occasion: "Airport Transfer", tripType: "One Way", date: "15 Jul 2025", status: "Confirmed", color: "text-white bg-white/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif-lux text-white">All Bookings</h1>
          <p className="text-white text-sm mt-1">Manage and track your customer reservations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#050505] border border-white/10 rounded-xl px-4 py-2 w-64 focus-within:border-white/30 transition-all">
            <Search size={16} className="text-white" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white px-3 w-full placeholder:text-white"
            />
          </div>
        </div>
      </div>

      <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4 w-10">
                   <input type="checkbox" className="rounded border-white/20 bg-black/50" />
                </th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Vehicle Name</th>
                <th className="p-4 font-medium">Occasion Name</th>
                <th className="p-4 font-medium">Trip Type</th>
                <th className="p-4 font-medium">Enquiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {bookings.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-white/20 bg-black/50" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold border border-white/10">{row.customer[0]}</div>
                      <div>
                        <div className="text-white font-medium">{row.customer}</div>
                        <div className="text-[11px] text-white">{row.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-white">{row.vehicle}</td>
                  <td className="p-4 text-white">{row.occasion}</td>
                  <td className="p-4 text-white">{row.tripType}</td>
                  <td className="p-4 text-white">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white">
           <div>Showing 1 to 8 of 97 results</div>
           <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-xs font-medium text-white flex items-center gap-1">
                 <ChevronLeft size={14} /> Previous
              </button>
              <button className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold">1</button>
              <button className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white flex items-center justify-center text-xs font-medium">2</button>
              <button className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white flex items-center justify-center text-xs font-medium">3</button>
              <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-xs font-medium text-white flex items-center gap-1">
                 Next <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}