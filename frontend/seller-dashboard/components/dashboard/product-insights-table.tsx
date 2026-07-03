import { ChevronRight, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductInsight } from "@/types/seller-analytics";

interface ProductInsightsTableProps {
  products: ProductInsight[];
  onSelectProduct: (product: ProductInsight) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ProductInsightsTable({ products, onSelectProduct }: ProductInsightsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Catalog</CardTitle>
        <CardDescription>
          Click any product to view its full return analysis, packaging & listing diagnostics, recovery outcomes, and actionable recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((product) => {
          const isHealthy = product.healthScore >= 85;
          const isWarning = product.healthScore >= 70 && product.healthScore < 85;

          return (
            <button
              key={product.sku}
              type="button"
              onClick={() => onSelectProduct(product)}
              className="group hover-lift w-full text-left rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <div className="flex items-center gap-4">
                {/* Health Indicator */}
                <div className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                  isHealthy ? "bg-emerald-50 text-emerald-600" :
                  isWarning ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                )}>
                  <span>{product.healthScore}</span>
                  <span className="text-[9px] font-semibold opacity-60">/100</span>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{product.name}</h3>
                    <Badge className={cn(
                      "text-[10px]",
                      isHealthy ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                      isWarning ? "border-amber-200 bg-amber-50 text-amber-700" :
                      "border-rose-200 bg-rose-50 text-rose-700"
                    )}>
                      {isHealthy ? "Healthy" : isWarning ? "Needs Attention" : "Critical"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.sku} · {product.category} · {currencyFormatter.format(product.price)}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Orders</p>
                    <p className="text-sm font-bold text-slate-800">{product.orders.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Returns</p>
                    <p className="text-sm font-bold text-rose-600">{product.returns}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rate</p>
                    <p className={cn("text-sm font-bold", product.returnRate > 10 ? "text-rose-600" : product.returnRate > 5 ? "text-amber-600" : "text-emerald-600")}>
                      {product.returnRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Issue</p>
                    <p className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{product.topComplaints[0]}</p>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="size-5 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </div>

              {/* Mobile Stats Row */}
              <div className="flex items-center gap-4 mt-3 sm:hidden text-xs">
                <span className="text-slate-500">{product.orders.toLocaleString()} orders</span>
                <span className="text-rose-500 font-semibold">{product.returns} returns ({product.returnRate}%)</span>
                <span className="text-slate-400">Top: {product.topComplaints[0]}</span>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
