"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Senior Dev Practice: Check for existing admin session on mount to prevent redundant login
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (profile?.role === "admin") {
            console.log("[ADMIN LOGIN] Active admin session detected, redirecting...");
            router.replace("/admin");
            return;
          }
        }
      } catch (err) {
        console.error("[ADMIN LOGIN] Session check failed:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !data.user) {
      console.error("[ADMIN LOGIN] Auth error:", loginError?.message);
      setError("Invalid admin credentials. Please try again.");
      setLoading(false);
      return;
    }

    console.log("[ADMIN LOGIN] User authenticated, checking role for:", data.user.id);

    // Verify role explicitly from the database (Authoritative check)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("[ADMIN LOGIN] Profile fetch error:", profileError.message, profileError.code);
      await supabase.auth.signOut();
      setError("Error verifying admin status. Please contact support.");
      setLoading(false);
      return;
    }

    if (profile?.role !== "admin") {
      console.warn("[ADMIN LOGIN] Unauthorized access attempt by:", email, "Role:", profile?.role);
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    console.log("[ADMIN LOGIN] Access authorized, redirecting...");
    router.push("/admin");
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#1A146B] opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-[24px] bg-[#1A146B] flex items-center justify-center text-white shadow-2xl shadow-indigo-900/30 mb-6">
            <Zap size={32} />
          </div>
          <h1 className="text-3xl font-black text-[#0F0A4A] tracking-tighter uppercase">Impact Admin</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Premium Concierge</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-10 text-indigo-600">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Access Only</span>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
              <div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Admin Email</label>
                 <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@elevatedimpact.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#0F0A4A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Security Key</label>
                 <div className="relative">
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#0F0A4A] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                    />
                    <Lock size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                 </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                   {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#1A146B] text-white rounded-[20px] font-black text-sm shadow-xl shadow-indigo-900/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Authorize Access"}
              </button>
           </form>

           <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">System Integrity Verified</span>
              <ShieldCheck size={12} className="text-emerald-500" />
           </div>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          Not an admin? <Link href="/login" className="text-primary font-bold hover:underline">User Login</Link>
        </p>
      </div>
    </div>
  );
}
