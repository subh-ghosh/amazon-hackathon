import {
  ClipboardCheck,
  PackageCheck,
  PackageOpen,
  Route,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ReturnsSummary } from "@/types/operations";

interface ReturnsKpisProps {
  data: ReturnsSummary;
}

interface Kpi {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  iconClass: string;
}

export function ReturnsKpis({ data }: ReturnsKpisProps) {
  const kpis: Kpi[] = [
    {
      label: "Returns received",
      value: data.totalReceived,
      helper: "12% above daily average",
      icon: PackageOpen,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      label: "Awaiting inspection",
      value: data.awaitingInspection,
      helper: "22% of today's intake",
      icon: ClipboardCheck,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Awaiting decision",
      value: data.awaitingDecision,
      helper: "Median wait: 1h 18m",
      icon: Route,
      iconClass: "bg-violet-50 text-violet-700",
    },
    {
      label: "Processed today",
      value: data.processedToday,
      helper: "65% completion rate",
      icon: PackageCheck,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Returns today"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {kpi.value}
                  </p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.iconClass}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-5 text-xs text-slate-400">{kpi.helper}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
