"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Loader2, Zap, Trophy } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "react-hot-toast";

export default function SubscribePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planType: string) => {
    if (!user) {
      toast.error("Please log in to subscribe");
      return;
    }

    setLoading(planType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err: any) {
      toast.error(err.message);
      setLoading(null);
    }
  };

  const plans = [
    {
      type: "monthly",
      title: "Impact Monthly",
      price: process.env.NEXT_PUBLIC_MONTHLY_PRICE || "£9.99",
      priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
      features: [
        "10 Official Draw Entries",
        "Personal Impact Dashboard",
        "Select 1 Primary Charity",
        "Monthly Performance Reports",
        "Community Access"
      ],
      icon: Zap,
      color: "from-blue-500/20 to-indigo-500/20"
    },
    {
      type: "yearly",
      title: "Elevated Yearly",
      price: process.env.NEXT_PUBLIC_YEARLY_PRICE || "£89.99",
      priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
      features: [
        "120 Official Draw Entries",
        "Founding Member Badge",
        "Select up to 3 Charities",
        "Real-time Impact Map",
        "Priority Claim Processing",
        "Save 25% annually"
      ],
      icon: Trophy,
      badge: "Best Value",
      color: "from-emerald-500/20 to-teal-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-primary tracking-tight">Unlock Your Impact</h1>
          <p className="text-xl text-text-muted font-medium max-w-2xl mx-auto">
            Choose a plan to start logging your performance and funding global change. 
            Every subscription fuels our mission.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.type}
              className="relative group bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${plan.color} blur-[80px] -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              {plan.badge && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                  {plan.badge}
                </div>
              )}

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-8">
                  <plan.icon className="text-primary" size={32} />
                </div>

                <h3 className="text-2xl font-black text-primary mb-2">{plan.title}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-primary">{plan.price}</span>
                  <span className="text-text-muted font-bold">/{plan.type === 'monthly' ? 'mo' : 'yr'}</span>
                </div>

                <ul className="space-y-4 mb-12">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-600 font-medium">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Check size={12} className="text-emerald-600" strokeWidth={4} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.type)}
                  disabled={!!loading}
                  className="w-full py-5 bg-accent text-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading === plan.type ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    `Subscribe ${plan.type === 'monthly' ? 'Monthly' : 'Yearly'}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
