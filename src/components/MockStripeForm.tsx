"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface MockStripeFormProps {
  amount: number;
  onSuccess: () => void;
}

export default function MockStripeForm({ amount, onSuccess }: MockStripeFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    card: "4242 4242 4242 4242",
    expiry: "12 / 26",
    cvc: "123"
  });

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const loadingToast = toast.loading("Processing simulated payment...");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    toast.success("Success! Test payment accepted.", { id: loadingToast });
    onSuccess();
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSimulatedPayment} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 rounded-[32px] bg-indigo-50/30 border border-indigo-100/50 space-y-6">
        <div className="flex items-center gap-3 mb-2">
           <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-md">Demo Mode</span>
           <p className="text-[10px] font-bold text-indigo-900/40">Simulated Payment Environment</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
          <div className="relative">
             <input 
              type="text" 
              value={formData.card}
              readOnly
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-primary focus:border-indigo-600 transition-all outline-none"
             />
             <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3" alt="Mastercard" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
            <input 
              type="text" 
              value={formData.expiry}
              readOnly
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-primary focus:border-indigo-600 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC</label>
            <input 
              type="text" 
              value={formData.cvc}
              readOnly
              className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-primary focus:border-indigo-600 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-[10px] font-bold text-amber-900/60 leading-relaxed">
          Platform is currently in **Simulation Mode**. No real funds will be charged. Use this to verify the impact subscription workflow.
        </p>
      </div>

      <button
        disabled={isProcessing}
        type="submit"
        className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-sm hover:shadow-2xl hover:shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <Lock size={18} />
            Process Test Payment (${amount}.00)
          </>
        )}
      </button>
    </form>
  );
}
