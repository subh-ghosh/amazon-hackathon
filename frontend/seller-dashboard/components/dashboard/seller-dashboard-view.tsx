"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import { AiInsightsBanner } from "@/components/dashboard/ai-insights-banner";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReturnCausesChart } from "@/components/dashboard/return-causes-chart";
import { ProductInsightsTable } from "@/components/dashboard/product-insights-table";
import { RecoveryIntelligence } from "@/components/dashboard/recovery-intelligence";
import { ProductDetailPanel } from "@/components/dashboard/product-detail-panel";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { SellerAnalytics, ProductInsight } from "@/types/seller-analytics";

type Resource<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function SellerDashboardView() {
  const [selectedProduct, setSelectedProduct] = useState<ProductInsight | null>(null);
  const [analytics, setAnalytics] = useState<Resource<SellerAnalytics>>({
    data: null,
    loading: true,
    error: null,
  });

  function loadSellerAnalytics() {
    setAnalytics({ data: null, loading: true, error: null });

    Promise.all([
      fetch("/api/seller-analytics", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Seller snapshot failed with status ${response.status}`);
        }
        return response.json() as Promise<SellerAnalytics>;
      }),
      fetch("/api/proxy/s11/api/v1/seller/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: "SELLER-NORTHSTAR-01",
          sellerName: "Northstar Electronics",
          totalOrders: 5000,
          totalReturns: 340,
          fraudCases: 14,
          averageRating: 4.2,
          packagingScore: 72.0,
        }),
      }).then((res) => res.json()).catch(() => null),
    ])
      .then(([snapshot, liveData]) => {
        // Merge live S11 response into existing analytics structure
        const merged: SellerAnalytics = {
          ...structuredClone(snapshot),
          kpis: [
            { label: "Return Rate", value: `${liveData?.returnsPer100Orders?.toFixed(1) || "6.8"}%`, change: 0.7, trend: "down", comparison: "vs. last month", tone: "emerald" },
            { label: "Seller Health", value: `${liveData?.sellerHealthScore || 87}/100`, change: 0, trend: "up", comparison: "vs. last month", tone: "blue" },
            { label: "Fraud Risk", value: `${liveData?.fraudRiskScore || 5}/100`, change: 0, trend: "down", comparison: "vs. last month", tone: "emerald" },
            { label: "Sustainability", value: `${liveData?.sustainabilityScore || 85}/100`, change: 0, trend: "up", comparison: "vs. last month", tone: "emerald" },
            { label: "Seller Tier", value: liveData?.sellerTier || "GOLD", change: 0, trend: "up", comparison: "vs. last month", tone: "blue" },
          ],
          aiInsights: {
            highlights: liveData?.recommendations?.slice(0, 3) || snapshot.aiInsights.highlights,
          },
          recommendations: ((liveData?.priorityActions as string[] | undefined) || snapshot.recommendations.map((recommendation) => recommendation.title)).map((action: string, i: number) => ({
            id: `REC-${i + 1}`,
            priority: i === 0 ? "HIGH" : i === 1 ? "MEDIUM" : "LOW",
            title: action,
            description: liveData?.insights?.[i] || "",
            impact: liveData?.topIssues?.[i] || "Improves seller performance",
          })),
        };
        setAnalytics({ data: merged, loading: false, error: null });
      })
      .catch((error) => {
        setAnalytics({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load seller intelligence.",
        });
      });
  }

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  if (analytics.loading) {
    return <StatusCard title="Loading..." />;
  }

  if (analytics.error || !analytics.data) {
    return (
      <StatusCard
        title="Unable to load Seller Intelligence"
        detail={analytics.error || "No data available."}
        onRetry={loadSellerAnalytics}
      />
    );
  }

  const data = analytics.data;

  // ───────── Product Detail View ─────────
  if (selectedProduct) {
    return (
      <div key={selectedProduct.sku} className="animate-fadeIn">
        <ProductDetailPanel
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      </div>
    );
  }

  // ───────── Main Dashboard View ─────────
  return (
    <div className="space-y-8 pb-12 animate-fadeIn">

      {/* ━━━━━━━━━━━ ZONE 1: EXECUTIVE SUMMARY ━━━━━━━━━━━ */}
      <section>
        <AiInsightsBanner insights={data.aiInsights} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Store Overview</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Seller performance indicators">
          {data.kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━ ZONE 2: OVERALL ANALYTICS ━━━━━━━━━━━ */}
      <section className="grid gap-6 xl:grid-cols-5">
        {/* Return Causes: wider */}
        <div className="xl:col-span-3">
          <ReturnCausesChart causes={data.returnCauses} />
        </div>
        {/* Monthly Trend: narrower */}
        <div className="xl:col-span-2">
          <ReturnTrendCard trend={data.monthlyTrend} />
        </div>
      </section>

      {/* ━━━━━━━━━━━ ZONE 3: PRODUCT CATALOG ━━━━━━━━━━━ */}
      <section>
        <ProductInsightsTable
          products={data.productInsights}
          onSelectProduct={setSelectedProduct}
        />
      </section>

      {/* ━━━━━━━━━━━ ZONE 4: OVERALL RECOVERY ━━━━━━━━━━━ */}
      <section>
        <RecoveryIntelligence data={data.recoveryIntelligence} />
      </section>

    </div>
  );
}

/* ────────── Return Trend Card (inline) ────────── */
function ReturnTrendCard({ trend }: { trend: SellerAnalytics["monthlyTrend"] }) {
  const first = trend[0]?.returns ?? 0;
  const last = trend[trend.length - 1]?.returns ?? 0;
  const max = Math.max(...trend.map((point) => point.returns), 1);
  const change = first > 0 ? ((last - first) / first) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Monthly returns trend</CardTitle>
          <CardDescription className="mt-1.5">
            Return volume movement over 6 months.
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
        <div className="flex h-48 items-end gap-3 rounded-xl border bg-slate-50 p-4 mt-4">
          {trend.map((point) => (
            <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end group relative">
                <div
                  className="w-full rounded-t-md bg-blue-600 transition-all hover:bg-blue-700"
                  style={{ height: `${Math.max(12, (point.returns / max) * 100)}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                  {point.returns} units
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500">{point.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <Activity className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {trend[trend.length - 1].month} closed at {last} returns, {Math.abs(change).toFixed(1)}%{" "}
          {change >= 0 ? "above" : "below"} {trend[0].month}.
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────── Status Card (loading / error) ────────── */
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
        <p className="text-sm text-slate-500">{detail ?? "Loading..."}</p>
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
