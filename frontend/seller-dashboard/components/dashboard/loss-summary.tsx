import { ArrowDownRight, CircleDollarSign } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EstimatedLosses } from "@/types/seller-analytics";

interface LossSummaryProps {
  data: EstimatedLosses;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function LossSummary({ data }: LossSummaryProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <CircleDollarSign className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Estimated loss summary</CardTitle>
        <CardDescription>
          Direct return costs and recoverable value for this period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
          <div>
            <p className="text-sm text-slate-500">Total estimated loss</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {currencyFormatter.format(data.total)}
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end text-sm font-semibold text-emerald-700">
              <ArrowDownRight className="mr-1 size-4" aria-hidden="true" />
              4.1% from last month
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {currencyFormatter.format(data.projectedAnnual)} annualized
            </p>
          </div>
        </div>

        <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
          {data.categories.map((category) => (
            <div
              key={category.label}
              className={category.color}
              style={{ width: `${category.percentage}%` }}
              title={`${category.label}: ${category.percentage}%`}
            />
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {data.categories.map((category) => (
            <div
              key={category.label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${category.color}`} />
                <span className="text-slate-600">{category.label}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  {currencyFormatter.format(category.amount)}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {category.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Potentially preventable
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-900">
            {currencyFormatter.format(data.preventable)}
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-700">
            Addressing the highlighted packaging and listing issues could avoid 65% of losses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
