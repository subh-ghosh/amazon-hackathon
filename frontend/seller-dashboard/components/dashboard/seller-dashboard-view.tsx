"use client";

import { useEffect, useState } from "react";

import { FraudExposureCard } from "@/components/dashboard/fraud-exposure-card";
import { IssuesCard } from "@/components/dashboard/issues-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LossSummary } from "@/components/dashboard/loss-summary";
import { ReturnCausesChart } from "@/components/dashboard/return-causes-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  adaptSellerDashboard,
  getPrimarySellerId,
  type SellerDashboardViewModel,
} from "../../../shared/api/adapters";
import {
  getSellerIntelligence,
  getSellerReturnAnalysis,
} from "../../../shared/api/service12";

type Resource<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function SellerDashboardView() {
  const [sellerAnalytics, setSellerAnalytics] = useState<
    Resource<SellerDashboardViewModel>
  >({
    data: null,
    loading: true,
    error: null,
  });

  function loadSellerAnalytics() {
    setSellerAnalytics((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

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
        });
      })
      .catch((error: unknown) => {
        setSellerAnalytics({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      });
  }

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  if (sellerAnalytics.loading) {
    return <StatusCard title="Loading seller intelligence..." />;
  }

  if (sellerAnalytics.error) {
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

  return (
    <div className="space-y-6">
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Seller performance indicators"
      >
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

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
        <IssuesCard
          title="Packaging problems"
          description="Packaging patterns contributing to damage and incomplete returns."
          issues={data.packagingProblems}
          type="packaging"
        />
        <IssuesCard
          title="Listing problems"
          description="Content gaps creating expectation and compatibility issues."
          issues={data.listingProblems}
          type="listing"
        />
      </section>

      <section>
        <LossSummary data={data.estimatedLosses} />
      </section>
    </div>
  );
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
