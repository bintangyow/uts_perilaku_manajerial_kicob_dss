"use client";

import { motion, AnimatePresence } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import { 
  History, 
  Calendar, 
  User, 
  FileText, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowLeftRight,
  Filter,
  Search,
  LayoutGrid,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  approved: { label: "Disetujui", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Ditolak", class: "bg-red-500/15 text-red-400 border-red-500/20", icon: XCircle },
  adjusted: { label: "Disesuaikan", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", icon: ArrowLeftRight },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RiwayatPage() {
  const { data: history, isLoading } = useSWR<any[]>("/api/history", fetcher);
  const { mutate } = useSWRConfig();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const stats = useMemo(() => {
    if (!history) return { total: 0, approved: 0, rejected: 0, adjusted: 0 };
    return {
      total: history.length,
      approved: history.filter(h => h.status === 'approved').length,
      rejected: history.filter(h => h.status === 'rejected').length,
      adjusted: history.filter(h => h.status === 'adjusted').length,
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    if (filter === "all") return history;
    return history.filter(h => h.status === filter);
  }, [history, filter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat ini?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate("/api/history");
      }
    } catch (error) {
      console.error("Failed to delete history:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold">Riwayat Keputusan</h1>
            <p className="text-sm text-muted-foreground mt-1">Audit trail seluruh rekomendasi dan pengesahan tim.</p>
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:col-span-2">
          <StatMiniCard label="Total" value={stats.total} icon={LayoutGrid} color="text-primary" />
          <StatMiniCard label="Setuju" value={stats.approved} icon={CheckCircle2} color="text-emerald-400" />
          <StatMiniCard label="Tolak" value={stats.rejected} icon={XCircle} color="text-red-400" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900/40 border border-border/10">
        <Button 
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-xl text-xs h-8 px-4"
        >
          Semua
        </Button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <Button 
            key={key}
            variant={filter === key ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(key)}
            className={`rounded-xl text-xs h-8 px-4 ${filter === key ? 'glow-button text-white' : ''}`}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Menelusuri arsip keputusan...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((rec, i) => {
              const sc = statusConfig[rec.status] || statusConfig.pending;
              const Icon = sc.icon;
              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5 group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${sc.class.split(' ')[1]}`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sc.class}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                          {rec.project?.projectName || `Proyek #${rec.projectId}`}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" />
                            {new Date(rec.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-primary/60" />
                            {rec.approver?.name || "System Administrator"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] font-bold uppercase tracking-wider ${sc.class}`}>
                        {sc.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rec.id)}
                        disabled={deletingId === rec.id}
                        className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {deletingId === rec.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-slate-950/50 border border-border/5 group-hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/5">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Catatan Keputusan</p>
                        <p className="text-sm text-foreground/90 italic line-clamp-2">
                          &ldquo;{rec.decisionNote || "Keputusan sistem otomatis berdasarkan kalkulasi DSS."}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-24 glass-card rounded-3xl border-dashed"
          >
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-primary/20" />
            </div>
            <h3 className="text-lg font-semibold">Arsip Kosong</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">
              Tidak ada riwayat untuk kategori <span className="text-primary font-bold">"{filter}"</span>.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFilter("all")}
              className="mt-6 rounded-xl text-xs h-9"
            >
              Tampilkan Semua Riwayat
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-3 rounded-2xl border-border/10 flex flex-col items-center justify-center text-center">
      <div className={`p-1.5 rounded-lg bg-slate-900/50 mb-1.5`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{label}</p>
      <p className="text-lg font-black tracking-tight">{value}</p>
    </div>
  );
}
