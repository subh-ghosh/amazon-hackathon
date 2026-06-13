import {
  AlertTriangle,
  ArrowUpRight,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  ExecutiveInsight,
  ExecutiveSummary,
} from "@/types/executive-impact";

interface AiExecutiveSummaryProps {
  summary: ExecutiveSummary;
}

interface SummaryGroupProps {
  title: string;
  items: ExecutiveInsight[];
  icon: LucideIcon;
  tone: "emerald" | "rose" | "blue" | "violet";
}

const toneStyles = {
  emerald: {
    icon: "bg-emerald-400/10 text-emerald-300",
    label: "text-emerald-300",
  },
  rose: {
    icon: "bg-rose-400/10 text-rose-300",
    label: "text-rose-300",
  },
  blue: {
    icon: "bg-blue-400/10 text-blue-300",
    label: "text-blue-300",
  },
  violet: {
    icon: "bg-violet-400/10 text-violet-300",
    label: "text-violet-300",
  },
} as const;

export function AiExecutiveSummary({ summary }: AiExecutiveSummaryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-executive">
      <div className="border-b border-slate-800 p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold">AI executive summary</h2>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  Updated live
                </Badge>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                {summary.headline}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
          >
            View strategic brief
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid divide-y divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        <SummaryGroup
          title="Key insights"
          items={summary.insights}
          icon={TrendingUp}
          tone="emerald"
        />
        <SummaryGroup
          title="Risks"
          items={summary.risks}
          icon={AlertTriangle}
          tone="rose"
        />
        <SummaryGroup
          title="Opportunities"
          items={summary.opportunities}
          icon={Lightbulb}
          tone="blue"
        />
        <SummaryGroup
          title="Recommendations"
          items={summary.recommendations}
          icon={Target}
          tone="violet"
        />
      </div>
    </section>
  );
}

function SummaryGroup({
  title,
  items,
  icon: Icon,
  tone,
}: SummaryGroupProps) {
  const styles = toneStyles[tone];

  return (
    <div className="p-6">
      <div className={`flex size-9 items-center justify-center rounded-lg ${styles.icon}`}>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <p className={`mt-4 text-xs font-semibold uppercase tracking-wider ${styles.label}`}>
        {title}
      </p>
      <div className="mt-4 space-y-5">
        {items.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-semibold text-slate-100">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
