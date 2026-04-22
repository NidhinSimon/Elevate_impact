"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import OnboardingModal from "@/components/OnboardingModal";
import Link from "next/link";
import {
  TrendingUp,
  Trophy,
  Heart,
  Zap,
  Plus,
  Timer,
  ChevronRight,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatDateSafe } from "@/lib/date";

const supabase = createClient();

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary opacity-20" size={40} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, charities(name)')
      .eq('id', user!.id)
      .single();

    if (data) {
      setProfile(data);
      // Show onboarding if subscribed=true or if not completed yet
      const isSubscribedJustNow = searchParams.get('subscribed') === 'true';
      if ((isSubscribedJustNow || !data.onboarding_completed) && data.subscription_status === 'active') {
        setShowOnboarding(true);
      }
    }

    // Fetch winnings
    const { data: winningsData } = await supabase
      .from('winnings')
      .select('*')
      .eq('user_id', user!.id);

    setWinnings(winningsData || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary opacity-20" size={40} />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const totalWon = winnings.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const latestWinning = winnings[0];
  const needsVerification = latestWinning && latestWinning.payout_status === 'pending';

  const metrics = [
    { label: "Active Entries", value: "12", trend: profile?.subscription_tier === 'yearly' ? 'Elite' : 'Member', icon: Trophy, color: "text-emerald-600" },
    { label: "Impact Partner", value: profile?.charities?.name || "None", trend: "Active", icon: Heart, color: "text-rose-600" },
    { label: "Total Winnings", value: `$${totalWon.toLocaleString()}`, trend: latestWinning ? (latestWinning.payout_status === 'paid' ? 'Paid' : 'Pending') : 'No wins yet', icon: Zap, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      {showOnboarding && <OnboardingModal userId={user.id} />}

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-16">

          <DashboardSidebar />

          {/* Main Dashboard Content - Workspace Canvas */}
          <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary/5 space-y-12 border border-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#15803d] text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100">
                  <Zap size={12} fill="currentColor" /> {profile?.subscription_tier === 'yearly' ? 'Elite Member' : 'Active Member'}
                </div>
                <h1 className="text-[44px] font-extrabold text-[#0F0A4A] mb-2 tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'}</h1>
                <p className="text-lg text-slate-500 leading-relaxed">Your performance is driving change for {profile?.charities?.name || 'global causes'}.</p>
              </div>
              <Link href="/dashboard/scores">
                <button className="flex items-center gap-2 px-8 py-4 bg-[#1A146B] text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-indigo-900/20 transition-all active:scale-95 shadow-xl shadow-indigo-900/10">
                  <Plus size={20} /> Log New Score
                </button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {metrics.map((m) => (
                <div key={m.label} className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 transition-colors ${m.color}`}>
                      <m.icon size={24} />
                    </div>
                    <span className="text-[10px] font-black px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg uppercase tracking-widest">{m.trend}</span>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
                  <p className="text-2xl font-black text-[#0F0A4A] tracking-tighter truncate">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_340px] gap-10">
              {/* Left Content Area */}
              <div className="space-y-10">
                <section className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-[#0F0A4A]">Recent Activity</h2>
                    <Link href="/dashboard/scores" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-2 group">
                      Full History <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  <div className="space-y-6">
                    <div className="py-20 text-center text-slate-300 italic font-medium">
                      No recent activity to show.
                    </div>
                  </div>
                </section>

                <section className="bg-[#1A146B] rounded-[40px] p-12 text-white overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 blur-[100px] -mr-64 -mt-64 group-hover:bg-emerald-400/20 transition-all duration-700" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-3 mb-8 text-emerald-300">
                        <Heart size={20} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Impact Pulse</span>
                      </div>
                      <h2 className="text-3xl font-extrabold mb-6 leading-tight">Your impact is growing.</h2>
                      <p className="text-indigo-200 mb-10 text-lg leading-relaxed font-medium">Your subscription and performance scores have directly supported {profile?.charities?.name || 'impact partners'} this cycle.</p>
                      <div className="flex flex-wrap gap-4">
                        <Link href="/charity" className="px-8 py-4 bg-white text-[#1A146B] rounded-2xl font-bold text-sm hover:scale-105 transition-all">Explore Partners</Link>
                        <Link href="/dashboard/charity" className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">Update Mission</Link>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar Area */}
              <div className="space-y-10">
                <section className="p-10 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8 text-[#0F0A4A]">
                    <Timer size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Monthly Draw</span>
                  </div>
                  <div className="p-6 rounded-[24px] bg-[#F8F9FE] border border-indigo-50 mb-8">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Status</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-emerald-600 tracking-tight">Active Qualifier</span>
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Trophy size={20} />
                      </div>
                    </div>
                  </div>
                  <Link href="/draw">
                    <button className="w-full py-5 rounded-[20px] bg-[#1A146B] text-white font-bold text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all">View Draw Details</button>
                  </Link>
                </section>

                <section className="p-10 rounded-[40px] bg-[#EDF2FF]/50 border border-[#EDF2FF] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3">
                    <Zap size={24} className="text-[#1A146B]/10 group-hover:text-[#1A146B]/20 transition-colors" fill="currentColor" />
                  </div>
                  <h3 className="text-lg font-black text-[#0F0A4A] mb-2 tracking-tight">Active Membership</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">Plan renews on {formatDateSafe(profile?.renewal_date, "N/A")}</p>
                  <Link href="/subscribe" className="inline-flex items-center gap-2 text-[#1A146B] font-bold text-sm hover:gap-3 transition-all">
                    Manage Billing <ArrowRight size={18} />
                  </Link>
                </section>

                {needsVerification && (
                  <section className="p-10 rounded-[40px] bg-amber-50 border border-amber-100 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-6 text-amber-700">
                      <Trophy size={20} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Verification Required</span>
                    </div>
                    <h3 className="text-lg font-black text-amber-900 mb-2 tracking-tight">Claim Your Prize</h3>
                    <p className="text-sm text-amber-700/70 mb-8 leading-relaxed font-medium">Your latest win requires proof of performance to be processed.</p>
                    <Link href="/dashboard/verify-win" className="inline-flex items-center gap-2 text-amber-900 font-bold text-sm hover:gap-3 transition-all">
                      Verify Now <ArrowRight size={18} />
                    </Link>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
