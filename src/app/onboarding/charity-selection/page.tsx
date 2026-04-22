"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { charityService, Charity } from "@/services/charityService";
import { userService } from "@/services/userService";
import { useAuth } from "@/components/auth-provider";
import { 
  Heart, 
  ChevronRight, 
  Check, 
  Globe, 
  ArrowRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function CharitySelectionOnboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [contribution, setContribution] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const data = await charityService.getCharities();
    setCharities(data);
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!user || !selectedId) return;
    
    setIsSaving(true);
    try {
      const success = await userService.updateProfile(user.id, {
        selected_charity_id: selectedId,
        contribution_percentage: contribution
      });
      if (success) {
        toast.success("Impact partner selected!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Failed to save selection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex flex-col">
      {/* Progress Header */}
      <nav className="w-full h-2 bg-slate-100">
        <div className="h-full bg-primary w-2/3 transition-all duration-1000" />
      </nav>

      <main className="flex-1 flex flex-col items-center py-20 px-10 max-w-[1440px] mx-auto w-full">
        <header className="text-center max-w-2xl mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-100">
            <Heart size={12} fill="currentColor" /> Final Step
          </div>
          <h1 className="text-5xl font-black text-primary tracking-tight">Choose Your Impact Partner</h1>
          <p className="text-lg text-text-muted font-medium">
            Where should your athletic performance drive change? Select the organization that will receive a percentage of your subscription.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-20">
          {charities.map((charity) => (
            <div 
              key={charity.id}
              onClick={() => setSelectedId(charity.id)}
              className={`relative group cursor-pointer p-1 rounded-[40px] transition-all duration-500 hover:scale-[1.02] ${
                selectedId === charity.id ? 'bg-gradient-to-b from-indigo-600 to-accent' : 'bg-transparent'
              }`}
            >
              <div className="bg-white rounded-[36px] p-8 h-full flex flex-col border border-slate-100 shadow-sm overflow-hidden relative">
                 {selectedId === charity.id && (
                   <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                      <Check size={18} strokeWidth={3} />
                   </div>
                 )}
                 
                 <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-3 mb-8 group-hover:bg-indigo-50 transition-colors">
                    <img src={charity.image_url} alt="" className="w-full h-full object-contain" />
                 </div>

                 <h3 className="text-xl font-black text-primary mb-2 leading-tight">{charity.name}</h3>
                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{charity.category}</p>
                 <p className="text-sm text-text-muted font-medium leading-relaxed mb-8 flex-1">
                    {charity.tagline}
                 </p>

                 <div className="flex items-center gap-2 text-primary font-bold text-xs pt-6 border-t border-slate-50">
                    <Globe size={14} className="text-slate-300" />
                    Global Impact verified
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Contribution Slider */}
        {selectedId && (
          <div className="max-w-xl w-full bg-white rounded-[48px] p-12 shadow-2xl shadow-indigo-900/10 border border-slate-100 animate-in slide-in-from-bottom-10 duration-500 mb-20">
             <div className="flex justify-between items-center mb-10">
                <div>
                   <h3 className="text-2xl font-black text-primary tracking-tight">Set Your Impact Level</h3>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Subscription Allocation</p>
                </div>
                <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-2xl tracking-tighter border border-emerald-100">
                   {contribution}%
                </div>
             </div>

             <div className="space-y-8">
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  value={contribution}
                  onChange={e => setContribution(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                   <span>Standard (5%)</span>
                   <span>Premium (25%)</span>
                   <span>Elite (50%)</span>
                </div>
             </div>

             <div className="mt-10 p-6 rounded-3xl bg-indigo-50/50 flex gap-4 border border-indigo-100/50">
                <Sparkles size={24} className="text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-indigo-900/60 leading-relaxed">
                   Increasing your allocation doesn't change your subscription price—it just increases the direct impact of your athletic membership.
                </p>
             </div>
          </div>
        )}

        {/* Action Bar */}
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 transition-all duration-500 ${selectedId ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
           <button 
            onClick={handleComplete}
            disabled={isSaving}
            className="px-12 py-5 bg-primary text-white rounded-[24px] font-black text-sm shadow-2xl shadow-indigo-900/40 hover:scale-105 transition-all flex items-center gap-3"
           >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
              Finalize & Start My Journey
           </button>
        </div>
      </main>
    </div>
  );
}
