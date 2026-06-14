import type { Metadata } from "next";
import { Radio } from "lucide-react";

import { RecoveryWorkflowView } from "@/components/recovery-workflow/recovery-workflow-view";

export const metadata: Metadata = {
  title: "Recovery Workflow | Amazon ReLife",
  description:
    "Run product recovery through simulation, optimization, logistics, and graph insights.",
};

export default function RecoveryWorkflowPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-emerald-700">
              RECOVERY WORKFLOW
            </p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Radio className="size-3.5" aria-hidden="true" />
              S5 - S12 orchestration
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Circular recovery decisioning
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Submit product details, simulate possible futures, optimize recovery, plan reverse logistics, and summarize the final circular outcome.
          </p>
        </div>
      </div>
      <RecoveryWorkflowView />
    </main>
  );
}
