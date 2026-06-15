import {
  HandCoins,
  HeartHandshake,
  Leaf,
  PackageCheck,
  PiggyBank,
  Recycle,
  Truck,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExecutiveKpiCard } from "@/components/dashboard/executive-kpi-card";
import type {
  DonationImpact,
  ReturnlessRefundSavings,
  SustainabilityImpact,
} from "@/types/executive-impact";

interface ImpactOverviewProps {
  refundSavings: ReturnlessRefundSavings;
  sustainability: SustainabilityImpact;
  donation: DonationImpact;
}

export function ImpactOverview({
  refundSavings,
  sustainability,
  donation,
}: ImpactOverviewProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <PiggyBank className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Returnless refund savings</CardTitle>
          <CardDescription>
            Cost avoided by resolving eligible low-value returns without transport.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <ExecutiveKpiCard
            label="Cost avoided"
            value={`$${(refundSavings.costAvoided / 1_000_000).toFixed(2)}M`}
            detail={`${refundSavings.eligibleRefunds.toLocaleString("en-US")} eligible refunds automated`}
            icon={HandCoins}
            tone="blue"
          />
          <ExecutiveKpiCard
            label="Shipping savings"
            value={`$${(refundSavings.shippingSavings / 1_000_000).toFixed(2)}M`}
            detail="Reverse logistics transport and handling avoided"
            icon={Truck}
            tone="emerald"
          />
          <ExecutiveKpiCard
            label="Refund efficiency"
            value={`${refundSavings.refundEfficiency}%`}
            detail="Eligible cases resolved without manual review"
            icon={PackageCheck}
            tone="violet"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Leaf className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Sustainability impact</CardTitle>
          <CardDescription>
            Environmental value created through product recovery and recycling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Metric
            label="Carbon emissions prevented"
            value={`${sustainability.carbonPreventedTonnes.toLocaleString("en-US")} t`}
            helper="CO2e avoided"
          />
          <Metric
            label="Products diverted from landfill"
            value={`${(sustainability.productsDiverted / 1_000_000).toFixed(2)}M`}
            helper={`${sustainability.landfillDiversionRate}% diversion rate`}
          />
          <ProgressMetric
            label="Recycling success rate"
            value={sustainability.recyclingSuccessRate}
            icon={Recycle}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
            <HeartHandshake className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Donation impact</CardTitle>
          <CardDescription>
            Functional products placed with communities through nonprofit partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight text-slate-950">
            {donation.productsDonated.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-sm text-slate-500">products donated year to date</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-violet-50 p-4">
              <HeartHandshake className="size-4 text-violet-700" aria-hidden="true" />
              <p className="mt-4 text-xl font-bold text-violet-950">
                {donation.ngosSupported}
              </p>
              <p className="mt-1 text-xs text-violet-700">NGOs supported</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <Users className="size-4 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-xl font-bold text-emerald-950">
                {(donation.beneficiariesReached / 1000).toFixed(0)}K
              </p>
              <p className="mt-1 text-xs text-emerald-700">Beneficiaries</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold text-emerald-700">
            +{donation.yearOverYearGrowth}% impact growth year over year
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <p className="text-xs text-slate-400">{helper}</p>
      </div>
    </div>
  );
}

function ProgressMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Recycle;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-slate-600">
          <Icon className="size-4 text-emerald-700" aria-hidden="true" />
          {label}
        </span>
        <span className="font-bold text-emerald-700">{value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
