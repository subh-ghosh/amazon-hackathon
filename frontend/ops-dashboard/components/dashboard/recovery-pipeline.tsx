import {
  ArrowRight,
  ClipboardCheck,
  Gift,
  PackageOpen,
  Recycle,
  RotateCcw,
  Route,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PipelineStage, RecoveryOutcome } from "@/types/operations";

interface RecoveryPipelineProps {
  stages: PipelineStage[];
  outcomes: RecoveryOutcome[];
}

const stageIcons: Record<string, LucideIcon> = {
  Returned: PackageOpen,
  Inspection: ClipboardCheck,
  Decision: Route,
  Recovery: RotateCcw,
};

const outcomeIcons: Record<RecoveryOutcome["label"], LucideIcon> = {
  Resold: ShoppingBag,
  Donated: Gift,
  Recycled: Recycle,
};

export function RecoveryPipeline({
  stages,
  outcomes,
}: RecoveryPipelineProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recovery pipeline</CardTitle>
        <CardDescription>
          Today&apos;s product flow from return intake to final circular outcome.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((stage) => {
              const Icon = stageIcons[stage.label];
              return (
                <div key={stage.label} className="relative">
                  <div className="h-full rounded-xl border bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {stage.completionRate}%
                      </span>
                    </div>
                    <p className="mt-4 text-xl font-bold text-slate-950">{stage.count}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{stage.label}</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${stage.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ArrowRight
            className="mx-auto hidden size-5 shrink-0 text-emerald-500 xl:block"
            aria-hidden="true"
          />
          <div className="grid gap-2 sm:grid-cols-3 xl:w-48 xl:grid-cols-1">
            {outcomes.map((outcome) => {
              const Icon = outcomeIcons[outcome.label];
              return (
                <div
                  key={outcome.label}
                  className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                    <Icon className="size-4 text-emerald-700" aria-hidden="true" />
                    {outcome.label}
                  </div>
                  <span className="font-bold text-emerald-800">{outcome.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
