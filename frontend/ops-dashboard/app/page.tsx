import { Clock3, Radio } from "lucide-react";

import { OperationsDashboardView } from "@/components/dashboard/operations-dashboard-view";
import { operationsData } from "@/data/operations-data";

export default function OperationsDashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Facility Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Intake, inspection, routing, and recovery execution for returned inventory.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm">
            <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
            {operationsData.lastUpdated}
          </div>
          <div className="flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
            <Radio className="size-4" aria-hidden="true" />
            Live
          </div>
        </div>
      </div>
      <OperationsDashboardView />
    </main>
  );
}
