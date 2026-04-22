"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      // Send Welcome Email (Fire and forget or wait depending on UX)
      import("@/services/emailService").then(({ emailService }) => {
        emailService.sendWelcomeEmail(email, fullName);
      });

      setSuccess(true);
      // Wait a bit then redirect or show message
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google.");
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
        {/* Signup Card */}
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-[0_20px_40px_rgba(19,27,46,0.04)] border border-gray-100/50 backdrop-blur-sm">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-extrabold text-text-main mb-2 tracking-tight">Create Account</h2>
            <p className="text-text-muted text-sm font-medium">Join the elite community of digital philanthropists.</p>
          </div>

          {success ? (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="text-emerald-500 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main mb-2">Check your email</h3>
                <p className="text-sm text-text-muted">We&apos;ve sent a verification link to <span className="font-bold text-primary">{email}</span>.</p>
              </div>
              <button 
                onClick={() => router.push("/login")}
                className="w-full py-4 bg-primary text-white font-display font-black rounded-xl hover:shadow-xl transition-all text-sm tracking-wide uppercase"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSignup}>
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-primary/70 ml-1" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-surface-container-low border border-transparent rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none text-text-main placeholder:text-gray-400 transition-all duration-200 text-sm font-medium"
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

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
                  <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-primary/70 ml-1" htmlFor="password">
                    Password
                  </label>
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
                  className="w-full py-4 bg-primary text-white font-display font-black rounded-xl hover:shadow-xl hover:shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all duration-300 text-sm tracking-wide uppercase flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Create Account"}
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
                  onClick={handleGoogleSignup}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low rounded-xl border border-transparent hover:border-gray-200 hover:bg-white transition-all group shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.26620003,9.76451641 L2.29961433,7.4600551 C3.85904185,4.33789809 7.05675846,2.22222222 10.7407407,2.22222222 C13.0760181,2.22222222 15.2044739,3.06697622 16.8524183,4.45703622 L13.6825105,7.62694401 C12.8554457,6.93330366 11.8396016,6.51851852 10.7407407,6.51851852 C8.40461313,6.51851852 6.42852789,7.91652432 5.58992288,9.8897651 L5.26620003,9.76451641 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.7407407,18.962963 C8.40461313,18.962963 6.42852789,17.5649572 5.58992288,15.5917164 L2.29961433,17.8961777 C3.85904185,21.0183347 7.05675846,23.1338889 10.7407407,23.1338889 C11.8033947,23.1338889 12.8173404,22.7303317 13.6069502,22.0531715 L10.7407407,18.962963 Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M22.6103396,12.398514 C22.6103396,11.6351056 22.5486517,10.9004512 22.4338903,10.1851852 L10.7407407,10.1851852 L10.7407407,14.4814815 L17.3916203,14.4814815 C17.1044407,16.0319121 16.230291,17.3415644 14.9123242,18.2212627 L17.7785337,21.3114711 C19.4563299,19.763354 22.6103396,16.3986378 22.6103396,12.398514 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M5.58992288,15.5917164 C5.36531394,14.9213854 5.24074074,14.2055611 5.24074074,13.462963 C5.24074074,12.7203648 5.36531394,12.0045405 5.58992288,13.3342095 L2.29961433,11.0297482 C1.59330853,12.4412543 1.18518519,14.0270836 1.18518519,15.7037037 C1.18518519,17.3803238 1.59330853,18.9661531 2.29961433,20.3776592 L5.58992288,18.0731979 Z"
                    />
                  </svg>
                  <span className="text-sm font-bold text-text-main">Continue with Google</span>
                </button>
              </div>

              <p className="mt-10 text-center text-sm font-medium text-text-muted">
                Already have an account?
                <Link className="text-primary font-black hover:underline ml-1.5" href="/login">
                  Sign in
                </Link>
              </p>
            </>
          )}
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
