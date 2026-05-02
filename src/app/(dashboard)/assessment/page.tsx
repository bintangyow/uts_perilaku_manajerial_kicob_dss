"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import useSWR from "swr";
import { Search, Filter, ClipboardCheck, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssessmentPage() {
  const { data: employeesData, isLoading } = useSWR<any[]>("/api/assessments", fetcher);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Semua Status");

  // Generate dynamic periods (current month + 5 months back)
  const generatePeriods = () => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const now = new Date();
    const result = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
    }
    return result;
  };
  const periods = generatePeriods();
  const [periodFilter, setPeriodFilter] = useState(periods[0]);

  // Create assessment overview per employee for the SELECTED period
  const empAssessmentList = employeesData
    ? employeesData
        .filter((e) => e.status === "active")
        .map((emp) => {
          const empAsmts = (emp.assessments || []).filter((a: any) => a.period === periodFilter);
          const hasSelf = empAsmts.some((a: any) => a.assessmentType === "self");
          const hasPeer = empAsmts.some((a: any) => a.assessmentType === "peer");
          const hasSupervisor = empAsmts.some((a: any) => a.assessmentType === "supervisor");
          return {
            ...emp,
            hasSelf,
            hasPeer,
            hasSupervisor,
            totalAssessmentsInPeriod: empAsmts.length,
          };
        })
    : [];

  const filtered = empAssessmentList.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    if (typeFilter === "Semua Status") return matchSearch;
    if (typeFilter === "Belum Lengkap") return matchSearch && emp.totalAssessmentsInPeriod < 3;
    if (typeFilter === "Sudah Lengkap") return matchSearch && emp.totalAssessmentsInPeriod >= 3;
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Assessment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penilaian perilaku karyawan untuk periode <b>{periodFilter}</b>
          </p>
        </div>
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
            placeholder="Cari karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-input/30 border-border/30 rounded-xl"
          />
        </div>

        <Select value={periodFilter} onValueChange={(v) => v && setPeriodFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-input/30 border-border/30 rounded-xl">
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent className="border-border/30">
            {periods.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-input/30 border-border/30 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent className="border-border/30">
            <SelectItem value="Semua Status">Semua Status</SelectItem>
            <SelectItem value="Belum Lengkap">Belum Lengkap</SelectItem>
            <SelectItem value="Sudah Lengkap">Sudah Lengkap</SelectItem>
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
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Departemen</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Self</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Peer</th>
                  <th className="text-center text-xs font-medium text-muted-foreground py-3 px-4">Supervisor</th>
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
                          <p className="text-xs text-muted-foreground">{emp.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{emp.department}</td>
                    <td className="py-3 px-4 text-center">
                      {emp.hasSelf ? (
                        <ClipboardCheck className="w-4 h-4 mx-auto text-emerald-500" />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {emp.hasPeer ? (
                        <ClipboardCheck className="w-4 h-4 mx-auto text-emerald-500" />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {emp.hasSupervisor ? (
                        <ClipboardCheck className="w-4 h-4 mx-auto text-emerald-500" />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          emp.totalAssessmentsInPeriod >= 3
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {emp.totalAssessmentsInPeriod >= 3 ? "Lengkap" : `${emp.totalAssessmentsInPeriod}/3 Selesai`}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link href={`/assessment/${emp.id}`}>
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
            Tidak ada data assessment yang cocok.
          </div>
        )}
      </motion.div>
    </div>
  );
}
