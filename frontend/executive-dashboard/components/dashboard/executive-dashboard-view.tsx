import { AiExecutiveSummary } from "@/components/dashboard/ai-executive-summary";
import { ImpactOverview } from "@/components/dashboard/impact-overview";
import { RecoveryPerformance } from "@/components/dashboard/recovery-performance";
import { RevenueOverview } from "@/components/dashboard/revenue-overview";
import { executiveDashboardData } from "@/data/executive-impact";

export function ExecutiveDashboardView() {
  return (
    <div className="space-y-6">
      <RevenueOverview data={executiveDashboardData.recoveredRevenue} />
      <ImpactOverview
        refundSavings={executiveDashboardData.refundSavings}
        sustainability={executiveDashboardData.sustainability}
        donation={executiveDashboardData.donation}
      />
      <div className="grid gap-6">
        <RecoveryPerformance channels={executiveDashboardData.recoveryPerformance} />
        <AiExecutiveSummary summary={executiveDashboardData.aiSummary} />
      </div>
    </div>
  );
}
