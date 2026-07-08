import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { InspectionProduct, InspectorStatus, Priority } from "@/types/operations";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

const statusStyles: Record<InspectorStatus, string> = {
  "In progress": "border-blue-200 bg-blue-50 text-blue-700",
  Waiting: "border-slate-200 bg-slate-50 text-slate-600",
  Escalated: "border-rose-200 bg-rose-50 text-rose-700",
};

const priorityStyles: Record<Priority, string> = {
  Urgent: "border-rose-200 bg-rose-50 text-rose-700",
  High: "border-amber-200 bg-amber-50 text-amber-700",
  Normal: "border-slate-200 bg-white text-slate-600",
};

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export function InspectionTable({ products }: { products: InspectionProduct[] }) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Algorithmic Triage Queue</CardTitle>
          <CardDescription className="mt-1.5">
            Items pending physical induction and automated S6 decision generation.
          </CardDescription>
        </div>
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          {products.length} active
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / Category</TableHead>
                <TableHead>Return ID</TableHead>
                <TableHead>Condition Score</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Arrival Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.returnId}
                  className="cursor-pointer hover:bg-slate-50 transition-colors group"
                  onClick={() => router.push(`/triage/${product.returnId}`)}
                >
                  <TableCell>
                    <p className="font-medium text-slate-900">{product.productName}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-medium text-slate-500">
                    {product.returnId}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-28 items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", scoreColor(product.conditionScore))}
                          style={{ width: `${product.conditionScore}%` }}
                        />
                      </div>
                      <span className="w-6 text-xs font-semibold text-slate-800">
                        {product.conditionScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityStyles[product.priority]}>
                      {product.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {product.arrivalTime}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[product.inspectorStatus]}>
                      {product.inspectorStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      Run S6 Triage <ExternalLink className="size-3" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
