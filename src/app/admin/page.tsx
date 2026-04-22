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
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 p-10">
          <header className="flex justify-between items-center mb-12">
             <div>
                <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Platform Overview</h1>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Status · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
             </div>
             <div className="flex items-center gap-6">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 px-6 shadow-sm hover:shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/5">
                   <Search size={18} className="text-slate-300" />
                   <input type="text" placeholder="Search members..." className="bg-transparent border-none outline-none text-sm font-bold w-48 placeholder:text-slate-300" />
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black border border-primary/10 shadow-inner">A</div>
             </div>
          </header>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
             {[
               { l: "Total Revenue", v: "$482.1k", t: "+12%", i: TrendingUp, c: "text-emerald-500", bg: "bg-emerald-50" },
               { l: "Active Members", v: "14,289", t: "+423", i: Users, c: "text-indigo-500", bg: "bg-indigo-50" },
               { l: "Draw Pool", v: "$124,500", t: "+$8k", i: Ticket, c: "text-amber-500", bg: "bg-amber-50" },
               { l: "Platform Impact", v: "$845k", t: "+$14k", i: Heart, c: "text-rose-500", bg: "bg-rose-50" }
             ].map(stat => (
               <div key={stat.l} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.l}</p>
                     <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.c}`}>
                        <stat.i size={20} />
                     </div>
                  </div>
                  <div className="flex items-baseline justify-between relative z-10">
                     <p className="text-3xl font-black text-primary tracking-tighter">{stat.v}</p>
                     <span className={`text-[10px] font-black ${stat.c}`}>{stat.t}</span>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-primary group-hover:scale-110 transition-transform">
                     <stat.i size={60} />
                  </div>
               </div>
             ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* Member Activity */}
             <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                   <h3 className="text-xl font-black text-primary tracking-tight">Member Verification Queue</h3>
                   <button className="text-[10px] font-black text-secondary-light uppercase tracking-[0.2em] hover:underline">Process All</button>
                </div>
                <div className="divide-y divide-slate-50">
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
