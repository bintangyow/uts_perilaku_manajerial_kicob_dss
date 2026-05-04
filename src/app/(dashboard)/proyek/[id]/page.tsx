"use client";

import { use } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import { 
  ArrowLeft, 
  Settings2, 
  CheckCircle2, 
  CheckCircle, 
  Loader2, 
  Sparkles,
  Printer,
  Calendar,
  Briefcase
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { SkillRadarChart } from "@/components/skill-radar-chart";
import type { ProjectStatus } from "@/lib/types";

const statusConfig: Record<
  ProjectStatus,
  { label: string; class: string }
> = {
  draft: { label: "Draft", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  active: { label: "Aktif", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  completed: { label: "Selesai", class: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProyekDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading, error } = useSWR<any>(`/api/projects/${id}`, fetcher);

  const { mutate } = useSWRConfig();
  const [isCompleting, setIsCompleting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">Gagal memuat data proyek.</div>;
  if (!project || project.error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Proyek tidak ditemukan.</p>
      </div>
    );
  }

  const generateDetailedReason = (members: any[]) => {
    if (!project || !members || members.length === 0) return "";
    const avgHard = (members.reduce((acc: number, m: any) => acc + (m.hardSkillScore || 0), 0) / members.length).toFixed(1);
    const avgSoft = (members.reduce((acc: number, m: any) => acc + (m.softFactorScore || 0), 0) / members.length).toFixed(1);
    const avgTotal = (members.reduce((acc: number, m: any) => acc + (m.contributionScore || 0), 0) / members.length).toFixed(1);

    return `Tim ini telah disahkan dengan indeks kecocokan rata-rata ${avgTotal}% terhadap profil kebutuhan proyek. Seluruh anggota memenuhi kriteria kompetensi teknis dengan rata-rata skor hard skill ${avgHard}/100, didukung oleh stabilitas perilaku (soft factor) pada level ${avgSoft}/100 untuk menjamin performa kolaborasi yang berkelanjutan.`;
  };

  const handlePrintReport = async () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [14, 165, 233];

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("LAPORAN RESMI TIM PROYEK", 20, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Informasi Proyek", 20, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [["Atribut", "Detail"]],
      body: [
        ["Nama Proyek", project.projectName],
        ["Status", project.status.toUpperCase()],
        ["Ukuran Tim", `${project.teamSize} Orang`],
        ["Tanggal Pengesahan", new Date(project.createdAt).toLocaleDateString("id-ID")],
      ],
      theme: "striped",
      headStyles: { fillColor: primaryColor },
    });

    const nextY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Komposisi Anggota Tim", 20, nextY);
    
    const tableBody = (project.teamMembers || []).map((m: any) => [
      m.employeeName, m.employeePosition, m.hardSkillScore?.toFixed(1) || "-", m.softFactorScore?.toFixed(1) || "-", m.contributionScore?.toFixed(1) || "-",
    ]);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Nama", "Posisi", "Hard", "Soft", "Total"]],
      body: tableBody,
      headStyles: { fillColor: [51, 65, 85] },
    });

    const reasonY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("Analisis Rekomendasi", 20, reasonY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(generateDetailedReason(project.teamMembers || []), 170);
    doc.text(splitText, 20, reasonY + 7);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleComplete = async () => {
    if (!confirm("Apakah Anda yakin ingin menyelesaikan proyek ini?")) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok) mutate(`/api/projects/${id}`);
    } catch (e) {
      console.error("Failed to complete project:", e);
    } finally {
      setIsCompleting(false);
    }
  };

  const sc = statusConfig[project.status as ProjectStatus] || statusConfig.draft;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/proyek">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{project.projectName}</h1>
              <Badge variant="secondary" className={`capitalize ${sc.class}`}>
                {sc.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{project.description || "Tidak ada deskripsi."}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handlePrintReport} className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-2">
          <Printer className="w-4 h-4" />
          Cetak Laporan
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Konfigurasi Proyek
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ukuran Tim</span>
                <span className="font-semibold">{project.teamSize} orang</span>
              </div>
              <Separator className="bg-border/20" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Bobot Hard Skill</span>
                  <span className="font-semibold text-chart-1">{(project.hardSkillWeight * 100).toFixed(0)}%</span>
                </div>
                <Slider value={[project.hardSkillWeight * 100]} max={100} step={5} disabled />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Bobot Soft Factor</span>
                  <span className="font-semibold text-chart-2">{(project.softFactorWeight * 100).toFixed(0)}%</span>
                </div>
                <Slider value={[project.softFactorWeight * 100]} max={100} step={5} disabled />
              </div>
              <Separator className="bg-border/20" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="text-xs">{new Date(project.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {project.status === "draft" ? (
              <Link href={`/rekomendasi?project=${project.id}`}>
                <Button className="w-full h-12 glow-button text-white rounded-xl font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Rekomendasi Tim
                </Button>
              </Link>
            ) : project.status === "active" ? (
              <Button onClick={handleComplete} disabled={isCompleting} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold">
                {isCompleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Selesaikan Proyek
              </Button>
            ) : (
              <Button disabled className="w-full h-12 bg-muted text-muted-foreground rounded-xl font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Proyek Selesai
              </Button>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {project.teamMembers && project.teamMembers.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Anggota Tim Resmi
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/5">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Anggota</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider hidden sm:table-cell">Posisi</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Hard</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Soft</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.teamMembers.map((member: any) => (
                        <tr key={member.id} className="border-b border-border/10 hover:bg-accent/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{member.employeeName?.charAt(0)}</div>
                              <span className="font-medium">{member.employeeName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs hidden sm:table-cell">{member.employeePosition}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px]">{member.hardSkillScore?.toFixed(1) || "-"}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px]">{member.softFactorScore?.toFixed(1) || "-"}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-gradient">{member.contributionScore?.toFixed(1)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Analisis Pengesahan Tim</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {generateDetailedReason(project.teamMembers)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Distribusi Kontribusi</h3>
                    <p className="text-xs text-muted-foreground mb-4">Visualisasi performa anggota dalam tim</p>
                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-border/10 flex items-center justify-center">
                      <SkillRadarChart 
                        data={project.teamMembers.map((m: any) => ({
                          subject: m.employeeName?.split(" ")[0] || "?",
                          value: Math.min((m.contributionScore / 100) * 5, 5),
                          fullMark: 5,
                        }))} 
                        height={240} 
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64 space-y-4">
                    <h3 className="font-semibold text-sm">Metrik Tim</h3>
                    {[
                      { label: "Rata-rata Hard Skill", val: project.teamMembers.reduce((a: any, b: any) => a + (b.hardSkillScore || 0), 0) / project.teamMembers.length },
                      { label: "Rata-rata Soft Factor", val: project.teamMembers.reduce((a: any, b: any) => a + (b.softFactorScore || 0), 0) / project.teamMembers.length },
                      { label: "Skor Sinergi Tim", val: project.teamMembers.reduce((a: any, b: any) => a + (b.contributionScore || 0), 0) / project.teamMembers.length },
                    ].map((metric) => (
                      <div key={metric.label} className="p-3 rounded-xl bg-accent/5 border border-border/10">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{metric.label}</p>
                        <p className="text-lg font-bold text-gradient">{metric.val.toFixed(1)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada tim yang disahkan.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Gunakan fitur rekomendasi untuk membentuk tim.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
