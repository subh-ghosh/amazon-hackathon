import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecoveryIntelligence as RecoveryIntelligenceType } from "@/types/seller-analytics";
import { Badge } from "@/components/ui/badge";

export function RecoveryIntelligence({ data }: { data: RecoveryIntelligenceType }) {
  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const categories = [
    { label: "Restocked", data: data.restocked, color: "bg-emerald-500", tone: "bg-emerald-50 text-emerald-700" },
    { label: "Refurbished", data: data.refurbished, color: "bg-blue-500", tone: "bg-blue-50 text-blue-700" },
    { label: "Resold (Secondary Market)", data: data.resold, color: "bg-indigo-500", tone: "bg-indigo-50 text-indigo-700" },
    { label: "Donated", data: data.donated, color: "bg-amber-500", tone: "bg-amber-50 text-amber-700" },
    { label: "Recycled", data: data.recycled, color: "bg-slate-400", tone: "bg-slate-100 text-slate-700" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Recovery Intelligence</CardTitle>
            <CardDescription>How Amazon is recovering value from returned inventory across resale and recovery channels.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500">Total Recovered</p>
            <p className="text-2xl font-bold text-emerald-600">{currencyFormatter.format(data.totalRecoveredValue)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar Visualization */}
        <div className="mb-6 h-6 w-full overflow-hidden rounded-full flex">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className={`h-full ${cat.color}`}
              style={{ width: `${cat.data.percentage}%` }}
              title={`${cat.label}: ${cat.data.percentage}%`}
            />
          ))}
        </div>

        {/* Legend and Details */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.filter(c => c.data.percentage > 0).map((cat) => (
            <div key={cat.label} className="rounded-lg border p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${cat.color}`} />
                  <span className="font-semibold text-slate-900">{cat.label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{currencyFormatter.format(cat.data.value)}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-slate-500">{cat.data.count} units</span>
                <Badge className={cat.tone}>
                  {cat.data.percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
