"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  MoreVertical, 
  Star,
  Loader2,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { userService, UserProfile } from "@/services/userService";

export default function AdminMembersManagement() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const data = await userService.getAllProfiles();
    setMembers(data);
    setLoading(false);
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 ml-64 p-10">
          <header className="flex justify-between items-center mb-12">
             <div>
                <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Platform Members</h1>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Database Overview</p>
             </div>
             <div className="flex items-center gap-6">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-3 px-6 shadow-sm hover:shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary/5">
                   <Search size={18} className="text-slate-300" />
                   <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="bg-transparent border-none outline-none text-sm font-bold w-72 placeholder:text-slate-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>
          </header>

          <div className="grid gap-8">
             {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-8">
                 {[
                   { label: "Total Members", value: members.length, icon: Users, color: "text-primary", bg: "bg-primary/5", trend: "Database" },
                   { label: "Active Premium", value: members.filter(m => m.membership_tier !== 'Free').length, icon: Star, color: "text-secondary-light", bg: "bg-secondary-light/10", trend: "Revenue" },
                   { label: "Impact Growth", value: "+12.4%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", trend: "Global" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all">
                      <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} transition-colors group-hover:bg-white group-hover:shadow-lg`}>
                         <stat.icon size={28} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest">{stat.trend}</span>
                         </div>
                         <p className="text-3xl font-black text-primary tracking-tighter">{stat.value}</p>
                      </div>
                      <div className="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:opacity-10 transition-opacity">
                         <stat.icon size={80} />
                      </div>
                   </div>
                 ))}
              </div>

             {/* Members Table */}
             <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                   <div className="flex items-center justify-center py-48">
                      <Loader2 size={40} className="animate-spin text-primary opacity-20" />
                   </div>
                ) : (
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Profile</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subscription Status</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Impact Generated</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registration</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {filteredMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                        {member.full_name?.substring(0, 2).toUpperCase() || member.email.substring(0, 2).toUpperCase()}
                                     </div>
                                     <div>
                                        <p className="font-bold text-primary text-sm">{member.full_name || 'Anonymous User'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold lowercase flex items-center gap-1">
                                           <Mail size={10} /> {member.email}
                                        </p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${member.membership_tier === 'Free' ? 'bg-gray-300' : 'bg-emerald-400 animate-pulse'}`} />
                                     <span className={`text-[10px] font-black uppercase tracking-widest ${member.membership_tier === 'Free' ? 'text-gray-400' : 'text-emerald-600'}`}>
                                        {member.membership_tier}
                                     </span>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-sm font-black text-primary">${Number(member.total_impact).toLocaleString()}</p>
                                  <div className="w-24 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                     <div 
                                      className="h-full bg-indigo-400 rounded-full" 
                                      style={{ width: `${Math.min((Number(member.total_impact) / 10000) * 100, 100)}%` }}
                                     />
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                     <Calendar size={12} /> {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                     <MoreVertical size={18} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {filteredMembers.length === 0 && (
                            <tr>
                               <td colSpan={5} className="px-8 py-20 text-center">
                                  <p className="text-gray-400 font-bold text-sm">No members found matching your search.</p>
                               </td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                )}
             </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
