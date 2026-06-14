"use client";

import { useEffect, useState } from "react";
import { Activity, PackageSearch, TrendingUp } from "lucide-react";

import { FraudExposureCard } from "@/components/dashboard/fraud-exposure-card";
import { IssuesCard } from "@/components/dashboard/issues-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LossSummary } from "@/components/dashboard/loss-summary";
import { ReturnCausesChart } from "@/components/dashboard/return-causes-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  adaptSellerDashboard,
  getPrimarySellerId,
  type SellerDashboardViewModel,
} from "../../../shared/api/adapters";
import {
  circularDemoProduct,
  circularDemoListingProblems,
  circularDemoReturnCauses,
  circularDemoReturnTrend,
  circularDemoSeller,
} from "../../../shared/demo/circular-demo-data";
import {
  getSellerIntelligence,
  getSellerReturnAnalysis,
} from "../../../shared/api/service12";

type Resource<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  demoMode: boolean;
};

export function SellerDashboardView() {
  const [sellerAnalytics, setSellerAnalytics] = useState<
    Resource<SellerDashboardViewModel>
  >({
    data: null,
    loading: true,
    error: null,
    demoMode: false,
  });

  function loadSellerAnalytics() {
    setSellerAnalytics((current) => ({
      ...current,
      loading: true,
      error: null,
      demoMode: false,
    }));

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setSellerAnalytics({
        data: adaptSellerDashboard(demoSellerAnalysisPayload(), demoSellerIntelligencePayload()),
        loading: false,
        error: null,
        demoMode: true,
      });
      return;
    }

    getSellerReturnAnalysis()
      .then(async (analysisPayload) => {
        const sellerId =
          getPrimarySellerId(analysisPayload) ??
          process.env.NEXT_PUBLIC_SERVICE12_SELLER_ID;
        const intelligencePayload = sellerId
          ? await getSellerIntelligence(sellerId)
          : {};

        setSellerAnalytics({
          data: adaptSellerDashboard(analysisPayload, intelligencePayload),
          loading: false,
          error: null,
          demoMode: false,
        });
      })
      .catch((error: unknown) => {
        setSellerAnalytics({
          data: adaptSellerDashboard(demoSellerAnalysisPayload(), demoSellerIntelligencePayload()),
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
          demoMode: true,
        });
      });
  }

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  if (sellerAnalytics.loading) {
    return <StatusCard title="Loading seller intelligence..." />;
  }

  if (sellerAnalytics.error && !sellerAnalytics.data) {
    return (
      <StatusCard
        title="Unable to load Service #12 seller data"
        detail={sellerAnalytics.error}
        onRetry={loadSellerAnalytics}
      />
    );
  }

  if (!sellerAnalytics.data || sellerAnalytics.data.kpis.length === 0) {
    return (
      <StatusCard
        title="No seller intelligence data found."
        onRetry={loadSellerAnalytics}
      />
    );
  }

  const data = sellerAnalytics.data;
  const listingProblems = completeListingProblems(data.listingProblems);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Badge
          className={
            sellerAnalytics.demoMode
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }
        >
          {sellerAnalytics.demoMode
            ? "Demo Mode Active"
            : "Knowledge Graph S12 • Live"}
        </Badge>
      </div>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Seller performance indicators"
      >
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      {sellerAnalytics.demoMode && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Demo Mode seller intelligence
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Service #12 seller data was unavailable, so this dashboard is using the shared P123 demo story.
              </p>
            </div>
            <Badge className="border-amber-300 bg-white text-amber-700">
              Fallback
            </Badge>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {data.returnCauses.length > 0 ? (
          <ReturnCausesChart causes={data.returnCauses} />
        ) : (
          <StatusCard
            title="No return causes found."
            onRetry={loadSellerAnalytics}
          />
        )}
        <FraudExposureCard data={data.fraudExposure} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MostImpactfulProductCard />
        <ReturnTrendCard />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <IssuesCard
          title="Packaging problems"
          description="Packaging patterns contributing to damage and incomplete returns."
          issues={data.packagingProblems}
          type="packaging"
        />
        <IssuesCard
          title="Listing problems"
          description="Content gaps creating expectation and compatibility issues."
          issues={listingProblems}
          type="listing"
        />
      </section>

      <section>
        <LossSummary data={data.estimatedLosses} />
      </section>
    </div>
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function MostImpactfulProductCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <PackageSearch className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Most Impactful Product</CardTitle>
        <CardDescription>
          Highest current seller impact from the shared recovery story.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Product ID
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <p className="text-3xl font-bold">{circularDemoProduct.productId}</p>
            <Badge className="border-blue-300 bg-blue-50 text-blue-700">
              {circularDemoProduct.recoveryDecision}
            </Badge>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <ProductMetric
            label="Fraud score"
            value={circularDemoProduct.fraudScore.toFixed(2)}
          />
          <ProductMetric
            label="Recovered value"
            value={currencyFormatter.format(circularDemoProduct.recoveredValue)}
          />
          <ProductMetric
            label="Warehouse"
            value={circularDemoProduct.warehouseId}
          />
          <ProductMetric
            label="Return count"
            value={String(circularDemoProduct.returnCount)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function ProductMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function ReturnTrendCard() {
  const first = circularDemoReturnTrend[0]?.returns ?? 0;
  const last = circularDemoReturnTrend[circularDemoReturnTrend.length - 1]?.returns ?? 0;
  const max = Math.max(...circularDemoReturnTrend.map((point) => point.returns), 1);
  const change = first > 0 ? ((last - first) / first) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <TrendingUp className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Monthly returns trend</CardTitle>
          <CardDescription className="mt-1.5">
            Compact view of return volume movement.
          </CardDescription>
        </div>
        <Badge
          className={
            change >= 0
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3 rounded-xl border bg-slate-50 p-4">
          {circularDemoReturnTrend.map((point) => (
            <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-emerald-600"
                  style={{ height: `${Math.max(12, (point.returns / max) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{point.month}</span>
              <span className="text-xs font-bold text-slate-900">{point.returns}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Activity className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          May closed at {last} returns, {Math.abs(change).toFixed(1)}%{" "}
          {change >= 0 ? "above" : "below"} January.
        </div>
      </CardContent>
    </Card>
  );
}

function completeListingProblems(
  issues: SellerDashboardViewModel["listingProblems"],
): SellerDashboardViewModel["listingProblems"] {
  const byTitle = new Map(issues.map((issue) => [issue.title, issue]));

  return circularDemoListingProblems.map((fallback) => {
    const current = byTitle.get(fallback.title);

    return {
      title: fallback.title,
      detail: current?.detail ?? fallback.detail,
      affectedOrders: current?.affectedOrders ?? fallback.affectedOrders,
      returnCorrelation: current?.returnCorrelation ?? fallback.returnCorrelation,
      severity: current?.severity ?? fallback.severity,
    };
  });
}

function demoSellerAnalysisPayload() {
  return {
    seller_return_analysis: [
      {
        seller_id: circularDemoSeller.sellerId,
        seller_name: circularDemoSeller.sellerName,
        total_orders: circularDemoSeller.totalOrders,
        total_returns: circularDemoSeller.totalReturns,
        fraud_cases: circularDemoSeller.fraudCases,
        root_causes: circularDemoReturnCauses,
      },
    ],
    products: [
      {
        product_id: circularDemoProduct.productId,
        product_name: circularDemoProduct.productName,
        seller_id: circularDemoSeller.sellerId,
        total_returns: circularDemoProduct.returnCount,
        return_rate_percentage: circularDemoSeller.returnRate,
        risk_score: circularDemoProduct.fraudScorePercent,
        risk_driver: circularDemoProduct.returnReason,
      },
    ],
  };
}

function demoSellerIntelligencePayload() {
  return {
    seller_id: circularDemoSeller.sellerId,
    seller_name: circularDemoSeller.sellerName,
    total_orders: circularDemoSeller.totalOrders,
    total_returns: circularDemoSeller.totalReturns,
    return_rate_percentage: circularDemoSeller.returnRate,
    associated_fraud_cases: circularDemoSeller.fraudCases,
    fraud_risk_level: "HIGH",
    top_root_causes: circularDemoReturnCauses,
  };
}

function StatusCard({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{detail ?? "Service #12 live data"}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="h-9 rounded-md border bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Retry
          </button>
        )}
      </CardContent>
    </Card>
  );
}
