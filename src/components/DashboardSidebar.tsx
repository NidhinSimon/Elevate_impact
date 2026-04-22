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
    <aside className="hidden lg:flex flex-col sticky top-32 h-[calc(100vh-160px)] space-y-3 overflow-y-auto scrollbar-hide pb-10">
      <div className="flex-1 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${isActive
                  ? "bg-white shadow-md text-primary border border-slate-100/50"
                  : "text-slate-400 hover:text-primary hover:bg-white/50"
                }`}
            >
              <Icon size={20} className={isActive ? "text-primary" : "text-slate-300"} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
