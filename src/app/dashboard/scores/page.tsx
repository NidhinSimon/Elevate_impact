"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { 
  Trophy, 
  Calendar, 
  Trash2, 
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Check
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Score {
  id: string;
  score_value: number;
  score_date: string;
}

export default function PerformanceLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ score: 0, date: "" });
  const [newScoreForm, setNewScoreForm] = useState({ score: 18, date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (user) {
      fetchScores();
    }
  }, [user]);

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores");
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScoreForm.score, date: newScoreForm.date }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Performance logged!");
        setNewScoreForm({ score: 18, date: new Date().toISOString().split('T')[0] });
        fetchScores();
      } else {
        toast.error(data.error || "Failed to log score.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score?")) return;
    try {
      const res = await fetch(`/api/scores?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Score removed.");
        fetchScores();
      }
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const startEdit = (score: Score) => {
    setEditingId(score.id);
    setEditForm({ score: score.score_value, date: score.score_date });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Score updated!");
        setEditingId(null);
        fetchScores();
      } else {
        toast.error(data.error || "Failed to update.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      <Navbar />

      <main className="pt-32 pb-24 max-w-[1440px] mx-auto px-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-20">
          <DashboardSidebar />

          <div className="space-y-12">
            <header>
              <h1 className="text-[44px] font-extrabold text-primary mb-2 tracking-tight">Performance Logs</h1>
              <p className="text-lg text-text-muted font-medium">Manage your rolling verified scores for the monthly draw.</p>
            </header>

            {/* TOP SECTION: Entry Form */}
            <section className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                    <Trophy size={24} />
                  </div>
                  <h2 className="text-xl font-black text-primary">Log Performance Round</h2>
                </div>

                <form onSubmit={handleAddScore} className="grid md:grid-cols-[1fr_1fr_auto] gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">Stableford Score (1-45)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      max="45"
                      value={newScoreForm.score}
                      onChange={e => setNewScoreForm({...newScoreForm, score: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-background border border-slate-100 rounded-2xl text-xl font-black text-primary outline-none focus:border-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">Round Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted/30" size={18} />
                      <input 
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        value={newScoreForm.date}
                        onChange={e => setNewScoreForm({...newScoreForm, date: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-background border border-slate-100 rounded-2xl font-bold text-primary outline-none focus:border-accent/30 transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-10 py-4 bg-accent text-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : "Add Score"}
                  </button>
                </form>
              </div>
            </section>

            {/* BOTTOM SECTION: Scores Table */}
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-primary">Rolling Verified Scores</h3>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 5 Cycles Active</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Score (pts)</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-10 py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-slate-200" size={40} />
                        </td>
                      </tr>
                    ) : scores.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-10 py-20 text-center space-y-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <AlertCircle size={32} />
                          </div>
                          <p className="text-text-muted font-medium italic">No scores yet — add your first score above</p>
                        </td>
                      </tr>
                    ) : (
                      scores.map((score) => (
                        <tr key={score.id} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="px-10 py-6">
                            {editingId === score.id ? (
                              <input 
                                type="date"
                                value={editForm.date}
                                onChange={e => setEditForm({...editForm, date: e.target.value})}
                                className="px-4 py-2 bg-background border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-accent"
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                <Calendar className="text-slate-300" size={16} />
                                <span className="font-bold text-slate-600">
                                  {new Date(score.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-10 py-6">
                            {editingId === score.id ? (
                              <input 
                                type="number"
                                value={editForm.score}
                                onChange={e => setEditForm({...editForm, score: parseInt(e.target.value)})}
                                className="w-24 px-4 py-2 bg-background border border-slate-200 rounded-xl font-black text-primary outline-none focus:border-accent"
                              />
                            ) : (
                              <span className="text-2xl font-black text-primary">{score.score_value}</span>
                            )}
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {editingId === score.id ? (
                                <>
                                  <button onClick={handleUpdate} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all">
                                    <Check size={18} />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all">
                                    <X size={18} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(score)} className="p-2.5 text-slate-300 hover:text-primary hover:bg-slate-50 rounded-xl transition-all">
                                    <Edit3 size={18} />
                                  </button>
                                  <button onClick={() => handleDelete(score.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
