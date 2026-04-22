"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap, Trophy, Heart, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { userService } from "@/services/userService";
import { useState, useEffect } from "react";


const plans = [
  {
    id: "silver",
    name: "Silver Impact",
    price: { monthly: 19, yearly: 180 },
    features: [
      "1 Monthly Draw Entry",
      "Basic Performance Tracking",
      "10% Charity Allocation",
      "Impact Badge",
      "Email Support"
    ],
    color: "#6b7280", // Slate
    icon: Star,
    popular: false
  },
  {
    id: "gold",
    name: "Gold Champion",
    price: { monthly: 49, yearly: 470 },
    features: [
      "3 Monthly Draw Entries",
      "Advanced Analytics Dashboard",
      "10% Charity Allocation",
      "Verified Athlete Status",
      "Priority Verification",
      "Member-Only Community"
    ],
    color: "#68dba9", // Mint
    icon: Trophy,
    popular: true
  },
  {
    id: "elite",
    name: "Elite Visionary",
    price: { monthly: 99, yearly: 950 },
    features: [
      "10 Monthly Draw Entries",
      "Exclusive Impact Map Access",
      "20% Charity Allocation",
      "1-on-1 Performance Coaching",
      "VIP Event Access",
      "Legacy Impact Reporting",
      "Direct Founder Access"
    ],
    color: "#4f46e5", // Indigo
    icon: Zap,
    popular: false
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      userService.getCurrentProfile().then(profile => {
        if (profile?.subscription_status === 'active') {
          setCurrentPlan(profile.subscription_plan);
        }
      });
    }
  }, [user]);

  return (
    <div style={{ background: "#faf8ff", minHeight: "100vh" }}>

      <Navbar />

      <main className="pt-28 pb-20">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">

          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: "#312e81" }}
          >
            Membership Plans
          </p>
          <h1
            className="font-extrabold leading-[1.1] mb-8"
            style={{
              fontFamily: "Manrope, sans-serif",
              fontSize: "clamp(3rem, 6vw, 4.5rem)",
              color: "#130f4a",
              letterSpacing: "-0.03em",
            }}
          >
            Ready to <span style={{ color: "#68dba9" }}>Elevate</span> Your Impact?
          </h1>


          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-6 mb-8">

            <span className={`text-sm font-bold transition-colors duration-300 ${!isYearly ? 'text-[#130f4a]' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`w-14 h-7 rounded-full p-1 relative transition-all duration-500 ${isYearly ? 'bg-[#68dba9]' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-500 transform ${isYearly ? 'translate-x-7 bg-white' : 'translate-x-0 bg-[#130f4a]'}`} />
            </button>
            <span className={`text-sm font-bold transition-colors duration-300 ${isYearly ? 'text-[#130f4a]' : 'text-slate-400'}`}>
              Yearly <span className={`ml-2 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all duration-500 ${isYearly ? 'bg-[#130f4a] text-[#68dba9]' : 'bg-[#68dba9]/10 text-[#68dba9]'}`}>Save 20%</span>
            </span>

          </div>
        </div>

        {/* Pricing Grid */}
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-[40px] p-10 flex flex-col transition-all duration-300 hover:-translate-y-2 ${isCurrent ? 'ring-2 ring-[#68dba9] shadow-2xl' : ''}`}
                style={{
                  background: plan.popular ? "#130f4a" : "#ffffff",
                  border: plan.popular ? "none" : isCurrent ? "none" : "1px solid rgba(26,20,107,0.08)",
                  boxShadow: plan.popular ? "0 24px 80px rgba(26,20,107,0.25)" : "0 4px 24px rgba(26,20,107,0.04)",
                  color: plan.popular ? "#ffffff" : "#131b2e"
                }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: plan.popular ? "rgba(104,219,169,0.1)" : "#f3f4f6",
                      color: plan.popular ? "#68dba9" : "#130f4a",
                    }}
                  >
                    <plan.icon size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isCurrent && (
                      <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Current Plan</span>
                    )}
                    {plan.popular && !isCurrent && (
                      <span className="px-3 py-1 bg-[#68dba9] text-[#002b1b] text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</span>
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black" style={{ fontFamily: "Manrope, sans-serif" }}>
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-sm font-bold opacity-60">/{isYearly ? 'year' : 'mo'}</span>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-medium opacity-80">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: plan.popular ? "rgba(104,219,169,0.2)" : "#f0fdf4", color: plan.popular ? "#68dba9" : "#16a34a" }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href={isCurrent ? "/dashboard/subscription" : `/checkout?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`}
                  className="inline-flex items-center justify-center px-8 py-5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: isCurrent ? "#6366f1" : plan.popular ? "#68dba9" : "#130f4a",
                    color: plan.popular && !isCurrent ? "#002b1b" : "#ffffff",
                    boxShadow: plan.popular ? "0 8px 24px rgba(104,219,169,0.3)" : "0 8px 24px rgba(19,15,74,0.15)"
                  }}
                >
                  {isCurrent ? "Manage Plan" : "Choose Plan"} <ArrowRight size={16} className="ml-2" />

                </Link>
              </div>
            );
          })}

        </div>

        {/* Trust Section */}
        <div className="max-w-4xl mx-auto px-6 mt-32 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Trusted by over 14,000 athletes worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <div className="text-xl font-black">NIKE</div>
            <div className="text-xl font-black">ADIDAS</div>
            <div className="text-xl font-black">PUMA</div>
            <div className="text-xl font-black">UNDER ARMOUR</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
