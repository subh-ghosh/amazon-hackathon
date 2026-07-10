"use client";

import React from "react";
import { Cpu, ShieldAlert, BadgeCheck, Wrench, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function VisualInspectionAnalytics() {
  // Aggregate visual inspection dashboard analytics (real/simulated dashboard summary)
  const analytics = {
    avgConditionScore: 82.4,
    mostCommonDamage: "Scratch",
    avgRepairCost: 1120,
    recoverySuccessRate: 95.8,
    recoveredRevenue: "₹38.4L",
    damageDistribution: [
      { name: "Scratch", percentage: 38, count: 441, color: "bg-emerald-500" },
      { name: "Dent", percentage: 24, count: 278, color: "bg-amber-500" },
      { name: "Packaging Damage", percentage: 16, count: 185, color: "bg-yellow-500" },
      { name: "Broken Screen", percentage: 11, count: 128, color: "bg-orange-500" },
      { name: "Missing Accessory", percentage: 7, count: 81, color: "bg-indigo-500" },
      { name: "Water Damage", percentage: 4, count: 47, color: "bg-rose-500" },
    ],
  };

  return (
    <Card className="border-indigo-150 shadow-md">
      <CardHeader className="bg-indigo-50/40 border-b border-indigo-100/50 pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-indigo-600 animate-pulse" size={20} />
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">AI Visual Inspection Analytics</CardTitle>
            <CardDescription className="text-xs">Aggregate telemetry from YOLOv8 returns damage scanners network-wide.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Avg Condition</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{analytics.avgConditionScore}</span>
              <span className="text-[10px] text-emerald-600 font-bold">Excellent</span>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Common Damage</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 truncate max-w-full">{analytics.mostCommonDamage}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Avg Repair Cost</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">₹{analytics.avgRepairCost}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Recovered Value</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{analytics.recoveredRevenue}</span>
              <span className="text-[10px] text-indigo-600 font-bold">ROI 128%</span>
            </div>
          </div>
        </div>

        {/* Damage Distribution Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <BarChart3 size={14} className="text-slate-500" />
              <span>Scanned Blemish Distribution</span>
            </div>
            <span className="text-xs font-bold text-indigo-600">Total Inspections: 1,160</span>
          </div>

          {/* Stacked Percentage Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex mb-4">
            {analytics.damageDistribution.map((item, idx) => (
              <div 
                key={idx} 
                className={`${item.color} h-full`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.name}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.damageDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                <span className="text-slate-600 font-medium truncate">{item.name}</span>
                <span className="text-slate-900 font-bold ml-auto">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Network Metrics Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
            <span className="text-slate-500 font-medium">AI Return Fraud Flag Rate:</span>
            <span className="font-black text-rose-600">4.6%</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
            <span className="text-slate-500 font-medium">Transit Blemish Mismatch Rate:</span>
            <span className="font-black text-amber-600">8.2%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
