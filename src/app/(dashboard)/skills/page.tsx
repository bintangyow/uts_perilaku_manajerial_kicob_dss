"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Plus, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SkillsPage() {
  const { data: skills, mutate, isLoading } = useSWR<any[]>("/api/skills", fetcher);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = skills
    ? skills.filter((s) => {
        const matchSearch = s.skillName.toLowerCase().includes(search.toLowerCase());
        const mappedFilter =
          categoryFilter === "Hard Skill" ? "hard" : categoryFilter === "Soft Skill" ? "soft" : "all";
        const matchCat = categoryFilter === "Semua Kategori" || s.category === mappedFilter;
        return matchSearch && matchCat;
      })
    : [];

  const handleAddSkill = async () => {
    if (!formName || !formCategory) return;
    setIsSubmitting(true);

    await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillName: formName,
        category: formCategory === "Hard Skill" ? "hard" : "soft",
      }),
    });

    await mutate();

    setFormName("");
    setFormCategory("");
    setIsSubmitting(false);
    setDialogOpen(false);
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm("Yakin ingin menghapus skill ini?")) return;
    
    await fetch(`/api/skills/${id}`, {
      method: "DELETE",
    });
    await mutate();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar skill dan kompetensi
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="glow-button text-white rounded-xl h-10 w-fit" />
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Skill
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm bg-[oklch(0.14_0.04_260)] border-border/30">
            <DialogHeader>
              <DialogTitle>Tambah Skill Baru</DialogTitle>
              <DialogDescription>
                Tambahkan skill baru ke dalam database kompetensi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Nama Skill</Label>
                <Input
                  id="skill-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: ReactJS"
                  className="bg-input/30 border-border/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={formCategory}
                  onValueChange={(v) => v && setFormCategory(v)}
                >
                  <SelectTrigger className="h-10 bg-input/30 border-border/30 rounded-xl">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent className="border-border/30">
                    <SelectItem value="Hard Skill">Hard Skill</SelectItem>
                    <SelectItem value="Soft Skill">Soft Skill</SelectItem>
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
                  disabled={!formName || !formCategory || isSubmitting}
                  className="flex-1 glow-button text-white rounded-xl font-semibold"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Skill"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-input/30 border-border/30 rounded-xl"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-input/30 border-border/30 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent className="border-border/30">
            <SelectItem value="Semua Kategori">Semua Kategori</SelectItem>
            <SelectItem value="Hard Skill">Hard Skill</SelectItem>
            <SelectItem value="Soft Skill">Soft Skill</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl overflow-hidden min-h-[400px]"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Nama Skill</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Kategori</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((skill, i) => (
                  <motion.tr
                    key={skill.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/10 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-sm">
                      {skill.skillName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          skill.category === "hard"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                            : "bg-purple-500/15 text-purple-400 border-purple-500/20"
                        }`}
                      >
                        {skill.category === "hard" ? "Hard Skill" : "Soft Skill"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Tidak ada skill yang cocok dengan pencarian.
          </div>
        )}
      </motion.div>
    </div>
  );
}
