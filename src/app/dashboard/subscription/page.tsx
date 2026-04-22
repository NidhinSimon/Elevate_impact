"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { userService, UserProfile } from "@/services/userService";
import { 
  CreditCard, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  RefreshCcw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock
} from "lucide-react";

import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SubscriptionManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await userService.getCurrentProfile();
      if (!data) {
        console.warn("[SUBSCRIPTION] No profile found for current user.");
      } else {
        console.log("[SUBSCRIPTION] Profile loaded:", data);
      }
      setProfile(data);
    } catch (err) {
      console.error("[SUBSCRIPTION] Failed to fetch profile:", err);
      toast.error("Failed to load impact data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = async () => {
    if (!profile) return;
    
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your subscription? Your access to draws will remain active until the end of the current billing cycle."
    );

    if (confirmCancel) {
      const loadingToast = toast.loading("Processing cancellation...");
      try {
        const success = await userService.updateProfile(profile.id, {
          subscription_status: 'cancelled'
        });
        if (success) {
          setProfile(success);
          toast.success("Subscription cancelled. Access remains active until " + 
            (success.renewal_date ? new Date(success.renewal_date).toLocaleDateString() : 'end of period'), 
            { id: loadingToast }
          );
        }
      } catch (err) {
        toast.error("Failed to cancel subscription. Please try again.", { id: loadingToast });
      }
    }
  };

  const handleReactivate = async () => {
    if (!profile) return;
    
    const loadingToast = toast.loading("Reactivating your impact...");
    try {
      const success = await userService.updateProfile(profile.id, {
        subscription_status: 'active'
      });
      if (success) {
        setProfile(success);
        toast.success("Welcome back! Your subscription is now fully active.", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Failed to reactivate. Please contact support.", { id: loadingToast });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const isActive = profile?.subscription_status === 'active';
  const isCancelled = profile?.subscription_status === 'cancelled';
  const hasNoPlan = profile?.subscription_plan === 'none' || !profile?.subscription_plan;

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-20">

          <DashboardSidebar />

          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-[44px] font-extrabold text-primary mb-2 tracking-tight">Subscription</h1>
                <p className="text-lg text-text-muted font-medium">Manage your impact tier and billing preferences.</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : isCancelled ? 'bg-amber-500' : 'bg-slate-300'} animate-pulse`} />
                <span className="text-xs font-black uppercase tracking-widest text-primary">
                  Status: {profile?.subscription_status?.toUpperCase() || 'INACTIVE'}
                </span>
              </div>
            </header>

            {hasNoPlan ? (
              <section className="bg-white rounded-[48px] p-16 text-center shadow-sm border border-slate-100">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
                  <Zap size={32} />
                </div>
                <h2 className="text-3xl font-black text-primary mb-4">No Active Subscription</h2>
                <p className="text-text-muted font-medium max-w-md mx-auto mb-10">
                  Join Elevated Impact today to start participating in draws and contributing to global initiatives.
                </p>
                <Link 
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all"
                >
                  View Plans <ArrowUpRight size={18} />
                </Link>
              </section>
            ) : (
              <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
                <div className="space-y-8">
                  {/* Current Plan Card */}
                  <section className="bg-white rounded-[48px] p-12 shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                       <Zap size={120} className="text-primary" fill="currentColor" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary">
                          <Zap size={20} fill="currentColor" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Current Tier</span>
                      </div>
  
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                         <div>
                            <h2 className="text-5xl font-black text-primary tracking-tighter mb-2">
                               {profile?.subscription_plan?.charAt(0).toUpperCase() + profile?.subscription_plan?.slice(1) + ' Impact'}
                            </h2>
                            <p className="text-text-muted font-bold flex items-center gap-2">
                               <Calendar size={16} /> 
                               {isCancelled ? 'Terminates on ' : 'Next Invoice on '} 
                               {profile?.renewal_date ? new Date(profile.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-4xl font-black text-primary tracking-tighter">
                              ${profile?.subscription_plan === 'elite' ? '99' : profile?.subscription_plan === 'gold' ? '49' : '19'}.00
                            </p>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Per {profile?.subscription_period}</p>
                         </div>
                      </div>
  
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-50">
                         <Link 
                          href="/pricing"
                          className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all flex items-center gap-2"
                         >
                            Modify Plan <ArrowUpRight size={18} />
                         </Link>
                         
                         {isActive && (
                           <button 
                            onClick={handleCancel}
                            className="px-8 py-4 bg-white text-rose-500 border border-rose-100 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all flex items-center gap-2"
                           >
                              <XCircle size={18} /> Cancel Impact
                           </button>
                         )}
                         
                         {isCancelled && (
                           <button 
                            onClick={handleReactivate}
                            className="px-8 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-sm hover:bg-emerald-100 transition-all flex items-center gap-2"
                           >
                              <RefreshCcw size={18} /> Resume Impact
                           </button>
                         )}
                      </div>
                    </div>
                  </section>
  
                  {/* Billing Information */}
                  <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-primary">Billing History</h3>
                        <div className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                           Latest Invoices
                        </div>
                     </div>
                     <div className="space-y-4">
                        {/* Dynamic Billing History Generation */}
                        {[0, 1, 2].map(i => {
                          const date = new Date();
                          date.setMonth(date.getMonth() - i);
                          return (
                            <div key={i} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-colors">
                                     <CreditCard size={20} />
                                  </div>
                                  <div>
                                     <p className="font-bold text-primary">Impact Contribution #{842 - i}</p>
                                     <p className="text-xs text-text-muted font-medium">{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                                  </div>
                               </div>
                               <div className="text-right flex items-center gap-6">
                                  <span className="font-black text-primary">${profile?.subscription_plan === 'elite' ? '99' : profile?.subscription_plan === 'gold' ? '49' : '19'}.00</span>
                                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                     <CheckCircle2 size={12} /> Paid
                                  </span>
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </section>
                </div>
  
                {/* Sidebar Info */}
                <aside className="space-y-8">
                   <div className="p-8 rounded-[40px] bg-[#0F0A4A] text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all pointer-events-none">
                         <ShieldCheck size={64} />
                      </div>
                      <h4 className="text-lg font-black mb-4">Payment Security</h4>
                      <p className="text-indigo-200 text-sm leading-relaxed font-medium mb-8">
                         Your subscription is managed via Stripe. Billing occurs automatically every month to ensure your draw entries remain active.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400">
                           <CheckCircle2 size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">PCI Level 1 Secure</span>
                        </div>
                        <div className="flex items-center gap-3 text-indigo-300">
                           <Lock size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">256-bit Encryption</span>
                        </div>
                      </div>
                   </div>
  
                   {isCancelled && (
                     <div className="p-8 rounded-[40px] bg-rose-50 border border-rose-100">
                        <div className="flex items-center gap-3 mb-4 text-rose-600">
                           <AlertCircle size={20} />
                           <h4 className="font-black text-xs uppercase tracking-widest">Termination Notice</h4>
                        </div>
                        <p className="text-rose-900/60 text-xs font-bold leading-relaxed">
                          Your subscription is set to expire. After {profile?.renewal_date ? new Date(profile.renewal_date).toLocaleDateString() : 'the period'}, you will lose access to premium draws and impact metrics.
                        </p>
                     </div>
                   )}

                   <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100">
                      <h4 className="font-black text-primary text-xs uppercase tracking-widest mb-6">Subscription FAQ</h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-black text-primary mb-1">Can I upgrade anytime?</p>
                          <p className="text-[11px] text-text-muted font-medium leading-relaxed">Yes, upgrades take effect immediately and are prorated.</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-primary mb-1">When is my next draw?</p>
                          <p className="text-[11px] text-text-muted font-medium leading-relaxed">Active subscribers are automatically entered into every weekly draw.</p>
                        </div>
                      </div>
                   </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
