"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Trophy,
  CheckCircle2,
  Loader2
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { winningsService, Winning } from "@/services/winningsService";

import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function DrawResults() {
  const { user, loading: authLoading } = useAuth();
  const [recentWinners, setRecentWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [prizeTiers, setPrizeTiers] = useState([

    { tier: "5 Match", winners: "Loading...", amount: "$0", sub: "ROLLOVER", icon: "5" },
    { tier: "4 Match", winners: "Loading...", amount: "$0", sub: "PER PERSON", icon: "4" },
    { tier: "3 Match", winners: "Loading...", amount: "$0", sub: "PER PERSON", icon: "3" },
  ]);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchWinners();
      fetchLatestDrawStats();
    }
  }, [user, authLoading, router]);

  const fetchLatestDrawStats = async () => {
    try {
      // 1. Fetch latest prize pool
      const { data: pool } = await supabase
        .from('prize_pools')
        .select('*')
        .order('draw_date', { ascending: false })
        .limit(1)
        .single();

      if (pool) {
        if (pool.winning_numbers) {
          setWinningNumbers(pool.winning_numbers);
        }
        
        // 2. Fetch winners count per tier for the latest cycle
        const { data: winnersData } = await supabase
          .from('winnings')
          .select('tier')
          .order('created_at', { ascending: false });

        const counts = { jackpot: 0, tier_2: 0, tier_3: 0 };
        winnersData?.forEach(w => {
          if (w.tier === 'jackpot') counts.jackpot++;
          if (w.tier === 'tier_2') counts.tier_2++;
          if (w.tier === 'tier_3') counts.tier_3++;
        });

        setPrizeTiers([
          { 
            tier: "5 Match", 
            winners: `${counts.jackpot} Winners`, 
            amount: `$${(Number(pool.jackpot_amount) / (counts.jackpot || 1)).toLocaleString()}`, 
            sub: counts.jackpot === 0 ? "ROLLOVER" : "PER PERSON", 
            icon: "5" 
          },
          { 
            tier: "4 Match", 
            winners: `${counts.tier_2} Winners`, 
            amount: `$${(Number(pool.total_pool * 0.35) / (counts.tier_2 || 1)).toLocaleString()}`, 
            sub: "PER PERSON", 
            icon: "4" 
          },
          { 
            tier: "3 Match", 
            winners: `${counts.tier_3} Winners`, 
            amount: `$${(Number(pool.total_pool * 0.25) / (counts.tier_3 || 1)).toLocaleString()}`, 
            sub: "PER PERSON", 
            icon: "3" 
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching draw stats:", err);
    }
  };



  const fetchWinners = async () => {
    try {
      const data = await winningsService.getAllWinnings();
      // Map database winnings to UI format
      const mapped = data.slice(0, 4).map(w => ({
        handle: w.profiles?.email.split('@')[0] || 'Member',
        match: "Verified Selection",
        tier: w.amount >= 1000 ? "Elite Tier" : "Impact Tier",
        amount: `$${Number(w.amount).toLocaleString()}`,
        initial: (w.profiles?.email[0] || 'M').toUpperCase()
      }));
      setRecentWinners(mapped);

    } catch (err) {
      console.error("Error fetching winners:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user) return null;


  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-20">

          <DashboardSidebar />

          {/* Main Content Area */}
          <div className="space-y-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-3">October 2023</p>
                <h1 className="text-[44px] font-extrabold text-[#0F0A4A] tracking-tight">Monthly Draw Results</h1>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 size={12} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Draw Certified by Independent Auditors</span>
              </div>
            </div>

            {/* Hero Card */}
            <section className="bg-[#1A146B] rounded-[48px] p-12 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 blur-[100px] -mr-48 -mt-48 pointer-events-none" />

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                    Jackpot Rolled Over
                  </div>
                  <p className="text-sm font-bold opacity-60 uppercase tracking-[0.2em] mb-4">Current Prize Pool</p>
                  <h2 className="text-[84px] font-black leading-none mb-8 tracking-tighter">$2.4M</h2>
                  <p className="text-lg text-indigo-100/70 max-w-md leading-relaxed font-medium">
                    No 5-match winners this month. The jackpot rolls over to November, fueling even greater impact for our global charity partners.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 space-y-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 text-center">Official Winning Numbers</p>
                  <div className="flex gap-4">
                    {winningNumbers.map((num, i) => (
                      <div 
                        key={i}
                        className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-xl"
                      >
                        {num < 10 ? `0${num}` : num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Impact Champions & Prize Tiers */}
            <div className="grid lg:grid-cols-[1fr_380px] gap-16">
              <section className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#0F0A4A]">Impact Champions</h2>
                </div>
                <div className="px-10 py-6 bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <span>Top Contributors for October</span>
                  <span className="text-emerald-600">Total Community Contributions: $412,850</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="p-20 text-center">
                      <Loader2 size={32} className="animate-spin text-primary opacity-20 mx-auto" />
                    </div>
                  ) : recentWinners.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 font-bold text-sm">
                      No official winners published for this cycle yet.
                    </div>
                  ) : (
                    recentWinners.map(c => (
                      <div key={c.handle} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-full bg-[#0F0A4A] flex items-center justify-center text-secondary-light font-black text-lg">
                            {c.initial}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F0A4A] text-lg">@{c.handle}</p>
                            <p className="text-sm text-slate-400 font-medium">{c.match} · <span className="text-indigo-600">{c.tier}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-5 py-2 bg-emerald-50 text-[#15803d] rounded-xl font-black text-lg border border-emerald-100">
                            {c.amount}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-8 text-center border-t border-slate-50">
                  <button className="text-sm font-bold text-indigo-600 hover:underline">View Complete October Hall of Fame</button>
                </div>
              </section>

              <section className="space-y-10">
                <h2 className="text-2xl font-black text-[#0F0A4A] ml-4">Prize Tiers</h2>
                <div className="space-y-4">
                  {prizeTiers.map(tier => (
                    <div key={tier.tier} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black border border-slate-100 group-hover:bg-indigo-50 group-hover:text-primary transition-colors">
                            {tier.icon}
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary mb-0.5">{tier.tier}</p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{tier.winners}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary leading-tight">{tier.amount}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{tier.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
