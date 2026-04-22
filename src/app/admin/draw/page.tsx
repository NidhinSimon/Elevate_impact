"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  Trophy, 
  Play, 
  ShieldCheck, 
  Loader2,
  RefreshCcw,
  CheckCircle2,
  Settings,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  runRandomDraw, 
  runAlgorithmicDraw, 
  checkMatch, 
  calculatePrizePools, 
  splitPrize,
  ScoreRecord 
} from "@/lib/drawEngine";
import { toast } from "react-hot-toast";

const supabase = createClient();

interface Winner {
  user_id: string;
  amount: number;
  match_count: number;
  tier: string;
}

export default function AdminDrawManagement() {
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [numbers, setNumbers] = useState([0, 0, 0, 0, 0]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('random');
  const [pools, setPools] = useState({ jackpot: 0, tier2Pool: 0, tier3Pool: 0, totalPool: 0 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data: configData } = await supabase.from('draw_config').select('*').single();
    if (configData) {
      setConfig(configData);
      setDrawMode(configData.draw_mode);
      
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active');
      const prizePools = calculatePrizePools(count || 0, configData.contribution_per_subscriber, configData.jackpot_rollover);
      setPools(prizePools);
    }
  };

  const runSimulation = async () => {
    setSimulationRunning(true);
    setWinners([]);
    
    // 1. Animate sequence generation
    const interval = setInterval(() => {
      setNumbers(prev => prev.map(() => Math.floor(Math.random() * 45) + 1));
    }, 80);

    // 2. Compute actual results
    setTimeout(async () => {
      clearInterval(interval);
      
      let drawResult;
      if (drawMode === 'algorithmic') {
        const { data: allScores } = await supabase.from('scores').select('score');
        drawResult = runAlgorithmicDraw(allScores || []);
      } else {
        drawResult = runRandomDraw();
      }
      
      setNumbers(drawResult.drawnNumbers);

      // 3. Find winners
      const { data: activeSubscribers } = await supabase
        .from('profiles')
        .select('id, subscription_status')
        .eq('subscription_status', 'active');

      const allWinners: Winner[] = [];
      
      if (activeSubscribers) {
        for (const sub of activeSubscribers) {
          const { data: userScores } = await supabase
            .from('scores')
            .select('score')
            .eq('user_id', sub.id);
          
          if (userScores && userScores.length > 0) {
            const match = checkMatch(userScores.map(s => s.score), drawResult.drawnNumbers);
            if (match.tier) {
              allWinners.push({
                user_id: sub.id,
                match_count: match.matchCount,
                tier: match.tier,
                amount: 0 // Will calculate after grouping
              });
            }
          }
        }
      }

      // 4. Calculate prize shares
      const tierCounts = {
        jackpot: allWinners.filter(w => w.tier === 'jackpot').length,
        tier2: allWinners.filter(w => w.tier === 'tier2').length,
        tier3: allWinners.filter(w => w.tier === 'tier3').length
      };

      const finalWinners = allWinners.map(w => ({
        ...w,
        amount: splitPrize(
          w.tier === 'jackpot' ? pools.jackpot : w.tier === 'tier2' ? pools.tier2Pool : pools.tier3Pool,
          tierCounts[w.tier as keyof typeof tierCounts]
        )
      }));

      setWinners(finalWinners);
      setSimulationRunning(false);
      toast.success(`Simulation Complete: ${finalWinners.length} winners found.`);
    }, 2000);
  };

  const handlePublishResults = async () => {
    setIsPublishing(true);
    try {
      const drawId = `DRAW-${Date.now().toString().slice(-6)}`;
      
      // 1. Insert Winners
      if (winners.length > 0) {
        await supabase.from('winnings').insert(
          winners.map(w => ({
            user_id: w.user_id,
            draw_id: drawId,
            amount: w.amount,
            match_count: w.match_count,
            tier: w.tier,
            status: 'pending'
          }))
        );
      }

      // 2. Update Prize Pools
      await supabase.from('prize_pools').insert({
        total_pool: pools.totalPool,
        jackpot_amount: pools.jackpot,
        winning_numbers: numbers,
        is_rollover: winners.filter(w => w.tier === 'jackpot').length === 0
      });

      // 3. Update Rollover in Config
      const hasJackpotWinner = winners.some(w => w.tier === 'jackpot');
      await supabase.from('draw_config').update({
        jackpot_rollover: hasJackpotWinner ? 0 : pools.jackpot
      }).eq('id', config.id);

      // 4. Notify all active subscribers
      const { data: subscribers } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('subscription_status', 'active');
      
      if (subscribers && subscribers.length > 0) {
        const emails = subscribers.map(s => s.email).filter(Boolean) as string[];
        const { emailService } = await import("@/services/emailService");
        
        // Generic results to everyone
        await emailService.sendDrawResults(emails, numbers);

        // Targeted alerts to winners
        for (const winner of winners) {
          const profile = subscribers.find(s => s.id === winner.user_id);
          if (profile?.email) {
            await emailService.sendWinnerAlert(profile.email, winner.amount);
          }
        }
      }

      setShowSuccessModal(true);
      toast.success("Results Published!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F9FE] flex">
        <AdminSidebar />

        <main className="flex-1 p-12 overflow-y-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#0F0A4A] mb-2">Draw Simulation Console</h1>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-widest">
                Current Mode: <span className="text-primary font-black">{drawMode}</span>
              </p>
            </div>
            <button 
              onClick={handlePublishResults}
              disabled={winners.length === 0 && !simulationRunning || isPublishing}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-30"
            >
              {isPublishing ? <Loader2 className="animate-spin" /> : "Publish Official Results"}
            </button>
          </header>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-8">
              {/* Prize Pool Summary */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pool</p>
                  <p className="text-3xl font-black text-primary">£{pools.totalPool.toLocaleString()}</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jackpot (Current)</p>
                  <p className="text-3xl font-black text-emerald-500">£{pools.jackpot.toLocaleString()}</p>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Winners</p>
                  <p className="text-3xl font-black text-primary">{winners.length}</p>
                </div>
              </div>

              {/* Draw Interface */}
              <section className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-12">Official Draw Sequence</h3>
                
                <div className="flex gap-6 mb-16">
                  {numbers.map((num, i) => (
                    <div 
                      key={i}
                      className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-3xl font-black transition-all duration-500 border-2 ${
                        simulationRunning ? 'animate-pulse' : ''
                      } ${
                        i === 4 ? "bg-primary text-white border-transparent shadow-2xl shadow-primary/20" : "bg-white text-primary border-slate-100"
                      }`}
                    >
                      {num < 10 ? `0${num}` : num}
                    </div>
                  ))}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={simulationRunning}
                  className="px-12 py-6 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {simulationRunning ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                  Execute Draw Cycle
                </button>
              </section>
            </div>

            {/* Winner Insights */}
            <aside className="space-y-6">
              <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Winner Breakdown</h4>
                <div className="space-y-4">
                  {[
                    { tier: 'Jackpot', key: 'jackpot', amount: pools.jackpot },
                    { tier: 'Tier 2', key: 'tier2', amount: pools.tier2Pool },
                    { tier: 'Tier 3', key: 'tier3', amount: pools.tier3Pool }
                  ].map(t => {
                    const count = winners.filter(w => w.tier === t.key).length;
                    return (
                      <div key={t.key} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-50">
                        <div>
                          <p className="text-xs font-black text-primary uppercase tracking-widest">{t.tier}</p>
                          <p className="text-[10px] font-bold text-slate-400">{count} Winners</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-primary">£{splitPrize(t.amount, count).toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-300">EACH</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4">
                <ShieldCheck size={24} className="text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-indigo-900/60 leading-relaxed">
                  Verified using {drawMode} selection logic. Winners are automatically notified upon publication.
                </p>
              </div>
            </aside>
          </div>
        </main>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-12 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-primary mb-4">Cycle Published</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed px-4">
                The results have been officialized. Winners have been notified and prize pools updated.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest"
              >
                Close Engine
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
