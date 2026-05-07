"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import useSWR from "swr";
import { Plus, Search, Filter, Mail, Building2, UserCircle, Trash2, ArrowRight, Eye, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
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
  const { currentUser } = useAuth();
  const { data: employees, mutate, isLoading } = useSWR<any[]>("/api/employees", fetcher);
  const { data: users } = useSWR<any[]>("/api/users", fetcher);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Semua Departemen");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formUserId, setFormUserId] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formJobLevel, setFormJobLevel] = useState("1");
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter users who are not yet employees
  const availableUsers = users?.filter(u => 
    !employees?.some(e => e.userId === u.id)
  ) || [];

  const departments = employees 
    ? [...new Set(employees.map((e) => e.department))]
    : [];

  const filtered = employees
    ? employees.filter((emp) => {
        const matchSearch =
          (emp.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
          emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
          emp.position.toLowerCase().includes(search.toLowerCase());
        const matchDept =
          deptFilter === "Semua Departemen" || emp.department === deptFilter;
        return matchSearch && matchDept;
      })
    : [];

  const handleAddEmployee = async () => {
    if (!formUserId || !formDept || !formPosition) return;
    setIsSubmitting(true);

    const newCode = `EMP${String((employees?.length || 0) + 1).padStart(3, "0")}`;

    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: formUserId,
        employeeCode: newCode,
        department: formDept,
        position: formPosition,
        jobLevel: formJobLevel,
        status: "active",
      }),
    });

    await mutate();
    
    setFormUserId("");
    setFormDept("");
    setFormPosition("");
    setIsSubmitting(false);
    setDialogOpen(false);
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Yakin ingin menghapus karyawan ini? Data assessment terkait juga akan terhapus.")) return;
    
    try {
      await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      await mutate();
    } catch (error) {
      console.error("Gagal menghapus karyawan:", error);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmp) return;
    setIsSubmitting(true);
    
    try {
      await fetch(`/api/employees/${editingEmp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: formDept,
          position: formPosition,
          jobLevel: Number(formJobLevel),
        }),
      });
      await mutate();
      setEditingEmp(null);
    } catch (error) {
      console.error("Gagal update karyawan:", error);
    } finally {
      setIsSubmitting(false);
    }
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

        {(currentUser?.role === "admin" || currentUser?.role === "hr") && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="glow-button text-white rounded-xl h-10 px-4 flex items-center justify-center w-fit">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Karyawan
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[oklch(0.14_0.04_260)] border-border/30">
              <DialogHeader>
                <DialogTitle>Tambah Karyawan Baru</DialogTitle>
                <DialogDescription>
                  Pilih akun user untuk dijadikan profil karyawan.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Pilih User / Akun</Label>
                  <Select value={formUserId} onValueChange={(v) => v && setFormUserId(v)}>
                    <SelectTrigger className="bg-input/30 border-border/30 rounded-xl h-12">
                      <SelectValue placeholder="Pilih user yang terdaftar">
                        {formUserId ? availableUsers.find(u => u.id === formUserId)?.name : "Pilih user yang terdaftar"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)]">
                      {availableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {availableUsers.length === 0 && (
                        <div className="p-2 text-xs text-center text-muted-foreground">
                          Semua user sudah menjadi karyawan
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Departemen</Label>
                  <Select value={formDept} onValueChange={(v) => v && setFormDept(v)}>
                    <SelectTrigger className="bg-input/30 border-border/30 rounded-xl h-12">
                      <SelectValue placeholder="Pilih Departemen" />
                    </SelectTrigger>
                    <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)]">
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
                    className="bg-input/30 border-border/30 rounded-xl h-12"
                  />
                </div>
                  <div className="space-y-2">
                    <Label>Level Jabatan</Label>
                    <Select value={formJobLevel} onValueChange={(v) => v && setFormJobLevel(v)}>
                      <SelectTrigger className="bg-input/30 border-border/30 rounded-xl h-12 w-full text-left">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)] min-w-[240px]">
                        <SelectItem value="1" className="py-2.5">Level 1 (Staff)</SelectItem>
                        <SelectItem value="2" className="py-2.5">Level 2 (Supervisor)</SelectItem>
                        <SelectItem value="3" className="py-2.5">Level 3 (Manager)</SelectItem>
                        <SelectItem value="4" className="py-2.5">Level 4 (Director/Owner)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="flex gap-3 pt-2">
                  <DialogClose className="rounded-xl border border-border/30 h-12 px-6 hover:bg-white/5 transition-colors text-sm font-medium">
                    Batal
                  </DialogClose>
                  <Button
                    onClick={handleAddEmployee}
                    disabled={!formUserId || !formDept || !formPosition || !formJobLevel || isSubmitting}
                    className="flex-1 glow-button text-white rounded-xl font-semibold h-12"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
          <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)]">
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
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full mr-3"
            />
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
                          <p className="font-medium text-sm">{emp.name || "Unknown User"}</p>
                          <p className="text-xs text-muted-foreground">{emp.email || "no-email@kicob.id"}</p>
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
                          {Number(emp.behavioralScore.finalBehaviorScore).toFixed(2)}
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
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {(currentUser?.role === "admin" || currentUser?.role === "hr") && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingEmp(emp);
                              setFormDept(emp.department);
                              setFormPosition(emp.position);
                              setFormJobLevel(String(emp.jobLevel));
                            }}
                            className="text-amber-400 hover:bg-amber-500/10 h-8 w-8 p-0 ml-1"
                          >
                            <UserCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-3">
             <User className="w-8 h-8 opacity-20" />
             Tidak ada karyawan yang cocok dengan pencarian.
          </div>
        )}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEmp} onOpenChange={(open) => !open && setEditingEmp(null)}>
        <DialogContent className="sm:max-w-md bg-[oklch(0.14_0.04_260)] border-border/30">
          <DialogHeader>
            <DialogTitle>Edit Profil Karyawan</DialogTitle>
            <DialogDescription>
              Ubah informasi departemen, posisi, atau level hirarki.
            </DialogDescription>
          </DialogHeader>
          {editingEmp && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border/20">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {editingEmp.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{editingEmp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{editingEmp.employeeCode}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select value={formDept} onValueChange={(v) => v && setFormDept(v)}>
                  <SelectTrigger className="bg-input/30 border-border/30 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)]">
                    {["IT Ops", "Engineering", "Marketing", "HR", "Sales", "Finance", "Legal"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-pos">Posisi</Label>
                <Input
                  id="edit-pos"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  className="bg-input/30 border-border/30 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Level Jabatan</Label>
                <Select value={formJobLevel} onValueChange={(v) => v && setFormJobLevel(v)}>
                  <SelectTrigger className="bg-input/30 border-border/30 rounded-xl h-12 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border/30 bg-[oklch(0.16_0.04_260)] min-w-[240px]">
                    <SelectItem value="1" className="py-2.5">Level 1 (Staff)</SelectItem>
                    <SelectItem value="2" className="py-2.5">Level 2 (Supervisor)</SelectItem>
                    <SelectItem value="3" className="py-2.5">Level 3 (Manager)</SelectItem>
                    <SelectItem value="4" className="py-2.5">Level 4 (Director/Owner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <DialogClose className="rounded-xl border border-border/30 h-12 px-6 hover:bg-white/5 transition-colors text-sm font-medium flex-1">
                  Batal
                </DialogClose>
                <Button
                  onClick={handleUpdateEmployee}
                  disabled={isSubmitting}
                  className="flex-[2] glow-button text-white rounded-xl font-semibold h-12"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
