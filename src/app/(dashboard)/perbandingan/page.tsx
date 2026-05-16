"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Swords, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

  const compareData = [
    { subject: "Emosional", A: empAData?.behavioralScore?.avgEmotionalStability || 0, B: empBData?.behavioralScore?.avgEmotionalStability || 0 },
    { subject: "Komunikasi", A: empAData?.behavioralScore?.avgCommunication || 0, B: empBData?.behavioralScore?.avgCommunication || 0 },
    { subject: "Kerja Tim", A: empAData?.behavioralScore?.avgTeamwork || 0, B: empBData?.behavioralScore?.avgTeamwork || 0 },
    { subject: "Adaptasi", A: empAData?.behavioralScore?.avgAdaptability || 0, B: empBData?.behavioralScore?.avgAdaptability || 0 },
    { subject: "Hard Skill", A: (empAData?.skills?.reduce((acc: number, s: any) => acc + s.level, 0) / (empAData?.skills?.length || 1)) * 2 || 0, B: (empBData?.skills?.reduce((acc: number, s: any) => acc + s.level, 0) / (empBData?.skills?.length || 1)) * 2 || 0 },
  ];

  const categories = [
    { label: "Stabilitas Emosional", key: "avgEmotionalStability" },
    { label: "Komunikasi", key: "avgCommunication" },
    { label: "Kerja Tim", key: "avgTeamwork" },
    { label: "Adaptabilitas", key: "avgAdaptability" },
    { label: "Final Score", key: "finalBehaviorScore" },
  ];

  const getWinner = (key: string) => {
    const valA = Number(empAData?.behavioralScore?.[key] || 0);
    const valB = Number(empBData?.behavioralScore?.[key] || 0);
    if (valA > valB) return "A";
    if (valB > valA) return "B";
    return "draw";
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Swords className="w-8 h-8 text-primary" /> Head-to-Head Comparison
        </h1>
        <p className="text-muted-foreground">Bandingkan profil kompetensi antar karyawan secara mendalam.</p>
      </header>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Player 1 */}
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

        {/* Player 2 */}
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Visual Radar */}
            <div className="lg:col-span-7 glass-card rounded-3xl p-8 flex flex-col items-center bg-slate-900/30">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Profil Kompetensi Radar</h3>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={compareData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      name={empAData.name}
                      dataKey="A"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fill="#0ea5e9"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name={empBData.name}
                      dataKey="B"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fill="#f59e0b"
                      fillOpacity={0.2}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Comparison */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass-card rounded-3xl p-6 bg-slate-900/30">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Statistik Head-to-Head
                </h3>
                <div className="space-y-8">
                  {categories.map((cat) => {
                    const winner = getWinner(cat.key);
                    const valA = Number(empAData.behavioralScore?.[cat.key] || 0);
                    const valB = Number(empBData.behavioralScore?.[cat.key] || 0);

                    return (
                      <div key={cat.key} className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                          <span className={winner === 'A' ? 'text-primary' : ''}>{valA.toFixed(1)}</span>
                          <span>{cat.label}</span>
                          <span className={winner === 'B' ? 'text-amber-500' : ''}>{valB.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-primary transition-all duration-1000" 
                              style={{ width: `${(valA / (valA + valB || 1)) * 100}%` }}
                            />
                            <div 
                              className="h-full bg-amber-500 transition-all duration-1000 border-l border-slate-950" 
                              style={{ width: `${(valB / (valA + valB || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verdict Card */}
              <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 opacity-50" />
                <div className="relative">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Kesimpulan Manajerial</h4>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {(() => {
                      let winsA = 0;
                      let winsB = 0;
                      let biggestGap = { label: "", val: 0, winner: "" };
                      
                      categories.forEach(cat => {
                        const vA = Number(empAData.behavioralScore?.[cat.key] || 0);
                        const vB = Number(empBData.behavioralScore?.[cat.key] || 0);
                        const gap = Math.abs(vA - vB);
                        if (vA > vB) {
                          winsA++;
                          if (gap > biggestGap.val) biggestGap = { label: cat.label, val: gap, winner: "A" };
                        } else if (vB > vA) {
                          winsB++;
                          if (gap > biggestGap.val) biggestGap = { label: cat.label, val: gap, winner: "B" };
                        }
                      });

                      if (winsA > winsB) {
                        return `${empAData.name} menunjukkan performa lebih dominan dengan unggul di ${winsA} kategori. Keunggulan paling signifikan terlihat pada aspek ${biggestGap.label} (+${biggestGap.val.toFixed(1)}).`;
                      } else if (winsB > winsA) {
                        return `${empBData.name} menunjukkan performa lebih dominan dengan unggul di ${winsB} kategori. Keunggulan paling signifikan terlihat pada aspek ${biggestGap.label} (+${biggestGap.val.toFixed(1)}).`;
                      } else {
                        return `Hasil perbandingan menunjukkan skor yang sangat kompetitif dan seimbang antara ${empAData.name} dan ${empBData.name}.`;
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-medium">Siap Membandingkan?</h2>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">Pilih dua karyawan di atas untuk melihat perbandingan statistik kompetensi mereka.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
