"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import {
  Heart,
  Search,
  Check,
  ChevronRight,
  Loader2,
  Info,
  Globe,
  Award
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

const supabase = createClient();

interface Charity {
  id: string;
  name: string;
  short_description: string;
  logo_url: string;
  category: string;
}

export default function CharityPreferencesPage() {
  const { user } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(10);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: charityData } = await supabase.from('charities').select('*');
      setCharities(charityData || []);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('selected_charity_id, charity_contribution_percentage')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setSelectedId(profileData.selected_charity_id);
          setPercentage(profileData.charity_contribution_percentage || 10);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedId) {
      toast.error("Please select a charity first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/charity-contribution", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId: selectedId, percentage }),
      });
      if (res.ok) {
        toast.success("Preferences updated!");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCharities = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCharity = charities.find(c => c.id === selectedId);
  const monthlyContribution = (9.99 * (percentage / 100)).toFixed(2);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-16">
          <DashboardSidebar />

          <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary/5 space-y-12 border border-slate-100">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-[44px] font-extrabold text-primary mb-2 tracking-tight">Impact Partners</h1>
                <p className="text-lg text-text-muted font-medium">Choose the global mission your performance funds.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted/30" size={18} />
                <input
                  type="text"
                  placeholder="Search mission..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-primary outline-none focus:border-accent/30 transition-all shadow-sm"
                />
              </div>
            </header>

            {/* Charity Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCharities.map((charity) => (
                <button
                  key={charity.id}
                  onClick={() => setSelectedId(charity.id)}
                  className={`group relative p-8 rounded-[40px] bg-white border transition-all duration-500 text-left hover:shadow-2xl hover:shadow-primary/5 ${selectedId === charity.id
                      ? 'border-accent ring-4 ring-accent/10 shadow-xl shadow-accent/5'
                      : 'border-slate-100'
                    }`}
                >
                  {selectedId === charity.id && (
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary shadow-lg shadow-accent/20">
                      <Check size={16} strokeWidth={4} />
                    </div>
                  )}

                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 overflow-hidden border border-slate-50">
                    {charity.logo_url ? (
                      <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover" />
                    ) : (
                      <Globe className="text-slate-200" size={32} />
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-md">
                      {charity.category}
                    </span>
                    <h3 className="text-xl font-black text-primary mt-3 mb-2">{charity.name}</h3>
                    <p className="text-sm text-text-muted font-medium leading-relaxed line-clamp-2">
                      {charity.short_description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Impact Model <ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>

            {/* Contribution Panel */}
            <section className="bg-primary rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

              <div className="relative z-10 grid lg:grid-cols-[1fr_400px] gap-16 items-center">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-accent border border-white/10 backdrop-blur-md">
                      <Heart size={24} fill="currentColor" />
                    </div>
                    <h2 className="text-3xl font-black">Contribution Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <p className="text-primary-muted font-bold">Your contribution: <span className="text-white text-xl font-black">{percentage}%</span> of subscription</p>
                      <span className="text-xs font-black text-accent uppercase tracking-widest">Min locked at 10%</span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={percentage}
                      onChange={e => setPercentage(parseInt(e.target.value))}
                      className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent transition-all"
                    />

                    <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                      <Award className="text-accent" size={32} />
                      <p className="text-sm font-medium leading-relaxed">
                        You contribute <span className="text-accent font-black">${monthlyContribution}</span> per month to
                        <span className="text-white font-black"> {selectedCharity?.name || 'your chosen mission'}</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-md">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary-muted mb-6 flex items-center gap-2">
                      <Info size={14} /> Allocation Strategy
                    </h4>
                    <p className="text-sm font-medium text-primary-muted leading-relaxed mb-8">
                      By choosing a higher contribution, you unlock exclusive Impact Tier rewards and personalized reports on your funding progress.
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-5 bg-accent text-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="animate-spin mx-auto" /> : "Save Preferences"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
