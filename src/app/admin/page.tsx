"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import {
  Users,
  Ticket,
  TrendingUp,
  AlertCircle,
  Search,
  MoreVertical,
  ShieldCheck,
  Heart
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-10">
          <header className="flex justify-between items-center mb-10">
             <div>
                <h1 className="text-2xl font-black text-primary mb-1">Platform Overview</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Real-time status · April 22, 2024</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-white border border-gray-100 p-2 rounded-xl flex items-center gap-3 px-4 shadow-sm">
                   <Search size={16} className="text-gray-400" />
                   <input type="text" placeholder="Search members..." className="bg-transparent border-none outline-none text-sm font-medium w-48" />
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-md">A</div>
             </div>
          </header>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
             {[
               { l: "Total Revenue", v: "$482.1k", t: "+12%", i: TrendingUp, c: "text-emerald-500" },
               { l: "Active Members", v: "14,289", t: "+423", i: Users, c: "text-indigo-500" },
               { l: "Draw Pool", v: "$124,500", t: "+$8k", i: Ticket, c: "text-amber-500" },
               { l: "Platform Impact", v: "$845k", t: "+$14k", i: Heart, c: "text-rose-500" }
             ].map(stat => (
               <div key={stat.l} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.l}</p>
                     <div className={stat.c}><stat.i size={16} /></div>
                  </div>
                  <div className="flex items-baseline justify-between">
                     <p className="text-2xl font-black text-primary">{stat.v}</p>
                     <span className={`text-[10px] font-bold ${stat.c}`}>{stat.t}</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* Member Activity */}
             <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                   <h3 className="font-bold text-primary">Member Verification Queue</h3>
                   <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Process All</button>
                </div>
                <div className="divide-y divide-gray-50">
                   {[
                     { u: "Marcus Reeves", s: "82", d: "10 mins ago", e: "+3" },
                     { u: "Sarah Chen", s: "79", d: "24 mins ago", e: "+1" },
                     { u: "Priya Malhotra", s: "84", d: "1 hour ago", e: "+3" },
                     { u: "John Smith", s: "91", d: "2 hours ago", e: "+10" },
                     { u: "Elena Rossi", s: "75", d: "3 hours ago", e: "+1" }
                   ].map(row => (
                     <div key={row.u} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{row.u[0]}</div>
                           <div>
                              <p className="font-bold text-primary text-sm">{row.u}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{row.d}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-12">
                           <div className="text-center">
                              <p className="text-xs font-bold text-primary">{row.s}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-medium">Score</p>
                           </div>
                           <div className="text-center">
                              <p className="text-xs font-bold text-emerald-600">{row.e}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-medium">Entries</p>
                           </div>
                           <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                              <MoreVertical size={16} className="text-gray-400" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* System Alerts */}
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex items-center gap-2 mb-6 text-amber-600">
                      <AlertCircle size={18} />
                      <h3 className="font-bold text-sm">System Alerts (2)</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                         <p className="text-xs font-bold text-amber-900 mb-1">Draw Approaching</p>
                         <p className="text-[10px] text-amber-700 leading-relaxed font-medium">Monthly Grand Draw is scheduled for release in 4 days. Verify all scores in queue.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                         <p className="text-xs font-bold text-indigo-900 mb-1">High Impact Surge</p>
                         <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">Ocean Cleanup Alliance is 15% ahead of funding targets this month.</p>
                      </div>
                   </div>
                </div>

                <div className="bg-primary p-6 rounded-3xl text-white relative overflow-hidden">
                   <ShieldCheck size={48} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                   <h4 className="font-bold text-sm mb-2">Platform Security</h4>
                   <p className="text-[10px] text-indigo-200 mb-6 leading-relaxed">System is performing 24/7 automated audits on all score logs and entry transactions.</p>
                   <button className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Audit Logs</button>
                </div>
             </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
