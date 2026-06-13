import { CheckCircle2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FraudExposure } from "@/types/seller-analytics";

interface FraudExposureCardProps {
  data: FraudExposure;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function FraudExposureCard({ data }: FraudExposureCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Fraud exposure</CardTitle>
          <CardDescription className="mt-1.5">
            Suspected return abuse and claim anomalies.
          </CardDescription>
        </div>
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          Moderate risk
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Current exposure
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <p className="text-3xl font-bold">
              {currencyFormatter.format(data.exposureAmount)}
            </p>
            <p className="text-sm font-medium text-amber-400">
              Risk score {data.riskScore}/100
            </p>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${data.riskScore}%` }}
            />
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-3 divide-x text-center">
          <div className="px-2">
            <dt className="text-xs text-slate-500">Flagged orders</dt>
            <dd className="mt-1 text-lg font-bold text-slate-900">
              {data.flaggedOrders}
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-xs text-slate-500">Claims blocked</dt>
            <dd className="mt-1 text-lg font-bold text-slate-900">
              {data.blockedClaims}
            </dd>
          </div>
          <div className="px-2">
            <dt className="text-xs text-slate-500">Recovered</dt>
            <dd className="mt-1 text-lg font-bold text-emerald-700">
              {currencyFormatter.format(data.recoveredAmount)}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Automated screening prevented 65% of flagged claims from becoming losses.
        </div>
      </CardContent>
    </Card>
  );
}
