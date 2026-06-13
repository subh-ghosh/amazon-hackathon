import { CalendarDays, Package, RotateCcw, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductDigitalTwin } from "@/types/product-twin";

interface ProductInformationCardProps {
  twin: ProductDigitalTwin;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function ProductInformationCard({
  twin,
}: ProductInformationCardProps) {
  const details = [
    { label: "Category", value: twin.product.category },
    { label: "Model", value: twin.product.model },
    { label: "Serial number", value: twin.product.serialNumber },
    { label: "Current owner", value: twin.product.currentOwner },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 p-8">
            <div className="relative flex size-40 items-center justify-center rounded-[2rem] bg-white shadow-lg shadow-slate-200/70">
              <div className="absolute right-4 top-4 size-2 rounded-full bg-emerald-400" />
              <Package className="size-20 text-slate-700" strokeWidth={1.2} aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  {twin.product.brand}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {twin.product.name}
                </h2>
                <p className="mt-2 font-mono text-xs text-slate-500">
                  Digital Twin ID: {twin.productId}
                </p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                {twin.product.condition}
              </Badge>
            </div>

            <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {detail.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 grid gap-3 border-t pt-5 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2 text-slate-600">
                <CalendarDays className="size-4 text-slate-400" aria-hidden="true" />
                Bought {dateFormatter.format(new Date(twin.product.purchaseDate))}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="size-4 text-slate-400" aria-hidden="true" />
                Warranty to {dateFormatter.format(new Date(twin.product.warrantyExpires))}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <RotateCcw className="size-4 text-slate-400" aria-hidden="true" />
                {twin.returnCount} lifetime return
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
