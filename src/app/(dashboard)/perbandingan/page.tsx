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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 */}
        <div className="glass-card rounded-3xl p-6 border-primary/20 bg-primary/5">
          <label className="text-xs font-bold text-primary uppercase tracking-widest mb-4 block">Karyawan A (Biru)</label>
          <Select onValueChange={(val) => setEmpAId(val || "")} value={empAId}>
            <SelectTrigger className="h-14 bg-[#0f172a] border-slate-800 rounded-2xl text-lg">
              <SelectValue>
                {empAData ? (
                  <div className="text-sm font-bold">{empAData.name}</div>
                ) : (
                  "Pilih Karyawan Pertama..."
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#0f172a] border-slate-800">
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()} disabled={emp.id.toString() === empBId}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Player 2 */}
        <div className="glass-card rounded-3xl p-6 border-amber-500/20 bg-amber-500/5">
          <label className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 block">Karyawan B (Emas)</label>
          <Select onValueChange={(val) => setEmpBId(val || "")} value={empBId}>
            <SelectTrigger className="h-14 bg-[#0f172a] border-slate-800 rounded-2xl text-lg">
              <SelectValue>
                {empBData ? (
                  <div className="text-sm font-bold">{empBData.name}</div>
                ) : (
                  "Pilih Karyawan Kedua..."
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#0f172a] border-slate-800">
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Visual Radar */}
            <div className="lg:col-span-7 glass-card rounded-3xl p-8 flex flex-col items-center">
              <h3 className="font-semibold text-center mb-6">Radar Comparison (Skala 1-10)</h3>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={compareData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar
                      name={empAData.name}
                      dataKey="A"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name={empBData.name}
                      dataKey="B"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.5}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Comparison */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Key Stats Comparison
                </h3>
                <div className="space-y-6">
                  {categories.map((cat) => {
                    const winner = getWinner(cat.key);
                    const valA = Number(empAData.behavioralScore?.[cat.key] || 0).toFixed(1);
                    const valB = Number(empBData.behavioralScore?.[cat.key] || 0).toFixed(1);

                    return (
                      <div key={cat.key} className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase">
                          <span>{cat.label}</span>
                          <span className="text-primary font-bold">
                            {winner === 'A' ? empAData.name : winner === 'B' ? empBData.name : 'Seimbang'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xl font-mono font-bold w-12 text-primary">{valA}</div>
                          <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-primary transition-all duration-1000" 
                              style={{ width: `${(Number(valA) / (Number(valA) + Number(valB) || 1)) * 100}%` }}
                            />
                            <div 
                              className="h-full bg-amber-500 transition-all duration-1000 border-l border-slate-900" 
                              style={{ width: `${(Number(valB) / (Number(valA) + Number(valB) || 1)) * 100}%` }}
                            />
                          </div>
                          <div className="text-xl font-mono font-bold w-12 text-right text-amber-500">{valB}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verdict Card */}
              <div className="bg-gradient-to-br from-primary/20 to-amber-500/20 border border-white/10 rounded-3xl p-6">
                <h4 className="text-center font-bold text-white mb-2 uppercase tracking-tighter">Kesimpulan Manajerial</h4>
                <p className="text-sm text-center text-slate-300">
                  {Number(empAData.behavioralScore?.finalBehaviorScore) > Number(empBData.behavioralScore?.finalBehaviorScore) 
                    ? `${empAData.name} memiliki profil perilaku yang lebih unggul secara keseluruhan dibandingkan ${empBData.name}.`
                    : `${empBData.name} memiliki profil perilaku yang lebih unggul secara keseluruhan dibandingkan ${empAData.name}.`
                  }
                </p>
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
