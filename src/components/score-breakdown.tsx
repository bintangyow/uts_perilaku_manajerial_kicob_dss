"use client";

import { motion } from "framer-motion";

interface ScoreItem {
  label: string;
  score: number;
  maxScore: number;
  color?: string;
}

interface ScoreBreakdownProps {
  items: ScoreItem[];
  totalScore?: number;
  totalLabel?: string;
}

export function ScoreBreakdown({
  items,
  totalScore,
  totalLabel = "Total Skor",
}: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const percentage = (item.score / item.maxScore) * 100;
        return (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">
                {item.score.toFixed(1)}/{item.maxScore}
              </span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full score-bar"
                style={{
                  background: item.color
                    ? item.color
                    : `linear-gradient(90deg, oklch(0.55 0.2 ${250 + index * 15}), oklch(0.65 0.18 ${260 + index * 15}))`,
                }}
              />
            </div>
          </div>
        );
      })}

      {totalScore !== undefined && (
        <div className="pt-3 mt-3 border-t border-border/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {totalLabel}
            </span>
            <span className="text-lg font-bold text-gradient">
              {totalScore.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
