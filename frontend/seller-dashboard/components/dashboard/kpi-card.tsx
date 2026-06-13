import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  PackageX,
  RotateCcw,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SellerKpi } from "@/types/seller-analytics";

interface KpiCardProps {
  kpi: SellerKpi;
}

const toneStyles: Record<
  SellerKpi["tone"],
  { icon: string; trend: string; iconComponent: LucideIcon }
> = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    trend: "text-emerald-700",
    iconComponent: RotateCcw,
  },
  blue: {
    icon: "bg-blue-50 text-blue-700",
    trend: "text-emerald-700",
    iconComponent: PackageX,
  },
  amber: {
    icon: "bg-amber-50 text-amber-700",
    trend: "text-emerald-700",
    iconComponent: WalletCards,
  },
  rose: {
    icon: "bg-rose-50 text-rose-700",
    trend: "text-rose-700",
    iconComponent: AlertTriangle,
  },
};

export function KpiCard({ kpi }: KpiCardProps) {
  const style = toneStyles[kpi.tone];
  const Icon = style.iconComponent;
  const TrendIcon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {kpi.value}
            </p>
          </div>
          <div className={cn("flex size-10 items-center justify-center rounded-lg", style.icon)}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1.5 text-xs">
          <span className={cn("flex items-center font-semibold", style.trend)}>
            <TrendIcon className="mr-0.5 size-3.5" aria-hidden="true" />
            {kpi.change}%
          </span>
          <span className="text-slate-400">{kpi.comparison}</span>
        </div>
      </CardContent>
    </Card>
  );
}
