"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <div className="bg-surface font-sans text-text-main min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary-light/10 blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="w-full px-8 py-10 flex justify-center">
        <Link href="/">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary">
            Elevated Impact
          </h1>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pb-20">
        {/* Login Card */}
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-[0_20px_40px_rgba(19,27,46,0.04)] border border-gray-100/50 backdrop-blur-sm">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-extrabold text-text-main mb-2 tracking-tight">Welcome back</h2>
            <p className="text-text-muted text-sm font-medium">Continue your journey of global impact.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-primary/70 ml-1" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none text-text-main placeholder:text-gray-400 transition-all duration-200 text-sm font-medium"
                id="email"
                name="email"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-primary/70" htmlFor="password">
                  Password
                </label>
                <Link className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors uppercase tracking-wider" href="#">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none text-text-main placeholder:text-gray-400 transition-all duration-200 text-sm font-medium"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full py-4 bg-primary text-white font-display font-black rounded-xl hover:shadow-xl hover:shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all duration-300 text-sm tracking-wide uppercase flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-[0.2em]">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low rounded-xl border border-transparent hover:border-gray-200 hover:bg-white transition-all group shadow-sm hover:shadow-md"
            >
              <img
                alt="Google"
                className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7ab3EycvjPeKUhDd9U3OGiofHxdUduk3c_O4XG8KpqxvSzRTQ38aon414pvjhsUjNo99NBHSRcLdSbvgNqTKEhGr4smD_2EsmRHSERRDcKp1WNRIGiNtMatU7LtIGOI-dG4evr9C57eXO4i9iu6IgZ47SDeTWaX54OVQkidcZIEshGdkKWEF12gyvIIY7vpGDmmat6vWC7R9ClpJSI6BR1CT7iQnYu-1LyvwAhFKnU9FuEer9g5mNX9p_GBwEMUknwT7yINNyYO7-"
              />
              <span className="text-sm font-bold text-text-main">Continue with Google</span>
            </button>
          </div>

          <p className="mt-10 text-center text-sm font-medium text-text-muted">
            Don&apos;t have an account?
            <Link className="text-primary font-black hover:underline ml-1.5" href="/signup">
              Sign up for free
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-8 max-w-7xl mx-auto">
          <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase opacity-60">
            © 2024 Elevated Impact. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {["Privacy Policy", "Terms of Service", "Support"].map((item) => (
              <Link
                key={item}
                className="text-[10px] font-bold tracking-widest text-text-muted hover:text-primary transition-all opacity-60 hover:opacity-100 uppercase"
                href="#"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
