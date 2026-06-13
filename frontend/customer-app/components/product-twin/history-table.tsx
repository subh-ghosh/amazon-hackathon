import { Wrench } from "lucide-react";

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
import type { RecoveryRecord, RepairRecord } from "@/types/product-twin";

interface RepairHistoryTableProps {
  records: RepairRecord[];
}

interface RecoveryHistoryTableProps {
  records: RecoveryRecord[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100">
        <Wrench className="size-5 text-slate-500" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function RepairHistoryTable({ records }: RepairHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair history</CardTitle>
        <CardDescription>
          Service events recorded across the product lifecycle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState message="No repair events have been recorded." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {dateFormatter.format(new Date(record.date))}
                  </TableCell>
                  <TableCell>{record.service}</TableCell>
                  <TableCell>{record.provider}</TableCell>
                  <TableCell>
                    {record.partsReplaced.length
                      ? record.partsReplaced.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>{currencyFormatter.format(record.cost)}</TableCell>
                  <TableCell>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function RecoveryHistoryTable({ records }: RecoveryHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery history</CardTitle>
        <CardDescription>
          Previous returns, trade-ins, and circular outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState message="No recovery events have been recorded." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Value recovered</TableHead>
                <TableHead>CO2e avoided</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {dateFormatter.format(new Date(record.date))}
                  </TableCell>
                  <TableCell>
                    <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                      {record.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.outcome}</TableCell>
                  <TableCell>
                    {currencyFormatter.format(record.valueRecovered)}
                  </TableCell>
                  <TableCell>{record.carbonAvoidedKg.toFixed(1)} kg</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
