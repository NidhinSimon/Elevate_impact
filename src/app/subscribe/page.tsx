"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Zap, Trophy, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

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

export default function SubscribePage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans overflow-x-hidden text-primary">
      <Navbar />

      <main className="pt-32 pb-48 max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary/60 mb-2">Activation Required</p>
          <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight leading-[1.1]">
            Unlock Your <span className="text-secondary-light">Impact</span>
          </h1>
          <p className="text-xl text-text-muted font-medium max-w-2xl mx-auto">
            Your account is ready. Choose a membership plan to activate your dashboard and start funding global change.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center justify-center gap-6 mb-16"
        >
          <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-primary' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`w-14 h-7 rounded-full p-1 relative transition-all duration-300 ${isYearly ? 'bg-secondary-light' : 'bg-slate-200'}`}
          >
            <motion.div 
              animate={{ x: isYearly ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`w-5 h-5 rounded-full shadow-md ${isYearly ? 'bg-white' : 'bg-primary'}`} 
            />
          </button>
          <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-primary' : 'text-slate-400'}`}>
            Yearly <span className="ml-2 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-secondary-light/10 text-secondary-light rounded-md animate-pulse">Save 20%</span>
          </span>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              className={`relative rounded-[48px] p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 group ${plan.popular ? 'bg-primary text-white shadow-2xl shadow-primary/20 border-none min-h-[640px]' : 'bg-white text-primary border border-slate-100 shadow-sm min-h-[640px]'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-light/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-white/10 text-secondary-light' : 'bg-slate-50 text-primary'}`}>
                  <plan.icon size={28} />
                </div>
                {plan.popular && (
                  <span className="px-4 py-1.5 bg-secondary-light text-primary text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-secondary-light/20">Most Popular</span>
                )}
              </div>

              <h3 className="text-2xl font-black mb-2 relative z-10">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8 relative z-10">
                <span className="text-5xl font-black leading-none">
                  ${isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-sm font-bold opacity-60">/{isYearly ? 'yr' : 'mo'}</span>
              </div>

              <div className="space-y-4 mb-10 flex-1 relative z-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-medium">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-secondary-light/20 text-secondary-light' : 'bg-secondary-light/10 text-secondary-light'}`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="opacity-80">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/checkout?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`}
                className={`inline-flex items-center justify-center px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all group-hover:scale-[1.02] active:scale-[0.98] ${plan.popular ? 'bg-secondary-light text-primary shadow-xl shadow-secondary-light/20' : 'bg-primary text-white shadow-xl shadow-primary/10'}`}
              >
                Choose {plan.name} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom Notice */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-sm font-bold text-slate-400 uppercase tracking-widest opacity-60"
        >
          Secure Payment via Stripe • Cancel Anytime • 24/7 Support
        </motion.p>
      </main>

      <Footer />
    </div>
  );
}
