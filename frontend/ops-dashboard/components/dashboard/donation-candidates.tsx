import { HeartHandshake, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DonationCandidate } from "@/types/operations";

interface DonationCandidatesProps {
  candidates: DonationCandidate[];
}

export function DonationCandidates({ candidates }: DonationCandidatesProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <HeartHandshake className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Donation candidates</CardTitle>
        <CardDescription>
          Functional products matched to eligible nonprofit partners.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {candidates.map((candidate) => (
          <div
            key={candidate.productId}
            className="border-b py-4 first:pt-0 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {candidate.productName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {candidate.productId} · {candidate.category}
                </p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Impact {candidate.impactScore}
              </Badge>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Suggested NGO</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                  {candidate.suggestedNgo}
                </p>
                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                  <Users className="size-3.5" aria-hidden="true" />
                  {candidate.beneficiaries}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
