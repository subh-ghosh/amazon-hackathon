import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialBreakdown } from "@/types/executive-impact";

export function FinancialImpact({ data }: { data: FinancialBreakdown }) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(val);
  };

  const breakdowns = [
    { label: "Resale Revenue", value: data.resaleRevenue, color: "bg-emerald-500" },
    { label: "Refurbishment Recovery", value: data.refurbishmentRecovery, color: "bg-blue-500" },
    { label: "Returnless Refund Savings", value: data.returnlessSavings, color: "bg-indigo-500" },
    { label: "Fraud Prevention Savings", value: data.fraudSavings, color: "bg-violet-500" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Impact</CardTitle>
        <CardDescription>Breakdown of revenue recovered and costs avoided.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Total Financial Value Generated</p>
          <p className="text-4xl font-bold text-emerald-600 mt-1">{formatCurrency(data.totalRecovered)}</p>
        </div>

        <div className="space-y-4">
          {breakdowns.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color}`} 
                  style={{ width: `${(item.value / data.totalRecovered) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
