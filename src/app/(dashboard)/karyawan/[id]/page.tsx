"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Building2, Briefcase, Hash, Plus, Trash2, Printer, Search } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillRadarChart } from "@/components/skill-radar-chart";
import { ScoreBreakdown } from "@/components/score-breakdown";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function KaryawanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const { data: employee, mutate: mutateEmployee, isLoading } = useSWR<any>(`/api/employees/${id}`, fetcher);
  const { data: masterSkills } = useSWR<any[]>('/api/skills', fetcher);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Level 1");
  const [skillSearch, setSkillSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Memuat data karyawan...</p>
      </div>
    );
  }

  if (!employee || employee.error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Karyawan tidak ditemukan.</p>
      </div>
    );
  }

  const empAssessments = employee.assessments || [];

  // Skill radar data
  const skillRadarData = (employee.skills || []).map((s: any) => ({
    subject: s.skillName,
    value: s.level,
    fullMark: 5,
  }));

  // Behavioral breakdown
  const behaviorItems = employee.behavioralScore
    ? [
        {
          label: "Stabilitas Emosional",
          score: Number(employee.behavioralScore.avgEmotionalStability),
          maxScore: 5,
        },
        {
          label: "Komunikasi",
          score: Number(employee.behavioralScore.avgCommunication),
          maxScore: 5,
        },
        {
          label: "Kerja Tim",
          score: Number(employee.behavioralScore.avgTeamwork),
          maxScore: 5,
        },
        {
          label: "Adaptabilitas",
          score: Number(employee.behavioralScore.avgAdaptability),
          maxScore: 5,
        },
      ]
    : [];

  // Filter out skills the employee already has
  const availableSkills = masterSkills
    ? masterSkills.filter(
        (ms) => !employee.skills.some((es: any) => es.skillId === ms.id)
      )
    : [];

  const handleAddSkill = async () => {
    if (!selectedSkillId || !selectedLevel) return;
    setIsSubmitting(true);

    await fetch(`/api/employees/${id}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillId: Number(selectedSkillId),
        level: Number(selectedLevel.replace("Level ", "")),
      }),
    });

    await mutateEmployee();
    setSelectedSkillId("");
    setSelectedLevel("Level 1");
    setIsSubmitting(false);
    setDialogOpen(false);
  };

  const handleRemoveSkill = async (skillId: number) => {
    await fetch(`/api/employees/${id}/skills?skillId=${skillId}`, {
      method: "DELETE",
    });
    await mutateEmployee();
  };

  const handlePrintReport = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [14, 165, 233]; // Sky blue

    // 1. Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RAPORT KOMPETENSI KARYAWAN", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 20, 30);

    // 2. Personal Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Informasi Pribadi", 20, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [["Field", "Detail"]],
      body: [
        ["Nama Lengkap", employee.name],
        ["NIK / Kode", employee.employeeCode],
        ["Posisi", employee.position],
        ["Departemen", employee.department],
        ["Email", employee.email],
        ["Status", employee.status === "active" ? "Aktif" : "Nonaktif"],
      ],
      theme: "striped",
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10 },
    });

    // 3. Behavioral Scores (Soft Factors)
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Hasil Assessment Perilaku (Soft Factor)", 20, currentY);

    if (employee.behavioralScore) {
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Kriteria Perilaku", "Skor (1-5)", "Keterangan"]],
        body: [
          ["Stabilitas Emosional", Number(employee.behavioralScore.avgEmotionalStability).toFixed(2), "Rata-rata Gabungan"],
          ["Komunikasi", Number(employee.behavioralScore.avgCommunication).toFixed(2), "Rata-rata Gabungan"],
          ["Kerja Tim", Number(employee.behavioralScore.avgTeamwork).toFixed(2), "Rata-rata Gabungan"],
          ["Adaptabilitas", Number(employee.behavioralScore.avgAdaptability).toFixed(2), "Rata-rata Gabungan"],
          ["SKOR AKHIR PERILAKU", Number(employee.behavioralScore.finalBehaviorScore).toFixed(2), "Sangat Baik"],
        ],
        theme: "grid",
        headStyles: { fillColor: [51, 65, 85] as [number, number, number] },
        styles: { fontSize: 10 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Belum ada data assessment perilaku.", 20, currentY + 10);
      currentY += 25; // Beri jarak manual jika tabel tidak ada
    }

    // 4. Hard Skills
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Hard Skill", 20, currentY);

    const skillBody = (employee.skills || []).map((s: any) => [s.skillName, `Level ${s.level}`]);
    
    if (skillBody.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        head: [["Nama Skill", "Tingkat Penguasaan"]],
        body: skillBody,
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Belum ada data hard skill.", 20, currentY + 10);
      currentY += 25;
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "KiCob DSS — Laporan Kompetensi Karyawan Internal",
        105,
        285,
        { align: "center" }
      );
    }

    // Open Preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/karyawan">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Detail Karyawan</h1>
          <p className="text-sm text-muted-foreground">
            Profil dan kompetensi {employee.name}
          </p>
        </div>
        <Button
          onClick={handlePrintReport}
          variant="outline"
          className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 hidden sm:flex"
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak Raport
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 lg:col-span-1 flex flex-col"
        >
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 rounded-full border-2 border-primary/20 mx-auto mb-4">
              <AvatarImage src={employee.image || ""} />
              <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
                {employee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold">{employee.name}</h2>
            <p className="text-sm text-muted-foreground">
              {employee.position}
            </p>
            <Badge
              variant="secondary"
              className={`mt-2 text-xs ${
                employee.status === "active"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/15 text-red-400 border-red-500/20"
              }`}
            >
              {employee.status === "active" ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kode:</span>
              <span className="font-mono text-xs bg-muted/20 px-2 py-0.5 rounded">
                {employee.employeeCode}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dept:</span>
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total Proyek:</span>
              <span className="font-semibold">{employee.totalProjects || 0} Proyek</span>
            </div>
          </div>
        </motion.div>

        {/* Competency Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-1">Peta Kompetensi</h3>
              <p className="text-[10px] text-muted-foreground mb-4 italic">Visualisasi sebaran hard & soft skill</p>
              {skillRadarData.length > 2 ? (
                <div className="h-[250px]">
                  <SkillRadarChart data={skillRadarData} />
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center border border-dashed border-border/50 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Belum cukup data skill untuk visualisasi radar (minimal 3).
                  </p>
                </div>
              )}
            </motion.div>

            {/* Behavioral Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Skor Soft Factor</h3>
                {employee.behavioralScore ? (
                  <Badge className="bg-primary text-white">
                    {Number(employee.behavioralScore.finalBehaviorScore).toFixed(2)}
                  </Badge>
                ) : (
                  <Badge variant="outline">Belum Dinilai</Badge>
                )}
              </div>
              {employee.behavioralScore ? (
                <ScoreBreakdown items={behaviorItems} />
              ) : (
                <div className="h-[200px] flex items-center justify-center border border-dashed border-border/50 rounded-xl">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Belum ada penilaian perilaku dari rekan atau atasan.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Skill List & Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Daftar Hard Skill</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm" className="glow-button text-white rounded-xl" />
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Skill
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm bg-[oklch(0.14_0.04_260)] border-border/30">
                  <DialogHeader>
                    <DialogTitle>Assign Skill Baru</DialogTitle>
                    <DialogDescription>
                      Pilih skill dari master data untuk ditambahkan ke profil karyawan ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-3">
                      <Label>Cari & Pilih Skill</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Ketik nama skill..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="pl-10 bg-input/30 border-border/30 rounded-xl"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {availableSkills
                          .filter(s => s.skillName.toLowerCase().includes(skillSearch.toLowerCase()))
                          .map((s: any) => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSkillId(s.id.toString())}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                selectedSkillId === s.id.toString()
                                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                                  : "bg-accent/5 hover:bg-accent/10 text-muted-foreground border border-transparent"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{s.skillName}</span>
                                <Badge variant="outline" className="text-[9px] border-white/20 text-inherit capitalize">
                                  {s.category}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        {availableSkills.filter(s => s.skillName.toLowerCase().includes(skillSearch.toLowerCase())).length === 0 && (
                          <p className="text-center py-4 text-xs text-muted-foreground italic">
                            Skill tidak ditemukan...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Level Penguasaan</Label>
                      <Select
                        value={selectedLevel}
                        onValueChange={(v) => v && setSelectedLevel(v)}
                      >
                        <SelectTrigger className="h-10 bg-input/30 border-border/30 rounded-xl">
                          <SelectValue placeholder="Pilih level..." />
                        </SelectTrigger>
                        <SelectContent className="border-border/30">
                          {[1, 2, 3, 4, 5].map((l) => (
                            <SelectItem key={l} value={`Level ${l}`}>
                              Level {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <DialogClose
                        render={
                          <Button
                            variant="outline"
                            className="rounded-xl border-border/30"
                          />
                        }
                      >
                        Batal
                      </DialogClose>
                      <Button
                        onClick={handleAddSkill}
                        disabled={!selectedSkillId || !selectedLevel || isSubmitting}
                        className="flex-1 glow-button text-white rounded-xl font-semibold"
                      >
                        {isSubmitting ? "Menyimpan..." : "Assign Skill"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {employee.skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employee.skills.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-border/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{s.skillName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tingkat Penguasaan: L{s.level}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(s.skillId)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-border/50 rounded-xl">
                <p className="text-muted-foreground text-sm">
                  Belum ada hard skill yang didaftarkan.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Assessment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Riwayat Assessment Perilaku</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Data penilaian dari rekan kerja atau atasan.
            </p>
          </div>
          <Link href="/assessment">
            <Button variant="outline" size="sm" className="rounded-xl">
              Lihat Semua
            </Button>
          </Link>
        </div>

        {empAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Tanggal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Periode</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Asesor</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Tipe</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Emosional</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Komunikasi</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Kerja Tim</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Adaptasi</th>
                </tr>
              </thead>
              <tbody>
                {empAssessments.map((a: any) => (
                  <tr key={a.id} className="border-b border-border/10">
                    <td className="py-3 px-4 text-sm">
                      {new Date(a.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-primary/80">
                      {a.periodName || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{a.assessorName}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] capitalize ${
                          a.assessmentType === 'upward' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''
                        }`}
                      >
                        {a.assessmentType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-mono">{Number(a.emotionalStability).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-sm font-mono">{Number(a.communication).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-sm font-mono">{Number(a.teamwork).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-sm font-mono">{Number(a.adaptability).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-border/50 rounded-xl">
            <p className="text-muted-foreground text-sm">
              Belum ada riwayat assessment.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
