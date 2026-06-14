import { AlertTriangle, RotateCcw, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProductDigitalTwin } from "@/types/product-twin";

interface TwinRiskCardProps {
  twin: ProductDigitalTwin;
}

export function TwinRiskCard({ twin }: TwinRiskCardProps) {
  const hasRisk = twin.fraudFlags.some((flag) => !flag.toLowerCase().includes("no active"));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Risk and recovery state</CardTitle>
            <CardDescription>
              Fraud signals and the current recommended recovery path.
            </CardDescription>
          </div>
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            {twin.currentRecoveryDecision}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          {twin.fraudFlags.map((flag) => (
            <div
              key={flag}
              className="flex items-center gap-3 rounded-lg border bg-white p-3"
            >
              {hasRisk ? (
                <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
              )}
              <span className="text-sm font-medium text-slate-700">{flag}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <RotateCcw className="size-5 text-slate-500" aria-hidden="true" />
          <p className="mt-4 text-xs font-medium uppercase text-slate-400">
            Return count
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-950">
            {twin.returnCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Lifetime returns linked to this digital twin.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
