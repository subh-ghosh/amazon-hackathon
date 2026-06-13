import type { Metadata } from "next";
import { Clock3, RotateCcw } from "lucide-react";

import { ReturnPortalView } from "@/components/return-portal/return-portal-view";
import { returnOrders, returnReasons } from "@/data/return-orders";

export const metadata: Metadata = {
  title: "Return Portal | Amazon ReLife",
  description:
    "Create a product return with ReLife intake details, photos, and recovery routing.",
};

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-emerald-700">
              CUSTOMER RETURNS
            </p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              ReLife intake active
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Return Portal
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Start a return, attach product photos, and preview the ReLife recovery
            path before submission.
          </p>
        </div>
        <div className="flex h-10 items-center gap-2 self-start rounded-md border bg-white px-3 text-sm font-medium text-slate-600 shadow-sm lg:self-auto">
          <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
          Mock return workflow
        </div>
      </div>
      <ReturnPortalView orders={returnOrders} reasons={returnReasons} />
      <p className="mt-6 text-right text-xs text-slate-400">
        Mock order and return data for Amazon ReLife
      </p>
    </main>
  );
}
