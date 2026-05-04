"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Edit3,
  Loader2,
  ArrowLeftRight,
  Save,
  X,
  Printer,
  FileDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillRadarChart } from "@/components/skill-radar-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function RekomendasiPage() {
  const { mutate } = useSWRConfig();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);

  // Candidates removed from view after decision
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  // Sesuaikan: which candidate is in edit mode, and pending swaps {teamMemberId -> newEmployeeId}
  const [editingCandidate, setEditingCandidate] = useState<number | null>(null);
  const [pendingSwaps, setPendingSwaps] = useState<Record<number, number>>({});
  const [isSavingSwap, setIsSavingSwap] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useSWR<any[]>("/api/projects", fetcher);
  const { data: allEmployees } = useSWR<any[]>("/api/employees", fetcher);
  const { data: allCandidates, isLoading: candidatesLoading } = useSWR<any[]>(
    "/api/recommendations",
    fetcher
  );

  const openProjects = (projects ?? []).filter((p) => p.status === "draft");
  const activeProjectId =
    selectedProject || (openProjects.length > 0 ? openProjects[0].id : null);
  const proj = openProjects.find((p) => p.id === activeProjectId) ?? null;
  const candidates = (allCandidates ?? [])
    .filter((c) => c.projectId === activeProjectId && !dismissed.has(c.id))
    .sort((a, b) => a.ranking - b.ranking);

  const radarData =
    candidates[0]?.members.map((m: any) => ({
      subject: m.employeeName?.split(" ")[0] || "?",
      value: Math.min((m.contributionScore / 100) * 5, 5),
      fullMark: 5,
    })) ?? [];

  /* ─── Generate first team ─── */
  const handleGenerate = async () => {
    if (!activeProjectId) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProjectId }),
      });
      if (res.ok) await mutate("/api/recommendations");
      else console.error(await res.json());
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Generate alternative team (excludes members already in existing teams) ─── */
  const handleGenerateAlternative = async () => {
    if (!activeProjectId) return;
    setIsGeneratingAlt(true);
    const existingMemberIds = candidates.flatMap((c: any) =>
      c.members.map((m: any) => m.employeeId)
    );
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          excludeEmployeeIds: existingMemberIds,
        }),
      });
      if (res.ok) await mutate("/api/recommendations");
      else console.error(await res.json());
    } finally {
      setIsGeneratingAlt(false);
    }
  };

  /* ─── Decision: approved / rejected ─── */
  const handleDecision = async (
    candidate: any,
    status: "approved" | "rejected"
  ) => {
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          candidateId: candidate.id,
          status,
          decisionNote: `Tim Alternatif #${candidate.ranking} ${
            status === "approved" ? "disetujui" : "ditolak"
          }`,
        }),
      });
      if (res.ok) {
        await mutate("/api/recommendations");
        if (status === "approved") {
          await mutate("/api/projects");
          setSelectedProject(null);
        }
      }
    } catch (e) {
      console.error("Decision failed:", e);
    }
  };

  /* ─── Sesuaikan: save all pending swaps ─── */
  const handleSaveSwaps = async (candidateId: number) => {
    if (Object.keys(pendingSwaps).length === 0) {
      setEditingCandidate(null);
      return;
    }
    setIsSavingSwap(true);
    try {
      for (const [teamMemberId, newEmployeeId] of Object.entries(pendingSwaps)) {
        await fetch("/api/recommendations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamMemberId: Number(teamMemberId),
            newEmployeeId: Number(newEmployeeId),
          }),
        });
      }
      setPendingSwaps({});
      setEditingCandidate(null);
      await mutate("/api/recommendations");
    } finally {
      setIsSavingSwap(false);
    }
  };

  const memberInSwap = (teamMemberId: number, currentEmpId: number) =>
    pendingSwaps[teamMemberId] ?? currentEmpId;

  /* ─── Export: PDF ─── */
  const handleExportPDF = async (candidate: any) => {
    if (!proj) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Title & Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("LAPORAN REKOMENDASI TIM", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Proyek: ${proj.projectName}`, 14, 33);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 38);
    doc.setDrawColor(200);
    doc.line(14, 42, pageWidth - 14, 42);

    // 2. Project Context
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("1. Konfigurasi Kebutuhan Proyek", 14, 52);
    
    autoTable(doc, {
      startY: 57,
      head: [["Kriteria Penilaian", "Bobot Kepentingan"]],
      body: [
        ["Hard Skill (Kompetensi Teknis)", `${(proj.hardSkillWeight * 100).toFixed(0)}%`],
        ["Soft Factor (Perilaku & Adaptasi)", `${(proj.softFactorWeight * 100).toFixed(0)}%`],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // Indigo-600
    });

    // 3. Recommended Team
    const nextY = (doc as any).lastAutoTable.finalY + 15;
    doc.text(`2. Komposisi Tim Alternatif #${candidate.ranking}`, 14, nextY);
    doc.setFontSize(10);
    doc.text(`Skor Gabungan (DSS Score): ${candidate.totalScore.toFixed(2)}`, 14, nextY + 7);
    
    const tableBody = candidate.members.map((m: any) => [
      m.employeeName,
      m.employeePosition,
      m.hardSkillScore?.toFixed(1) || "-",
      m.softFactorScore?.toFixed(1) || "-",
      m.contributionScore?.toFixed(1) || "-",
    ]);

    autoTable(doc, {
      startY: nextY + 12,
      head: [["Nama Anggota", "Posisi", "Hard Skill", "Soft Factor", "Skor Akhir"]],
      body: tableBody,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 }, // Slate-700
      columnStyles: {
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center", fontStyle: "bold" },
      }
    });

    // 4. Visualization (Radar Chart)
    const chartElement = document.getElementById("radar-chart-container");
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: "#020617", // slate-950 match app theme
          logging: false,
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 70;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const chartY = (doc as any).lastAutoTable.finalY + 15;
        if (chartY + imgHeight > 270) doc.addPage();
        
        doc.setFontSize(12);
        doc.text("3. Visualisasi Kontribusi Anggota", 14, (doc as any).lastAutoTable.finalY + 10);
        doc.addImage(imgData, "PNG", (pageWidth - imgWidth) / 2, (doc as any).lastAutoTable.finalY + 15, imgWidth, imgHeight);
      } catch (e) {
        console.error("Failed to capture radar chart", e);
      }
    }

    // 5. Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Laporan ini dihasilkan secara otomatis oleh KiCob DSS Platform berdasarkan metode SAW.", 14, 285);
    doc.text(`Halaman 1 dari 1`, pageWidth - 30, 285);

    // Open Preview instead of direct save
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const generateDetailedReason = (candidate: any) => {
    if (!proj || !candidate.members) return "";

    const avgHard = (candidate.members.reduce((acc: number, m: any) => acc + (m.hardSkillScore || 0), 0) / candidate.members.length).toFixed(1);
    const avgSoft = (candidate.members.reduce((acc: number, m: any) => acc + (m.softFactorScore || 0), 0) / candidate.members.length).toFixed(1);

    return `Komposisi tim ini direkomendasikan karena memiliki indeks kecocokan (matching rate) sebesar ${candidate.totalScore.toFixed(1)}% terhadap profil kebutuhan proyek. Seluruh anggota tim memenuhi kriteria kompetensi teknis yang dipersyaratkan dengan rata-rata skor hard skill ${avgHard}/100, didukung oleh stabilitas perilaku (soft factor) pada level ${avgSoft}/100 untuk menjamin performa kolaborasi yang optimal.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold">Rekomendasi Tim</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hasil kalkulasi DSS • Simple Additive Weighting
          </p>
        </div>
        {proj && candidates.length > 0 && (
          <Button
            onClick={handleGenerateAlternative}
            disabled={isGeneratingAlt}
            variant="outline"
            size="sm"
            className="rounded-xl border-border/30 hover:bg-accent/10 text-xs gap-1.5"
          >
            {isGeneratingAlt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Generate Tim Alternatif
          </Button>
        )}
      </motion.div>

      {/* Project tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {projectsLoading ? (
          <p className="text-sm text-muted-foreground">Memuat proyek...</p>
        ) : openProjects.length > 0 ? (
          openProjects.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={activeProjectId === p.id ? "default" : "outline"}
              onClick={() => {
                setSelectedProject(p.id);
                setDismissed(new Set());
                setEditingCandidate(null);
                setPendingSwaps({});
              }}
              className={`rounded-xl text-xs ${
                activeProjectId === p.id
                  ? "glow-button text-white"
                  : "border-border/30 hover:bg-accent/10"
              }`}
            >
              {p.projectName}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Tidak ada proyek.</p>
        )}
      </motion.div>

      {/* Loading */}
      {candidatesLoading || isGenerating || isGeneratingAlt ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-muted-foreground">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm animate-pulse">
            {isGenerating || isGeneratingAlt
              ? "Algoritma DSS sedang mengkalkulasi komposisi tim terbaik..."
              : "Memuat data rekomendasi..."}
          </p>
        </div>
      ) : proj && candidates.length > 0 ? (
        /* ─── Main content ─── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5 h-fit"
          >
            <div id="radar-chart-container" className="bg-slate-950 p-2 rounded-xl">
              <p className="text-xs font-semibold mb-0.5">Kontribusi Anggota</p>
              <p className="text-[10px] text-muted-foreground mb-4">Tim Alternatif #1</p>
              {radarData.length > 2 ? (
                <SkillRadarChart data={radarData} height={210} primaryLabel="Skor" />
              ) : (
                <div className="h-[210px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-xl">
                  Minimal 3 anggota untuk grafik
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border/10 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Bobot Proyek
              </p>
              {[
                { label: "Hard Skill", val: proj.hardSkillWeight, cls: "bg-chart-1" },
                { label: "Soft Factor", val: proj.softFactorWeight, cls: "bg-chart-2" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{(val * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30">
                    <div className={`h-full rounded-full ${cls}`} style={{ width: `${val * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Candidate cards */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {candidates.map((c: any, ci: number) => {
                const isEditing = editingCandidate === c.id;

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 60, transition: { duration: 0.3 } }}
                    transition={{ delay: ci * 0.08 }}
                    className="glass-card rounded-2xl p-5"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary text-sm font-bold flex items-center justify-center">
                          #{c.ranking}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Alternatif Tim {c.ranking}</h3>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(c.generatedAt).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Skor DSS</p>
                        <p className="text-xl font-bold text-gradient">{c.totalScore.toFixed(1)}</p>
                      </div>
                    </div>

                    {/* Members table */}
                    <div className="overflow-x-auto rounded-xl border border-border/10">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border/20 bg-muted/5">
                            <th className="text-left text-[10px] font-semibold text-muted-foreground py-2 px-3 uppercase tracking-wider">
                              Anggota
                            </th>
                            <th className="text-left text-[10px] font-semibold text-muted-foreground py-2 px-3 uppercase tracking-wider hidden sm:table-cell">
                              Posisi
                            </th>
                            <th className="text-center text-[10px] font-semibold text-muted-foreground py-2 px-3 uppercase tracking-wider">
                              Hard
                            </th>
                            <th className="text-center text-[10px] font-semibold text-muted-foreground py-2 px-3 uppercase tracking-wider">
                              Soft
                            </th>
                            <th className="text-center text-[10px] font-semibold text-muted-foreground py-2 px-3 uppercase tracking-wider">
                              Skor
                            </th>
                            {isEditing && (
                              <th className="text-center text-[10px] font-semibold text-muted-foreground py-2 px-3 uppercase tracking-wider">
                                Ganti
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {c.members.map((m: any) => {
                            const selectedEmpId = memberInSwap(m.id, m.employeeId);
                            const selectedEmp = allEmployees?.find((e) => e.id === selectedEmpId);
                            const displayName = isEditing && selectedEmp ? selectedEmp.name : m.employeeName;
                            const changed = pendingSwaps[m.id] !== undefined && pendingSwaps[m.id] !== m.employeeId;

                            return (
                              <tr
                                key={m.id}
                                className={`border-b border-border/10 transition-colors ${
                                  changed ? "bg-amber-500/5" : "hover:bg-accent/5"
                                }`}
                              >
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                                      {displayName?.charAt(0) ?? "?"}
                                    </div>
                                    <span className={`text-sm font-medium ${changed ? "text-amber-400" : ""}`}>
                                      {displayName}
                                    </span>
                                    {changed && (
                                      <Badge variant="secondary" className="text-[8px] bg-amber-500/10 text-amber-400 border-amber-500/20 px-1">
                                        diubah
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                                  {m.employeePosition}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <Badge variant="secondary" className="text-[10px] bg-chart-1/15 text-chart-1 border-chart-1/20 font-mono">
                                    {m.hardSkillScore?.toFixed(1) ?? "-"}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <Badge variant="secondary" className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/20 font-mono">
                                    {m.softFactorScore?.toFixed(1) ?? "-"}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="text-sm font-bold text-gradient">
                                    {m.contributionScore?.toFixed(1) ?? "-"}
                                  </span>
                                </td>
                                {isEditing && (
                                  <td className="py-2 px-3 text-center">
                                    <Select
                                      value={selectedEmpId.toString()}
                                      onValueChange={(val) =>
                                        setPendingSwaps((prev) => ({
                                          ...prev,
                                          [m.id]: Number(val),
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-[11px] rounded-lg border-border/30 bg-input/30 max-w-[140px]">
                                        <SelectValue placeholder="Pilih karyawan" />
                                      </SelectTrigger>
                                      <SelectContent className="glass-card border-white/10 bg-slate-900/95 backdrop-blur-xl text-white rounded-xl">
                                        {allEmployees?.map((e: any) => (
                                          <SelectItem 
                                            key={e.id} 
                                            value={e.id.toString()}
                                            className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg text-xs"
                                          >
                                            {e.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Explainability */}
                    <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" /> Alasan Rekomendasi (DSS Analysis)
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {generateDetailedReason(c)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {!isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleDecision(c, "approved")}
                            className="glow-button text-white rounded-xl text-xs flex-1 min-w-[80px]"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportPDF(c)}
                            className="rounded-xl text-xs border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <FileDown className="w-3.5 h-3.5 mr-1.5" />
                            Cetak PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCandidate(c.id);
                              setPendingSwaps({});
                            }}
                            className="rounded-xl text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                            Sesuaikan Anggota
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(c, "rejected")}
                            className="rounded-xl text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Tolak
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveSwaps(c.id)}
                            disabled={isSavingSwap}
                            className="glow-button text-white rounded-xl text-xs flex-1"
                          >
                            {isSavingSwap ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Simpan Perubahan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCandidate(null);
                              setPendingSwaps({});
                            }}
                            className="rounded-xl text-xs border-border/30 hover:bg-accent/10"
                          >
                            <X className="w-3.5 h-3.5 mr-1.5" />
                            Batal
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* ─── Empty state ─── */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {!proj ? "Pilih Proyek Terlebih Dahulu" : "Belum Ada Rekomendasi"}
          </h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            {!proj
              ? "Pilih proyek dari tab di atas, lalu generate rekomendasi tim."
              : "Klik tombol di bawah untuk memulai kalkulasi DSS dan mendapatkan rekomendasi komposisi tim terbaik."}
          </p>
          {proj && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="glow-button text-white rounded-xl px-10 h-12 text-sm font-semibold"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              Mulai Kalkulasi DSS
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
