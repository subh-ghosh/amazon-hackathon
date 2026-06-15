import { Box, FileWarning } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SellerIssue } from "@/types/seller-analytics";

interface IssuesCardProps {
  title: string;
  description: string;
  issues: SellerIssue[];
  type: "packaging" | "listing";
}

const severityStyles: Record<SellerIssue["severity"], string> = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
};

export function IssuesCard({
  title,
  description,
  issues,
  type,
}: IssuesCardProps) {
  const Icon = type === "packaging" ? Box : FileWarning;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {issues.map((issue) => (
          <div
            key={issue.title}
            className="border-b py-4 first:pt-0 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">{issue.title}</p>
              <Badge className={cn("shrink-0", severityStyles[issue.severity])}>
                {issue.severity}
              </Badge>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-500">{issue.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
              <span>{issue.affectedOrders} affected returns</span>
              {typeof issue.returnCorrelation === "number" && (
                <span>{issue.returnCorrelation}% return correlation</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
