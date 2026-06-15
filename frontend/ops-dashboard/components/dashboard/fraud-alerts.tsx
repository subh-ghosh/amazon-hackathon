import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FraudAlert, FraudSeverity } from "@/types/operations";

interface FraudAlertsProps {
  alerts: FraudAlert[];
}

const severityStyles: Record<FraudSeverity, string> = {
  Critical: "border-rose-300 bg-rose-100 text-rose-800",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
};

export function FraudAlerts({ alerts }: FraudAlertsProps) {
  return (
    <Card className="overflow-hidden border-rose-200">
      <CardHeader className="bg-rose-50/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Fraud alerts</CardTitle>
            <CardDescription className="mt-1.5">
              Suspicious return patterns requiring operator review.
            </CardDescription>
          </div>
          <Badge className="border-rose-300 bg-white text-rose-700">
            {alerts.length} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <AlertTriangle className="size-5 shrink-0 text-rose-600" aria-hidden="true" />
                <Badge className={cn("shrink-0", severityStyles[alert.severity])}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                {alert.pattern}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {alert.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 font-mono text-xs text-slate-500">
                <span>{alert.productId}</span>
                <span>{alert.customerId}</span>
                <span className="ml-auto font-sans text-slate-400">
                  {alert.detectedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
