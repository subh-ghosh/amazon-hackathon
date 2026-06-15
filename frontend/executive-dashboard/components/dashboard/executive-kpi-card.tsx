import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExecutiveKpiCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "emerald" | "blue" | "violet" | "amber";
}

const toneStyles = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-700",
} as const;

export function ExecutiveKpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: ExecutiveKpiCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              toneStyles[tone],
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}
