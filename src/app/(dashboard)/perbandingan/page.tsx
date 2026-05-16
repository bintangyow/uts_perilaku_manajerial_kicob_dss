"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, Target, Brain, Zap } from "lucide-react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PerbandinganPage() {
  const { data: employees } = useSWR<any[]>("/api/employees", fetcher);
  
  const [empAId, setEmpAId] = useState<string>("");
  const [empBId, setEmpBId] = useState<string>("");

  const { data: empAData } = useSWR<any>(empAId ? `/api/employees/${empAId}` : null, fetcher);
  const { data: empBData } = useSWR<any>(empBId ? `/api/employees/${empBId}` : null, fetcher);

  const categories = [
    { label: "Emosional", key: "avgEmotionalStability" },
    { label: "Komunikasi", key: "avgCommunication" },
    { label: "Kerja Tim", key: "avgTeamwork" },
    { label: "Adaptasi", key: "avgAdaptability" },
    { label: "Final Score", key: "finalBehaviorScore" },
  ];

  const compareData = categories.map(cat => ({
    subject: cat.label,
    A: Number(empAData?.behavioralScore?.[cat.key] || 0),
    B: Number(empBData?.behavioralScore?.[cat.key] || 0),
  }));

  const getSkillComparison = () => {
    if (!empAData || !empBData) return [];
    const allSkillNames = Array.from(new Set([
      ...(empAData.skills?.map((s: any) => s.skillName) || []),
      ...(empBData.skills?.map((s: any) => s.skillName) || [])
    ]));

    return allSkillNames.map(name => ({
      name,
      levelA: empAData.skills?.find((s: any) => s.skillName === name)?.level || 0,
      levelB: empBData.skills?.find((s: any) => s.skillName === name)?.level || 0,
    })).sort((a, b) => (b.levelA + b.levelB) - (a.levelA + a.levelB)).slice(0, 6);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Head-to-Head Comparison</h1>
        <p className="text-muted-foreground">Bandingkan profil kompetensi antar karyawan secara mendalam.</p>
      </header>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-6 border-slate-800 bg-slate-900/50">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 block">Karyawan A</label>
          <Select onValueChange={(val) => setEmpAId(val || "")} value={empAId}>
            <SelectTrigger className="h-14 bg-slate-950 border-slate-800 rounded-2xl text-lg hover:border-primary/50 transition-colors">
              <SelectValue>
                {empAData ? (
                  <div className="text-sm font-bold text-slate-200">{empAData.name}</div>
                ) : (
                  "Pilih Karyawan Pertama..."
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()} disabled={emp.id.toString() === empBId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card rounded-3xl p-6 border-slate-800 bg-slate-900/50">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 block">Karyawan B</label>
          <Select onValueChange={(val) => setEmpBId(val || "")} value={empBId}>
            <SelectTrigger className="h-14 bg-slate-950 border-slate-800 rounded-2xl text-lg hover:border-amber-500/50 transition-colors">
              <SelectValue>
                {empBData ? (
                  <div className="text-sm font-bold text-slate-200">{empBData.name}</div>
                ) : (
                  "Pilih Karyawan Kedua..."
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()} disabled={emp.id.toString() === empAId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {empAData && empBData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Top Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 glass-card rounded-3xl p-8 bg-slate-900/30 border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Profil Kompetensi Radar</h3>
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={compareData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar name={empAData.name} dataKey="A" stroke="#0ea5e9" strokeWidth={3} fill="#0ea5e9" fillOpacity={0.2} />
                      <Radar name={empBData.name} dataKey="B" stroke="#f59e0b" strokeWidth={3} fill="#f59e0b" fillOpacity={0.2} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Legend iconType="circle" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 glass-card rounded-3xl p-8 bg-slate-900/30 border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Statistik Head-to-Head
                </h3>
                <div className="space-y-8">
                  {categories.map((cat) => {
                    const valA = Number(empAData.behavioralScore?.[cat.key] || 0);
                    const valB = Number(empBData.behavioralScore?.[cat.key] || 0);
                    return (
                      <div key={cat.key} className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                          <span className={valA > valB ? 'text-primary' : ''}>{valA.toFixed(1)}</span>
                          <span>{cat.label}</span>
                          <span className={valB > valA ? 'text-amber-500' : ''}>{valB.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full flex relative overflow-hidden">
                          <div className="absolute inset-y-0 right-1/2 left-0 flex justify-end">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(valA / 10) * 100}%` }} className="h-full bg-primary transition-all duration-1000" />
                          </div>
                          <div className="absolute inset-y-0 left-1/2 right-0 flex justify-start">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(valB / 10) * 100}%` }} className="h-full bg-amber-500 transition-all duration-1000 border-l border-slate-950" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hard Skills Duel */}
            <div className="glass-card rounded-3xl p-8 bg-slate-900/20 border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8 text-center">Technical Skills Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getSkillComparison().map((skill) => (
                  <div key={skill.name} className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">{skill.name}</div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-bold text-primary">L{skill.levelA}</div>
                      <div className="flex-1 h-1 bg-slate-800 rounded-full flex overflow-hidden">
                        <div style={{ width: `${(skill.levelA / 5) * 50}%` }} className="bg-primary h-full" />
                        <div style={{ width: `${(skill.levelB / 5) * 50}%` }} className="bg-amber-500 h-full" />
                      </div>
                      <div className="text-sm font-bold text-amber-500">L{skill.levelB}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card rounded-3xl p-8 bg-slate-900/40 border-slate-800">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Analisis Karir: {empAData.name}
                </h4>
                <ul className="space-y-4 text-sm text-slate-300">
                   <li className="flex gap-3">
                     <Zap className="w-4 h-4 text-primary shrink-0" />
                     <span>
                       {Number(empAData.behavioralScore?.avgCommunication) > 7.5 
                         ? `Sangat piawai dalam menjalin komunikasi dan koordinasi tim, terlihat dari skor yang menonjol.` 
                         : `Cenderung lebih produktif saat bekerja secara mandiri dan fokus pada penyelesaian tugas teknis.`}
                     </span>
                   </li>
                   <li className="flex gap-3">
                     <Target className="w-4 h-4 text-primary shrink-0" />
                     <span>
                       {(() => {
                         const scores = [
                           { name: 'Stabilitas Emosional', val: Number(empAData.behavioralScore?.avgEmotionalStability) },
                           { name: 'Komunikasi', val: Number(empAData.behavioralScore?.avgCommunication) },
                           { name: 'Kerja Tim', val: Number(empAData.behavioralScore?.avgTeamwork) },
                           { name: 'Adaptabilitas', val: Number(empAData.behavioralScore?.avgAdaptability) },
                         ];
                         const lowest = scores.sort((a, b) => a.val - b.val)[0];
                         return lowest.val < 6.5 
                           ? `Aspek ${lowest.name} masih bisa ditingkatkan lagi agar keseimbangan kompetensinya lebih terjaga.`
                           : `Memiliki pondasi perilaku yang solid dan siap mengemban tanggung jawab yang lebih besar.`;
                       })()}
                     </span>
                   </li>
                </ul>
              </div>

              <div className="glass-card rounded-3xl p-8 bg-slate-900/40 border-slate-800">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Analisis Karir: {empBData.name}
                </h4>
                <ul className="space-y-4 text-sm text-slate-300">
                   <li className="flex gap-3">
                     <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                     <span>
                       {Number(empBData.behavioralScore?.avgTeamwork) > 7.5 
                         ? `Memiliki jiwa kolaborasi yang tinggi, sangat membantu dalam menjaga keharmonisan kerja di dalam tim.` 
                         : `Menunjukkan ketelitian yang baik dalam bekerja, meskipun masih perlu didorong untuk lebih aktif berkolaborasi.`}
                     </span>
                   </li>
                   <li className="flex gap-3">
                     <Target className="w-4 h-4 text-amber-500 shrink-0" />
                     <span>
                       {(() => {
                         const scores = [
                           { name: 'Stabilitas Emosional', val: Number(empBData.behavioralScore?.avgEmotionalStability) },
                           { name: 'Komunikasi', val: Number(empBData.behavioralScore?.avgCommunication) },
                           { name: 'Kerja Tim', val: Number(empBData.behavioralScore?.avgTeamwork) },
                           { name: 'Adaptabilitas', val: Number(empBData.behavioralScore?.avgAdaptability) },
                         ];
                         const lowest = scores.sort((a, b) => a.val - b.val)[0];
                         return lowest.val < 6.5 
                           ? `Pemberian bimbingan pada sisi ${lowest.name} akan sangat membantu proses perkembangannya ke depan.`
                           : `Profil perilakunya menunjukkan kematangan yang merata di berbagai pilar kompetensi.`;
                       })()}
                     </span>
                   </li>
                </ul>
              </div>
            </div>

            {/* Final Verdict */}
            <div className="glass-card rounded-3xl p-10 bg-slate-900/50 border border-slate-800/50">
              <div className="flex flex-col gap-4 max-w-3xl">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Kesimpulan Strategis</span>
                </div>
                <p className="text-lg leading-relaxed text-slate-300">
                  {(() => {
                    const scoreA = Number(empAData.behavioralScore?.finalBehaviorScore || 0);
                    const scoreB = Number(empBData.behavioralScore?.finalBehaviorScore || 0);
                    
                    let winsA = [];
                    let winsB = [];
                    let biggestGap = { label: "", val: 0 };

                    categories.forEach(cat => {
                      const vA = Number(empAData.behavioralScore?.[cat.key] || 0);
                      const vB = Number(empBData.behavioralScore?.[cat.key] || 0);
                      const gap = Math.abs(vA - vB);
                      
                      if (vA > vB) winsA.push(cat.label);
                      else if (vB > vA) winsB.push(cat.label);
                      
                      if (gap > biggestGap.val) {
                        biggestGap = { label: cat.label, val: gap };
                      }
                    });

                    if (scoreA > scoreB) {
                      return `${empAData.name} menunjukkan profil yang lebih unggul secara keseluruhan, terutama pada aspek ${winsA.join(", ")}. Perbedaan paling mencolok terlihat pada variabel ${biggestGap.label} dengan selisih skor ${biggestGap.val.toFixed(1)}. Hal ini menjadikannya pilihan yang lebih kuat untuk peran yang menuntut kompetensi tersebut.`;
                    } else if (scoreB > scoreA) {
                      return `${empBData.name} menunjukkan profil yang lebih unggul secara keseluruhan, terutama pada aspek ${winsB.join(", ")}. Perbedaan paling mencolok terlihat pada variabel ${biggestGap.label} dengan selisih skor ${biggestGap.val.toFixed(1)}. Hal ini menjadikannya pilihan yang lebih kuat untuk peran yang menuntut kompetensi tersebut.`;
                    }
                    return `Kedua kandidat memiliki kualitas perilaku yang sangat berimbang di hampir semua variabel. Pengambilan keputusan dapat difokuskan pada kecocokan spesifik terhadap kebutuhan teknis proyek.`;
                  })()}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
             <Users className="w-12 h-12 mb-4" />
             <h2 className="text-xl font-bold uppercase tracking-widest">Pilih Karyawan</h2>
             <p className="text-slate-500 text-sm mt-2">Pilih dua karyawan untuk mulai membandingkan performa mereka secara lengkap.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
