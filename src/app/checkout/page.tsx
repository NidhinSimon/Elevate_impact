"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { userService } from "@/services/userService";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary opacity-20" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Secure Checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const plan = searchParams.get("plan") || "gold";
  const billing = searchParams.get("billing") || "monthly";
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const planDetails = {
    silver: { name: "Silver Impact", price: billing === "monthly" ? 19 : 180 },
    gold: { name: "Gold Champion", price: billing === "monthly" ? 49 : 470 },
    elite: { name: "Elite Visionary", price: billing === "monthly" ? 99 : 950 },
  }[plan as "silver" | "gold" | "elite"] || { name: "Gold Champion", price: 49 };


  useEffect(() => {
    if (!authLoading && !user) {
      const currentParams = searchParams.toString();
      router.push(`/login?redirect=/checkout${currentParams ? `?${currentParams}` : ""}`);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (!user || !success || !sessionId || isSuccess || isVerifying) {
      return;
    }

    const verifySession = async () => {
      setIsVerifying(true);
      const loadingToast = toast.loading("Finalizing your membership...");

      try {
        const res = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Stripe verification failed");
        }

        toast.success("Subscription activated! Welcome to the team.", { id: loadingToast });
        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard?subscribed=true"), 1800);
      } catch (err: any) {
        toast.error(err.message || "We couldn't confirm your Stripe checkout yet.", { id: loadingToast });
      } finally {
        setIsVerifying(false);
      }
    };

    void verifySession();
  }, [user, success, sessionId, isSuccess, isVerifying, router]);

  useEffect(() => {
    if (canceled) {
      toast.error("Checkout was canceled. Your plan has not been changed.");
    }
  }, [canceled]);

  const handleSubscriptionActivation = async () => {
    if (!user) return;

    setIsRedirecting(true);
    const loadingToast = toast.loading("Preparing secure Stripe checkout...");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          billing,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create Stripe checkout");
      }

      if (data.isMock) {
        const subscribed = await userService.subscribe(user.id, plan as any, billing as any);
        if (!subscribed) {
          throw new Error("Mock subscription activation failed");
        }

        toast.success("Subscription activated! Welcome to the team.", { id: loadingToast });
        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL is missing");
      }

      toast.success("Redirecting to Stripe...", { id: loadingToast });
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Subscription activation error:", err);
      toast.error(err.message || "An error occurred during activation.", { id: loadingToast });
      setIsRedirecting(false);
    }
  };


  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary opacity-20" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Secure Checkout...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-10">
        <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in fade-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Impact Activated!</h1>
          <p className="text-text-muted font-medium text-lg leading-relaxed">
            Welcome to the {planDetails.name} tier. Your first contribution has been logged and your draw entries are now active.
          </p>
          <div className="pt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all"
            >
              Enter Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-12 group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Plans</span>
        </Link>

        <div className="grid lg:grid-cols-[1fr_450px] gap-20 items-start">
          {/* Payment Section */}
          <section className="bg-white rounded-[48px] p-12 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-primary tracking-tight">Secure Stripe Checkout</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hosted by Stripe</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[32px] bg-indigo-50/40 border border-indigo-100 p-8 space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  You&apos;ll be redirected to Stripe&apos;s hosted checkout to securely complete your subscription with card authentication, receipts, and billing handling built in.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    "Card authorization",
                    "Subscription billing",
                    "Secure confirmation",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-white border border-slate-100 px-4 py-5 text-center text-xs font-black uppercase tracking-widest text-primary">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  Stripe handles the payment capture and any required authentication. After you return, we&apos;ll automatically sync your membership with your account.
                </p>
              </div>

              <button
                onClick={handleSubscriptionActivation}
                disabled={isRedirecting || isVerifying}
                className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isRedirecting || isVerifying ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Lock size={18} />
                    Continue to Stripe
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="space-y-8 sticky top-32">
            <div className="bg-[#0F0A4A] rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl -mr-10 -mt-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Order Summary</p>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-200">{planDetails.name}</span>
                  <span className="font-black text-xl">${planDetails.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium opacity-60">
                  <span>Billing Cycle</span>
                  <span className="capitalize">{billing}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Due Now</p>
                  <p className="text-4xl font-black">${planDetails.price}.00</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">VAT Included</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Zap size={20} className="text-primary" />
                <h4 className="font-black text-primary uppercase text-xs tracking-widest">Included in {planDetails.name}</h4>
              </div>
              <div className="space-y-4">
                {[
                  "Instant Draw Eligibility",
                  "Verified Performance Tracking",
                  "Impact Partner Contributions",
                  "Cancel Anytime"
                ].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
