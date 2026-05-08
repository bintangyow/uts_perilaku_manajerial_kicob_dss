"use client";

import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const dims = [
  { key: "es", label: "Stabilitas Emosional", desc: "Kemampuan mengelola emosi di bawah tekanan" },
  { key: "cm", label: "Komunikasi", desc: "Menyampaikan dan menerima informasi secara efektif" },
  { key: "tw", label: "Kerja Tim", desc: "Berkolaborasi dan berkontribusi dalam tim" },
  { key: "ad", label: "Adaptabilitas", desc: "Beradaptasi dengan perubahan dan situasi baru" },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssessmentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  
  const { data: emp, isLoading } = useSWR<any>(`/api/employees/${id}`, fetcher);
  const { data: allEmployees } = useSWR<any[]>("/api/employees", fetcher);
  
  const isSelf = emp?.userId === currentUser?.id;
  const currentUserEmp = allEmployees?.find(e => e.userId === currentUser?.id);
  
  const assessorLevel = currentUserEmp?.jobLevel || 1;
  const targetLevel = emp?.jobLevel || 1;
  const isSuperior = assessorLevel > targetLevel && !isSelf;
  const isPeer = assessorLevel === targetLevel && !isSelf;
  const isUnderling = assessorLevel < targetLevel && !isSelf;

  // Logic to determine initial type and allowed types based on role
  const getInitialType = () => {
    if (isSelf) return "self";
    if (isSuperior) return "supervisor";
    if (isPeer) return "peer";
    if (isUnderling) return "upward";
    return "";
  };

  const { data: periodsData } = useSWR<any[]>("/api/periods", fetcher);
  const activePeriod = periodsData?.find(p => p.isCurrent);

  const [type, setType] = useState("");
  const [period, setPeriod] = useState("");
  const [scores, setScores] = useState({ es: 3, cm: 3, tw: 3, ad: 3 });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedPeriodData = periodsData?.find(p => p.name === period);
  const isPeriodClosed = selectedPeriodData && selectedPeriodData.status !== "active";

  // Check if this user already assessed this employee in THIS period
  const existingAssessment = emp?.assessments?.find(
    (a: any) => 
      a.assessorName === currentUser?.name && 
      a.assessmentType === type && 
      a.periodName === period // BUGFIX: was 'a.period', should be 'a.periodName' based on previous API fix
  );

  // Set initial state once data is loaded
  useEffect(() => {
    if (emp && !isLoading) {
      setType(getInitialType());
    }
    if (activePeriod && !period) {
      setPeriod(activePeriod.name);
    }
  }, [emp, isLoading, currentUser, allEmployees, activePeriod]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Memuat data karyawan...</p>
      </div>
    );
  }

  if (!emp || emp.error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Karyawan tidak ditemukan.</p>
      </div>
    );
  }

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 4;

  const handleSubmit = async () => {
    if (existingAssessment) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessorName: currentUser?.name || "Anonymous",
          employeeId: emp.id,
          assessmentType: type,
          period: period,
          emotionalStability: scores.es,
          communication: scores.cm,
          teamwork: scores.tw,
          adaptability: scores.ad,
          notes: notes,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push("/assessment");
        }, 1500);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menyimpan assessment. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Terjadi kesalahan koneksi. Silakan cek jaringan Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRoleRestricted = currentUser?.role !== "admin" && currentUser?.role !== "hr";

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Link href="/assessment"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Form Assessment</h1><p className="text-sm text-muted-foreground">Penilaian untuk {emp.name}</p></div>
      </motion.div>

      {/* Status Banners */}
      {isUnderling && !existingAssessment && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">!</div>
          <p>Anda sedang melakukan <b>Upward Assessment</b>. Penilaian Anda terhadap atasan (<b>Level {targetLevel}</b>) bersifat rahasia dan akan berkontribusi secara adil pada skor akhirnya.</p>
        </motion.div>
      )}

      {existingAssessment && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">✓</div>
          <p>Anda sudah memberikan <b>{type} assessment</b> untuk periode <b>{period}</b>. Terima kasih atas penilaian Anda.</p>
        </motion.div>
      )}

      {isPeriodClosed && !existingAssessment && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">!</div>
          <p>Periode <b>{selectedPeriodData.name}</b> saat ini berstatus <b>{selectedPeriodData.status === 'closed' ? 'Ditutup' : 'Dikunci'}</b>. Pengisian form penilaian dinonaktifkan.</p>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-lg font-bold">{emp.name.charAt(0)}</div>
        <div className="flex-1">
          <h3 className="font-semibold">{emp.name}</h3>
          <p className="text-xs text-muted-foreground">
            {emp.position} — {emp.department}
          </p>
        </div>
        <div className="text-right"><p className="text-xs text-muted-foreground">Rata-rata</p><p className="text-xl font-bold text-gradient">{avg.toFixed(1)}</p></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5">
          <label className="text-sm font-medium mb-2 block">Tipe Assessment</label>
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger className="min-h-[44px] h-auto bg-input/30 border-border/30 rounded-xl px-4 py-2.5 text-left flex items-center justify-between w-full">
              <div className="font-semibold text-sm text-primary capitalize">{type || "Pilih"} Assessment</div>
            </SelectTrigger>
            <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)] min-w-[240px]">
              {isSelf && (
                <SelectItem value="self" className="py-2.5 px-3 focus:bg-primary/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-primary">Self Assessment</span>
                    <span className="text-[10px] text-muted-foreground/80 leading-tight">Penilaian Mandiri</span>
                  </div>
                </SelectItem>
              )}
              {isSuperior && (
                <SelectItem value="supervisor" className="py-2.5 px-3 focus:bg-primary/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-primary">Supervisor Assessment</span>
                    <span className="text-[10px] text-muted-foreground/80 leading-tight">Penilaian sebagai Atasan Langsung</span>
                  </div>
                </SelectItem>
              )}
              {isPeer && (
                <SelectItem value="peer" className="py-2.5 px-3 focus:bg-primary/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-primary">Peer Assessment</span>
                    <span className="text-[10px] text-muted-foreground/80 leading-tight">Penilaian sebagai Rekan Kerja</span>
                  </div>
                </SelectItem>
              )}
              {isUnderling && (
                <SelectItem value="upward" className="py-2.5 px-3 focus:bg-primary/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-primary">Upward Assessment</span>
                    <span className="text-[10px] text-muted-foreground/80 leading-tight">Penilaian terhadap Atasan</span>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground/70 mt-2 italic">
            {isSelf 
              ? "Sistem mendeteksi Anda sedang mengisi penilaian mandiri." 
              : isSuperior 
                ? "Sistem mendeteksi Anda menilai sebagai atasan langsung."
                : isUnderling
                  ? "Sistem mendeteksi Anda menilai atasan (Upward Feedback)."
                  : "Sistem mendeteksi Anda menilai sebagai rekan sejawat."}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5">
          <label className="text-sm font-medium mb-2 block">Periode Penilaian</label>
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="min-h-[44px] h-auto bg-input/30 border-border/30 rounded-xl px-4 py-2.5 text-left flex items-center justify-between w-full">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)]">
              {periodsData?.map(p => (
                <SelectItem key={p.id} value={p.name} className="py-2.5 px-3 focus:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{p.name}</span>
                    {p.isCurrent && (
                      <Badge variant="secondary" className="text-[9px] h-4 bg-primary/15 text-primary border-primary/20">
                        Default
                      </Badge>
                    )}
                    {p.status !== "active" && (
                      <Badge variant="secondary" className="text-[9px] h-4 bg-muted/20 text-muted-foreground border-border/30">
                        {p.status === 'closed' ? 'Tutup' : 'Kunci'}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground/70 mt-2 italic">
            Pilih periode evaluasi kinerja karyawan.
          </p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`glass-card rounded-2xl p-5 space-y-6 ${(existingAssessment || isPeriodClosed) ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-sm font-semibold">Dimensi Penilaian</h3>
        {dims.map((d, i) => {
          const val = scores[d.key as keyof typeof scores];
          return (
            <motion.div key={d.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.08 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{d.label}</p><p className="text-xs text-muted-foreground">{d.desc}</p></div>
                <Badge variant="secondary" className="text-sm font-bold bg-primary/10 text-primary border-primary/20 min-w-[3rem] justify-center">{val.toFixed(1)}</Badge>
              </div>
              <Slider value={[val]} onValueChange={(v) => { const n = Array.isArray(v) ? v[0] : v; setScores((p) => ({ ...p, [d.key]: n })); }} min={1} max={5} step={0.5} className="cursor-pointer" />
              <div className="flex justify-between text-[10px] text-muted-foreground/60"><span>Sangat Kurang</span><span>Kurang</span><span>Cukup</span><span>Baik</span><span>Sangat Baik</span></div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`glass-card rounded-2xl p-5 ${(existingAssessment || isPeriodClosed) ? 'opacity-50 pointer-events-none' : ''}`}>
        <label className="text-sm font-medium mb-2 block">Catatan (opsional)</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tambahkan catatan..." rows={3} className="bg-input/30 border-border/30 rounded-xl resize-none" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex gap-3">
        <Button variant="outline" onClick={() => { setScores({ es: 3, cm: 3, tw: 3, ad: 3 }); setNotes(""); }} disabled={!!existingAssessment || isPeriodClosed} className="rounded-xl border-border/30 hover:bg-accent/10"><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !!existingAssessment || isPeriodClosed} className="flex-1 h-11 glow-button text-white rounded-xl font-semibold">
          {saved ? <span>✓ Tersimpan</span> : isSubmitting ? <span>Menyimpan...</span> : isPeriodClosed ? <span>Periode Ditutup</span> : existingAssessment ? <span>Sudah Diisi</span> : <><Save className="w-4 h-4 mr-2" />Simpan Assessment</>}
        </Button>
      </motion.div>
    </div>
  );
}
