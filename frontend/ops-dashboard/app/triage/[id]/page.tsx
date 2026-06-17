"use client";

import { use, useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, ShieldAlert, Clock, Leaf,
  Activity, Box, MapPin, Loader2, Zap, BarChart3, Users, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { operationsData } from "@/data/operations-data";
import type { TriageItemDetails } from "@/types/operations";

interface Scenario {
  scenario: string;
  recoveryValue: number;
  carbonImpact: number;
  processingTimeDays: number;
  confidence: number;
}

interface RecoveryDecision {
  recommendedDecision: string;
  expectedProfit: number;
  carbonSavings: number;
  processingDays: number;
  confidence: number;
  reasoning: string[];
}

interface LogisticsResult {
  recommendedWarehouse: string;
  recommendedRoute: string;
  estimatedCost: number;
  estimatedDays: number;
  carbonScore: number;
  reasoning: string[];
}

interface CircularResult {
  selectedFacilityId: string;
  selectedFacilityType: string;
  optimizationScore: number;
  sustainabilityMetrics: { estimatedCO2Saved: number; estimatedWasteDivertedKg: number; circularityScore: number };
}

export default function TriageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const data: TriageItemDetails = operationsData.triageDetails[id] || operationsData.triageDetails["RET-9921-A"];

  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [recommended, setRecommended] = useState<RecoveryDecision | null>(null);
  const [logistics, setLogistics] = useState<LogisticsResult | null>(null);
  const [circular, setCircular] = useState<CircularResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const config = getItemConfig(id);

  useEffect(() => { runPipeline(); }, []);

  async function runPipeline() {
    setLoading(true);

    // S5: Get all recovery scenarios
    let sims: Scenario[] = [];
    try {
      const res = await fetch("/api/proxy/s5/api/v1/simulation/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: data.returnId, productId: config.productId,
          category: config.category, conditionScore: config.conditionScore,
          utilityScore: config.utilityScore, fraudScore: config.fraudScore,
          estimatedValue: config.estimatedValue, returnReason: config.returnReason,
          sellerTrustScore: config.sellerTrust,
        }),
      }).then(r => r.json());
      sims = res.simulations || [];
    } catch { /* fallback empty */ }
    setScenarios(sims);

    // S6: Get recommended decision
    let decision: RecoveryDecision | null = null;
    if (sims.length > 0) {
      try {
        const res = await fetch("/api/proxy/s6/api/v1/recovery/optimize", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            returnId: data.returnId, productId: config.productId,
            fraudScore: config.fraudScore, sellerTrustScore: config.sellerTrust,
            simulations: sims,
          }),
        }).then(r => r.json());
        decision = res;
      } catch { /* fallback */ }
    }
    setRecommended(decision);

    // Pre-select the recommended scenario
    if (decision && sims.length > 0) {
      const match = sims.find(s => s.scenario.toUpperCase().includes(decision!.recommendedDecision.toUpperCase()))
        || sims.find(s => decision!.recommendedDecision.toUpperCase().includes(s.scenario.toUpperCase()))
        || sims[0];
      setSelectedScenario(match);
    } else if (sims.length > 0) {
      setSelectedScenario(sims[0]);
    }

    // S7: Logistics
    try {
      const res = await fetch("/api/proxy/s7/api/v1/logistics/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: data.returnId, productId: config.productId,
          recommendedDecision: decision?.recommendedDecision || "RESELL",
          customerLocation: "Bangalore",
          expectedProfit: decision?.expectedProfit || config.estimatedValue * 0.7,
          carbonSavings: decision?.carbonSavings || 5,
          processingDays: decision?.processingDays || 3,
          confidence: decision?.confidence || 0.8,
          reasoning: decision?.reasoning || ["Optimal"],
          warehouses: [
            { warehouseId: "WH-BLR-04", city: "Bangalore", capacity: 82, distanceKm: 18 },
            { warehouseId: "WH-HYD-02", city: "Hyderabad", capacity: 64, distanceKm: 575 },
            { warehouseId: "WH-MAA-01", city: "Chennai", capacity: 71, distanceKm: 346 },
          ],
        }),
      }).then(r => r.json());
      setLogistics(res);
    } catch { /* fallback */ }

    // S9: Circular
    try {
      const res = await fetch("/api/proxy/s9/api/v1/logistics/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: `CIR-${Date.now()}`, returnId: data.returnId, productId: config.productId,
          category: config.category, condition: config.conditionEnum,
          estimatedValue: config.estimatedValue, weightKg: config.weightKg,
          customerLatitude: 12.9716, customerLongitude: 77.5946,
          facilityOptions: [
            { facilityId: "FAC-REFURB-BLR", facilityType: "REFURBISHMENT", distanceKm: 18, capacityAvailable: true },
            { facilityId: "FAC-RESELL-BLR", facilityType: "LIQUIDATION", distanceKm: 22, capacityAvailable: true },
            { facilityId: "FAC-DONATE-BLR", facilityType: "DONATION", distanceKm: 8, capacityAvailable: true },
            { facilityId: "FAC-RECYCLE-HYD", facilityType: "RECYCLING", distanceKm: 575, capacityAvailable: true },
          ],
        }),
      }).then(r => r.json());
      setCircular(res);
    } catch { /* fallback */ }

    setLoading(false);
  }

  const handleExecute = () => {
    setIsRouting(true);
    setTimeout(() => router.push("/"), 1500);
  };

  const isOverride = selectedScenario && recommended &&
    !selectedScenario.scenario.toUpperCase().includes(recommended.recommendedDecision.toUpperCase());

  // Delta vs recommended
  const recommendedScenario = scenarios.find(s =>
    s.scenario.toUpperCase().includes(recommended?.recommendedDecision?.toUpperCase() || ""));
  const valueDelta = selectedScenario && recommendedScenario
    ? selectedScenario.recoveryValue - recommendedScenario.recoveryValue : 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{data.productName}</h1>
          <p className="text-sm text-slate-500 font-mono">Return: {data.returnId}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
          <p className="text-sm text-slate-600">Running recovery analysis...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Item context */}
          <div className="space-y-6 lg:col-span-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Box size={16} />Item Condition</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-amber-50 border border-amber-100 text-sm p-3 rounded-lg italic text-amber-900">
                  &ldquo;{data.customerStatedReason}&rdquo;
                </div>
                <div className="bg-emerald-50 border border-emerald-100 text-sm p-3 rounded-lg text-emerald-900">
                  {data.conditionAssessment}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Activity size={16} />Product Lifecycle</CardTitle></CardHeader>
              <CardContent className="pl-4">
                <div className="border-l-2 border-slate-200 pl-5 space-y-4">
                  {data.twinEvents.map((ev, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[27px] w-3 h-3 rounded-full border-2 border-white ${ev.type === "return" ? "bg-amber-500" : ev.type === "inspection" ? "bg-emerald-500" : "bg-blue-500"}`} />
                      <p className="text-[10px] text-slate-400 font-mono">{ev.date}</p>
                      <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                      <p className="text-xs text-slate-500">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Scenarios + Routing */}
          <div className="space-y-6 lg:col-span-8">

            {/* Recovery Scenarios — selectable */}
            <Card className="border-indigo-200">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Zap size={18} className="text-indigo-600" />Recovery Scenarios</CardTitle>
                <CardDescription>Select a recovery path. The system recommendation is pre-selected.</CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                {scenarios.length === 0 ? (
                  <p className="text-sm text-slate-500">No scenarios available.</p>
                ) : (
                  <div className="space-y-2">
                    {scenarios.map((scenario) => {
                      const isSelected = selectedScenario?.scenario === scenario.scenario;
                      const isRecommended = recommended?.recommendedDecision?.toUpperCase().includes(scenario.scenario.toUpperCase())
                        || scenario.scenario.toUpperCase().includes(recommended?.recommendedDecision?.toUpperCase() || "___");
                      return (
                        <button key={scenario.scenario} onClick={() => setSelectedScenario(scenario)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-indigo-500" : "border-slate-300"}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                              </div>
                              <span className="font-medium text-slate-900">{scenario.scenario}</span>
                              {isRecommended && <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">Recommended</Badge>}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-600">
                              <span className="font-bold text-slate-900">${scenario.recoveryValue.toFixed(0)}</span>
                              <span>{(scenario.confidence * 100).toFixed(0)}%</span>
                              <span>{scenario.processingTimeDays}d</span>
                              <span className="text-emerald-600">{scenario.carbonImpact > 0 ? "-" : ""}{Math.abs(scenario.carbonImpact).toFixed(1)}kg CO₂</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Live metrics for selected option */}
                {selectedScenario && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xl font-bold text-slate-900">${selectedScenario.recoveryValue.toFixed(0)}</p>
                        <p className="text-[10px] text-slate-500 uppercase">Recovery</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xl font-bold text-emerald-700">{Math.abs(selectedScenario.carbonImpact).toFixed(1)}kg</p>
                        <p className="text-[10px] text-slate-500 uppercase">CO₂ Impact</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xl font-bold text-slate-900">{selectedScenario.processingTimeDays}d</p>
                        <p className="text-[10px] text-slate-500 uppercase">Processing</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-700">{(selectedScenario.confidence * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                      </div>
                    </div>

                    {/* Delta vs recommended */}
                    {isOverride && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm">
                        <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
                        <span className="text-amber-800">
                          Manual override: {valueDelta >= 0 ? "+" : ""}{valueDelta.toFixed(0)} vs recommended ({recommended?.recommendedDecision})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Routing */}
            {logistics && (
              <Card className="border-emerald-200">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2"><MapPin size={18} className="text-emerald-600" />Routing</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  <div className="p-3 bg-white border border-emerald-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-900">{logistics.recommendedRoute}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Warehouse: {logistics.recommendedWarehouse} • Cost: ${logistics.estimatedCost.toFixed(2)} • {logistics.estimatedDays} day(s) • Carbon: {logistics.carbonScore.toFixed(0)}/100
                    </p>
                  </div>
                  {circular && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                      <Leaf size={16} className="text-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-emerald-800">
                        Facility: {circular.selectedFacilityId} ({circular.selectedFacilityType}) •
                        Optimization: {circular.optimizationScore.toFixed(0)}% •
                        CO₂ saved: {circular.sustainabilityMetrics.estimatedCO2Saved.toFixed(1)}kg •
                        Circularity: {circular.sustainabilityMetrics.circularityScore}/100
                      </p>
                    </div>
                  )}
                  {/* Reasoning from S6 */}
                  {recommended?.reasoning && recommended.reasoning.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs font-medium text-slate-500 mb-1">Decision factors:</p>
                      <ul className="space-y-0.5">
                        {recommended.reasoning.map((r, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <CheckCircle2 size={10} className="text-indigo-500 mt-0.5" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {!loading && selectedScenario && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 backdrop-blur-xl p-4 z-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isOverride ? (
                <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                  Override: {selectedScenario.scenario} (System recommended {recommended?.recommendedDecision})
                </span>
              ) : (
                <span className="text-sm text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
                  <CheckCircle2 size={14} className="inline mr-1" />{selectedScenario.scenario} • ${selectedScenario.recoveryValue.toFixed(0)} recovery
                </span>
              )}
            </div>
            <button onClick={handleExecute} disabled={isRouting}
              className="px-8 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-md flex items-center gap-2">
              {isRouting ? <><Loader2 size={16} className="animate-spin" />Routing...</> : <>Execute: {selectedScenario.scenario}</>}
            </button>
          </div>
        </div>
      )}

      {isRouting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Routed</h2>
            <p className="text-sm text-slate-500 text-center">
              {data.returnId} → {selectedScenario?.scenario} via {logistics?.recommendedWarehouse || "nearest facility"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function getItemConfig(returnId: string) {
  const configs: Record<string, any> = {
    "RET-9921-A": { productId: "P-88421", category: "Smart Home", conditionScore: 92, utilityScore: 88, fraudScore: 12, estimatedValue: 249.99, returnReason: "DAMAGED_IN_TRANSIT", sellerTrust: 0.92, weightKg: 2.5, conditionEnum: "LIKE_NEW" },
    "RET-9922-B": { productId: "P-88417", category: "Streaming", conditionScore: 74, utilityScore: 65, fraudScore: 8, estimatedValue: 54.99, returnReason: "DEFECTIVE", sellerTrust: 0.88, weightKg: 0.3, conditionEnum: "USED" },
    "RET-9923-C": { productId: "P-88409", category: "E-readers", conditionScore: 88, utilityScore: 82, fraudScore: 5, estimatedValue: 139.99, returnReason: "CHANGED_MIND", sellerTrust: 0.95, weightKg: 0.2, conditionEnum: "LIKE_NEW" },
    "RET-9924-D": { productId: "P-91204", category: "Footwear", conditionScore: 45, utilityScore: 30, fraudScore: 25, estimatedValue: 150.00, returnReason: "WRONG_ITEM", sellerTrust: 0.70, weightKg: 0.8, conditionEnum: "DAMAGED" },
    "RET-9925-E": { productId: "P-73892", category: "Electronics", conditionScore: 30, utilityScore: 20, fraudScore: 75, estimatedValue: 1299.99, returnReason: "DEFECTIVE", sellerTrust: 0.40, weightKg: 0.23, conditionEnum: "BROKEN" },
    "RET-9926-F": { productId: "P-55210", category: "Home Appliance", conditionScore: 62, utilityScore: 55, fraudScore: 10, estimatedValue: 749.99, returnReason: "NOT_AS_DESCRIBED", sellerTrust: 0.85, weightKg: 3.1, conditionEnum: "REFURBISHABLE" },
  };
  return configs[returnId] || configs["RET-9921-A"];
}
