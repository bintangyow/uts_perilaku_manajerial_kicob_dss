"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Database, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const settings = [
  { icon: Shield, title: "Manajemen Role", desc: "Kelola role dan hak akses pengguna", status: "4 roles aktif" },
  { icon: Database, title: "Database", desc: "Konfigurasi koneksi dan backup database", status: "PostgreSQL" },
  { icon: Palette, title: "Tampilan", desc: "Sesuaikan tema dan branding aplikasi", status: "Blue Glass" },
];

export default function PengaturanPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Konfigurasi sistem KiCob</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">{s.status}</Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
