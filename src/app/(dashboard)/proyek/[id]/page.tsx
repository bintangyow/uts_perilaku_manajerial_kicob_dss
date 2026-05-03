"use client";

import { use } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import useSWR, { useSWRConfig } from "swr";
import {
  ArrowLeft,
  Sparkles,
  Settings2,
  CheckCircle2,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
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
  const { data: project, isLoading } = useSWR<any>(`/api/projects/${id}`, fetcher);

  const { mutate } = useSWRConfig();
  const [isCompleting, setIsCompleting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Memuat data proyek...</p>
      </div>
    );
  }

  if (!project || project.error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Proyek tidak ditemukan.</p>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!confirm("Apakah Anda yakin ingin menyelesaikan proyek ini?")) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (res.ok) {
        mutate(`/api/projects/${id}`);
      }
    } catch (e) {
      console.error("Failed to complete project:", e);
    } finally {
      setIsCompleting(false);
    }
  };

  const sc = statusConfig[project.status as ProjectStatus] || statusConfig.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/proyek">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.projectName}</h1>
            <Badge variant="secondary" className={`text-xs ${sc.class}`}>
              {sc.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {project.description}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Project Info & Config */}
        <div className="space-y-6">
          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
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
                  <span className="text-muted-foreground">Bobot Hard Skill</span>
                  <span className="font-semibold text-chart-1">
                    {(project.hardSkillWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[project.hardSkillWeight * 100]}
                  max={100}
                  step={5}
                  className="cursor-pointer"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bobot Soft Factor</span>
                  <span className="font-semibold text-chart-2">
                    {(project.softFactorWeight * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[project.softFactorWeight * 100]}
                  max={100}
                  step={5}
                  className="cursor-pointer"
                  disabled
                />
              </div>

              <Separator className="bg-border/20" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dibuat</span>
                <span>{new Date(project.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </motion.div>

          {/* Required Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold mb-4">Skill yang Dibutuhkan</h3>
            <div className="space-y-2">
              {project.requirements && project.requirements.length > 0 ? (
                project.requirements.map((req: any) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/10"
                  >
                    <div className="flex items-center gap-2">
                      {req.isMandatory ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                      <span className="text-sm font-medium">
                        {req.skillName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Min Level
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border-primary/20 font-mono"
                      >
                        {req.requiredLevel}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada skill yang ditambahkan.</p>
              )}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {project.status === "draft" ? (
              <Link href={`/rekomendasi?project=${project.id}`}>
                <Button className="w-full h-12 glow-button text-white rounded-xl font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Rekomendasi Tim
                </Button>
              </Link>
            ) : project.status === "active" ? (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold"
              >
                {isCompleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Selesaikan Proyek
              </Button>
            ) : (
              <Button
                disabled
                className="w-full h-12 bg-muted text-muted-foreground rounded-xl font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Proyek Selesai
              </Button>
            )}
          </motion.div>
        </div>

        {/* Right — Team Candidates */}
        <div className="lg:col-span-2 space-y-6">
          {project.teamCandidates && project.teamCandidates.length > 0 ? (
            project.teamCandidates.map((candidate: any, ci: number) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + ci * 0.1 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary text-sm font-bold flex items-center justify-center">
                      #{candidate.ranking}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {project.status === "active" || project.status === "completed" 
                          ? "Tim Proyek Resmi" 
                          : `Alternatif Tim ${candidate.ranking}`}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(candidate.generatedAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Skor Total</p>
                    <p className="text-lg font-bold text-gradient">
                      {candidate.totalScore.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="text-left text-xs font-medium text-muted-foreground py-2 px-3">
                          Anggota
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-2 px-3">
                          Posisi
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">
                          Hard Skill
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">
                          Soft Factor
                        </th>
                        <th className="text-center text-xs font-medium text-muted-foreground py-2 px-3">
                          Kontribusi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidate.members.map((m: any) => (
                        <tr
                          key={m.id}
                          className="border-b border-border/10 hover:bg-accent/5"
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                {m.employeeName?.charAt(0) || "U"}
                              </div>
                              <span className="text-sm font-medium">
                                {m.employeeName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-muted-foreground">
                            {m.employeePosition}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-chart-1/15 text-chart-1 border-chart-1/20 font-mono"
                            >
                              {m.hardSkillScore?.toFixed(1) || "-"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-chart-2/15 text-chart-2 border-chart-2/20 font-mono"
                            >
                              {m.softFactorScore?.toFixed(1) || "-"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-sm font-semibold text-gradient">
                              {m.contributionScore?.toFixed(1) || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Belum ada tim yang disetujui untuk proyek ini.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Silakan buka halaman &ldquo;Rekomendasi&rdquo; untuk menyetujui salah satu alternatif tim.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
