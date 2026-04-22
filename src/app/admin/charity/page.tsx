"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Globe, 
  Heart, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Loader2,
  X,
  Image as ImageIcon,
  Save
} from "lucide-react";
import { useEffect, useState } from "react";
import { charityService, Charity } from "@/services/charityService";
import { toast } from "react-hot-toast";


export default function AdminCharityManagement() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Partial<Charity> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    const data = await charityService.getCharities();
    setCharities(data);
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingCharity({
      name: "",
      tagline: "",
      description: "",
      category: "Learning",
      image_url: "/images/charity/global_education.png",
      community_support: "$0",
      collective_impact: "+0%",
      lives_impacted: "0",
      funds_allocated: "$0",
      schools_modernized: "0",
      raised_amount: 0,
      goal_amount: 1000000,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (charity: Charity) => {
    setEditingCharity(charity);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    // We'll keep the confirm for destructive actions as it's a safety check, 
    // but we can wrap the result in a toast
    if (window.confirm("Are you sure you want to remove this charity partner?")) {
      const loadingToast = toast.loading("Removing partner...");
      try {
        const success = await charityService.deleteCharity(id);
        if (success) {
          setCharities(charities.filter(c => c.id !== id));
          toast.success("Partner removed successfully", { id: loadingToast });
        } else {
          toast.error("Failed to remove partner", { id: loadingToast });
        }
      } catch (err) {
        toast.error("An error occurred", { id: loadingToast });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharity) return;

    setIsSaving(true);
    const loadingToast = toast.loading(editingCharity.id ? "Saving changes..." : "Creating partner...");
    
    try {
      if (editingCharity.id) {
        // Update
        const updated = await charityService.updateCharity(editingCharity.id, editingCharity);
        if (updated) {
          setCharities(charities.map(c => c.id === updated.id ? updated : c));
          toast.success("Changes saved successfully", { id: loadingToast });
        }
      } else {
        // Create
        const created = await charityService.createCharity(editingCharity);
        if (created) {
          setCharities([...charities, created]);
          toast.success("New partner added!", { id: loadingToast });
        }
      }
      setIsModalOpen(false);
      setEditingCharity(null);
    } catch (err) {
      toast.error("Operation failed. Please check your connection.", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };


  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />

        <main className="flex-1 ml-64 p-10">
          <header className="flex justify-between items-center mb-10">
             <div>
                <h1 className="text-2xl font-black text-primary mb-1">Charity Partners</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage impact organizations and fundraising goals</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="bg-white border border-gray-100 p-2 rounded-xl flex items-center gap-3 px-4 shadow-sm">
                   <Search size={16} className="text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="Search partners..." 
                    className="bg-transparent border-none outline-none text-sm font-medium w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <button 
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-md"
                >
                   <Plus size={16} /> Add Charity
                </button>
             </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-40">
               <Loader2 size={32} className="animate-spin text-primary opacity-20" />
            </div>
          ) : (
            <div className="grid gap-6">
               <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Impact</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Goal Progress</th>
                           <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {filteredCharities.map((charity) => (
                           <tr key={charity.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center p-2">
                                       <img src={charity.image_url} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                       <p className="font-bold text-primary text-sm">{charity.name}</p>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase">{charity.tagline}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {charity.category}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <span className="text-sm font-bold text-primary">{charity.community_support}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="w-48">
                                    <div className="flex justify-between items-end mb-2">
                                       <p className="text-[10px] font-bold text-primary">${(charity.raised_amount / 1000).toFixed(0)}k</p>
                                       <p className="text-[10px] font-bold text-gray-400">${(charity.goal_amount / 1000).toFixed(0)}k</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                       <div 
                                          className="h-full bg-emerald-400 rounded-full" 
                                          style={{ width: `${(charity.raised_amount / charity.goal_amount) * 100}%` }}
                                       />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleOpenEdit(charity)}
                                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                    >
                                       <Edit3 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(charity.id)}
                                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </main>

        {/* Add/Edit Modal */}
        {isModalOpen && editingCharity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/20 backdrop-blur-sm">
             <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                   <h2 className="text-xl font-black text-primary">
                      {editingCharity.id ? "Edit Charity Partner" : "Add New Charity"}
                   </h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                      <X size={20} />
                   </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Charity Name</label>
                         <input 
                          type="text" 
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:border-indigo-600 transition-colors"
                          value={editingCharity.name}
                          onChange={e => setEditingCharity({...editingCharity, name: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                         <select 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:border-indigo-600 transition-colors"
                          value={editingCharity.category}
                          onChange={e => setEditingCharity({...editingCharity, category: e.target.value})}
                         >
                            {["Learning", "Well-Being", "Nature", "Youth"].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tagline</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:border-indigo-600 transition-colors"
                        value={editingCharity.tagline}
                        onChange={e => setEditingCharity({...editingCharity, tagline: e.target.value})}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:border-indigo-600 transition-colors resize-none"
                        value={editingCharity.description}
                        onChange={e => setEditingCharity({...editingCharity, description: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Raised Amount ($)</label>
                         <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:border-indigo-600 transition-colors"
                          value={editingCharity.raised_amount || ""}
                          onChange={e => setEditingCharity({...editingCharity, raised_amount: e.target.value === "" ? 0 : Number(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Goal Amount ($)</label>
                         <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:border-indigo-600 transition-colors"
                          value={editingCharity.goal_amount || ""}
                          onChange={e => setEditingCharity({...editingCharity, goal_amount: e.target.value === "" ? 0 : Number(e.target.value)})}
                         />
                      </div>
                   </div>

                   <div className="flex items-center gap-4 pt-4">

                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
                      >
                         {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                         {editingCharity.id ? "Save Changes" : "Create Partner"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                      >
                         Cancel
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
