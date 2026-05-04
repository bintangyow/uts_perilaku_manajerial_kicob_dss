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
  AlertTriangle
} from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [activeTab, setActiveTab] = useState<"main" | "roles" | "database">("main");
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

  const handleExportData = () => {
    setIsExporting(true);
    // Dummy export logic — in real world, this would fetch from a combined API
    setTimeout(() => {
      const data = "Contoh data ekspor KiCob";
      const blob = new Blob([data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_kicob_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      setIsExporting(false);
    }, 1000);
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
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "main" && "Konfigurasi sistem KiCob"}
              {activeTab === "roles" && "Kelola hak akses dan tanggung jawab pengguna"}
              {activeTab === "database" && "Ekspor data dan pembersihan sistem"}
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
              icon={Database} 
              title="Database" 
              desc="Konfigurasi koneksi dan backup database" 
              status="PostgreSQL Online"
              onClick={() => setActiveTab("database")}
            />
            <SettingsCard 
              icon={Palette} 
              title="Tampilan" 
              desc="Sesuaikan tema dan branding aplikasi" 
              status="Blue Glass"
              disabled
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
                    <th className="text-right py-4 px-6 font-semibold">Aksi</th>
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
                        <td className="py-4 px-6 text-right">
                          <Select 
                            defaultValue={user.role} 
                            onValueChange={(val) => handleUpdateRole(user.id, val)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs rounded-lg border-border/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border/30">
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="reviewer">Reviewer</SelectItem>
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
                Unduh Backup (.txt)
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
