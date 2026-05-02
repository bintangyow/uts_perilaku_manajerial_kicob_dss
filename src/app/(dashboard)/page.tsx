"use client";

import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Users,
  FolderKanban,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KpiCard } from "@/components/kpi-card";
import { SkillRadarChart } from "@/components/skill-radar-chart";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: employees } = useSWR<any[]>("/api/employees", fetcher);
  const { data: projects } = useSWR<any[]>("/api/projects", fetcher);
  const { data: recommendations } = useSWR<any[]>("/api/recommendations", fetcher);
  const { data: assessments } = useSWR<any[]>("/api/assessments", fetcher);

  // Stats
  const totalEmployees = employees ? employees.filter((e) => e.status === "active").length : 0;
  const activeProjects = projects ? projects.filter((p) => p.status === "active").length : 0;
  
  // Pending assessments: employees with no assessments yet
  const pendingAssessments = assessments ? assessments.filter((a: any) => a.totalAssessments === 0).length : 0; 

  const bestRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;
  const avgTeamScore = bestRec ? bestRec.totalScore : 0;
  const topCandidates = bestRec ? bestRec.members.slice(0, 5) : [];

  // Behavioral chart data
  const behaviorChartData = employees
    ? employees
        .filter((e) => e.behavioralScore)
        .slice(0, 8)
        .map((e) => ({
          name: e.name.split(" ")[0],
          "Emosional": e.behavioralScore.avgEmotionalStability,
          "Komunikasi": e.behavioralScore.avgCommunication,
          "Kerja Tim": e.behavioralScore.avgTeamwork,
          "Adaptasi": e.behavioralScore.avgAdaptability,
        }))
    : [];

  // Use team skills if available, otherwise fallback to global average
  const radarData = bestRec && bestRec.members.length > 0 
    ? [
        { subject: "Hard Skill", value: (bestRec.members.reduce((s: any, m: any) => s + (m.hardSkillScore || 0), 0) / bestRec.members.length) / 20, fullMark: 5 },
        { subject: "Soft Factor", value: (bestRec.members.reduce((s: any, m: any) => s + (m.softFactorScore || 0), 0) / bestRec.members.length) / 20, fullMark: 5 },
        { subject: "Emosional", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgEmotionalStability || 0), 0) / (employees?.length || 1)), fullMark: 5 },
        { subject: "Komunikasi", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgCommunication || 0), 0) / (employees?.length || 1)), fullMark: 5 },
        { subject: "Kerja Tim", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgTeamwork || 0), 0) / (employees?.length || 1)), fullMark: 5 },
        { subject: "Adaptasi", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgAdaptability || 0), 0) / (employees?.length || 1)), fullMark: 5 },
      ]
    : [
        { subject: "Hard Skill", value: 0, fullMark: 5 },
        { subject: "Soft Factor", value: 0, fullMark: 5 },
        { subject: "Emosional", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgEmotionalStability || 0), 0) / (employees?.length || 1)) || 0, fullMark: 5 },
        { subject: "Komunikasi", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgCommunication || 0), 0) / (employees?.length || 1)) || 0, fullMark: 5 },
        { subject: "Kerja Tim", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgTeamwork || 0), 0) / (employees?.length || 1)) || 0, fullMark: 5 },
        { subject: "Adaptasi", value: (employees?.reduce((s, e) => s + (e.behavioralScore?.avgAdaptability || 0), 0) / (employees?.length || 1)) || 0, fullMark: 5 },
      ];
  

  return (
    <div className="space-y-6">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan data karyawan, proyek, dan rekomendasi tim
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Karyawan Aktif"
          value={totalEmployees}
          icon={Users}
          trend={{ value: 5, label: "bulan ini" }}
          delay={0}
        />
        <KpiCard
          title="Proyek Aktif"
          value={activeProjects}
          icon={FolderKanban}
          trend={{ value: 12, label: "bulan ini" }}
          delay={0.1}
        />
        <KpiCard
          title="Assessment Pending"
          value={pendingAssessments}
          icon={ClipboardCheck}
          delay={0.2}
        />
        <KpiCard
          title="Rata-rata Skor Tim"
          value={avgTeamScore}
          icon={TrendingUp}
          trend={{ value: 3.2, label: "vs bulan lalu" }}
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart — Behavioral Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-base font-semibold mb-4">
            Skor Perilaku Karyawan
          </h3>
          {behaviorChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={behaviorChartData} barGap={2} barSize={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.3 0.04 260 / 30%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 11 }}
                  axisLine={{ stroke: "oklch(0.3 0.04 260 / 20%)" }}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fill: "oklch(0.5 0.02 260)", fontSize: 10 }}
                  axisLine={{ stroke: "oklch(0.3 0.04 260 / 20%)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.16 0.04 260 / 90%)",
                    border: "1px solid oklch(0.4 0.08 260 / 30%)",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                    color: "oklch(0.9 0.01 260)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="Emosional"
                  fill="oklch(0.6 0.2 250)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Komunikasi"
                  fill="oklch(0.55 0.18 270)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Kerja Tim"
                  fill="oklch(0.5 0.15 230)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Adaptasi"
                  fill="oklch(0.65 0.12 210)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
              Belum ada data skor perilaku karyawan.
            </div>
          )}
        </motion.div>

        {/* Radar Chart — Team Skill Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-base font-semibold mb-4">
            Perbandingan Skill Tim
          </h3>
          <SkillRadarChart
            data={radarData}
            primaryLabel="Rata-rata Tim/Karyawan"
            height={280}
          />
        </motion.div>
      </div>

      {/* Recommendation Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">
              Rekomendasi Tim Teratas
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Berdasarkan history rekomendasi proyek
            </p>
          </div>
          <Link
            href="/rekomendasi"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {topCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
                    #
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
                    Karyawan
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
                    Posisi
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Hard Skill
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Soft Factor
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {topCandidates.map((member: any, i: number) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="border-b border-border/10 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                          {member.employeeName?.charAt(0) || "U"}
                        </div>
                        <span className="font-medium text-sm">
                          {member.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">
                      {member.employeePosition}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant="secondary"
                        className="bg-chart-1/15 text-chart-1 border-chart-1/20 font-mono text-xs"
                      >
                        {member.hardSkillScore?.toFixed(1) || "-"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant="secondary"
                        className="bg-chart-2/15 text-chart-2 border-chart-2/20 font-mono text-xs"
                      >
                        {member.softFactorScore?.toFixed(1) || "-"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-sm font-bold text-gradient">
                        {member.contributionScore?.toFixed(1) || "-"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
            Belum ada rekomendasi tim yang pernah di-generate.
          </div>
        )}
      </motion.div>
    </div>
  );
}
