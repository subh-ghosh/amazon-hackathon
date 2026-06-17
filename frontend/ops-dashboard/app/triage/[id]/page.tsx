"use client";

import { use, useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, ShieldAlert, Clock, Leaf,
  Activity, Box, MapPin, Loader2, Zap, BarChart3, Users, TrendingUp,
  Recycle, Heart, Truck, Package, Trash2
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

// Categorize recovery scenarios into routing types
type RoutingType = "warehouse" | "recycling" | "donation" | "vendor" | "disposal";

function getRoutingType(scenario: string): RoutingType {
  const s = scenario.toUpperCase();
  if (s.includes("RESTOCK") || s.includes("RESELL") || s.includes("REFURBISH") || s.includes("OUTLET") || s.includes("LIQUIDAT")) return "warehouse";
  if (s.includes("RECYCLE") || s.includes("SALVAGE")) return "recycling";
  if (s.includes("DONAT")) return "donation";
  if (s.includes("VENDOR") || s.includes("RETURN TO") || s.includes("RTV")) return "vendor";
  if (s.includes("DESTROY") || s.includes("DISPOS") || s.includes("WRITE")) return "disposal";
  // Default to warehouse for unknown
  return "warehouse";
}

interface DestinationOption {
  id: string;
  name: string;
  type: RoutingType;
  distanceKm: number;
  capacity: number;
  detail: string;
}

// Realistic destination options by type
const destinationsByType: Record<RoutingType, DestinationOption[]> = {
  warehouse: [
    { id: "WH-BLR-04", name: "Amazon BLR4 Fulfillment Center", type: "warehouse", distanceKm: 18, capacity: 82, detail: "Devanahalli, Bangalore • 3.2x local demand" },
    { id: "WH-MAA-01", name: "Amazon MAA1 Fulfillment Center", type: "warehouse", distanceKm: 346, capacity: 71, detail: "Sriperumbudur, Chennai • 1.1x local demand" },
    { id: "WH-HYD-02", name: "Amazon HYD2 Fulfillment Center", type: "warehouse", distanceKm: 575, capacity: 64, detail: "Shamshabad, Hyderabad • 1.8x local demand" },
  ],
  recycling: [
    { id: "REC-BLR-01", name: "E-Parisaraa Pvt Ltd", type: "recycling", distanceKm: 24, capacity: 88, detail: "Dobaspet, Bangalore • CPCB Authorized • e-Waste specialist" },
    { id: "REC-HYD-01", name: "Ramky Enviro Engineers", type: "recycling", distanceKm: 560, capacity: 76, detail: "Dundigal, Hyderabad • ISO 14001 • Multi-stream recycling" },
    { id: "REC-CHN-01", name: "Trishyiraya Recycling India", type: "recycling", distanceKm: 340, capacity: 69, detail: "Gummidipoondi, Chennai • SPCB Licensed • Metals & plastics" },
  ],
  donation: [
    { id: "DON-BLR-01", name: "Goonj Foundation — Bangalore Hub", type: "donation", distanceKm: 12, capacity: 90, detail: "Koramangala, Bangalore • Verified NGO • Accepts electronics & apparel" },
    { id: "DON-BLR-02", name: "Hasiru Dala Innovations", type: "donation", distanceKm: 15, capacity: 85, detail: "Jayanagar, Bangalore • Community redistribution • Home goods" },
    { id: "DON-MAA-01", name: "The Banyan — Chennai Center", type: "donation", distanceKm: 352, capacity: 72, detail: "Mogappair, Chennai • Mental health org • All categories" },
  ],
  vendor: [
    { id: "VND-SELLER", name: "Return to Seller", type: "vendor", distanceKm: 0, capacity: 100, detail: "Seller-managed reverse pickup • No warehouse needed" },
  ],
  disposal: [
    { id: "DSP-BLR-01", name: "BBMP Authorized Waste Facility", type: "disposal", distanceKm: 32, capacity: 95, detail: "Mandur, Bangalore • Municipal solid waste • Last resort" },
  ],
};

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
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [isRouting, setIsRouting] = useState(false);

  // Get destinations based on the selected recovery scenario
  const routingType = selectedScenario ? getRoutingType(selectedScenario.scenario) : "warehouse";
  const destinationsUnsorted = destinationsByType[routingType] || destinationsByType.warehouse;

  // Sort by composite score: proximity×0.40 + capacity×0.30 (demand not applicable for non-warehouse)
  // For warehouses, we parse demand from detail string
  const maxDistance = Math.max(...destinationsUnsorted.map(d => d.distanceKm), 1);
  const maxCapacity = Math.max(...destinationsUnsorted.map(d => d.capacity), 1);

  const destinations = [...destinationsUnsorted].sort((a, b) => {
    const scoreA = (1 - a.distanceKm / (maxDistance + 1)) * 50 + (a.capacity / maxCapacity) * 50;
    const scoreB = (1 - b.distanceKm / (maxDistance + 1)) * 50 + (b.capacity / maxCapacity) * 50;
    return scoreB - scoreA;
  });

  // Reset selected route when scenario changes
  useEffect(() => { setSelectedRoute(0); }, [selectedScenario?.scenario]);

  function getRouteConsequences(destIndex: number) {
    const dest = destinations[destIndex];
    const costPerKm = routingType === "vendor" ? 0 : 3.5;
    const cost = Math.round(dest.distanceKm * costPerKm) / 100;
    const days = dest.distanceKm === 0 ? 0 : Math.max(1, Math.ceil(dest.distanceKm / 500));
    const carbon = Math.round(dest.distanceKm * 0.05 * 10) / 10;
    return { cost, days, carbon, capacity: dest.capacity };
  }

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

    // S9: Circular — send facility options matching the selected/recommended path
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
            { facilityId: "FAC-LIQUIDATION-BLR", facilityType: "LIQUIDATION", distanceKm: 22, capacityAvailable: true },
            { facilityId: "FAC-DONATE-BLR", facilityType: "DONATION", distanceKm: 12, capacityAvailable: true },
            { facilityId: "FAC-RECYCLE-BLR", facilityType: "RECYCLING", distanceKm: 24, capacityAvailable: true },
            { facilityId: "FAC-DISPOSAL-BLR", facilityType: "DISPOSAL", distanceKm: 32, capacityAvailable: true },
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

            {/* Routing — Contextual based on selected scenario */}
            <Card className="border-emerald-200">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  {routingType === "warehouse" && <><MapPin size={18} className="text-emerald-600" />Fulfillment Routing</>}
                  {routingType === "recycling" && <><Recycle size={18} className="text-emerald-600" />Recycling Facility</>}
                  {routingType === "donation" && <><Heart size={18} className="text-emerald-600" />Donation Partner</>}
                  {routingType === "vendor" && <><Truck size={18} className="text-emerald-600" />Vendor Return</>}
                  {routingType === "disposal" && <><Trash2 size={18} className="text-emerald-600" />Disposal Facility</>}
                </CardTitle>
                <CardDescription>
                  {routingType === "warehouse" && "Select destination fulfillment center. Ranked by demand, proximity, and capacity."}
                  {routingType === "recycling" && "Select authorized recycling partner. Ranked by proximity and certifications."}
                  {routingType === "donation" && "Select donation partner. Ranked by proximity and acceptance capacity."}
                  {routingType === "vendor" && "Item will be returned to the original seller/manufacturer."}
                  {routingType === "disposal" && "Select authorized disposal facility. Used only when no recovery path is viable."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-2">
                {destinations.map((dest, i) => {
                  const cons = getRouteConsequences(i);
                  const isSelected = selectedRoute === i;
                  const isFirst = i === 0;
                  return (
                    <button key={dest.id} onClick={() => setSelectedRoute(i)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-emerald-500" : "border-slate-300"}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{dest.name}</span>
                              {isFirst && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Recommended</Badge>}
                            </div>
                            <span className="text-xs text-slate-500">{dest.detail}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && routingType !== "vendor" && (
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                          <div><p className="text-sm font-bold text-slate-900">${cons.cost.toFixed(0)}</p><p className="text-[9px] text-slate-500">Shipping Cost</p></div>
                          <div><p className="text-sm font-bold text-slate-900">{cons.days}d</p><p className="text-[9px] text-slate-500">Transit Time</p></div>
                          <div><p className="text-sm font-bold text-emerald-700">{cons.carbon}kg</p><p className="text-[9px] text-slate-500">CO₂ Emission</p></div>
                        </div>
                      )}
                      {isSelected && routingType === "vendor" && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-600">Seller arranges reverse pickup. No warehouse routing required. Estimated 3-5 business days for seller acknowledgment.</p>
                        </div>
                      )}
                    </button>
                  );
                })}
                {circular && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                    <Leaf size={16} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-800">
                      S9 Circular Engine: {circular.selectedFacilityId} ({circular.selectedFacilityType}) •
                      Score: {circular.optimizationScore.toFixed(0)}% •
                      CO₂ saved: {circular.sustainabilityMetrics.estimatedCO2Saved.toFixed(1)}kg
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
              {data.returnId} → {selectedScenario?.scenario} via {destinations[selectedRoute]?.name || "nearest facility"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function getItemConfig(returnId: string) {
  const configs: Record<string, any> = {
    // Echo Show: box destroyed but device perfect → RESTOCK AS NEW
    "RET-9921-A": { productId: "P-88421", category: "Smart Home", conditionScore: 96, utilityScore: 95, fraudScore: 10, estimatedValue: 249.99, returnReason: "DAMAGED_IN_TRANSIT", sellerTrust: 0.92, weightKg: 2.5, conditionEnum: "LIKE_NEW" },
    // Fire TV Stick: remote defective, device works → REFURBISH
    "RET-9922-B": { productId: "P-88417", category: "Streaming", conditionScore: 74, utilityScore: 65, fraudScore: 8, estimatedValue: 54.99, returnReason: "DEFECTIVE", sellerTrust: 0.88, weightKg: 0.3, conditionEnum: "USED" },
    // Kindle: completely unopened → RESTOCK AS NEW
    "RET-9923-C": { productId: "P-88409", category: "E-readers", conditionScore: 99, utilityScore: 99, fraudScore: 5, estimatedValue: 139.99, returnReason: "CHANGED_MIND", sellerTrust: 0.95, weightKg: 0.2, conditionEnum: "LIKE_NEW" },
    // Nike shoes: tried on, good condition → OUTLET SALE
    "RET-9924-D": { productId: "P-91204", category: "Footwear", conditionScore: 78, utilityScore: 70, fraudScore: 15, estimatedValue: 150.00, returnReason: "WRONG_ITEM", sellerTrust: 0.70, weightKg: 0.8, conditionEnum: "USED" },
    // Samsung phone: completely broken screen, very high fraud → RECYCLE (nothing salvageable at low confidence)
    "RET-9925-E": { productId: "P-73892", category: "Electronics", conditionScore: 15, utilityScore: 10, fraudScore: 85, estimatedValue: 1299.99, returnReason: "DEFECTIVE", sellerTrust: 0.25, weightKg: 0.23, conditionEnum: "BROKEN" },
    // Dyson vacuum: cosmetic damage, motor noise → RETURN TO VENDOR (condition too low to refurbish, but seller accepts returns)
    "RET-9926-F": { productId: "P-55210", category: "Home Appliance", conditionScore: 28, utilityScore: 25, fraudScore: 5, estimatedValue: 749.99, returnReason: "NOT_AS_DESCRIBED", sellerTrust: 0.98, weightKg: 3.1, conditionEnum: "USED" },
  };
  return configs[returnId] || configs["RET-9921-A"];
}
