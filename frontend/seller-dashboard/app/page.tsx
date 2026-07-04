import { CalendarDays, Download } from "lucide-react";

import { SellerDashboardView } from "@/components/dashboard/seller-dashboard-view";

export default function SellerDashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Returns Performance
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Monitor return drivers, protect margin, and improve listing and product quality.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm">
            <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
            Live seller snapshot
          </div>
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="size-4" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>
      <SellerDashboardView />
    </main>
  );
}
