"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, User, Target, Info, ShieldCheck, CalendarClock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  {
    id: "es",
    title: "Stabilitas Emosional",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 12H9L10.5 9L13.5 15L15 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "from-[#020617] via-[#1e1b4b] to-[#312e81]",
    questions: [
      { key: "esSelfControl", label: "Self-Control", desc: "Mengendalikan emosi saat situasi memanas" },
      { key: "esStressTolerance", label: "Stress Tolerance", desc: "Tetap produktif di bawah tekanan tinggi" },
      { key: "esResilience", label: "Resilience", desc: "Cepat bangkit setelah mengalami kegagalan" },
      { key: "esObjectivity", label: "Objectivity", desc: "Menilai berdasarkan fakta, bukan perasaan" },
    ]
  },
  {
    id: "cm",
    title: "Komunikasi",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9H16M8 13H13M18 5V15C18 15.5304 17.7893 16.0391 17.4142 16.4142C17.0391 16.7893 16.5304 17 16 17H11L7 21V17H6C5.46957 17 4.96086 16.7893 4.58579 16.4142C4.21071 16.0391 4 15.5304 4 15V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H16C16.5304 3 17.0391 3.21071 17.4142 3.58579C17.7893 3.96086 18 4.46957 18 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "from-[#020617] via-[#164e63] to-[#0891b2]",
    questions: [
      { key: "commClarity", label: "Clarity", desc: "Penyampaian ide yang ringkas dan jelas" },
      { key: "commListening", label: "Active Listening", desc: "Memahami instruksi sepenuhnya sebelum merespon" },
      { key: "commResponsiveness", label: "Responsiveness", desc: "Kecepatan koordinasi dalam tim" },
      { key: "commEmpathy", label: "Empathy", desc: "Memahami kondisi rekan saat berinteraksi" },
    ]
  },
  {
    id: "tw",
    title: "Kerja Tim",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M16 3.13C17.2247 3.41165 18.2834 4.10864 19.0143 5.11303C19.7453 6.11742 20.1118 7.37525 20.0573 8.65361C20.0028 9.93198 19.5302 11.1611 18.7113 12.1485C17.8923 13.136 16.7691 13.832 15.5 14.13M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM19 7C19 9.20914 20.7909 11 23 11C25.2091 11 27 9.20914 27 7C27 4.79086 25.2091 3 23 3C20.7909 3 19 4.79086 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "from-[#020617] via-[#064e3b] to-[#059669]",
    questions: [
      { key: "twReliability", label: "Reliability", desc: "Konsistensi dalam memenuhi janji tugas" },
      { key: "twSupport", label: "Proactive Support", desc: "Inisiatif membantu rekan yang kesulitan" },
      { key: "twSharing", label: "Information Sharing", desc: "Kesediaan berbagi data demi sukses tim" },
      { key: "twResolution", label: "Conflict Resolution", desc: "Berperan aktif meredam ketegangan" },
    ]
  },
  {
    id: "ad",
    title: "Adaptabilitas",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "from-[#020617] via-[#4c0519] to-[#9f1239]",
    questions: [
      { key: "adLearning", label: "Learning Agility", desc: "Kecepatan menguasai metode kerja baru" },
      { key: "adFlexibility", label: "Flexibility", desc: "Siap berubah prioritas jika dibutuhkan" },
      { key: "adInnovation", label: "Innovation Mindset", desc: "Mencari cara kerja baru yang lebih efisien" },
      { key: "adVersatility", label: "Versatility", desc: "Siap menjalankan peran luar jobdesk utama" },
    ]
  }
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssessmentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  
  const { data: emp, isLoading } = useSWR<any>(`/api/employees/${id}`, fetcher);
  const { data: allEmployees } = useSWR<any[]>("/api/employees", fetcher);
  
  const currentUserEmp = allEmployees?.find(e => e.userId === currentUser?.id);
  const assessorLevel = currentUserEmp?.jobLevel || 1;
  const targetLevel = emp?.jobLevel || 1;

  // Real Hierarchy Logic (Direct Supervisor Relation)
  const isDirectSupervisor = currentUserEmp && emp?.supervisorId === currentUserEmp.id;
  const isDirectUnderling = currentUserEmp && currentUserEmp.supervisorId === emp?.id;

  const isSelf = emp?.userId === currentUser?.id;
  const isPeer = assessorLevel === targetLevel && !isSelf;
  const isSuperior = (isDirectSupervisor || (assessorLevel > targetLevel)) && !isSelf;
  const isUnderling = (isDirectUnderling || (assessorLevel < targetLevel)) && !isSelf;

  const getInitialType = () => {
    if (isSelf) return "self";
    if (isSuperior) return "supervisor";
    if (isPeer) return "peer";
    if (isUnderling) return "upward";
    return "";
  };

  const { data: periodsData } = useSWR<any[]>("/api/periods", fetcher);
  const activePeriod = periodsData?.find(p => p.isCurrent);

  const [currentStep, setCurrentStep] = useState(0);
  const [type, setType] = useState("");
  const [period, setPeriod] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({
    esSelfControl: 7, esStressTolerance: 7, esResilience: 7, esObjectivity: 7,
    commClarity: 7, commListening: 7, commResponsiveness: 7, commEmpathy: 7,
    twReliability: 7, twSupport: 7, twSharing: 7, twResolution: 7,
    adLearning: 7, adFlexibility: 7, adInnovation: 7, adVersatility: 7,
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (emp && !isLoading) { setType(getInitialType()); }
    if (activePeriod && !period) { setPeriod(activePeriod.name); }
  }, [emp, isLoading, currentUser, allEmployees, activePeriod]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-muted-foreground animate-pulse">Memuat mesin penilaian...</p></div>;
  if (!emp || emp.error) return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-muted-foreground">Karyawan tidak ditemukan.</p></div>;

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const avg = totalScore / 16;
  const selectedPeriodData = periodsData?.find(p => p.name === period);
  const isPeriodClosed = selectedPeriodData && selectedPeriodData.status !== "active";
  const existingAssessment = emp?.assessments?.find((a: any) => a.assessorName === currentUser?.name && a.assessmentType === type && a.periodName === period);

  const handleSubmit = async () => {
    if (existingAssessment || isPeriodClosed || !type || !period) return;
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
          notes,
          ...scores
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/assessment"), 1500);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan.");
      }
    } catch (e) {
      alert("Kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && (!type || !period)) {
      alert("Harap pilih Tipe Penilaian dan Periode terlebih dahulu.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length + 1));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const currentThemeColor = currentStep > 0 && currentStep <= steps.length 
    ? steps[currentStep - 1].color 
    : "from-[#020617] via-[#1e1b4b] to-[#312e81]";

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col lg:flex-row overflow-hidden rounded-3xl border border-slate-800/50 bg-[#020617] shadow-2xl">
      {/* Left Column: Gradient Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`lg:w-[320px] shrink-0 bg-gradient-to-br ${currentThemeColor} p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-700`}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 animate-pulse" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
              {currentStep === 0 ? <User className="w-8 h-8" /> : 
               currentStep <= steps.length ? steps[currentStep - 1].icon : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85782 7.69279 2.71537 9.79631 2.24013C11.8998 1.7649 14.1003 1.98232 16.07 2.85999M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {currentStep === 0 ? "Persiapan" :
                 currentStep <= steps.length ? steps[currentStep - 1].title : "Final Review"}
              </h1>
              <p className="text-white/70 text-xs mt-2 leading-relaxed">
                {currentStep === 0 ? "Tentukan peran Anda dalam penilaian ini." :
                 currentStep <= steps.length ? "Berikan penilaian objektif pada indikator ini." : "Tinjau kembali sebelum disimpan."}
              </p>
            </div>
          </div>

          {/* Steps Vertical List */}
          <div className="space-y-4 pt-4">
            {[{ id: "init", title: "Persiapan" }, ...steps, { id: "final", title: "Final" }].map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-500 ${
                  idx < currentStep ? "bg-white text-emerald-600" : idx === currentStep ? "bg-white text-primary shadow-lg" : "border border-white/30 text-white/30"
                }`}>
                  {idx < currentStep ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${idx === currentStep ? "text-white" : "text-white/40"}`}>
                  {s.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <div className="p-4 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              {emp.image ? (
                <img src={emp.image} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">{emp.name?.charAt(0)}</div>
              )}
              <p className="text-xs font-bold text-white truncate max-w-[150px]">{emp.name}</p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-white/50 uppercase font-bold">Live Score</p>
                <p className="text-xl font-black text-white">{avg.toFixed(1)}</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-white/30" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Scrollable Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950/50 backdrop-blur-sm relative">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            {currentStep === 0 ? (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 py-10"
              >
                <div className="space-y-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30">Langkah 1 dari 6</Badge>
                  <h2 className="text-4xl font-black tracking-tight text-white">Mari Mulai Penilaian</h2>
                  <p className="text-slate-400">Sebelum masuk ke kuesioner, harap konfirmasi peran Anda untuk **{emp.name}**.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Anda Menilai Sebagai:
                    </label>
                    <Select value={type} onValueChange={(v) => v && setType(v)}>
                      <SelectTrigger className="h-16 bg-slate-900/50 border-slate-800 rounded-2xl text-lg font-semibold focus:ring-primary shadow-inner">
                        <SelectValue placeholder="Pilih Peran Anda" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 min-w-[320px]">
                        {isSelf && <SelectItem value="self" className="py-3">Self Assessment (Diri Sendiri)</SelectItem>}
                        {isDirectSupervisor ? (
                           <SelectItem value="supervisor" className="py-3">Supervisor Assessment (Atasan Langsung)</SelectItem>
                        ) : isSuperior ? (
                           <SelectItem value="supervisor" className="py-3">Supervisor Assessment (Pihak Atasan)</SelectItem>
                        ) : null}
                        {isPeer && <SelectItem value="peer" className="py-3">Peer Assessment (Rekan Kerja)</SelectItem>}
                        {isDirectUnderling ? (
                           <SelectItem value="upward" className="py-3">Upward Feedback (Bawahan Langsung)</SelectItem>
                        ) : isUnderling ? (
                           <SelectItem value="upward" className="py-3">Upward Feedback (Bawahan)</SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 italic">*Pilihan dibatasi berdasarkan hirarki jabatan Anda.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-primary" /> Periode Penilaian:
                    </label>
                    <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
                      <SelectTrigger className="h-16 bg-slate-900/50 border-slate-800 rounded-2xl text-lg font-semibold focus:ring-primary shadow-inner">
                        <SelectValue placeholder="Pilih Periode" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 min-w-[240px]">
                        {periodsData?.map(p => (
                          <SelectItem key={p.id} value={p.name} className="py-3">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{p.name}</span>
                              <Badge variant="outline" className={`text-[9px] ${p.status === 'active' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                                {p.status === 'active' ? 'Buka' : p.status === 'closed' ? 'Tutup' : 'Kunci'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-10">
                  <Button 
                    onClick={nextStep} 
                    disabled={!type || !period || isPeriodClosed || !!existingAssessment}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                  >
                    {isPeriodClosed ? "Kuesioner Ditutup" : existingAssessment ? "Sudah Diisi" : <>Mulai Isi Kuesioner <ChevronRight className="w-6 h-6" /></>}
                  </Button>
                  
                  {isPeriodClosed && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-medium flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Periode ini sudah ditutup atau dikunci oleh admin.
                    </div>
                  )}

                  {existingAssessment && !isPeriodClosed && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center text-sm font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Anda sudah mengirimkan penilaian ini sebelumnya.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : currentStep <= steps.length ? (
              <motion.div
                key={steps[currentStep - 1].id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-10"
              >
                {/* Header Mobile Only */}
                <div className="lg:hidden mb-8 space-y-2">
                   <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                    <span className="text-4xl">{steps[currentStep - 1].icon}</span>
                    {steps[currentStep - 1].title}
                   </h2>
                   <div className="h-1 w-20 bg-primary rounded-full" />
                </div>

                <div className="space-y-12">
                  {steps[currentStep - 1].questions.map((q, idx) => (
                    <motion.div 
                      key={q.key} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <label className="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors flex items-center gap-3">
                            {q.label}
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary" />
                          </label>
                          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">{q.desc}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-primary font-mono tabular-nums leading-none">
                            {scores[q.key]}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Score</span>
                        </div>
                      </div>

                      <div className="relative pt-6 pb-2">
                        <Slider 
                          value={[scores[q.key]]} 
                          onValueChange={(v) => {
                            const val = Array.isArray(v) ? v[0] : v;
                            setScores(p => ({ ...p, [q.key]: val }));
                          }} 
                          min={1} max={10} step={0.5} 
                          className="py-4"
                          disabled={!!existingAssessment || isPeriodClosed}
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold tracking-widest mt-2 uppercase">
                          <span>Sangat Kurang</span>
                          <span className="text-slate-700">|</span>
                          <span>Netral</span>
                          <span className="text-slate-700">|</span>
                          <span>Sangat Baik</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-12 border-t border-slate-800/50">
                  <Button 
                    variant="ghost" 
                    onClick={prevStep} 
                    className="h-12 px-6 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    className="h-14 px-10 rounded-2xl bg-primary text-white font-bold text-lg glow-button hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Next Category <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="final-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4 mb-12">
                   <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-5xl animate-bounce">
                     🏁
                   </div>
                   <h2 className="text-4xl font-black tracking-tight text-white">Final Checkpoint</h2>
                   <p className="text-slate-400">Tinjau kembali penilaian Anda sebelum disimpan ke sistem.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps.map(s => {
                    const sAvg = s.questions.reduce((acc, q) => acc + scores[q.key], 0) / 4;
                    return (
                      <div key={s.id} className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{s.icon}</span>
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{s.id}</p>
                            <p className="text-sm font-bold text-slate-200">{s.title}</p>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-primary font-mono">{sAvg.toFixed(1)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-6 pt-10">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Peran & Periode</p>
                      <p className="text-sm font-medium text-slate-200 capitalize">{type} Assessment — {period}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)} className="text-xs text-primary hover:bg-primary/10 h-8">Ubah</Button>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-3 h-3" /> Catatan Tambahan (Opsional)
                    </label>
                    <Textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Tuliskan alasan atau feedback kualitatif di sini..." 
                      className="bg-slate-900/80 border-slate-800 rounded-2xl min-h-[120px] p-4 focus:ring-primary resize-none text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                  <Button variant="ghost" onClick={prevStep} className="h-14 rounded-2xl text-slate-400 hover:text-white flex-1 border border-slate-800">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Revise Scores
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !!existingAssessment || isPeriodClosed}
                    className="flex-[2] h-14 bg-primary text-white rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-primary/60 transition-all hover:scale-[1.02]"
                  >
                    {saved ? <><CheckCircle2 className="w-6 h-6 mr-2" /> SUCCESS!</> : isSubmitting ? "PROCESSING..." : <><Save className="w-6 h-6 mr-2" /> SUBMIT FINAL</>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-20 pt-8 border-t border-slate-900/50 flex justify-between items-center text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            <span>KiCob v2.5</span>
            <div className="flex gap-4">
              <span>Security</span>
              <span>Methodology</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
