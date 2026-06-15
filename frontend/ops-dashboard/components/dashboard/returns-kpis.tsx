import { ClipboardCheck, PackageCheck, PackageOpen, Route, CircleDollarSign, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReturnsSummary } from "@/types/operations";

export function ReturnsKpis({ data }: { data: ReturnsSummary }) {
  const kpis = [
    {
      label: "Items Received",
      value: data.totalReceived,
      icon: PackageOpen,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      label: "Awaiting Inspection",
      value: data.awaitingInspection,
      icon: ClipboardCheck,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Awaiting Decision",
      value: data.awaitingDecision,
      icon: Route,
      iconClass: "bg-violet-50 text-violet-700",
    },
    {
      label: "Processed Today",
      value: data.processedToday,
      icon: PackageCheck,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Recovery Generated",
      value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(data.recoveryValueGenerated),
      icon: CircleDollarSign,
      iconClass: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {kpi.value}
                  </p>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.iconClass}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
