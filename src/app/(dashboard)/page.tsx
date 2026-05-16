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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: employees } = useSWR<any[]>("/api/employees", fetcher);
  const { data: projects } = useSWR<any[]>("/api/projects", fetcher);
  const { data: assessments } = useSWR<any[]>("/api/assessments", fetcher);

  // ── KPI: Karyawan Aktif ────────────────────────────────────────────────
  const totalEmployees = employees
    ? employees.filter((e) => e.status === "active").length
    : 0;

  // ── KPI: Proyek Aktif ─────────────────────────────────────────────────
  const activeProjects = projects
    ? projects.filter((p) => p.status === "active").length
    : 0;

  // ── KPI: Assessment Pending ──────────────────────────────────────────
  // Hitung karyawan aktif yang belum memiliki semua tipe assessment (self, peer, supervisor)
  // dalam periode apapun yang aktif. Jika totalAssessments < 3, dianggap pending.
  const REQUIRED_ASSESSMENT_TYPES = 3; // self + peer + supervisor (minimal)
  const pendingAssessments = assessments
    ? assessments.filter(
        (emp: any) =>
          emp.status === "active" &&
          (emp.totalAssessments ?? 0) < REQUIRED_ASSESSMENT_TYPES
      ).length
    : 0;

  // ── KPI: Rata-rata Skor Organisasi ────────────────────────────────────
  const activeScores =
    employees
      ?.filter((e) => e.behavioralScore)
      .map((e) => Number(e.behavioralScore.finalBehaviorScore)) || [];
  const avgOrgScore =
    activeScores.length > 0
      ? activeScores.reduce((a, b) => a + b, 0) / activeScores.length
      : 0;

  // ── Top 5 Karyawan berdasarkan Skor Perilaku ──────────────────────────
  const topEmployees = employees
    ? [...employees]
        .filter((e) => e.behavioralScore)
        .sort(
          (a, b) =>
            Number(b.behavioralScore.finalBehaviorScore) -
            Number(a.behavioralScore.finalBehaviorScore)
        )
        .slice(0, 5)
    : [];

  // ── Bar Chart: Data Skor per Dimensi ─────────────────────────────────
  const behaviorChartData = employees
    ? employees
        .filter((e) => e.behavioralScore)
        .slice(0, 8)
        .map((e) => ({
          name: e.name.split(" ")[0],
          Emosional: Number(e.behavioralScore.avgEmotionalStability),
          Komunikasi: Number(e.behavioralScore.avgCommunication),
          "Kerja Tim": Number(e.behavioralScore.avgTeamwork),
          Adaptasi: Number(e.behavioralScore.avgAdaptability),
        }))
    : [];

  // ── Radar Chart: Rata-rata Organisasi ────────────────────────────────
  const getAvg = (key: string) => {
    const scores =
      employees
        ?.filter((e) => e.behavioralScore)
        .map((e) => Number(e.behavioralScore[key])) || [];
    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  };

  const radarData = [
    {
      subject: "Emosional",
      value: getAvg("avgEmotionalStability"),
      fullMark: 10,
    },
    { subject: "Komunikasi", value: getAvg("avgCommunication"), fullMark: 10 },
    { subject: "Kerja Tim", value: getAvg("avgTeamwork"), fullMark: 10 },
    { subject: "Adaptasi", value: getAvg("avgAdaptability"), fullMark: 10 },
    { subject: "Final Score", value: avgOrgScore, fullMark: 10 },
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

      {/* KPI Cards – tanpa nilai trend statis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Karyawan Aktif"
          value={totalEmployees}
          icon={Users}
          delay={0}
        />
        <KpiCard
          title="Proyek Aktif"
          value={activeProjects}
          icon={FolderKanban}
          delay={0.1}
        />
        <KpiCard
          title="Karyawan Belum Dinilai"
          value={pendingAssessments}
          icon={ClipboardCheck}
          delay={0.2}
        />
        <KpiCard
          title="Rata-rata Skor Organisasi"
          value={Number(avgOrgScore.toFixed(2))}
          icon={TrendingUp}
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
                  domain={[0, 10]}
                  tick={{ fill: "oklch(0.5 0.02 260)", fontSize: 10 }}
                  axisLine={{ stroke: "oklch(0.3 0.04 260 / 20%)" }}
                />
                <Tooltip
                  cursor={{ fill: "oklch(0.2 0.05 260 / 15%)" }}
                  formatter={(value) => (typeof value === "number" ? value.toFixed(2) : value)}
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

      {/* Top Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass-card rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">
              Karyawan Berperforma Terbaik
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Berdasarkan skor rata-rata perilaku (Soft Factor)
            </p>
          </div>
          <Link
            href="/karyawan"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {topEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
                    Rank
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
                    Karyawan
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
                    Departemen
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Emosional
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Komunikasi
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Kerja Tim
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Adaptasi
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-3">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {topEmployees.map((member: any, i: number) => (
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
                        <Avatar className="w-8 h-8 rounded-full border border-primary/10">
                          <AvatarImage src={member.image || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {member.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/karyawan/${member.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors"
                        >
                          {member.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-muted-foreground">
                      {member.department}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs text-muted-foreground font-mono">
                        {Number(
                          member.behavioralScore.avgEmotionalStability
                        ).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs text-muted-foreground font-mono">
                        {Number(
                          member.behavioralScore.avgCommunication
                        ).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs text-muted-foreground font-mono">
                        {Number(member.behavioralScore.avgTeamwork).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs text-muted-foreground font-mono">
                        {Number(member.behavioralScore.avgAdaptability).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 font-bold text-xs"
                      >
                        {Number(
                          member.behavioralScore.finalBehaviorScore
                        ).toFixed(2)}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
            Belum ada data karyawan dengan skor perilaku lengkap.
          </div>
        )}
      </motion.div>
    </div>
  );
}
