"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Activity, Target } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  { name: "Approved", value: 85, color: "#22c55e" },
  { name: "OTP Triggered", value: 10, color: "#eab308" },
  { name: "Manual Review", value: 3, color: "#f97316" },
  { name: "Blocked (Fraud)", value: 2, color: "#ef4444" },
];

const latestBlocks = [
  { reason: "High Geolocation Delta (> 1000mi)", score: 92, status: "Blocked" },
  { reason: "Graph Node: 1-Hop to Banned IP", score: 88, status: "Blocked" },
  { reason: "Velocity Spike (Same ASIN)", score: 85, status: "Blocked" },
  { reason: "Bot Keystroke Dynamics", score: 98, status: "Blocked" }
];

export function FraudAnalytics() {
  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-red-500" />
          <CardTitle>Pre-Order Fraud Engine (Live)</CardTitle>
        </div>
        <CardDescription>Real-time XGBoost ML Risk Scoring & Network Graph Analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Activity className="size-4 text-blue-500"/>
              Latest Interceptions
            </h4>
            <div className="space-y-2">
              {latestBlocks.map((block, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-md border text-sm">
                  <span className="font-medium text-slate-700">{block.reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                      Score: {block.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-[200px] w-full flex flex-col items-center">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Target className="size-4 text-purple-500"/>
              Order Action Distribution
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs mt-2">
              <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-green-500" /> Legit</div>
              <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-red-500" /> Fraud</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
