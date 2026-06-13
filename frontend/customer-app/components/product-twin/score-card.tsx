import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  icon: LucideIcon;
  accent: "emerald" | "blue";
}

const accentStyles = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    text: "text-emerald-700",
    stroke: "stroke-emerald-500",
  },
  blue: {
    icon: "bg-blue-50 text-blue-700",
    text: "text-blue-700",
    stroke: "stroke-blue-500",
  },
} as const;

export function ScoreCard({
  title,
  score,
  description,
  icon: Icon,
  accent,
}: ScoreCardProps) {
  const styles = accentStyles[accent];
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex h-full items-center gap-6 p-6">
        <div className="relative size-28 shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="-rotate-90"
            role="img"
            aria-label={`${title}: ${score} out of 100`}
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              className="stroke-slate-100"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={styles.stroke}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-2xl font-bold", styles.text)}>{score}</span>
          </div>
        </div>
        <div>
          <div className={cn("mb-3 flex size-9 items-center justify-center rounded-lg", styles.icon)}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          <p className={cn("mt-2 text-sm font-semibold", styles.text)}>
            {score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Attention needed"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
