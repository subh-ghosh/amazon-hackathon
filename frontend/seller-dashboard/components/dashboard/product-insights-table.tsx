import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductInsight } from "@/types/seller-analytics";

export function ProductInsightsTable({ products }: { products: ProductInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Insights</CardTitle>
        <CardDescription>
          Detailed return analysis and health scores for your top SKUs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product / SKU</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Returns</th>
                <th className="px-4 py-3 font-medium">Return Rate</th>
                <th className="px-4 py-3 font-medium">Health Score</th>
                <th className="px-4 py-3 font-medium">Top Complaints</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {products.map((product) => (
                <tr key={product.sku} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </td>
                  <td className="px-4 py-4">{product.orders.toLocaleString()}</td>
                  <td className="px-4 py-4 font-medium text-rose-600">{product.returns.toLocaleString()}</td>
                  <td className="px-4 py-4 font-semibold">{product.returnRate.toFixed(1)}%</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${product.healthScore >= 80 ? "text-emerald-600" : product.healthScore >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                        {product.healthScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="list-inside list-disc text-xs text-slate-600 space-y-1">
                      {product.topComplaints.map((complaint, i) => (
                        <li key={i}>{complaint}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
