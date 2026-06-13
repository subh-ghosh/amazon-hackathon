import { CalendarDays, Download, Radio } from "lucide-react";

import { ExecutiveDashboardView } from "@/components/dashboard/executive-dashboard-view";
import { executiveDashboardData } from "@/data/executive-impact";

export default function ExecutiveDashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-emerald-700">
              EXECUTIVE INTELLIGENCE
            </p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Radio className="size-3.5" aria-hidden="true" />
              Live
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Recovery impact overview
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Enterprise value, environmental impact, and social outcomes from
            returned-product recovery.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
            {executiveDashboardData.reportingPeriod}
          </div>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="size-4" aria-hidden="true" />
            Export brief
          </button>
        </div>
      </div>
      <ExecutiveDashboardView />
      <p className="mt-6 text-right text-xs text-slate-400">
        Last updated {executiveDashboardData.lastUpdated}
      </p>
    </main>
  );
}
