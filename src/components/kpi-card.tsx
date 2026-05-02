"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  delay?: number;
}

export function KpiCard({
  title,
  value,
  suffix = "",
  icon: Icon,
  trend,
  delay = 0,
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased * 10) / 10);

      if (current >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card glass-card-hover rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.value >= 0
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">
          {Number.isInteger(value)
            ? Math.round(displayValue)
            : displayValue.toFixed(1)}
          {suffix}
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.div>
  );
}
