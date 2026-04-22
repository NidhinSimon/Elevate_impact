"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { winningsService, Winning } from "@/services/winningsService";
import {
   Trophy,
   Upload,
   Clock,
   CheckCircle2,
   XCircle,
   Loader2,
   FileText,
   ArrowRight,
   ShieldCheck,
   AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function UserWinningsPage() {
   const { user, loading: authLoading } = useAuth();
   const [winnings, setWinnings] = useState<Winning[]>([]);
   const [loading, setLoading] = useState(true);
   const [uploadingId, setUploadingId] = useState<string | null>(null);

   useEffect(() => {
      if (user) {
         fetchWinnings();
      }
   }, [user]);

   const fetchWinnings = async () => {
      try {
         const data = await winningsService.getMyWinnings();
         setWinnings(data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleFileUpload = async (winningId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingId(winningId);
      const loadingToast = toast.loading("Uploading verification proof...");

      try {
         await winningsService.uploadProof(winningId, file);
         toast.success("Verification submitted! Our team will review it within 24-48 hours.", { id: loadingToast });
         fetchWinnings();
      } catch (err) {
         toast.error("Upload failed. Please try again.", { id: loadingToast });
      } finally {
         setUploadingId(null);
      }
   };

   const getStatusConfig = (status: string) => {
      switch (status) {
         case 'pending': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Action Required', desc: 'Please upload proof of your score (e.g., photo of scorecard).' };
         case 'submitted': return { icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Under Review', desc: 'Our auditors are verifying your performance data.' };
         case 'approved': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Approved', desc: 'Payout has been authorized and is in the transfer queue.' };
         case 'rejected': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Rejected', desc: 'Verification failed. Please check the requirements and resubmit.' };
         case 'paid': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Paid', desc: 'Funds have been successfully transferred to your account.' };
         default: return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Processing', desc: 'Standard processing in progress.' };
      }
   };

   if (authLoading) return null;

   return (
      <div className="min-h-screen bg-background font-sans text-text-main">
         <Navbar />

         <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
            <div className="grid lg:grid-cols-[280px_1fr] gap-16">
               <DashboardSidebar />

               <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary/5 space-y-12 border border-slate-100">
                  <header>
                     <h1 className="text-[44px] font-extrabold text-primary mb-2 tracking-tight">Your Winnings</h1>
                     <p className="text-lg text-text-muted font-medium">Track your prize claims and verification status.</p>
                  </header>

                  {loading ? (
                     <div className="py-40 flex justify-center">
                        <Loader2 size={40} className="animate-spin text-primary opacity-20" />
                     </div>
                  ) : winnings.length === 0 ? (
                     <div className="bg-white rounded-[48px] p-20 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                           <Trophy size={40} />
                        </div>
                        <h3 className="text-xl font-black text-primary mb-2">No Prizes Yet</h3>
                        <p className="text-text-muted font-medium mb-8 max-w-sm mx-auto">Keep logging your scores. Every round is a chance to win and drive impact.</p>
                        <Link
                           href="/dashboard/scores"
                           className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                        >
                           Log New Round <ArrowRight size={18} />
                        </Link>
                     </div>
                  ) : (
                     <div className="space-y-8">
                        {winnings.map((w) => {
                           const config = getStatusConfig(w.status);
                           return (
                              <section key={w.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden group">
                                 <div className="grid lg:grid-cols-[1fr_380px]">
                                    {/* Left: Prize Details */}
                                    <div className="p-10 lg:p-12 border-r border-slate-50">
                                       <div className="flex justify-between items-start mb-10">
                                          <div>
                                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
                                                {w.draw_id}
                                             </div>
                                             <h2 className="text-5xl font-black text-primary tracking-tighter">${Number(w.amount).toLocaleString()}</h2>
                                          </div>
                                          <div className={`p-5 rounded-3xl ${config.bg} ${config.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                             <Trophy size={32} />
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                                          <div>
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match Tier</p>
                                             <p className="text-lg font-black text-primary capitalize">{w.tier?.replace('_', ' ') || 'Impact Award'}</p>
                                          </div>
                                          <div>
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Drawn Date</p>
                                             <p className="text-lg font-black text-primary">{new Date(w.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Right: Verification Timeline */}
                                    <div className="p-10 lg:p-12 bg-slate-50/30">
                                       <div className="flex items-center gap-3 mb-8">
                                          <div className={`w-3 h-3 rounded-full ${config.color.replace('text', 'bg')} animate-pulse`} />
                                          <h3 className="font-black text-primary uppercase text-xs tracking-widest">{config.label}</h3>
                                       </div>

                                       <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                                          {config.desc}
                                       </p>

                                       {/* Status Bar */}
                                       <div className="relative h-1 w-full bg-slate-100 rounded-full mb-10 overflow-hidden">
                                          <div
                                             className={`h-full transition-all duration-1000 ${config.color.replace('text', 'bg')}`}
                                             style={{ width: w.status === 'paid' ? '100%' : w.status === 'approved' ? '75%' : w.status === 'submitted' ? '50%' : '25%' }}
                                          />
                                       </div>

                                       {/* Action Area */}
                                       {(w.status === 'pending' || w.status === 'rejected') && (
                                          <div className="space-y-4">
                                             <label className="block">
                                                <span className="sr-only">Choose proof file</span>
                                                <div className="relative group/upload">
                                                   <input
                                                      type="file"
                                                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-xs file:font-black file:bg-primary file:text-white hover:file:opacity-90 file:cursor-pointer"
                                                      onChange={(e) => handleFileUpload(w.id, e)}
                                                      disabled={uploadingId === w.id}
                                                   />
                                                   {uploadingId === w.id && (
                                                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                                                         <Loader2 className="animate-spin text-primary" size={20} />
                                                      </div>
                                                   )}
                                                </div>
                                             </label>
                                             <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">JPG, PNG or PDF (Max 5MB)</p>
                                          </div>
                                       )}

                                       {w.status === 'submitted' && (
                                          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-3">
                                             <FileText size={18} className="text-indigo-600 shrink-0" />
                                             <p className="text-[10px] font-bold text-indigo-900/60 leading-tight">Verification pending. You will receive an email once your proof is approved.</p>
                                          </div>
                                       )}

                                       {w.status === 'paid' && (
                                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-3">
                                             <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                             <p className="text-[10px] font-bold text-emerald-900/60 leading-tight">Transaction complete. Check your primary payment method for funds.</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </section>
                           );
                        })}
                     </div>
                  )}

                  {/* Verification FAQ */}
                  <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 items-center justify-between">
                     <div className="flex gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                           <AlertCircle size={28} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-primary mb-2">Verification Requirements</h4>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                              To claim your prize, you must provide a clear photo of your signed scorecard or a screenshot from a verified golf tracking app.
                           </p>
                        </div>
                     </div>
                     <button className="px-8 py-4 bg-slate-50 text-primary rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
                        Read Full Policy
                     </button>
                  </section>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
}
