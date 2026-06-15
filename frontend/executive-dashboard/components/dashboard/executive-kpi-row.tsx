import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { KpiMetric } from "@/types/executive-impact";

export function ExecutiveKpiRow({ kpis }: { kpis: KpiMetric[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => {
        const isUp = kpi.trend === "up";
        const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
        const trendColor = isUp ? "text-emerald-600" : "text-rose-600";
        
        return (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</p>
              <div className="mt-2 flex items-center text-xs font-medium">
                <span className={`flex items-center ${trendColor}`}>
                  <TrendIcon className="size-3.5 mr-0.5" />
                  {kpi.change}
                </span>
                <span className="ml-1.5 text-slate-400">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
