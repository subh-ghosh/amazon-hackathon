import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  HandHeart,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Fit = "Best fit" | "Strong fit" | "Conditional";

interface DonationOption {
  productCategory: string;
  productCondition: string;
  recommendedNgo: string;
  recommendedRegion: string;
  socialImpactScore: number;
  estimatedBeneficiaries: number;
  carbonSavingsKg: number;
  donationRecommendation: string;
  fit: Fit;
}

interface RegionRank {
  region: string;
  needIndex: number;
  ngoCapacity: string;
  beneficiaryReach: number;
  carbonSavingsKg: number;
}

const donationOptions: DonationOption[] = [
  {
    productCategory: "Small Home Appliances",
    productCondition: "Functional, damaged retail packaging",
    recommendedNgo: "Goonj Urban Relief Network",
    recommendedRegion: "Delhi NCR",
    socialImpactScore: 94,
    estimatedBeneficiaries: 420,
    carbonSavingsKg: 318,
    donationRecommendation:
      "Donate immediately to family support kits for verified low-income households.",
    fit: "Best fit",
  },
  {
    productCategory: "Consumer Electronics",
    productCondition: "Open box, minor cosmetic wear",
    recommendedNgo: "Digital Empowerment Foundation",
    recommendedRegion: "Rural Karnataka",
    socialImpactScore: 91,
    estimatedBeneficiaries: 280,
    carbonSavingsKg: 246,
    donationRecommendation:
      "Route to digital learning centers after data wipe and accessory bundling.",
    fit: "Best fit",
  },
  {
    productCategory: "Apparel & Footwear",
    productCondition: "New, label removed",
    recommendedNgo: "GiveIndia Community Closet",
    recommendedRegion: "Maharashtra",
    socialImpactScore: 88,
    estimatedBeneficiaries: 610,
    carbonSavingsKg: 184,
    donationRecommendation:
      "Donate through seasonal clothing drives with size-based allocation.",
    fit: "Strong fit",
  },
  {
    productCategory: "Books & Learning",
    productCondition: "Good, light cover scuffs",
    recommendedNgo: "Pratham Books Library Program",
    recommendedRegion: "Uttar Pradesh",
    socialImpactScore: 86,
    estimatedBeneficiaries: 950,
    carbonSavingsKg: 92,
    donationRecommendation:
      "Bundle into classroom library packs for high-demand government schools.",
    fit: "Strong fit",
  },
  {
    productCategory: "Health & Personal Care",
    productCondition: "Sealed, outer carton crushed",
    recommendedNgo: "HelpAge India Care Homes",
    recommendedRegion: "Tamil Nadu",
    socialImpactScore: 82,
    estimatedBeneficiaries: 190,
    carbonSavingsKg: 76,
    donationRecommendation:
      "Donate after compliance screening and expiry-date validation.",
    fit: "Conditional",
  },
];

const regionRankings: RegionRank[] = [
  {
    region: "Delhi NCR",
    needIndex: 96,
    ngoCapacity: "High",
    beneficiaryReach: 420,
    carbonSavingsKg: 318,
  },
  {
    region: "Rural Karnataka",
    needIndex: 92,
    ngoCapacity: "High",
    beneficiaryReach: 280,
    carbonSavingsKg: 246,
  },
  {
    region: "Maharashtra",
    needIndex: 89,
    ngoCapacity: "Medium",
    beneficiaryReach: 610,
    carbonSavingsKg: 184,
  },
  {
    region: "Uttar Pradesh",
    needIndex: 87,
    ngoCapacity: "Medium",
    beneficiaryReach: 950,
    carbonSavingsKg: 92,
  },
];

const selectedDonation = donationOptions[0];

const impactSummary = [
  {
    label: "Social impact score",
    value: `${selectedDonation.socialImpactScore}/100`,
    detail: "Highest weighted match",
    icon: Sparkles,
    accent: "emerald",
  },
  {
    label: "Estimated beneficiaries",
    value: selectedDonation.estimatedBeneficiaries.toLocaleString("en-US"),
    detail: "Across first allocation batch",
    icon: Users,
    accent: "blue",
  },
  {
    label: "Carbon savings",
    value: `${selectedDonation.carbonSavingsKg} kg`,
    detail: "CO2e avoided vs disposal",
    icon: Leaf,
    accent: "emerald",
  },
  {
    label: "Donation readiness",
    value: "97%",
    detail: "NGO capacity and compliance",
    icon: BadgeCheck,
    accent: "blue",
  },
] as const;

const fitStyles: Record<Fit, string> = {
  "Best fit": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Strong fit": "border-blue-200 bg-blue-50 text-blue-700",
  Conditional: "border-amber-200 bg-amber-50 text-amber-700",
};

const accentStyles = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
} as const;

export function DonationIntelligenceDashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {impactSummary.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    accentStyles[item.accent],
                  )}
                >
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>NGO recommendation table</CardTitle>
                <CardDescription>
                  Ranked donation destinations for returned products excluded
                  from resale.
                </CardDescription>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                5 eligible routes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Category</TableHead>
                  <TableHead>Product Condition</TableHead>
                  <TableHead>Recommended NGO</TableHead>
                  <TableHead>Recommended Region</TableHead>
                  <TableHead>Social Impact Score</TableHead>
                  <TableHead>Estimated Beneficiaries</TableHead>
                  <TableHead>Carbon Savings</TableHead>
                  <TableHead>Donation Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donationOptions.map((option) => (
                  <TableRow key={`${option.productCategory}-${option.recommendedNgo}`}>
                    <TableCell className="min-w-44 font-medium text-slate-900">
                      {option.productCategory}
                    </TableCell>
                    <TableCell className="min-w-52 text-slate-600">
                      {option.productCondition}
                    </TableCell>
                    <TableCell className="min-w-52">
                      <div className="font-medium text-slate-900">
                        {option.recommendedNgo}
                      </div>
                      <Badge className={cn("mt-2", fitStyles[option.fit])}>
                        {option.fit}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-40 text-slate-700">
                      {option.recommendedRegion}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-700">
                      {option.socialImpactScore}
                    </TableCell>
                    <TableCell>
                      {option.estimatedBeneficiaries.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell>{option.carbonSavingsKg} kg CO2e</TableCell>
                    <TableCell className="min-w-72 leading-6 text-slate-600">
                      {option.donationRecommendation}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white">
          <CardContent className="flex h-full flex-col p-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <HandHeart className="size-4" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                Donation decision card
              </p>
            </div>
            <div className="mt-7 flex size-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
              <ShieldCheck className="size-7" aria-hidden="true" />
            </div>
            <p className="mt-6 text-3xl font-bold tracking-tight">
              Donate to {selectedDonation.recommendedNgo}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {selectedDonation.productCategory} returns are functional but not
              resale-ready. The strongest outcome is donation in{" "}
              {selectedDonation.recommendedRegion}, where NGO capacity, need,
              and carbon avoidance align.
            </p>

            <dl className="mt-8 grid gap-3 border-t border-slate-800 pt-5">
              <DecisionMetric label="Product Category" value={selectedDonation.productCategory} />
              <DecisionMetric label="Product Condition" value={selectedDonation.productCondition} />
              <DecisionMetric label="Recommended Region" value={selectedDonation.recommendedRegion} />
              <DecisionMetric
                label="Social Impact Score"
                value={`${selectedDonation.socialImpactScore}/100`}
              />
            </dl>

            <div className="mt-auto pt-8">
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-emerald-400" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Donation Recommendation
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {selectedDonation.donationRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Region ranking</CardTitle>
            <CardDescription>
              Prioritized by demand, NGO throughput, beneficiary reach, and
              avoided disposal emissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {regionRankings.map((region, index) => (
              <div key={region.region}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{region.region}</p>
                      <p className="text-xs text-slate-500">
                        {region.ngoCapacity} NGO capacity
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {region.needIndex}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${region.needIndex}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation signals</CardTitle>
            <CardDescription>
              Operational checks that support the top donation recommendation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SignalCard
              icon={PackageCheck}
              label="Inventory eligibility"
              value="Non-resellable, usable"
              detail="Failed packaging standard but passed safety and function checks."
            />
            <SignalCard
              icon={MapPin}
              label="Regional demand"
              value="Very high"
              detail="Household appliance requests exceed available NGO stock this week."
            />
            <SignalCard
              icon={Boxes}
              label="Batch efficiency"
              value="128 units ready"
              detail="Consolidated dispatch lowers handling cost and emissions per unit."
            />
            <SignalCard
              icon={ArrowRight}
              label="Next workflow"
              value="Create donation order"
              detail="Generate NGO manifest, compliance notes, and carrier pickup."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function DecisionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-48 text-right font-semibold text-slate-100">{value}</dd>
    </div>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof PackageCheck;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}
