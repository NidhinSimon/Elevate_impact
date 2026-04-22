"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { winningsService, WinnerVerification } from "@/services/winningsService";
import {
  Trophy,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  Loader2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function VerifyWinPage() {
  const { user, loading: authLoading } = useAuth();
  const [winnings, setWinnings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<WinnerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const wins = await winningsService.getMyWinnings();
      setWinnings(wins);

      if (wins.length > 0) {
        const latestWin = wins[0];
        const verifData = await winningsService.getVerifications(latestWin.draw_id);
        setVerifications(verifData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || winnings.length === 0) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading proof of performance...");

    try {
      const latestWin = winnings[0];
      await winningsService.submitVerification(user!.id, latestWin.draw_id, selectedFile);
      toast.success("Verification submitted successfully!", { id: loadingToast });
      setSelectedFile(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload verification.", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const latestWin = winnings[0];
  const latestVerif = verifications[0];

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-16">
          <DashboardSidebar />

          <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-primary/5 space-y-12 border border-slate-100">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Back to Overview</span>
            </Link>

            <header>
              <h1 className="text-[44px] font-extrabold text-primary mb-2 tracking-tight">Verify Your Win</h1>
              <p className="text-lg text-text-muted font-medium">Claim your rewards by submitting proof of your athletic performance.</p>
            </header>

            {!latestWin ? (
              <section className="bg-white rounded-[40px] p-20 border border-slate-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <Trophy size={40} />
                </div>
                <h3 className="text-2xl font-black text-primary mb-2">No Winnings Found</h3>
                <p className="text-text-muted font-medium">You don't have any wins that require verification at this time.</p>
              </section>
            ) : (
              <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
                <div className="space-y-8">
                  {/* Prize Details */}
                  <section className="bg-[#1A146B] rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-2">Match Tier: {latestWin.tier}</p>
                        <h2 className="text-5xl font-black tracking-tighter">${latestWin.amount.toLocaleString()}</h2>
                      </div>
                      <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        Draw ID: {latestWin.draw_id}
                      </div>
                    </div>
                  </section>

                  {/* Upload Form or Status */}
                  {latestVerif && latestVerif.status === 'pending' ? (
                    <section className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm text-center">
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                        <Clock size={40} className="animate-spin-slow" />
                      </div>
                      <h3 className="text-2xl font-black text-primary mb-4">Verification Under Review</h3>
                      <p className="text-text-muted font-medium mb-10 leading-relaxed max-w-sm mx-auto">
                        We've received your proof. Our team is currently verifying the scores against our independent auditors.
                      </p>
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Status: Pending Approval
                      </div>
                    </section>
                  ) : latestVerif && latestVerif.status === 'approved' ? (
                    <section className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm text-center">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-primary mb-4">Identity Verified</h3>
                      <p className="text-text-muted font-medium mb-10 leading-relaxed max-w-sm mx-auto">
                        Your performance has been verified. Your payout is now in the processing queue.
                      </p>
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        Status: Approved & Payout {latestVerif.payout_status}
                      </div>
                    </section>
                  ) : (
                    <section className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                          <Upload size={24} />
                        </div>
                        <h3 className="text-xl font-black text-primary">Upload Proof of Performance</h3>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative border-2 border-dashed border-slate-100 rounded-[32px] p-12 text-center hover:border-accent/30 transition-colors group cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-50 transition-colors">
                              <FileText className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <p className="font-bold text-primary">{selectedFile ? selectedFile.name : "Click to select or drag & drop"}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG up to 10MB</p>
                            </div>
                          </div>
                        </div>

                        {latestVerif?.status === 'rejected' && (
                          <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
                            <AlertCircle size={24} className="text-red-500 shrink-0" />
                            <div>
                              <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-1">Previous Attempt Rejected</p>
                              <p className="text-xs font-bold text-red-800/60 leading-relaxed">{latestVerif.admin_notes || "The proof provided did not match our records. Please ensure all 5 scores are visible."}</p>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={!selectedFile || isUploading}
                          className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isUploading ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Submit Verification Proof"}
                        </button>
                      </form>
                    </section>
                  )}
                </div>

                <aside className="space-y-8">
                  <div className="bg-[#F8F9FE] rounded-[40px] p-10 border border-slate-100">
                    <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-8">Instructions</h4>
                    <ul className="space-y-6">
                      {[
                        "Screenshot your score dashboard from your golf platform.",
                        "Ensure the date and all 5 scores are clearly visible.",
                        "Files must be in PNG or JPG format.",
                        "Verification takes 24-48 hours."
                      ].map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-primary shadow-sm shrink-0">{i + 1}</span>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex gap-4">
                    <CheckCircle2 size={24} className="text-indigo-600 shrink-0" />
                    <p className="text-[10px] font-bold text-indigo-900/60 leading-relaxed uppercase tracking-widest">
                      Independent Audit Verified by Global Play Standards.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
