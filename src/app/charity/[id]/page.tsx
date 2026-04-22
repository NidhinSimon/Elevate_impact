"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { charityService, Charity } from "@/services/charityService";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Heart, 
  Users, 
  Zap, 
  MapPin, 
  ArrowRight, 
  ShieldCheck,
  ChevronRight,
  Loader2,
  Calendar,
  Share2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";

export default function CharityDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState(100);
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    if (id) {
      charityService.getCharityById(id as string).then(data => {
        setCharity(data);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (!id || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const donationState = params.get("donation");
    const sessionId = params.get("session_id");

    if (donationState !== "success" || !sessionId) {
      if (donationState === "cancelled") {
        toast.error("Donation checkout was canceled.");
        router.replace(`/charity/${id}`);
      }
      return;
    }

    const verifyDonation = async () => {
      const loadingToast = toast.loading("Confirming your donation...");

      try {
        const res = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "We couldn't confirm your donation yet.");
        }

        const fresh = await charityService.getCharityById(id as string);
        if (fresh) {
          setCharity(fresh);
        }

        toast.success("Donation received. Thank you for supporting this mission.", { id: loadingToast });
      } catch (err: any) {
        toast.error(err.message || "Donation verification failed.", { id: loadingToast });
      } finally {
        router.replace(`/charity/${id}`);
      }
    };

    void verifyDonation();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl font-black text-primary">Charity Not Found</h1>
        <button onClick={() => router.push("/charity")} className="px-8 py-3 bg-primary text-white rounded-full font-bold">
           Back to Directory
        </button>
      </div>
    );
  }

  const progress = (charity.raised_amount / charity.goal_amount) * 100;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero Banner */}
        <section className="relative h-[600px] w-full overflow-hidden pt-20">
           <Image 
             src={charity.image_url} 
             alt={charity.name} 
             fill 
             className="object-cover brightness-[0.3]"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#1A146B] via-transparent to-transparent" />
           
           <div className="absolute inset-0 flex flex-col justify-end pb-24 px-6 max-w-[1400px] mx-auto w-full">
              <div className="max-w-3xl space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{charity.tagline}</span>
                 </div>
                 <h1 className="text-[72px] font-black text-white tracking-tighter leading-none">{charity.name}</h1>
                 <p className="text-xl text-indigo-100/70 font-medium leading-relaxed max-w-xl">
                    Advancing scholarship and technological excellence for the leaders of tomorrow.
                 </p>
              </div>
           </div>
        </section>

        {/* Content Section */}
        <div className="max-w-[1400px] mx-auto px-6 py-24">
           <div className="grid lg:grid-cols-[1fr_400px] gap-20">
              {/* Left Column: Mission & Impact */}
              <div className="space-y-24">
                 {/* Impact Stats */}
                 <section className="space-y-12">
                    <h3 className="text-xl font-black text-primary flex items-center gap-3">
                       <Zap size={20} className="text-emerald-500" /> Current Impact
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                       <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 space-y-6">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-primary">
                             <Users size={20} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Lives Impacted</p>
                             <p className="text-4xl font-black text-[#0F0A4A] tracking-tighter">{charity.lives_impacted}</p>
                          </div>
                       </div>

                       <div className="p-10 rounded-[40px] bg-[#1A146B] text-white space-y-6 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                             <Zap size={60} />
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                             <Zap size={20} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Funds Allocated</p>
                             <p className="text-4xl font-black tracking-tighter">{charity.funds_allocated}</p>
                          </div>
                       </div>

                       <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 space-y-6">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-primary">
                             <MapPin size={20} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schools Modernized</p>
                             <p className="text-4xl font-black text-[#0F0A4A] tracking-tighter">{charity.schools_modernized}</p>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* About Mission */}
                 <section className="space-y-8">
                    <h3 className="text-xl font-black text-primary">About the Mission</h3>
                    <div className="prose prose-lg max-w-none text-slate-500 font-medium leading-[1.8] space-y-8 whitespace-pre-line">
                       {charity.description}
                    </div>
                 </section>

                 {/* Upcoming Events */}
                 <section className="space-y-12">
                    <h3 className="text-xl font-black text-primary flex items-center gap-3">
                       <Calendar size={20} className="text-emerald-500" /> Upcoming Events
                    </h3>
                    <div className="space-y-4">
                       {charity.events?.map((event) => (
                         <div key={event.id} className="group flex items-center justify-between p-10 bg-white border border-slate-100 rounded-[40px] hover:shadow-xl transition-all cursor-pointer">
                            <div className="flex items-center gap-8">
                               <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-[28px] flex flex-col items-center justify-center text-primary shrink-0">
                                  <span className="text-2xl font-black leading-none">{event.event_date}</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest mt-1">{event.event_month}</span>
                               </div>
                               <div>
                                  <h4 className="text-2xl font-black text-[#0F0A4A] mb-2">{event.title}</h4>
                                  <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                                     <MapPin size={14} /> {event.location}
                                  </p>
                               </div>
                            </div>
                            <div className="w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                               <ChevronRight size={24} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>
              </div>

              {/* Right Column: Donation Sidebar */}
              <div className="relative">
                 <aside className="sticky top-32 space-y-8">
                    <div className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-900/5 space-y-10">
                       <div>
                          <h3 className="text-2xl font-black text-[#0F0A4A] mb-4">Fund this Mission</h3>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">Your contribution directly supports classroom modernization and student scholarships.</p>
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Raised: <span className="text-emerald-500">${(charity.raised_amount / 1000000).toFixed(1)}M</span></p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal: ${(charity.goal_amount / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div 
                              className="h-full bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/20" 
                              style={{ width: `${progress}%` }}
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-3">
                          {[50, 100, 250].map(amt => (
                            <button 
                              key={amt}
                              onClick={() => setDonationAmount(amt)}
                              className={`py-4 rounded-2xl font-black text-sm transition-all border ${
                                donationAmount === amt 
                                  ? 'bg-[#1A146B] text-white border-transparent shadow-lg shadow-indigo-900/20' 
                                  : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-primary'
                              }`}
                            >
                               ${amt}
                            </button>
                          ))}
                       </div>

                        <button 
                          onClick={async () => {
                            if (donationAmount < 5) {
                              toast.error("Minimum donation is $5");
                              return;
                            }
                            setIsDonating(true);
                            const t = toast.loading("Preparing secure donation...");
                            try {
                              const res = await fetch("/api/checkout-one-time", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  amount: donationAmount,
                                  charityId: charity.id,
                                  charityName: charity.name,
                                  userId: user?.id,
                                  userEmail: user?.email
                                })
                              });
                              const data = await res.json();

                              if (!res.ok) {
                                throw new Error(data.error || "Failed to create donation checkout");
                              }
                              
                              if (data.isMock) {
                                // Simulate recording the donation
                                await fetch("/api/donations", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    amount: donationAmount,
                                    charityId: charity.id,
                                    userId: user?.id,
                                    stripePaymentIntentId: data.clientSecret
                                  })
                                });
                                toast.success("Donation successful! (Demo Mode)", { id: t });
                                // Refresh charity data
                                const fresh = await charityService.getCharityById(id as string);
                                if (fresh) setCharity(fresh);
                              } else {
                                toast.success("Redirecting to secure payment...", { id: t });
                                if (data.url) {
                                  window.location.href = data.url;
                                }
                              }
                            } catch (err: any) {
                              toast.error(err.message || "Failed to initiate donation", { id: t });
                            } finally {
                              setIsDonating(false);
                            }
                          }}
                          disabled={isDonating}
                          className="w-full py-6 bg-[#1A146B] text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 hover:scale-[1.02] transition-all group disabled:opacity-50"
                        >
                          {isDonating ? <Loader2 className="animate-spin" /> : <Heart size={20} className="group-hover:fill-white transition-all" />}
                          Support with ${donationAmount}
                        </button>


                       <div className="flex items-center justify-center gap-2 pt-4 opacity-40">
                          <ShieldCheck size={14} className="text-[#0F0A4A]" />
                          <span className="text-[10px] font-black text-[#0F0A4A] uppercase tracking-widest">Secure Transaction</span>
                       </div>
                    </div>

                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] flex items-center gap-6">
                       <div className="w-14 h-14 bg-indigo-100 rounded-[20px] flex items-center justify-center text-primary font-black text-xs">
                          {charity.name.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <p className="font-black text-[#0F0A4A] text-sm">{charity.name} Network</p>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified Non-Profit</p>
                       </div>
                       <button className="ml-auto text-slate-300 hover:text-primary transition-colors">
                          <Share2 size={18} />
                       </button>
                    </div>
                 </aside>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
