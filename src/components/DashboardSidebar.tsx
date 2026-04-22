"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Heart,
  Gift,
  MessageSquare,
  LifeBuoy,
  LogOut,
  CreditCard,
  TrendingUp,
  BarChart3,
  Wallet
} from "lucide-react";
import { useAuth } from "./auth-provider";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/scores", label: "Scores", icon: TrendingUp },
    { href: "/draw", label: "Draw Results", icon: Trophy },
    { href: "/dashboard/winnings", label: "My Prizes", icon: Wallet },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  ];




  return (
    <aside className="hidden lg:flex flex-col sticky top-32 h-fit w-64">
      <div className="flex-1 space-y-3 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-6 py-5 rounded-[24px] transition-all duration-500 font-black text-sm group relative ${isActive
                  ? "bg-white shadow-2xl shadow-primary/5 text-primary border border-slate-100 translate-x-2"
                  : "text-slate-400 hover:text-primary hover:bg-white/40"
                }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary'}`}>
                <Icon size={20} />
              </div>
              <span className="tracking-tight">{link.label}</span>
              {isActive && (
                <div className="absolute left-[-8px] w-1.5 h-6 bg-secondary-light rounded-full shadow-lg shadow-secondary-light/40 animate-in slide-in-from-left-2 duration-500" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
