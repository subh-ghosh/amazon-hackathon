import { DonationCandidates } from "@/components/dashboard/donation-candidates";
import { FraudAlerts } from "@/components/dashboard/fraud-alerts";
import { InspectionTable } from "@/components/dashboard/inspection-table";
import { RecoveryPipeline } from "@/components/dashboard/recovery-pipeline";
import { RepairQueue } from "@/components/dashboard/repair-queue";
import { ReturnsKpis } from "@/components/dashboard/returns-kpis";
import { operationsData } from "@/data/operations-data";

export function OperationsDashboardView() {
  return (
    <div className="space-y-6">
      <ReturnsKpis data={operationsData.returns} />
      <RecoveryPipeline
        stages={operationsData.pipeline}
        outcomes={operationsData.outcomes}
      />
      <InspectionTable products={operationsData.inspections} />
      <section className="grid gap-6 lg:grid-cols-2">
        <RepairQueue items={operationsData.repairQueue} />
        <DonationCandidates candidates={operationsData.donationCandidates} />
      </section>
      <FraudAlerts alerts={operationsData.fraudAlerts} />
    </div>
  );
}
