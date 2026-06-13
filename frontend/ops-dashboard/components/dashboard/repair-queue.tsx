import { Clock3, Wrench } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RepairItem } from "@/types/operations";

interface RepairQueueProps {
  items: RepairItem[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function RepairQueue({ items }: RepairQueueProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Wrench className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Repair queue</CardTitle>
        <CardDescription>
          Refurbishment jobs prioritized by recovery potential.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => (
          <div
            key={item.productId}
            className="border-b py-4 first:pt-0 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.productName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.productId} · {item.issue}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-700">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {item.waitTimeHours}h wait
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Repair cost</p>
                <p className="mt-0.5 font-semibold text-slate-700">
                  {currencyFormatter.format(item.estimatedRepairCost)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Recovery value</p>
                <p className="mt-0.5 font-semibold text-emerald-700">
                  {currencyFormatter.format(item.expectedRecoveryValue)}
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${item.progress}%` }}
                aria-label={`${item.progress}% repair progress`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
