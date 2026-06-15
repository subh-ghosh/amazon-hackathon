import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReturnIntelligence as ReturnIntelligenceType, IntelligenceItem } from "@/types/executive-impact";

export function ReturnIntelligence({ data }: { data: ReturnIntelligenceType }) {
  const renderList = (title: string, items: IntelligenceItem[]) => (
    <div className="bg-slate-50 rounded-xl p-4 border">
      <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="font-bold text-slate-900">{item.value} ({item.percentage}%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-500 rounded-full" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Intelligence</CardTitle>
        <CardDescription>Network-wide analysis of "Why are returns happening?"</CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-4">
        {renderList("Top Return Categories", data.topCategories)}
        {renderList("Top Return Reasons", data.topReasons)}
        {renderList("Top Packaging Issues", data.packagingIssues)}
        {renderList("Seller Problem Areas", data.sellerProblemAreas)}
      </CardContent>
    </Card>
  );
}
