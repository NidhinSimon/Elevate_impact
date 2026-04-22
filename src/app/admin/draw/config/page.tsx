"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  Settings, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Save, 
  Info,
  Loader2,
  Trophy
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

const supabase = createClient();

export default function AdminDrawConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ activeSubscribers: 0 });
  const [config, setConfig] = useState({
    draw_mode: 'random',
    next_draw_date: '',
    contribution_per_subscriber: 5.00,
    jackpot_rollover: 0,
    pool_pct_jackpot: 40,
    pool_pct_tier2: 35,
    pool_pct_tier3: 25
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Config
      const { data: configData } = await supabase
        .from('draw_config')
        .select('*')
        .single();
      
      if (configData) setConfig(configData);

      // 2. Fetch Active Subscribers Count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');
      
      setStats({ activeSubscribers: count || 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('draw_config')
        .update({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', (config as any).id);

      if (error) throw error;
      toast.success("Configuration updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalPool = (stats.activeSubscribers * config.contribution_per_subscriber) + Number(config.jackpot_rollover);
  const pools = {
    jackpot: (totalPool * (config.pool_pct_jackpot / 100)) + Number(config.jackpot_rollover),
    tier2: totalPool * (config.pool_pct_tier2 / 100),
    tier3: totalPool * (config.pool_pct_tier3 / 100)
  };

  if (loading) return null;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F9FE] flex">
        <AdminSidebar />
        
        <main className="flex-1 p-12 overflow-y-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#0F0A4A] mb-2">Draw Configuration</h1>
              <p className="text-slate-400 font-medium">Control the mechanics and prize allocation for the next draw cycle.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Save Configuration
            </button>
          </header>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-8">
              {/* Mode Selection */}
              <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-xl font-black text-[#0F0A4A]">Draw Mechanism</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {['random', 'algorithmic'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setConfig({...config, draw_mode: mode})}
                      className={`p-8 rounded-[32px] border-2 transition-all text-left group ${
                        config.draw_mode === mode 
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                        config.draw_mode === mode ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {mode === 'random' ? <TrendingUp size={20} /> : <Settings size={20} />}
                      </div>
                      <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${
                        config.draw_mode === mode ? 'text-primary' : 'text-slate-400'
                      }`}>{mode}</h3>
                      <p className="text-sm font-medium text-slate-400 leading-relaxed">
                        {mode === 'random' ? 'Pure probability based on isolated random selection.' : 'Inverse frequency weighting based on active scores.'}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Economic Settings */}
              <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                    <DollarSign size={24} />
                  </div>
                  <h2 className="text-xl font-black text-[#0F0A4A]">Pool Economics</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Draw Date</label>
                    <input 
                      type="date"
                      value={config.next_draw_date}
                      onChange={e => setConfig({...config, next_draw_date: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#0F0A4A] outline-none focus:border-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contribution Per Member ($)</label>
                    <input 
                      type="number"
                      value={config.contribution_per_subscriber}
                      onChange={e => setConfig({...config, contribution_per_subscriber: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#0F0A4A] outline-none focus:border-primary/20 transition-all text-xl"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Live Preview */}
            <aside className="space-y-8">
              <div className="bg-[#1A146B] rounded-[40px] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-[40px] -mr-16 -mt-16" />
                <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                  <Trophy size={20} className="text-emerald-400" />
                  Projected Prize Pool
                </h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs font-bold text-white/60">Active Members</span>
                    <span className="text-xl font-black">{stats.activeSubscribers}</span>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/60">Jackpot (40% + Roll)</span>
                      <span className="text-lg font-black text-emerald-400">${pools.jackpot.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/60">Tier 2 (35%)</span>
                      <span className="text-lg font-black">${pools.tier2.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/60">Tier 3 (25%)</span>
                      <span className="text-lg font-black">${pools.tier3.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t-2 border-white/10 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest text-white/40">Total Pool</span>
                    <span className="text-3xl font-black tracking-tight">${totalPool.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                <Info size={24} className="text-amber-500 shrink-0" />
                <p className="text-xs font-medium text-amber-900/60 leading-relaxed">
                  Jackpot rollover is automatically calculated from the previous draw results. If no 5-match winners were found, the pool rolls over.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
