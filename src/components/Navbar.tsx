"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Zap, LogOut, User as UserIcon, LayoutDashboard, ChevronDown, Settings, CreditCard } from "lucide-react";
import { useAuth } from "./auth-provider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/charity", label: "Impact Partners" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Zap size={20} className="text-secondary-light" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
            ELEVATED <span className="text-secondary-light">IMPACT</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors duration-200 ${
                pathname === link.href ? "text-primary" : "text-text-muted hover:text-primary"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <div className="h-1 w-full bg-secondary-light rounded-full mt-0.5" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden lg:flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-1.5 pl-3 rounded-full bg-white border border-gray-100 hover:border-primary/20 hover:shadow-sm transition-all group"
                  >
                    <span className="text-xs font-bold text-text-muted group-hover:text-primary transition-colors">
                      {user.email?.split("@")[0]}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                      {user.email?.[0]}
                    </div>
                    <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-primary/10 p-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                      <div className="px-4 py-3 mb-2 border-b border-gray-50">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5">Account Status</p>
                        <p className="text-sm font-bold text-primary truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-surface-container-low hover:text-primary transition-all group"
                      >
                        <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/dashboard/scores"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-muted hover:bg-surface-container-low hover:text-primary transition-all group"
                      >
                        <Zap size={18} className="group-hover:scale-110 transition-transform" />
                        My Performance Scores
                      </Link>

                      <div className="my-2 border-t border-gray-50"></div>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
                      >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-bold text-primary px-4 py-2 hover:opacity-70 transition-opacity"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                  >
                    Join the Circle
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg font-bold ${
                pathname === link.href ? "text-primary" : "text-text-muted"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Member</span>
                    <span className="text-sm font-bold text-primary">{user.email}</span>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="w-full py-4 rounded-xl bg-indigo-50 text-primary text-center font-bold flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full py-4 rounded-xl bg-red-50 text-red-600 text-center font-bold flex items-center justify-center gap-2"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full py-4 rounded-xl bg-gray-50 text-primary text-center font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/pricing"
                  className="w-full py-4 rounded-xl bg-primary text-white text-center font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  Join the Circle
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
