"use client";

import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-indigo-900/10 p-12 text-center border border-slate-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <AlertCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-[#1A146B] mb-4 tracking-tight">Authentication Error</h1>
        <p className="text-slate-400 font-medium mb-10 leading-relaxed">
          We encountered an issue while verifying your session. This usually happens if the login link has expired or there was a database error.
        </p>

        <div className="space-y-4">
          <Link 
            href="/login" 
            className="w-full flex items-center justify-center gap-2 py-5 bg-[#1A146B] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-900/20"
          >
            Try Logging In Again
          </Link>
          
          <Link 
            href="/" 
            className="w-full flex items-center justify-center gap-2 py-5 bg-white text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-100 hover:text-primary transition-all"
          >
            <ChevronLeft size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
