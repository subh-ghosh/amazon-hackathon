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
import type {
  InspectionProduct,
  InspectorStatus,
  Priority,
} from "@/types/operations";

interface InspectionTableProps {
  products: InspectionProduct[];
}

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

export function InspectionTable({ products }: InspectionTableProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Products under inspection</CardTitle>
          <CardDescription className="mt-1.5">
            Live condition assessment and inspector assignments.
          </CardDescription>
        </div>
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          {products.length} active
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Condition score</TableHead>
              <TableHead>Inspector status</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-mono text-xs font-medium text-slate-500">
                  {product.productId}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {product.productName}
                </TableCell>
                <TableCell className="text-slate-600">{product.category}</TableCell>
                <TableCell>
                  <div className="flex min-w-28 items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn("h-full rounded-full", scoreColor(product.conditionScore))}
                        style={{ width: `${product.conditionScore}%` }}
                      />
                    </div>
                    <span className="w-6 font-semibold text-slate-800">
                      {product.conditionScore}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusStyles[product.inspectorStatus]}>
                    {product.inspectorStatus}
                  </Badge>
                  {product.inspector && (
                    <p className="mt-1 text-xs text-slate-400">{product.inspector}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={priorityStyles[product.priority]}>
                    {product.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
