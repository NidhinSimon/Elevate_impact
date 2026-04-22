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
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />

        <main className="flex-1 ml-64 p-10">
          <header className="flex justify-between items-center mb-10">
             <div>
                <h1 className="text-2xl font-black text-primary mb-1">Platform Members</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage users, subscriptions, and total impact</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-white border border-gray-100 p-2 rounded-xl flex items-center gap-3 px-4 shadow-sm">
                   <Search size={16} className="text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="bg-transparent border-none outline-none text-sm font-medium w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>
          </header>

          <div className="grid gap-8">
             {/* Stats Cards */}
             <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Users size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Members</p>
                      <p className="text-2xl font-black text-primary">{members.length}</p>
                   </div>
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Users size={80} />
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Star size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Premium</p>
                      <p className="text-2xl font-black text-primary">
                         {members.filter(m => m.membership_tier !== 'Free').length}
                      </p>
                   </div>
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Star size={80} />
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden">
                   <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <TrendingUp size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact Growth</p>
                      <p className="text-2xl font-black text-primary">+12.4%</p>
                   </div>
                </div>
             </div>

             {/* Members Table */}
             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                   <div className="flex items-center justify-center py-40">
                      <Loader2 size={32} className="animate-spin text-primary opacity-20" />
                   </div>
                ) : (
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifetime Impact</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
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
