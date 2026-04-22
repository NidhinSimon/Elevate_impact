"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function UserDrawPage() {
  const { user, loading: authLoading } = useAuth();
  const [winningNumbers, setWinningNumbers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [prizeTiers, setPrizeTiers] = useState<any[]>([]);
  const [activePool, setActivePool] = useState<any>(null);

  useEffect(() => {
    fetchDrawData();
  }, []);

  const fetchDrawData = async () => {
    try {
      setLoading(true);
      // 1. Fetch the latest published prize pool
      const { data: pool, error: poolError } = await supabase
        .from('prize_pools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (poolError) {
        console.warn("No draw results found yet.");
        setLoading(false);
        return;
      }

      if (pool) {
        setActivePool(pool);
        if (pool.winning_numbers && pool.winning_numbers.length === 5) {
          setWinningNumbers(pool.winning_numbers);
        }

        // 2. Fetch winners count per tier for THIS SPECIFIC draw
        const { data: winnersData } = await supabase
          .from('winnings')
          .select('tier')
          .eq('draw_id', pool.draw_id);

        const counts = { jackpot: 0, tier2: 0, tier3: 0 };
        winnersData?.forEach((w: any) => {
          if (w.tier === 'jackpot') counts.jackpot++;
          if (w.tier === 'tier2') counts.tier2++;
          if (w.tier === 'tier3') counts.tier3++;
        });

        // 3. Update UI with local currency symbols and accurate counts
        setPrizeTiers([
          {
            tier: "5 Match",
            winners: `${counts.jackpot} Winners`,
            amount: `$${(Number(pool.jackpot_amount) / (counts.jackpot || 1)).toLocaleString()}`,
            sub: counts.jackpot === 0 ? "ROLLOVER" : "PER PERSON",
            icon: "5",
            color: "text-amber-500",
            bg: "bg-amber-50"
          },
          {
            tier: "4 Match",
            winners: `${counts.tier2} Winners`,
            amount: `$${(Number(pool.total_pool * 0.35) / (counts.tier2 || 1)).toLocaleString()}`,
            sub: "PER PERSON",
            icon: "4",
            color: "text-indigo-600",
            bg: "bg-indigo-50"
          },
          {
            tier: "3 Match",
            winners: `${counts.tier3} Winners`,
            amount: `$${(Number(pool.total_pool * 0.25) / (counts.tier3 || 1)).toLocaleString()}`,
            sub: "PER PERSON",
            icon: "3",
            color: "text-emerald-500",
            bg: "bg-emerald-50"
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching draw stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-16">

          <DashboardSidebar />

          <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary/5 space-y-12 border border-slate-100 min-h-[800px]">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-secondary-light font-black text-xs uppercase tracking-[0.2em] mb-3">
                  {activePool ? new Date(activePool.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...'}
                </p>
                <h1 className="text-[44px] font-black text-primary tracking-tighter leading-tight">
                  Monthly Draw Results
                </h1>
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Draw Certified by Independent Auditors</span>
              </div>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Fetching Latest Draw...</p>
              </div>
            ) : !activePool ? (
               <div className="py-32 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <Trophy size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-primary mb-4">No Results Published</h2>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">The first draw of the month is currently being processed. Check back soon for the official results!</p>
               </div>
            ) : (
              <>
                {/* Hero Section: Numbers & Jackpot */}
                <section className="bg-primary rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                  <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-white/10">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        {activePool.is_rollover ? "Jackpot Rolling Over" : "Jackpot Claimed"}
                      </div>
                      <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-4">Current Prize Pool</p>
                      <h2 className="text-7xl lg:text-8xl font-black tracking-tighter mb-8 flex items-baseline gap-2">
                        $${Number(activePool.jackpot_amount).toLocaleString()}
                      </h2>
                      <p className="text-white/70 font-medium leading-relaxed max-w-md">
                        {activePool.is_rollover 
                          ? "No jackpot winner was found this cycle. The remaining pool has been added to next month's grand prize!"
                          : "We have a winner! This cycle's jackpot has been claimed, creating life-changing impact."
                        }
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-10 border border-white/10">
                      <p className="text-center text-white/40 font-black text-[10px] uppercase tracking-widest mb-10">Official Winning Numbers</p>
                      <div className="flex justify-center gap-4">
                        {winningNumbers.map((num, i) => (
                          <div 
                            key={i} 
                            className="w-14 h-20 md:w-16 md:h-24 bg-white/10 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black border border-white/20 shadow-xl"
                          >
                            {num < 10 ? `0${num}` : num}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-light/20 blur-[120px] rounded-full -mr-48 -mt-48" />
                </section>

                {/* Prize Breakdown */}
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <h3 className="text-xl font-black text-primary">Prize Breakdown</h3>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {prizeTiers.map((tier, i) => (
                      <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
                        <div className="flex justify-between items-start mb-8">
                          <div className={`w-12 h-12 ${tier.bg} ${tier.color} rounded-2xl flex items-center justify-center text-xl font-black shadow-sm`}>
                            {tier.icon}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Winners</p>
                            <p className="text-sm font-black text-primary">{tier.winners}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 mb-2">{tier.tier}</p>
                        <h4 className="text-3xl font-black text-primary tracking-tight mb-2">{tier.amount}</h4>
                        <p className="text-[10px] font-black text-secondary-light uppercase tracking-widest">{tier.sub}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer Info */}
                <section className="grid md:grid-cols-2 gap-8 pt-8">
                  <div className="p-8 rounded-[32px] bg-slate-50 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                      <Target size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-primary mb-1">How Prizes are Distributed</h4>
                      <p className="text-xs text-slate-500 font-medium">All prizes are automatically shared equally among players in the same match tier.</p>
                    </div>
                  </div>
                  <div className="p-8 rounded-[32px] bg-slate-50 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-primary mb-1">Verification Status</h4>
                      <p className="text-xs text-slate-500 font-medium">Results are finalized within 48 hours of the draw following independent audit.</p>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
