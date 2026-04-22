"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
}

export default function StripeCheckoutForm({ amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        toast.error(error.message!);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      await onSuccess();
    }


    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
      <div className="p-6 rounded-3xl bg-indigo-50/30 border border-indigo-100/50 mb-8">
        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      </div>

      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
          Your transaction is encrypted and secured by Stripe. By confirming, you authorize Elevated Impact to process your subscription payment.
        </p>
      </div>

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <Lock size={18} />
            Pay ${amount}.00 Securely
          </>
        )}
      </button>

      {message && (
        <div id="payment-message" className="text-center text-sm font-bold text-rose-500 animate-in fade-in">
          {message}
        </div>
      )}
    </form>
  );
}
