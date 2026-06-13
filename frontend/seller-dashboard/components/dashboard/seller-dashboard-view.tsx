import { sellerAnalytics } from "@/data/seller-analytics";
import { FraudExposureCard } from "@/components/dashboard/fraud-exposure-card";
import { IssuesCard } from "@/components/dashboard/issues-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LossSummary } from "@/components/dashboard/loss-summary";
import { ReturnCausesChart } from "@/components/dashboard/return-causes-chart";

export function SellerDashboardView() {
  return (
    <div className="space-y-6">
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Seller performance indicators"
      >
        {sellerAnalytics.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <ReturnCausesChart causes={sellerAnalytics.returnCauses} />
        <FraudExposureCard data={sellerAnalytics.fraudExposure} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <IssuesCard
          title="Packaging problems"
          description="Packaging patterns contributing to damage and incomplete returns."
          issues={sellerAnalytics.packagingProblems}
          type="packaging"
        />
        <IssuesCard
          title="Listing problems"
          description="Content gaps creating expectation and compatibility issues."
          issues={sellerAnalytics.listingProblems}
          type="listing"
        />
      </section>

      <section>
        <LossSummary data={sellerAnalytics.estimatedLosses} />
      </section>
    </div>
  );
}
