"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import useSWR from "swr";
import { Search, Filter, Plus, Eye } from "lucide-react";
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

export default function KaryawanPage() {
  const { data: employees, mutate, isLoading } = useSWR<any[]>("/api/employees", fetcher);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Semua Departemen");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = employees 
    ? [...new Set(employees.map((e) => e.department))]
    : [];

  const filtered = employees
    ? employees.filter((emp) => {
        const matchSearch =
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
          emp.position.toLowerCase().includes(search.toLowerCase());
        const matchDept =
          deptFilter === "Semua Departemen" || emp.department === deptFilter;
        return matchSearch && matchDept;
      })
    : [];

  const handleAddEmployee = async () => {
    if (!formName || !formEmail || !formDept || !formPosition) return;
    setIsSubmitting(true);

    const newCode = `EMP${String((employees?.length || 0) + 1).padStart(3, "0")}`;

    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName,
        email: formEmail,
        employeeCode: newCode,
        department: formDept,
        position: formPosition,
        status: "active",
      }),
    });

    await mutate();
    
    setFormName("");
    setFormEmail("");
    setFormDept("");
    setFormPosition("");
    setIsSubmitting(false);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Karyawan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data karyawan dan profil kompetensi
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="glow-button text-white rounded-xl h-10 w-fit" />
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[oklch(0.14_0.04_260)] border-border/30">
            <DialogHeader>
              <DialogTitle>Tambah Karyawan Baru</DialogTitle>
              <DialogDescription>
                Isi data karyawan untuk mendaftarkan ke sistem.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="emp-name">Nama Lengkap</Label>
                <Input
                  id="emp-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky"
                  className="bg-input/30 border-border/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-email">Email</Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ahmad@kicob.co.id"
                  className="bg-input/30 border-border/30 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select value={formDept} onValueChange={(v) => v && setFormDept(v)}>
                  <SelectTrigger className="bg-input/30 border-border/30 rounded-xl">
                    <SelectValue placeholder="Pilih Departemen" />
                  </SelectTrigger>
                  <SelectContent className="border-border/30">
                    {["IT Ops", "Engineering", "Marketing", "HR", "Sales", "Finance", "Legal"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-pos">Posisi</Label>
                <Input
                  id="emp-pos"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  placeholder="Contoh: Frontend Developer"
                  className="bg-input/30 border-border/30 rounded-xl"
                />
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
                  onClick={handleAddEmployee}
                  disabled={!formName || !formEmail || !formDept || !formPosition || isSubmitting}
                  className="flex-1 glow-button text-white rounded-xl font-semibold"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
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
            placeholder="Cari nama, kode, atau posisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-input/30 border-border/30 rounded-xl"
          />
        </div>
        <Select value={deptFilter} onValueChange={(v) => v && setDeptFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-input/30 border-border/30 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Semua Departemen" />
          </SelectTrigger>
          <SelectContent className="border-border/30">
            <SelectItem value="Semua Departemen">Semua Departemen</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d as string} value={d as string}>
                {d as string}
              </SelectItem>
            ))}
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
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Karyawan</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Kode</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Departemen</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Posisi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Skills</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Skor Perilaku</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/10 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {emp.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-muted-foreground bg-muted/20 px-2 py-0.5 rounded">
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{emp.department}</td>
                    <td className="py-3 px-4 text-sm">{emp.position}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {(emp.skills || []).slice(0, 3).map((s: any) => (
                          <Badge key={s.id} variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-primary/20">
                            {s.skillName} L{s.level}
                          </Badge>
                        ))}
                        {(emp.skills?.length || 0) > 3 && (
                          <Badge variant="secondary" className="text-[10px] h-5 bg-muted/20 text-muted-foreground">
                            +{(emp.skills?.length || 0) - 3}
                          </Badge>
                        )}
                        {(emp.skills?.length || 0) === 0 && (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {emp.behavioralScore ? (
                        <span className="text-sm font-semibold text-gradient">
                          {emp.behavioralScore.finalBehaviorScore.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          emp.status === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/15 text-red-400 border-red-500/20"
                        }`}
                      >
                        {emp.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link href={`/karyawan/${emp.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-lg">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Tidak ada karyawan yang cocok dengan pencarian.
          </div>
        )}
      </motion.div>
    </div>
  );
}
