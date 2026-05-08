"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { Plus, Search, Eye, Calendar, Users as UsersIcon, X, Trash2, Sliders, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus } from "@/lib/types";

const statusConfig: Record<
  ProjectStatus,
  { label: string; class: string }
> = {
  draft: {
    label: "Draft",
    class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  },
  active: {
    label: "Aktif",
    class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  completed: {
    label: "Selesai",
    class: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProyekPage() {
  const { mutate } = useSWRConfig();
  const { data: projects, isLoading } = useSWR<any[]>("/api/projects", fetcher);
  const { data: skills } = useSWR<any[]>("/api/skills", fetcher);
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(3);
  const [weights, setWeights] = useState([60]); // Hard skill weight, soft factor is 100 - this
  const [selectedRequirements, setSelectedRequirements] = useState<any[]>([]);
  
  // Temporary requirement selection
  const [currentSkillId, setCurrentSkillId] = useState("");
  const [currentLevel, setCurrentLevel] = useState(3);
  const [skillSearch, setSkillSearch] = useState("");

  const filtered = projects
    ? projects.filter((p) =>
        p.projectName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleAddRequirement = () => {
    if (!currentSkillId) return;
    const skill = skills?.find((s) => s.id.toString() === currentSkillId);
    if (!skill) return;

    if (selectedRequirements.find((r) => r.skillId === skill.id)) return;

    setSelectedRequirements([
      ...selectedRequirements,
      { skillId: skill.id, skillName: skill.skillName, requiredLevel: currentLevel, isMandatory: false },
    ]);
    setCurrentSkillId("");
    setCurrentLevel(3);
  };

  const removeRequirement = (id: number) => {
    setSelectedRequirements(selectedRequirements.filter((r) => r.skillId !== id));
  };

  const handleSubmit = async () => {
    if (!projectName) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          description,
          teamSize,
          hardSkillWeight: weights[0] / 100,
          softFactorWeight: (100 - weights[0]) / 100,
          requirements: selectedRequirements.map((r) => ({
            skillId: r.skillId,
            requiredLevel: r.requiredLevel,
          })),
        }),
      });

      if (res.ok) {
        mutate("/api/projects");
        setIsDialogOpen(false);
        // Reset form
        setProjectName("");
        setDescription("");
        setTeamSize(3);
        setWeights([60]);
        setSelectedRequirements([]);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutate("/api/projects");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Proyek</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola proyek dan kebutuhan tim
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="glow-button text-white rounded-xl h-10 w-fit"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Proyek Baru
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari proyek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-input/30 border-border/30 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
            Memuat data proyek...
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="col-span-full text-center py-24 glass-card rounded-3xl border-dashed bg-slate-900/20"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Proyek Kosong</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">
              Tidak ada proyek yang ditemukan dengan kata kunci pencarian tersebut.
            </p>
          </motion.div>
        ) : (
          filtered.map((project, i) => {
            const reqs = project.requirements || [];
            const sc = statusConfig[project.status as ProjectStatus] || statusConfig.draft;
            const progressValue =
              project.status === "completed"
                ? 100
                : project.status === "active"
                  ? 60
                  : 15;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="secondary" className={`text-[10px] ${sc.class}`}>
                    {sc.label}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="h-8 w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Link href={`/proyek/${project.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                  {project.projectName}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
                  {project.description}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-3.5 h-3.5" />
                      <span>{project.teamSize} Anggota Tim</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(project.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-muted-foreground">Kebutuhan Skill</span>
                      <span className="text-primary">{reqs.length} Skill</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {reqs.slice(0, 3).map((req: any) => (
                        <Badge
                          key={req.id}
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5 bg-accent border-border/30 font-normal"
                        >
                          {req.skillName}
                        </Badge>
                      ))}
                      {reqs.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5 bg-muted/20 text-muted-foreground font-normal"
                        >
                          +{reqs.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border/10">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5 bg-muted/30" />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient">Buat Proyek Baru</DialogTitle>
            <DialogDescription>
              Definisikan kebutuhan proyek dan biarkan DSS membantu Anda merekomendasikan tim terbaik.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Proyek</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Digital Transformation 2024"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-input/30 border-border/30 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea
                  id="desc"
                  placeholder="Jelaskan tujuan dan cakupan proyek..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-input/30 border-border/30 rounded-xl min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Size */}
              <div className="space-y-4">
                <Label className="flex justify-between items-center">
                  <span className="text-sm font-medium">Jumlah Anggota Tim</span>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
                    {teamSize || 0} Orang
                  </span>
                </Label>
                <div className="px-2">
                  <Slider
                    value={[teamSize]}
                    onValueChange={(v) => {
                      const val = Array.isArray(v) ? v[0] : v;
                      setTeamSize(val);
                    }}
                    max={10}
                    min={1}
                    step={1}
                  />
                </div>
              </div>

              {/* Weighting */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Bobot Kriteria</Label>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    <Sliders className="w-3 h-3" />
                    <span>Geser prioritas</span>
                  </div>
                </div>
                <div className="space-y-4 pt-1 px-2">
                  <Slider
                    value={weights}
                    onValueChange={(v) => {
                      const val = Array.isArray(v) ? v : [v];
                      setWeights(val);
                    }}
                    max={90}
                    min={10}
                    step={5}
                  />
                  <div className="flex justify-between text-[11px] font-semibold">
                    <div className="flex flex-col items-start gap-1 p-2 rounded-lg bg-primary/5 border border-primary/10 min-w-[80px]">
                      <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Hard Skill</span>
                      <span className="text-primary text-base">{weights[0] || 0}%</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 min-w-[80px]">
                      <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Soft Factor</span>
                      <span className="text-blue-400 text-base">{100 - (weights[0] || 0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            <div className="space-y-4 pt-4 border-t border-border/10">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Kebutuhan Skill</Label>
                <div className="text-[10px] text-muted-foreground bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                  {selectedRequirements.length} Skill Terpilih
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search & Select Skill */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">1. Cari Skill</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Ketik skill (mis: Leadership)..."
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        className="pl-10 bg-input/30 border-border/30 rounded-xl h-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto pr-2 space-y-4 rounded-xl border border-border/10 p-2 bg-slate-950/20 custom-scrollbar">
                    {/* Hard Skills Group */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-primary uppercase tracking-widest px-2 mb-1">Hard Skills</p>
                      {skills?.filter(s => s.category === "hard" && s.skillName.toLowerCase().includes(skillSearch.toLowerCase())).map((skill: any) => (
                        <button
                          key={skill.id}
                          onClick={() => setCurrentSkillId(skill.id.toString())}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                            currentSkillId === skill.id.toString()
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "hover:bg-primary/10 text-muted-foreground"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${currentSkillId === skill.id.toString() ? "bg-white" : "bg-primary"}`} />
                          {skill.skillName}
                        </button>
                      ))}
                    </div>

                    <Separator className="bg-border/10" />

                    {/* Soft Skills Group */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest px-2 mb-1">Soft Skills</p>
                      {skills?.filter(s => s.category === "soft" && s.skillName.toLowerCase().includes(skillSearch.toLowerCase())).map((skill: any) => (
                        <button
                          key={skill.id}
                          onClick={() => setCurrentSkillId(skill.id.toString())}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                            currentSkillId === skill.id.toString()
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "hover:bg-blue-400/10 text-muted-foreground"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${currentSkillId === skill.id.toString() ? "bg-white" : "bg-blue-400"}`} />
                          {skill.skillName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Level & Add Action */}
                <div className="space-y-3 flex flex-col justify-end">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">2. Level Minimum</Label>
                    <Select 
                      value={currentLevel.toString()} 
                      onValueChange={(v) => v && setCurrentLevel(parseInt(v))}
                    >
                      <SelectTrigger className="bg-input/30 border-border/30 rounded-xl h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border/30">
                        {[1, 2, 3, 4, 5].map((l) => (
                          <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={() => {
                      handleAddRequirement();
                      setSkillSearch(""); // Clear search after adding
                    }}
                    disabled={!currentSkillId}
                    className="w-full rounded-xl h-10 bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30 gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tambahkan Skill
                  </Button>

                  <div className="flex-1 bg-primary/5 rounded-2xl border border-dashed border-primary/20 p-4 flex flex-col items-center justify-center text-center">
                    {currentSkillId ? (
                      <>
                        <p className="text-[10px] text-primary uppercase font-bold mb-1">Siap Ditambahkan</p>
                        <p className="text-sm font-semibold">{skills?.find(s => s.id.toString() === currentSkillId)?.skillName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Level {currentLevel}</p>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-primary/30 mb-2" />
                        <p className="text-[10px] text-muted-foreground">Pilih skill dari daftar sebelah kiri</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Reqs List */}
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {selectedRequirements.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-border/20 rounded-2xl text-xs text-muted-foreground">
                      Belum ada skill yang ditambahkan.
                    </div>
                  ) : (
                    selectedRequirements.map((req) => (
                      <motion.div
                        key={req.skillId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-xs font-bold text-primary border border-border/20">
                            L{req.requiredLevel}
                          </div>
                          <span className="text-sm font-medium">{req.skillName}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement(req.skillId)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/10">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl h-11"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !projectName || selectedRequirements.length === 0}
              className="glow-button text-white rounded-xl h-11 px-8 min-w-[140px]"
            >
              {isSubmitting ? "Menyimpan..." : "Buat Proyek"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
