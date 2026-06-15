import {
  CheckCircle2,
  ClipboardCheck,
  PackageOpen,
  RotateCcw,
  Route,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PipelineStage } from "@/types/operations";

interface RecoveryPipelineProps {
  stages: PipelineStage[];
}

const stageIcons: Record<string, LucideIcon> = {
  Returned: PackageOpen,
  Inspection: ClipboardCheck,
  Inspected: ClipboardCheck,
  Decision: Route,
  Recovery: RotateCcw,
  Completed: CheckCircle2,
};



export function RecoveryPipeline({
  stages,
}: RecoveryPipelineProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Processing pipeline</CardTitle>
        <CardDescription>
          Today&apos;s item flow from return intake to final recovery outcome.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {stages.map((stage) => {
              const Icon = stageIcons[stage.label] ?? PackageOpen;
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
        </div>
      </CardContent>
    </Card>
  );
}
