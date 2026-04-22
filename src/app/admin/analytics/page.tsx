"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  Users, 
  CreditCard, 
  Trophy, 
  Heart, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  BarChart3,
  Calendar,
  Zap,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { userService, UserProfile } from "@/services/userService";
import { charityService, Charity } from "@/services/charityService";
import { winningsService } from "@/services/winningsService";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubs: 0,
    totalPool: 0,
    charityImpact: 0,
    avgScore: 24.5
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const [members, charities, winnings] = await Promise.all([
      userService.getAllProfiles(),
      charityService.getCharities(),
      winningsService.getAllWinnings()
    ]);

    const active = members.filter(m => m.subscription_status === 'active').length;
    const pool = active * 49 * 0.4; // Mock pool
    const impact = charities.reduce((acc, c) => acc + (c.raised_amount || 0), 0);

    setStats({
      totalUsers: members.length,
      activeSubs: active,
      totalPool: pool,
      charityImpact: impact,
      avgScore: 24.5
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 ml-64 p-10">
          <header className="mb-12">
             <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Impact Analytics</h1>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Platform Performance · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
             {[
               { label: "Total Members", value: stats.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/5", trend: "Stable" },
               { label: "Active Subs", value: stats.activeSubs, icon: Zap, color: "text-secondary-light", bg: "bg-secondary-light/10", trend: "Active" },
               { label: "Prize Pool", value: `$${(stats.totalPool / 1000).toFixed(1)}k`, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50", trend: "Locked" },
               { label: "Charity Impact", value: `$${(stats.charityImpact / 1000).toFixed(0)}k`, icon: Heart, color: "text-rose-500", bg: "bg-rose-50", trend: "Distributed" }
             ].map((stat, i) => (
               <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-lg`}>
                        <stat.icon size={22} />
                     </div>
                     <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">{stat.trend}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
                  <p className="text-3xl font-black text-primary tracking-tighter relative z-10">{stat.value}</p>
                  <div className="absolute top-0 right-0 p-6 opacity-5 text-primary group-hover:scale-110 transition-transform">
                     <stat.icon size={60} />
                  </div>
               </div>
             ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10">
             {/* Main Chart Card */}
             <section className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -ml-32 -mt-32 rounded-full pointer-events-none" />
                <div className="flex items-center justify-between mb-12 relative z-10">
                   <div>
                      <h3 className="text-2xl font-black text-primary tracking-tight mb-1">Growth Trajectory</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global subscriber volume (Real-time)</p>
                   </div>
                   <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner">
                      <Calendar size={14} className="text-slate-300" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Cycle</span>
                   </div>
                </div>

                {/* Mock Chart using CSS/SVG */}
                <div className="h-64 flex items-end justify-between gap-4 relative mb-12">
                   {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                     <div key={i} className="flex-1 group relative">
                        <div 
                          className="w-full bg-indigo-50 rounded-t-2xl transition-all duration-700 group-hover:bg-indigo-600 cursor-pointer" 
                          style={{ height: `${h}%` }}
                        />
                        {h > 80 && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                             PEAK
                          </div>
                        )}
                     </div>
                   ))}
                   <div className="absolute inset-0 border-b border-gray-50 pointer-events-none" />
                </div>

                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-gray-50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                         <Target size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retention</p>
                         <p className="text-xl font-black text-primary">94.2%</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <BarChart3 size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LTV (Avg)</p>
                         <p className="text-xl font-black text-primary">$842</p>
                      </div>
                   </div>
                </div>
             </section>

             {/* Sidebar Info */}
             <div className="space-y-6">
                <section className="bg-primary rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                      <Zap size={48} />
                   </div>
                   <h4 className="text-lg font-black mb-4">Elite Saturation</h4>
                   <p className="text-indigo-200 text-sm leading-relaxed font-medium mb-8">
                      12% of your subscriber base is now in the Elite Visionary tier, driving 40% of total charity impact.
                   </p>
                   <button className="flex items-center gap-2 text-emerald-400 font-bold text-xs group/btn">
                      View Tier Breakdown <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                   </button>
                </section>

                <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Recent Alerts</h4>
                   <div className="space-y-6">
                      {[
                        { type: 'sub', text: 'New Elite Subscriber', time: '2m ago' },
                        { type: 'draw', text: 'Draw simulation complete', time: '14m ago' },
                        { type: 'payout', text: 'Payout approved ($12.5k)', time: '1h ago' }
                      ].map((alert, i) => (
                        <div key={i} className="flex items-start gap-4">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                           <div>
                              <p className="text-xs font-bold text-primary">{alert.text}</p>
                              <p className="text-[9px] font-black text-gray-300 uppercase">{alert.time}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
