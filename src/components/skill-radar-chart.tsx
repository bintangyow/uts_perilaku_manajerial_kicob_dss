"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface SkillDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: SkillDataPoint[];
  secondaryData?: SkillDataPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
}

export function SkillRadarChart({
  data,
  secondaryData,
  primaryLabel = "Skor",
  secondaryLabel = "Rata-rata",
  height = 300,
}: SkillRadarChartProps) {
  // Merge primary and secondary data
  const mergedData = data.map((d, i) => ({
    subject: d.subject,
    primary: d.value,
    secondary: secondaryData?.[i]?.value ?? 0,
    fullMark: d.fullMark,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart 
        data={mergedData} 
        cx="50%" 
        cy="50%" 
        outerRadius="60%"
        margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
      >
        <PolarGrid
          stroke="oklch(0.4 0.06 260 / 30%)"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 5]}
          tick={{ fill: "oklch(0.5 0.02 260)", fontSize: 9 }}
          tickCount={6}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.16 0.04 260 / 90%)",
            border: "1px solid oklch(0.4 0.08 260 / 30%)",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            color: "oklch(0.9 0.01 260)",
            fontSize: "12px",
          }}
        />
        <Radar
          name={primaryLabel}
          dataKey="primary"
          stroke="oklch(0.65 0.2 260)"
          fill="oklch(0.55 0.2 260)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {secondaryData && (
          <Radar
            name={secondaryLabel}
            dataKey="secondary"
            stroke="oklch(0.6 0.18 280)"
            fill="oklch(0.5 0.18 280)"
            fillOpacity={0.15}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        {secondaryData && (
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "oklch(0.7 0.02 260)" }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
