"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  Trophy, 
  ArrowRight, 
  Check, 
  Globe, 
  Settings, 
  Target,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const supabase = createClient();

interface OnboardingModalProps {
  userId: string;
}

export default function OnboardingModal({ userId }: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*');
    setCharities(data || []);
    setFetching(false);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Update Profile
      const { error } = await supabase
        .from('profiles')
        .update({
          selected_charity_id: selectedCharity,
          charity_contribution_percentage: percentage,
          onboarding_completed: true
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Onboarding complete!");
      // 2. Redirect to scores
      router.push("/dashboard/scores");
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-[#0F0A4A]/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[40px] md:rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in duration-700">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
          <div 
            className="h-full bg-accent transition-all duration-700" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-8 md:p-12 pb-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {step === 1 && "Choose Your Mission"}
              {step === 2 && "Set Your Impact"}
              {step === 3 && "Final Step"}
            </h2>
            <p className="text-slate-400 font-medium text-xs md:text-sm mt-1">
              Step {step} of 3
            </p>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            {step === 1 && <Globe size={24} />}
            {step === 2 && <Settings size={24} />}
            {step === 3 && <Target size={24} />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 md:px-12 overflow-y-auto custom-scrollbar pb-8">
          {step === 1 && (
            <div className="space-y-6 py-4">
              <p className="text-slate-500 font-medium">Select the impact partner your performance will fund directly.</p>
              <div className="grid gap-4">
                {fetching ? (
                  <Loader2 className="animate-spin mx-auto text-slate-200" size={32} />
                ) : (
                  charities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCharity(c.id)}
                      className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
                        selectedCharity === c.id 
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/10' 
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-50">
                        {c.logo_url ? <img src={c.logo_url} className="w-full h-full object-cover" /> : <Globe size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-primary text-sm">{c.name}</p>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1">{c.short_description}</p>
                      </div>
                      {selectedCharity === c.id && <Check className="text-accent" size={20} strokeWidth={4} />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 py-8">
              <div className="text-center space-y-4">
                <p className="text-5xl font-black text-primary">{percentage}%</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Charitable Allocation</p>
              </div>

              <div className="space-y-6">
                <input 
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={percentage}
                  onChange={e => setPercentage(parseInt(e.target.value))}
                  className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-accent transition-all"
                />
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="text-rose-500" size={16} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Projection</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    At {percentage}%, you are contributing <span className="text-primary font-black">£{(9.99 * (percentage / 100)).toFixed(2)}</span> of your monthly subscription to {charities.find(c => c.id === selectedCharity)?.name || 'mission'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 py-12">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-xl shadow-emerald-500/10">
                <Trophy size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-primary tracking-tight">You're Ready to Play!</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                  Finalize your setup by entering your first performance score to qualify for the next draw.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 md:p-12 pt-4 md:pt-6 border-t border-slate-50 flex gap-4 shrink-0 bg-white">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 md:px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={20} /> Back
            </button>
          )}
          
          <button
            onClick={() => {
              if (step < 3) {
                if (step === 1 && !selectedCharity) {
                  toast.error("Please select a charity");
                  return;
                }
                setStep(s => s + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 md:py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {step === 3 ? "Complete & Log Score" : "Continue"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
