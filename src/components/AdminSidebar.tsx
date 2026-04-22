"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  BarChart3, 
  Globe, 
  Settings,
  Zap,
  LogOut,
  AlertCircle
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("admin_session");
    router.push("/admin/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Users, label: "Members", href: "/admin/members" },
    { icon: Ticket, label: "Draw Management", href: "/admin/draw" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Globe, label: "Charity Partners", href: "/admin/charity" },
    { icon: Settings, label: "System Config", href: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
      <div className="p-8 border-b border-gray-50">
         <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
               <Zap size={16} className="text-emerald-400" />
            </div>
            <span className="font-display text-sm font-black tracking-tighter text-primary">ADMIN CONSOLE</span>
         </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
         {navItems.map(item => {
           const isActive = pathname === item.href;
           return (
             <Link 
               key={item.label}
               href={item.href}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                 isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
               }`}
             >
                <item.icon size={18} />
                {item.label}
             </Link>
           );
         })}
      </nav>

      <div className="p-6 border-t border-gray-50 space-y-4">
         <div className="bg-indigo-900 rounded-2xl p-4 text-white">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">System Health</p>
            <div className="flex items-center justify-between">
               <span className="text-xs font-bold">Optimal</span>
               <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
         </div>
         
         <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors"
         >
            Sign Out Session
         </button>
      </div>
    </aside>
  );
}
