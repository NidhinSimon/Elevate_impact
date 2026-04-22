"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  CreditCard,
  Loader2,
  AlertCircle,
  Filter
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { winningsService, WinnerVerification } from "@/services/winningsService";
import { toast } from "react-hot-toast";

const supabase = createClient();

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'paid'>('pending');
  const [selectedVerif, setSelectedVerif] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('winner_verifications')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `);
      
      if (filter === 'paid') {
        query = query.eq('payout_status', 'paid');
      } else {
        query = query.eq('status', filter).eq('payout_status', 'pending');
      }

      const { data, error } = await query.order('submitted_at', { ascending: false });
      
      if (error) throw error;
      setVerifications(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedVerif) return;
    setProcessing(true);
    try {
      await winningsService.updateVerificationStatus(selectedVerif.id, status, adminNotes);
      toast.success(`Verification ${status}`);
      setSelectedVerif(null);
      setAdminNotes("");
      fetchVerifications();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async (id: string) => {
    setProcessing(true);
    try {
      await winningsService.markAsPaid(id);
      toast.success("Marked as Paid");
      fetchVerifications();
    } catch (err) {
      toast.error("Payment update failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F9FE] flex">
        <AdminSidebar />

        <main className="flex-1 p-12 overflow-y-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#0F0A4A] mb-2">Verification Queue</h1>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-widest">Auditing Performance Proofs</p>
            </div>
            
            <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
              {['pending', 'approved', 'rejected', 'paid'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </header>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Draw ID</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                    </td>
                  </tr>
                ) : verifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="max-w-xs mx-auto opacity-20">
                        <Filter className="mx-auto mb-4" size={48} />
                        <p className="font-black text-sm uppercase tracking-widest">No results in {filter}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-8">
                        <p className="font-bold text-primary">{v.profiles?.full_name || "Unknown User"}</p>
                        <p className="text-[10px] font-medium text-slate-400">{v.profiles?.email}</p>
                      </td>
                      <td className="p-8">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black tracking-widest">{v.draw_id}</span>
                      </td>
                      <td className="p-8 text-xs font-medium text-slate-500">
                        {new Date(v.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setSelectedVerif(v)}
                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all"
                          >
                            <Eye size={18} />
                          </button>
                          {v.status === 'approved' && v.payout_status === 'pending' && (
                            <button 
                              onClick={() => handlePay(v.id)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                            >
                              <CreditCard size={14} className="inline mr-2" /> Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Action Modal */}
        {selectedVerif && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-2xl font-black text-primary mb-2">Verify Performance</h2>
                  <p className="text-sm font-medium text-slate-400">Reviewing proof for {selectedVerif.profiles?.email}</p>
                </div>
                <button onClick={() => setSelectedVerif(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <XCircle size={24} className="text-slate-200" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="rounded-[32px] overflow-hidden border border-slate-100 bg-slate-50 aspect-[4/3] flex items-center justify-center">
                    <img 
                      src={selectedVerif.proof_url} 
                      alt="Performance Proof" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <a 
                    href={selectedVerif.proof_url} 
                    target="_blank" 
                    className="flex items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                  >
                    View Full Resolution <Eye size={14} />
                  </a>
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Date</span>
                        <span className="text-xs font-bold text-primary">{new Date(selectedVerif.submitted_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</span>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black tracking-widest uppercase">{selectedVerif.status}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Reviewer Notes (Optional on reject)</label>
                      <textarea 
                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all h-32"
                        placeholder="Explain why this proof was rejected or add internal notes..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleAction('rejected')}
                      disabled={processing}
                      className="py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject Proof
                    </button>
                    <button 
                      onClick={() => handleAction('approved')}
                      disabled={processing}
                      className="py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Approve Winner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
