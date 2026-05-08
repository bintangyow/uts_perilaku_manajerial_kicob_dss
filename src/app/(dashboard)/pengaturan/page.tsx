"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Database,
  Palette,
  ArrowLeft,
  UserCog,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CalendarClock,
  Briefcase,
  Plus,
  X
} from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"main" | "roles" | "database" | "master" | "periods">("main");
  const { data: users, isLoading: usersLoading } = useSWR<any[]>("/api/users", fetcher);
  const { mutate } = useSWRConfig();

  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      mutate("/api/users");
    } catch (e) {
      console.error("Update role failed:", e);
    }
  };

  const handleSystemReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/system/reset", { method: "POST" });
      if (res.ok) {
        alert("Seluruh data operasional berhasil dibersihkan.");
      }
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/system/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_kicob_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 min-h-[60vh]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          {activeTab !== "main" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("main")}
              className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === "main" && "Pengaturan"}
              {activeTab === "roles" && "Manajemen Role"}
              {activeTab === "database" && "Pemeliharaan Database"}
              {activeTab === "master" && "Master Data Struktur"}
              {activeTab === "periods" && "Periode Penilaian"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "main" && "Konfigurasi sistem KiCob"}
              {activeTab === "roles" && "Kelola hak akses dan tanggung jawab pengguna"}
              {activeTab === "database" && "Ekspor data dan pembersihan sistem"}
              {activeTab === "master" && "Kelola Departemen dan Jabatan Organisasi"}
              {activeTab === "periods" && "Atur siklus dan tenggat waktu penilaian"}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <SettingsCard
              icon={Shield}
              title="Manajemen Role"
              desc="Kelola role dan hak akses pengguna"
              status={`${users?.length || 0} akun terdaftar`}
              onClick={() => setActiveTab("roles")}
            />
            <SettingsCard
              icon={Building2}
              title="Master Data"
              desc="Kelola Departemen dan Jabatan"
              status="Struktur Organisasi"
              onClick={() => setActiveTab("master")}
            />
            <SettingsCard
              icon={CalendarClock}
              title="Periode"
              desc="Atur siklus penilaian aktif"
              status="Siklus Penilaian"
              onClick={() => setActiveTab("periods")}
            />
            <SettingsCard
              icon={Database}
              title="Database"
              desc="Ekspor data dan backup"
              status="PostgreSQL Online"
              onClick={() => setActiveTab("database")}
            />
          </motion.div>
        )}

        {activeTab === "roles" && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/20 bg-primary/5">
                    <th className="text-left py-4 px-6 font-semibold">Pengguna</th>
                    <th className="text-left py-4 px-6 font-semibold">Email</th>
                    <th className="text-left py-4 px-6 font-semibold">Role Saat Ini</th>
                    <th className="text-left py-4 px-6 font-semibold">Ganti Akses</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Memuat data pengguna...
                      </td>
                    </tr>
                  ) : (
                    users?.map((user) => (
                      <tr key={user.id} className="border-b border-border/10 hover:bg-accent/5 transition-colors">
                        <td className="py-4 px-6 font-medium">{user.name}</td>
                        <td className="py-4 px-6 text-muted-foreground">{user.email}</td>
                        <td className="py-4 px-6">
                          <Badge variant="secondary" className="capitalize bg-primary/10 text-primary border-primary/20">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Select
                            defaultValue={user.role}
                            onValueChange={(val: string | null) => val && handleUpdateRole(user.id, val)}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs rounded-lg border-border/30">
                              <SelectValue placeholder="Pilih Role">
                                {user.role === 'admin' ? 'Administrator' : 
                                 user.role === 'manager' ? 'Manajer' : 
                                 user.role === 'hr' ? 'HRD' : 'Penilai'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="border-border/30 bg-slate-900 min-w-[150px]">
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="manager">Manajer</SelectItem>
                              <SelectItem value="hr">HRD</SelectItem>
                              <SelectItem value="reviewer">Penilai</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "database" && (
          <motion.div
            key="database"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Ekspor Seluruh Data</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Unduh salinan cadangan seluruh data karyawan, proyek, dan riwayat rekomendasi dalam format teks terstruktur.
              </p>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
                className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                Unduh Backup (.csv)
              </Button>
            </div>

            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-destructive">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-destructive" />
                <h3 className="font-bold text-destructive">Bersihkan Sistem</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Menghapus seluruh proyek, rekomendasi, dan riwayat penilaian. <b>Aksi ini tidak dapat dibatalkan.</b> (Akun pengguna tidak akan dihapus).
              </p>

              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      variant="destructive"
                      className="w-full rounded-xl"
                      disabled={isResetting}
                    />
                  }
                >
                  {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Bersihkan Semua Data
                </DialogTrigger>
                <DialogContent className="bg-slate-950 border-border/30">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Apakah Anda Yakin?
                    </DialogTitle>
                    <DialogDescription>
                      Tindakan ini akan menghapus seluruh data operasional (Proyek, Rekomendasi, Assessment) dari database. Akun pengguna dan master data karyawan tetap aman.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-3 sm:gap-0">
                    <DialogClose render={<Button variant="outline" className="rounded-xl border-border/30" />}>
                      Batal
                    </DialogClose>
                    <Button
                      onClick={handleSystemReset}
                      className="rounded-xl bg-destructive hover:bg-destructive/90 text-white"
                    >
                      Ya, Bersihkan Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        )}

        {activeTab === "master" && <MasterDataContent />}
        {activeTab === "periods" && <PeriodsContent />}
      </AnimatePresence>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, desc, status, onClick, disabled }: any) {
  return (
    <motion.div
      whileHover={!disabled ? { y: -4, scale: 1.02 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`glass-card p-6 rounded-2xl transition-all duration-300 border border-border/10 group ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30 hover:shadow-[0_0_20px_oklch(0.5_0.2_260/10%)]"}`}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-bold text-base mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{desc}</p>
      <div className="flex items-center justify-between mt-auto">
        <Badge variant="secondary" className="text-[10px] px-2 bg-primary/5 text-primary/80 border-primary/10">
          {status}
        </Badge>
        {!disabled && <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
    </motion.div>
  );
}

function MasterDataContent() {
  const { data: departments, mutate: mutateDepts } = useSWR<any[]>("/api/departments", fetcher);
  const { data: positions, mutate: mutatePositions } = useSWR<any[]>("/api/positions", fetcher);

  const [newDept, setNewDept] = useState("");
  const [newPos, setNewPos] = useState("");

  const handleAddDept = async () => {
    if (!newDept) return;
    await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDept }),
    });
    setNewDept("");
    mutateDepts();
  };

  const handleAddPos = async () => {
    if (!newPos) return;
    await fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPos }),
    });
    setNewPos("");
    mutatePositions();
  };

  const handleDelete = async (type: "departments" | "positions", id: number) => {
    await fetch(`/api/${type}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    type === "departments" ? mutateDepts() : mutatePositions();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Departments Section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Daftar Departemen</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Tambah departemen baru..."
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            className="rounded-xl border-border/30"
          />
          <Button onClick={handleAddDept} size="sm" className="rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {departments?.map((dept) => (
            <div key={dept.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-border/10 group hover:border-primary/20 transition-colors">
              <span className="font-medium text-sm">{dept.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("departments", dept.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Positions Section */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Daftar Jabatan</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Tambah jabatan baru..."
            value={newPos}
            onChange={(e) => setNewPos(e.target.value)}
            className="rounded-xl border-border/30"
          />
          <Button onClick={handleAddPos} size="sm" className="rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {positions?.map((pos) => (
            <div key={pos.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-border/10 group hover:border-primary/20 transition-colors">
              <span className="font-medium text-sm">{pos.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete("positions", pos.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function PeriodsContent() {
  const { data: periods, mutate } = useSWR<any[]>("/api/periods", fetcher);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: ""
  });

  const handleAdd = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;
    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", startDate: "", endDate: "" });
    mutate();
  };

  const handleToggleCurrent = async (id: number) => {
    await fetch("/api/periods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCurrent: true }),
    });
    mutate();
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch("/api/periods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    mutate();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/periods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <h3 className="font-bold mb-6">Tambah Periode Penilaian</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Nama Periode</label>
            <Input
              placeholder="Contoh: Mei 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl border-border/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Tanggal Mulai</label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="rounded-xl border-border/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Tanggal Selesai</label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="rounded-xl border-border/30"
            />
          </div>
          <Button onClick={handleAdd} className="rounded-xl h-10">
            <Plus className="w-4 h-4 mr-2" />
            Buat Periode
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {periods?.map((period) => (
          <PeriodRow
            key={period.id}
            period={period}
            onUpdateStatus={handleUpdateStatus}
            onToggleCurrent={handleToggleCurrent}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

function PeriodRow({ period, onUpdateStatus, onToggleCurrent, onDelete }: any) {
  return (
    <motion.div
      layout
      className={`glass-card p-4 rounded-2xl border-l-4 transition-all ${period.isCurrent ? "border-l-primary bg-primary/5" : "border-l-border"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold flex items-center gap-2 text-sm sm:text-base">
              {period.name}
              {period.isCurrent && <Badge className="bg-primary text-white text-[10px]">Aktif Sekarang</Badge>}
            </h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {new Date(period.startDate).toLocaleDateString("id-ID")} - {new Date(period.endDate).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            key={`period-status-${period.id}-${period.status}`}
            value={String(period.status || "active")}
            onValueChange={(val: string | null) => val && onUpdateStatus(period.id, val)}
          >
            <SelectTrigger className="w-28 sm:w-32 h-8 text-xs rounded-lg border-border/30 bg-white/5">
              <SelectValue placeholder="Status">
                {period.status === 'active' ? 'Buka' : 
                 period.status === 'closed' ? 'Tutup' : 'Kunci'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-border/30 bg-slate-900">
              <SelectItem value="active">Buka</SelectItem>
              <SelectItem value="closed">Tutup</SelectItem>
              <SelectItem value="locked">Kunci</SelectItem>
            </SelectContent>
          </Select>

          {!period.isCurrent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleCurrent(period.id)}
              className="h-8 text-xs rounded-lg hover:bg-primary/10 px-3"
            >
              Set Aktif
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(period.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
