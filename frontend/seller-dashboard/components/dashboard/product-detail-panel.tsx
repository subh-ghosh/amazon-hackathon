"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Box,
  FileWarning,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PackageX,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductInsight } from "@/types/seller-analytics";
import { RufusActionPlan } from "./rufus-action-plan";

interface ProductDetailPanelProps {
  product: ProductInsight;
  onBack: () => void;
}

const severityStyles = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ProductDetailPanel({ product, onBack }: ProductDetailPanelProps) {
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const toggleDone = (id: string) =>
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const trendFirst = product.monthlyTrend[0]?.returns ?? 0;
  const trendLast = product.monthlyTrend[product.monthlyTrend.length - 1]?.returns ?? 0;
  const trendMax = Math.max(...product.monthlyTrend.map((p) => p.returns), 1);
  const trendChange = trendFirst > 0 ? ((trendLast - trendFirst) / trendFirst) * 100 : 0;

  const recoveryCategories = [
    { label: "Restocked", data: product.recovery.restocked, color: "bg-emerald-500", tone: "bg-emerald-50 text-emerald-700" },
    { label: "Refurbished", data: product.recovery.refurbished, color: "bg-blue-500", tone: "bg-blue-50 text-blue-700" },
    { label: "Resold", data: product.recovery.resold, color: "bg-indigo-500", tone: "bg-indigo-50 text-indigo-700" },
    { label: "Donated", data: product.recovery.donated, color: "bg-amber-500", tone: "bg-amber-50 text-amber-700" },
    { label: "Recycled", data: product.recovery.recycled, color: "bg-slate-400", tone: "bg-slate-100 text-slate-700" },
  ];

  const largestCause = Math.max(...product.returnCauses.map((c) => c.returns));

  return (
    <div className="space-y-6">
      {/* Back Button & Product Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          type="button"
          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{product.name}</h2>
            <Badge className={cn(
              "text-xs",
              product.healthScore >= 85 ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
              product.healthScore >= 70 ? "border-amber-200 bg-amber-50 text-amber-700" :
              "border-rose-200 bg-rose-50 text-rose-700"
            )}>
              Health {product.healthScore}/100
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            SKU: {product.sku} · {product.category} · {currencyFormatter.format(product.price)}
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniKpi label="Total Orders" value={product.orders.toLocaleString("en-IN")} icon={<ShieldCheck className="size-4 text-blue-600" />} />
        <MiniKpi label="Total Returns" value={product.returns.toLocaleString("en-IN")} icon={<PackageX className="size-4 text-rose-500" />} tone="rose" />
        <MiniKpi label="Return Rate" value={`${product.returnRate.toFixed(1)}%`} icon={<TrendingDown className="size-4 text-amber-600" />} tone={product.returnRate > 10 ? "rose" : product.returnRate > 5 ? "amber" : "emerald"} />
        <MiniKpi label="Recovery Rate" value={`${product.recovery.totalRecoveryRate.toFixed(1)}%`} icon={<Activity className="size-4 text-emerald-600" />} tone="emerald" />
      </div>

      {/* 2-Column Layout: Return Causes + Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Return Causes */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Return Causes for this Product</CardTitle>
            <CardDescription>{product.returns} total returns analyzed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.returnCauses.map((cause) => {
              const TrendIcon = cause.change > 0 ? ArrowUpRight : ArrowDownRight;
              return (
                <div key={cause.cause}>
                  <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-700">{cause.cause}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-slate-900">{cause.returns}</span>
                      <span className={cn("flex w-14 items-center justify-end text-xs font-medium", cause.change > 0 ? "text-rose-600" : "text-emerald-700")}>
                        <TrendIcon className="mr-0.5 size-3.5" />
                        {Math.abs(cause.change)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(cause.returns / largestCause) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm">Monthly Return Trend</CardTitle>
              <CardDescription className="mt-1">Return volume, last 6 months</CardDescription>
            </div>
            <Badge className={trendChange >= 0 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
              {trendChange >= 0 ? "+" : ""}{trendChange.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mt-3 flex gap-2">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between py-3 text-right">
                <span className="text-[10px] font-medium text-slate-400">{trendMax}</span>
                <span className="text-[10px] font-medium text-slate-400">{Math.round(trendMax / 2)}</span>
                <span className="text-[10px] font-medium text-slate-400">0</span>
              </div>
              {/* Bars */}
              <div className="flex flex-1 h-36 items-end gap-2 rounded-xl border bg-slate-50 p-3">
                {product.monthlyTrend.map((point) => (
                  <div key={point.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-24 w-full items-end group relative">
                      <div
                        className="w-full rounded-t-md bg-blue-600 transition-all hover:bg-blue-700"
                        style={{ height: `${Math.max(12, (point.returns / trendMax) * 100)}%` }}
                      />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                        {point.returns} returns
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{point.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column: Packaging & Listing Issues */}
      <div className="grid gap-6 lg:grid-cols-2">
        <IssuesList
          title="Packaging Issues"
          description="Physical packaging problems causing returns."
          issues={product.packagingIssues}
          icon={<Box className="size-5" />}
        />
        <IssuesList
          title="Listing Issues"
          description="Content gaps causing customer expectation mismatches."
          issues={product.listingIssues}
          icon={<FileWarning className="size-5" />}
        />
      </div>

      {/* Recovery Intelligence */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm">Recovery Outcomes</CardTitle>
              <CardDescription>How returns for this product are being routed.</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">Recovered</p>
              <p className="text-lg font-bold text-emerald-600">{currencyFormatter.format(product.recovery.totalRecoveredValue)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 h-4 w-full overflow-hidden rounded-full flex">
            {recoveryCategories.map((cat) => (
              <div
                key={cat.label}
                className={`h-full ${cat.color}`}
                style={{ width: `${cat.data.percentage}%` }}
                title={`${cat.label}: ${cat.data.percentage}%`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {recoveryCategories.filter(c => c.data.percentage > 0).map((cat) => (
              <div key={cat.label} className="rounded-lg border p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className={`size-2 rounded-full ${cat.color}`} />
                  <span className="text-xs font-semibold text-slate-600">{cat.label}</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{cat.data.percentage.toFixed(1)}%</p>
                <p className="text-[10px] text-slate-400">{cat.data.count} units</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <RufusActionPlan recommendations={product.recommendations} />
      </div>>
    </div>
  );
}

/* ────── Mini KPI Card ────── */
function MiniKpi({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className={cn("text-lg font-bold tracking-tight", tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-slate-900")}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────── Issues List Sub-component ────── */
function IssuesList({ title, description, issues, icon }: { title: string; description: string; issues: ProductInsight["packagingIssues"]; icon: React.ReactNode }) {
  // Detect "no issues" placeholder entries
  const hasRealIssues = issues.some(i => i.affectedOrders > 0 || i.severity !== "Low" || !i.title.toLowerCase().includes("no issue"));

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          {icon}
        </div>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {!hasRealIssues ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">No issues detected</p>
              <p className="text-xs text-emerald-600 mt-0.5">This product meets all quality standards for this category.</p>
            </div>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue.title} className="border-b py-3 first:pt-0 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{issue.title}</p>
                <Badge className={cn("shrink-0 text-[10px]", severityStyles[issue.severity])}>
                  {issue.severity}
                </Badge>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{issue.detail}</p>
              {issue.affectedOrders > 0 && (
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">{issue.affectedOrders} affected returns</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
