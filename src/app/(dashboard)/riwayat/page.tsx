"use client";

import { motion, AnimatePresence } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import { History, Calendar, User, FileText, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const statusConfig: Record<string, { label: string; class: string }> = {
  approved: { label: "Disetujui", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Ditolak", class: "bg-red-500/15 text-red-400 border-red-500/20" },
  adjusted: { label: "Disesuaikan", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  pending: { label: "Menunggu", class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RiwayatPage() {
  const { data: history, isLoading } = useSWR<any[]>("/api/history", fetcher);
  const { mutate } = useSWRConfig();
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Riwayat</h1>
        <p className="text-sm text-muted-foreground mt-1">Riwayat keputusan dan rekomendasi tim</p>
      </motion.div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Memuat riwayat...
          </div>
        ) : history && history.length > 0 ? (
          <AnimatePresence>
            {history.map((rec, i) => {
              const sc = statusConfig[rec.status] || statusConfig.pending;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="glass-card rounded-2xl p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                        <History className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{rec.project?.projectName || `Proyek #${rec.projectId}`}</h3>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(rec.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {rec.approver?.name || "System"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${sc.class}`}>{sc.label}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rec.id)}
                        disabled={deletingId === rec.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === rec.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/10 border border-border/10">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/80">{rec.decisionNote || "Tidak ada catatan."}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
            Belum ada riwayat keputusan.
          </div>
        )}
      </div>
    </div>
  );
}
