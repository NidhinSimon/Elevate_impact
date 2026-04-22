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
  const [isSimulation, setIsSimulation] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [numbers, setNumbers] = useState([0, 0, 0, 0, 0]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('random');
  const [pools, setPools] = useState({ jackpot: 0, tier2Pool: 0, tier3Pool: 0, totalPool: 0 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [frequencyMap, setFrequencyMap] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchConfig();
    fetchFrequencyMap();
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

  const fetchFrequencyMap = async () => {
    const { data: allScores } = await supabase.from('scores').select('score');
    if (allScores) {
      const { getFrequencyMap } = await import("@/lib/drawEngine");
      setFrequencyMap(getFrequencyMap(allScores));
    }
  };

  const runSimulation = async (isOfficialDraw = false) => {
    setSimulationRunning(true);
    setIsSimulation(!isOfficialDraw);
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
                amount: 0 
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
    if (isSimulation) {
      toast.error("Please run the official draw after the simulation.");
      return;
    }

    if (!config) {
      toast.error("Draw configuration not found. Please initialize the database.");
      return;
    }
    
    setIsPublishing(true);
    try {
      const drawId = `DRAW-${Date.now().toString().slice(-6)}`;
      
      // 1. Insert Winners
      if (winners.length > 0) {
        const { error: winError } = await supabase.from('winnings').insert(
          winners.map(w => ({
            user_id: w.user_id,
            draw_id: drawId,
            amount: w.amount,
            match_count: w.match_count,
            tier: w.tier,
            payout_status: 'pending'
          }))
        );
        if (winError) throw winError;
      }

      // 2. Update Prize Pools
      const { error: poolError } = await supabase.from('prize_pools').insert({
        draw_id: drawId,
        total_pool: pools.totalPool,
        jackpot_amount: pools.jackpot,
        winning_numbers: numbers,
        draw_mode: drawMode,
        is_rollover: winners.filter(w => w.tier === 'jackpot').length === 0
      });
      if (poolError) throw poolError;

      // 3. Update Rollover in Config
      const hasJackpotWinner = winners.some(w => w.tier === 'jackpot');
      const { error: configError } = await supabase.from('draw_config').update({
        jackpot_rollover: hasJackpotWinner ? 0 : pools.jackpot,
        draw_mode: drawMode
      }).eq('id', config.id);
      if (configError) throw configError;

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

  const executeOfficialDraw = async () => {
    await runSimulation(true);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />

        <main className="flex-1 ml-64 p-12 overflow-y-auto">
          <header className="mb-16 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-primary tracking-tight mb-4">Draw Control Center</h1>
              {!config && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-pulse">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">Draw configuration not found. Please run the setup SQL.</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Strategy</span>
                <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                  <button 
                    onClick={() => setDrawMode('random')}
                    className={`px-6 py-2 rounded-xl transition-all duration-300 text-xs ${drawMode === 'random' ? 'bg-primary text-white font-black shadow-lg shadow-primary/20' : 'text-slate-400 font-bold hover:text-primary'}`}
                  >
                    Random
                  </button>
                  <button 
                    onClick={() => setDrawMode('algorithmic')}
                    className={`px-6 py-2 rounded-xl transition-all duration-300 text-xs ${drawMode === 'algorithmic' ? 'bg-primary text-white font-black shadow-lg shadow-primary/20' : 'text-slate-400 font-bold hover:text-primary'}`}
                  >
                    Algorithmic
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => runSimulation(false)}
                disabled={simulationRunning || isPublishing}
                className="px-10 py-5 bg-white text-primary border border-slate-100 rounded-[20px] font-black text-sm shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all disabled:opacity-30 active:scale-95"
              >
                Run Simulation
              </button>
              <button 
                onClick={handlePublishResults}
                disabled={isSimulation || isPublishing}
                className="px-10 py-5 bg-primary text-white rounded-[20px] font-black text-sm shadow-2xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-30 active:scale-95"
              >
                {isPublishing ? <Loader2 className="animate-spin" /> : "Publish Official Results"}
              </button>
            </div>
          </header>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-8">
              {/* Prize Pool Summary */}
              <div className="grid grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-12 -mt-12 rounded-full" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Total Pool</p>
                  <p className="text-3xl font-black text-primary tracking-tighter relative z-10">${pools.totalPool.toLocaleString()}</p>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/5 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 blur-2xl -mr-12 -mt-12 rounded-full" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Jackpot</p>
                  <p className="text-3xl font-black text-emerald-500 tracking-tighter relative z-10">${pools.jackpot.toLocaleString()}</p>
                </div>
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl -mr-12 -mt-12 rounded-full" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Matched Winners</p>
                  <p className="text-3xl font-black text-primary tracking-tighter relative z-10">{winners.length}</p>
                </div>
              </div>

              {/* Draw Interface */}
              <section className="bg-white rounded-[48px] p-16 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                
                <div className="flex items-center gap-3 mb-12">
                  {isSimulation ? (
                    <div className="px-5 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Simulation Mode
                    </div>
                  ) : (
                    <div className="px-5 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Official Draw
                    </div>
                  )}
                </div>
                
                <div className="flex gap-8 mb-16">
                  {numbers.map((num, i) => (
                    <div 
                      key={i}
                      className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl font-black transition-all duration-700 border-2 ${
                        simulationRunning ? 'animate-pulse scale-105' : ''
                      } ${
                        i === 4 
                        ? "bg-primary text-white border-transparent shadow-2xl shadow-primary/30" 
                        : "bg-slate-50/50 text-primary border-slate-100"
                      }`}
                    >
                      {num < 10 ? `0${num}` : num}
                    </div>
                  ))}
                </div>

                {/* <button
                  onClick={executeOfficialDraw}
                  disabled={simulationRunning}
                  className="px-12 py-6 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {simulationRunning ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                  Execute Official Cycle
                </button> */}
              </section>

              {/* Frequency Heatmap */}
              <section className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Frequency Heatmap (1-45)</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-slate-50 border border-slate-100" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">High</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-9 gap-3">
                  {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
                    const freq = frequencyMap[num] || 0;
                    const maxFreq = Math.max(...Object.values(frequencyMap), 1);
                    const intensity = freq / maxFreq;
                    
                    return (
                      <div 
                        key={num} 
                        className="group relative flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 transition-all hover:scale-110 cursor-help"
                        style={{ backgroundColor: `rgba(104, 219, 169, ${intensity * 0.8})` }}
                      >
                        <span className={`text-xs font-black ${intensity > 0.5 ? 'text-white' : 'text-primary'}`}>{num}</span>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {freq} Selections
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Winner Insights */}
            <aside className="space-y-6">
              <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Simulation Results</h4>
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
                          <p className="text-sm font-black text-primary">${splitPrize(t.amount, count).toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-300">EACH</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {winners.length === 0 && !simulationRunning && (
                  <div className="mt-8 text-center p-6 border border-dashed border-slate-200 rounded-2xl">
                    <AlertCircle size={20} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">No matches found in last simulation</p>
                  </div>
                )}
              </section>

              <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100 flex gap-4">
                <ShieldCheck size={24} className="text-indigo-600 shrink-0" />
                <p className="text-[11px] font-bold text-indigo-900/60 leading-relaxed uppercase tracking-widest">
                  Official Publication will trigger {winners.length} winner alerts and update the global impact treasury.
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
              <h2 className="text-3xl font-black text-primary mb-4">Official Results Published</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed px-4">
                The {drawMode} draw sequence has been committed to the ledger. All prize tiers have been distributed.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest"
              >
                Return to Command
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
