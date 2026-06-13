import type { Metadata } from "next";
import { Activity, Clock3 } from "lucide-react";

import { DonationIntelligenceDashboard } from "@/components/donation-intelligence/donation-intelligence-dashboard";

export const metadata: Metadata = {
  title: "Donation Intelligence | Amazon ReLife",
  description:
    "Recommend donation destinations for returned products that should not be resold.",
};

export default function DonationIntelligencePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-emerald-700">
              DONATION INTELLIGENCE
            </p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Activity className="size-3.5" aria-hidden="true" />
              Impact routing active
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Donation Intelligence
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Match non-resellable returns to vetted NGOs and regions where they
            create the strongest social and environmental value.
          </p>
        </div>
        <div className="flex h-10 items-center gap-2 self-start rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm lg:self-auto">
          <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
          Daily routing model
        </div>
      </div>
      <DonationIntelligenceDashboard />
      <p className="mt-6 text-right text-xs text-slate-400">
        Mock donation intelligence data for Amazon ReLife operations
      </p>
    </main>
  );
}
