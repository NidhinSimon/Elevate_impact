"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  DollarSign, 
  Clock, 
  Users,
  Search,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { winningsService, Winning, WinningStatus } from "@/services/winningsService";

export default function AdminWinnings() {
  const [winnings, setWinnings] = useState<(Winning & { user: { email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    try {
      const data = await winningsService.getAllWinnings();
      setWinnings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: WinningStatus) => {
    setActioning(id);
    try {
      await winningsService.updateStatus(id, status);
      
      if (status === 'paid') {
        const winning = winnings.find(w => w.id === id);
        if (winning?.user?.email) {
          const { emailService } = await import("@/services/emailService");
          await emailService.sendPayoutConfirmed(winning.user.email, winning.amount);
        }
      }
      
      await fetchWinnings();
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const filteredWinnings = winnings.filter(w => {
    const matchesSearch = w.user?.email.toLowerCase().includes(search.toLowerCase()) || w.draw_id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Statuses" || w.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalPayout: winnings.filter(w => w.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0),
    pendingVerifications: winnings.filter(w => w.status === 'pending').length,
    totalWinners: winnings.length
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F9FE] flex">
        <AdminSidebar />

        <main className="flex-1 min-h-screen py-16 px-16">
          <div className="max-w-[1440px] mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h1 className="text-[44px] font-black text-[#0F0A4A] tracking-tighter">Winnings Console</h1>
                <p className="text-lg text-slate-400 font-medium flex items-center gap-2">
                   <ShieldCheck size={18} className="text-indigo-400" /> Review, verify, and disburse impact rewards.
                </p>
              </div>

              <div className="flex items-center gap-4">
                 <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-100 rounded-2xl px-6 py-4 pr-12 text-sm font-bold text-[#0F0A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option>All Statuses</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Paid</option>
                      <option>Rejected</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>

                 <div className="relative">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search Winner ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-white border border-slate-100 rounded-2xl pl-14 pr-8 py-4 text-sm font-bold text-[#0F0A4A] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-[280px]"
                    />
                 </div>
              </div>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-8 text-indigo-400">
                    <DollarSign size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Total Payouts (YTD)</span>
                  </div>
                  <p className="text-[44px] font-black text-[#0F0A4A] tracking-tighter">${(stats.totalPayout / 1000000).toFixed(1)}M</p>
               </div>

               <div className="p-10 rounded-[40px] bg-white border border-emerald-50 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-400" />
                  <div className="flex items-center gap-3 mb-8 text-emerald-400">
                    <Clock size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Pending Verifications</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <p className="text-[44px] font-black text-[#0F0A4A] tracking-tighter">{stats.pendingVerifications}</p>
                    <span className="mb-4 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-md">+12 today</span>
                  </div>
               </div>

               <div className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-8 text-slate-400">
                    <Users size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Total Winners</span>
                  </div>
                  <p className="text-[44px] font-black text-[#0F0A4A] tracking-tighter">{stats.totalWinners.toLocaleString()}</p>
               </div>
            </div>

            <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                       <th className="px-10 py-6">Winner Details</th>
                       <th className="px-10 py-6">Draw ID</th>
                       <th className="px-10 py-6">Amount</th>
                       <th className="px-10 py-6">Status</th>
                       <th className="px-10 py-6">Proof</th>
                       <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredWinnings.map(w => (
                       <tr key={w.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center text-white font-black text-sm">
                                   {w.user?.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-bold text-[#0F0A4A]">{w.user?.email.split('@')[0]}</p>
                                   <p className="text-xs text-slate-400 font-medium">{w.user?.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8 font-mono text-xs font-bold text-slate-400">#{w.draw_id}</td>
                          <td className="px-10 py-8 font-black text-[#0F0A4A] text-lg">${w.amount.toLocaleString()}</td>
                          <td className="px-10 py-8">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                               w.status === 'paid' ? 'bg-indigo-50 text-indigo-600' :
                               w.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                               w.status === 'rejected' ? 'bg-red-50 text-red-600' :
                               'bg-amber-50 text-amber-600'
                             }`}>
                                {w.status}
                             </span>
                          </td>
                          <td className="px-10 py-8">
                             {w.proof_url ? (
                               <a href={w.proof_url} target="_blank" className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:underline">
                                  <Eye size={16} /> View Proof
                               </a>
                             ) : (
                               <span className="text-slate-300 text-xs font-medium">No proof</span>
                             )}
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {w.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleStatusUpdate(w.id, 'approved')}
                                      className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all"
                                    >
                                       <Check size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleStatusUpdate(w.id, 'rejected')}
                                      className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all"
                                    >
                                       <X size={18} />
                                    </button>
                                  </>
                                )}
                                {w.status === 'approved' && (
                                   <button 
                                     onClick={() => handleStatusUpdate(w.id, 'paid')}
                                     className="px-6 py-3 bg-[#1A146B] text-white rounded-xl font-black text-xs hover:shadow-lg transition-all"
                                   >
                                      Mark Paid
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
        </main>
      </div>
    </AdminGuard>
  );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
