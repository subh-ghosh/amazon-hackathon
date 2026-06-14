import { Activity, Gauge } from "lucide-react";

import {
  RecoveryHistoryTable,
  RepairHistoryTable,
} from "@/components/product-twin/history-table";
import { ProductInformationCard } from "@/components/product-twin/product-information-card";
import { RecoverySimulator } from "@/components/product-twin/recovery-simulator";
import { ScoreCard } from "@/components/product-twin/score-card";
import { TwinRiskCard } from "@/components/product-twin/twin-risk-card";
import type { ProductDigitalTwin } from "@/types/product-twin";

interface ProductTwinViewProps {
  twin: ProductDigitalTwin;
}

export function ProductTwinView({ twin }: ProductTwinViewProps) {
  return (
    <div className="space-y-6">
      <ProductInformationCard twin={twin} />
      <section className="grid gap-6 md:grid-cols-2" aria-label="Product health scores">
        <ScoreCard
          title="Condition score"
          score={twin.conditionScore}
          description="Physical condition based on inspections, repairs, and usage signals."
          icon={Activity}
          accent="emerald"
        />
        <ScoreCard
          title="Utility score"
          score={twin.utilityScore}
          description="Functional performance and expected useful life remaining."
          icon={Gauge}
          accent="blue"
        />
      </section>
      <TwinRiskCard twin={twin} />
      <RepairHistoryTable records={twin.repairHistory} />
      <RecoveryHistoryTable records={twin.recoveryHistory} />
      <RecoverySimulator twin={twin} />
    </div>
  );
}
