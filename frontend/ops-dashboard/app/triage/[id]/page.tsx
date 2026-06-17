"use client";

import { use, useState, useEffect } from "react";
import {
  ArrowLeft, CheckCircle2, ShieldAlert, Leaf,
  Activity, Box, MapPin, Loader2, Zap, Users,
  Recycle, Heart, Truck, Trash2
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

interface BuyerMatch {
  orderId: string;
  customerName: string;
  city: string;
  distanceFromFacilityKm: number;
  orderDate: string;
  productMatch: number; // 0-100 how closely this matches what they ordered
  deliveryPromise: string; // original promise date
  waitingDays: number;
  isPrime: boolean;
}

// Sale type determines what kind of buyers and at what price
type SaleType = "restock" | "refurbish" | "outlet";

function getSaleType(scenario: string): SaleType {
  const s = scenario.toUpperCase();
  if (s.includes("RESTOCK") || s.includes("RESELL")) return "restock";
  if (s.includes("REFURBISH")) return "refurbish";
  return "outlet"; // Outlet, Liquidation
}

// Price multiplier per sale type — ALIGNED WITH BACKEND S5 CATEGORY_MULTIPLIERS
// These represent the customer-facing sale price as % of original value:
// - Restock as New = 95% (sold as new, near full price — tiny discount for "open box")
// - Refurbish = 80% (Certified Renewed — tested, certified, warranty included)
// - Outlet = 65% (Outlet/clearance — cosmetic wear, no refurb, sold as-is)
// Backend recovery values are lower because they subtract processing costs.
function getPriceMultiplier(saleType: SaleType): number {
  switch (saleType) {
    case "restock": return 0.95;
    case "refurbish": return 0.80;
    case "outlet": return 0.65;
  }
}

// Processing cost per sale type (inspection, refurb labor, certification):
// - Restock = $3 (just inspect + repackage)
// - Refurbish = $22 (diagnosis + parts + repair + test + certify + warranty)
// - Outlet = $8 (cosmetic check + relabel + photograph + list)
function getProcessingCost(saleType: SaleType): number {
  switch (saleType) {
    case "restock": return 3;
    case "refurbish": return 22;
    case "outlet": return 8;
  }
}

// Different buyer pools per sale type × warehouse × product
// Uses seeded generation to produce unique but deterministic buyers for each combination
const BUYER_NAMES: Record<string, { name: string; city: string; distKm: number; isPrime: boolean }[]> = {
  "WH-BLR-04": [
    { name: "Priya Sharma", city: "Whitefield, Bangalore", distKm: 28, isPrime: true },
    { name: "Ravi Krishnan", city: "Electronic City, Bangalore", distKm: 42, isPrime: true },
    { name: "Anitha Reddy", city: "Mysuru", distKm: 145, isPrime: false },
    { name: "Vikram Mehta", city: "Koramangala, Bangalore", distKm: 32, isPrime: true },
    { name: "Sneha Iyer", city: "HSR Layout, Bangalore", distKm: 38, isPrime: false },
    { name: "Manoj Kumar", city: "Mangalore", distKm: 350, isPrime: false },
    { name: "Suresh Gowda", city: "Jayanagar, Bangalore", distKm: 35, isPrime: false },
    { name: "Divya Shetty", city: "Hubli", distKm: 420, isPrime: false },
    { name: "Nitin Patel", city: "Belgaum", distKm: 502, isPrime: true },
  ],
  "WH-MAA-01": [
    { name: "Karthik Sundaram", city: "T. Nagar, Chennai", distKm: 35, isPrime: true },
    { name: "Lakshmi Venkat", city: "Coimbatore", distKm: 495, isPrime: false },
    { name: "Deepa Rajan", city: "Pondicherry", distKm: 162, isPrime: true },
    { name: "Arun Prasad", city: "Adyar, Chennai", distKm: 40, isPrime: true },
    { name: "Revathi Nair", city: "Madurai", distKm: 462, isPrime: false },
    { name: "Ganesh Babu", city: "Trichy", distKm: 320, isPrime: true },
    { name: "Ramesh Pillai", city: "Velachery, Chennai", distKm: 42, isPrime: false },
    { name: "Preethi Das", city: "Salem", distKm: 340, isPrime: false },
    { name: "Vignesh Raja", city: "Tiruppur", distKm: 425, isPrime: true },
  ],
  "WH-HYD-02": [
    { name: "Sanjay Gupta", city: "Gachibowli, Hyderabad", distKm: 22, isPrime: true },
    { name: "Meera Joshi", city: "Secunderabad", distKm: 38, isPrime: true },
    { name: "Arjun Nair", city: "Warangal", distKm: 165, isPrime: false },
    { name: "Pooja Reddy", city: "Jubilee Hills, Hyderabad", distKm: 28, isPrime: true },
    { name: "Rahul Deshmukh", city: "Nagpur", distKm: 520, isPrime: false },
    { name: "Kavitha Rao", city: "Vizag", distKm: 625, isPrime: true },
    { name: "Aditya Verma", city: "Banjara Hills, Hyderabad", distKm: 25, isPrime: true },
    { name: "Fatima Begum", city: "Aurangabad", distKm: 540, isPrime: false },
    { name: "Rohit Shinde", city: "Pune", distKm: 560, isPrime: false },
  ],
};

// Simple hash to get deterministic but varied indices per product
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate 3 unique buyers for a given product + sale type + warehouse
function getBuyersForCombination(productId: string, saleType: SaleType, warehouseId: string): BuyerMatch[] {
  const pool = BUYER_NAMES[warehouseId];
  if (!pool) return [];

  // Each sale type uses a different slice of the pool (0-2, 3-5, 6-8)
  const typeOffset = saleType === "restock" ? 0 : saleType === "refurbish" ? 3 : 6;
  // Product hash shifts which 3 from that slice we pick (rotates within the 3)
  const productSeed = simpleHash(productId);

  const buyers: BuyerMatch[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = typeOffset + ((i + productSeed) % 3);
    const person = pool[idx];

    // Product match varies by sale type + product seed
    const baseMatch = saleType === "restock" ? 94 : saleType === "refurbish" ? 82 : 70;
    const matchVariance = ((productSeed + i * 7) % 8); // 0-7 variance
    const productMatch = Math.min(99, baseMatch + matchVariance);

    // Waiting days vary per buyer
    const baseWait = saleType === "restock" ? 2 : saleType === "refurbish" ? 4 : 2;
    const waitDays = baseWait + ((productSeed + i * 3) % 3);

    // Order date based on waiting days
    const orderDay = 17 - waitDays;

    // Order ID is unique per combination
    const prefix = saleType === "restock" ? "ORD" : saleType === "refurbish" ? "ORD-RN" : "ORD-OT";
    const orderNum = 440000 + (simpleHash(`${productId}-${warehouseId}-${i}`) % 9999);

    buyers.push({
      orderId: `${prefix}-${orderNum}`,
      customerName: person.name,
      city: person.city,
      distanceFromFacilityKm: person.distKm,
      orderDate: `Jun ${orderDay}`,
      productMatch,
      deliveryPromise: `Jun ${orderDay + (saleType === "refurbish" ? 7 : 4)}`,
      waitingDays: waitDays,
      isPrime: person.isPrime,
    });
  }

  return buyers;
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
  const [selectedBuyer, setSelectedBuyer] = useState<number>(0);
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

  // Get buyer matches for the selected warehouse AND sale type — unique per product
  const saleType = selectedScenario ? getSaleType(selectedScenario.scenario) : "restock";
  const selectedWarehouseId = destinations[selectedRoute]?.id || "";

  // Price & cost logic varies by sale type
  const config = getItemConfig(id);
  const priceMultiplier = getPriceMultiplier(saleType);
  const salePrice = Math.round(config.estimatedValue * priceMultiplier * 100) / 100;
  const processingCost = getProcessingCost(saleType);

  const buyerMatchesUnsorted = getBuyersForCombination(config.productId, saleType, selectedWarehouseId);

  // Score buyers: productMatch×0.40 + proximity×0.30 + waitingDays×0.30
  const buyers = [...buyerMatchesUnsorted].sort((a, b) => {
    if (buyerMatchesUnsorted.length === 0) return 0;
    const maxDist = Math.max(...buyerMatchesUnsorted.map(x => x.distanceFromFacilityKm), 1);
    const maxWait = Math.max(...buyerMatchesUnsorted.map(x => x.waitingDays), 1);
    const scoreA = (a.productMatch / 100) * 40 + (1 - a.distanceFromFacilityKm / (maxDist + 1)) * 30 + (a.waitingDays / maxWait) * 30;
    const scoreB = (b.productMatch / 100) * 40 + (1 - b.distanceFromFacilityKm / (maxDist + 1)) * 30 + (b.waitingDays / maxWait) * 30;
    return scoreB - scoreA;
  });

  // Reset selected route when scenario changes
  useEffect(() => { setSelectedRoute(0); setSelectedBuyer(0); }, [selectedScenario?.scenario]);
  // Reset buyer when route changes
  useEffect(() => { setSelectedBuyer(0); }, [selectedRoute]);

  function getBuyerConsequences(buyerIndex: number) {
    const buyer = buyers[buyerIndex];
    if (!buyer) return { shippingCost: 0, deliveryDays: 0, co2: 0, netMargin: 0, warehouseSavings: 22 };
    const lastMileKm = buyer.distanceFromFacilityKm;
    const deliveryDays = Math.max(1, Math.ceil(lastMileKm / 200));
    const shippingCost = Math.round(lastMileKm * 0.12 * 100) / 100; // $0.12/km last mile
    const co2 = Math.round(lastMileKm * 0.03 * 10) / 10;
    const warehouseSavings = 22; // direct fulfillment skips $22 warehouse handling
    const netMargin = Math.round((salePrice - shippingCost - processingCost + warehouseSavings) * 100) / 100;
    return { shippingCost, deliveryDays, co2, netMargin, warehouseSavings };
  }

  function getRouteConsequences(destIndex: number) {
    const dest = destinations[destIndex];
    const costPerKm = routingType === "vendor" ? 0 : 3.5;
    const cost = Math.round(dest.distanceKm * costPerKm) / 100;
    const days = dest.distanceKm === 0 ? 0 : Math.max(1, Math.ceil(dest.distanceKm / 500));
    const carbon = Math.round(dest.distanceKm * 0.05 * 10) / 10;
    return { cost, days, carbon, capacity: dest.capacity };
  }

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
      const norm = (s: string) => s.toUpperCase().replace(/[_\s]/g, "");
      const match = sims.find(s => norm(s.scenario).includes(norm(decision!.recommendedDecision)))
        || sims.find(s => norm(decision!.recommendedDecision).includes(norm(s.scenario)))
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
    !selectedScenario.scenario.toUpperCase().replace(/[_\s]/g, "").includes(recommended.recommendedDecision.toUpperCase().replace(/[_\s]/g, ""));

  // Delta vs recommended
  const recommendedScenario = scenarios.find(s =>
    s.scenario.toUpperCase().replace(/[_\s]/g, "").includes((recommended?.recommendedDecision || "").toUpperCase().replace(/[_\s]/g, ""))
    || (recommended?.recommendedDecision || "").toUpperCase().replace(/[_\s]/g, "").includes(s.scenario.toUpperCase().replace(/[_\s]/g, ""))
  );
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
                      const normalizedDecision = (recommended?.recommendedDecision || "").toUpperCase().replace(/[_\s]/g, "");
                      const normalizedScenario = scenario.scenario.toUpperCase().replace(/[_\s]/g, "");
                      const isRecommended = normalizedDecision.length > 0 && (normalizedDecision.includes(normalizedScenario) || normalizedScenario.includes(normalizedDecision));
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
                              <span className={scenario.carbonImpact <= 0 ? "text-emerald-600" : "text-amber-600"}>{scenario.carbonImpact <= 0 ? "-" : "+"}{Math.abs(scenario.carbonImpact).toFixed(1)}kg CO₂</span>
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

            {/* Buyer Match — Only for sale-related scenarios */}
            {routingType === "warehouse" && buyers.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2"><Users size={18} className="text-blue-600" />Direct Buyer Match</CardTitle>
                  <CardDescription>Active orders near {destinations[selectedRoute]?.name?.split(" ").slice(1, 3).join(" ") || "this facility"}. Fulfill directly — skip warehouse storage and save $22+/item.</CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-2">
                  {buyers.map((buyer, i) => {
                    const cons = getBuyerConsequences(i);
                    const isSelected = selectedBuyer === i;
                    const isFirst = i === 0;
                    const recommendedBuyerCons = getBuyerConsequences(0);
                    const shippingDelta = cons.shippingCost - recommendedBuyerCons.shippingCost;
                    const deliveryDelta = cons.deliveryDays - recommendedBuyerCons.deliveryDays;
                    const marginDelta = cons.netMargin - recommendedBuyerCons.netMargin;
                    return (
                      <button key={buyer.orderId} onClick={() => setSelectedBuyer(i)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-500" : "border-slate-300"}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">{buyer.customerName}</span>
                                {buyer.isPrime && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px]">Prime</Badge>}
                                {isFirst && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Recommended</Badge>}
                              </div>
                              <span className="text-xs text-slate-500">{buyer.city} • {buyer.distanceFromFacilityKm}km from facility • Order {buyer.orderId}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{buyer.productMatch}% match • Waiting {buyer.waitingDays}d</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div><p className="text-sm font-bold text-amber-700">${cons.shippingCost.toFixed(1)}</p><p className="text-[9px] text-slate-500">Shipping Cost</p></div>
                              <div><p className="text-sm font-bold text-slate-900">{cons.deliveryDays}d</p><p className="text-[9px] text-slate-500">Delivery</p></div>
                              <div><p className="text-sm font-bold text-emerald-700">{cons.co2}kg</p><p className="text-[9px] text-slate-500">CO₂ (last mile)</p></div>
                              <div><p className="text-sm font-bold text-blue-700">${cons.netMargin.toFixed(0)}</p><p className="text-[9px] text-slate-500">Net Margin</p></div>
                            </div>
                            {!isFirst && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800 flex items-center gap-1.5">
                                <ShieldAlert size={12} className="flex-shrink-0" />
                                vs Recommended: +${shippingDelta.toFixed(1)} shipping, {deliveryDelta > 0 ? "+" : ""}{deliveryDelta}d delivery, {marginDelta >= 0 ? "+" : ""}{marginDelta.toFixed(0)} margin
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <span className="font-medium">Sale price:</span> ${salePrice.toFixed(2)} ({saleType === "restock" ? "95% — as new" : saleType === "refurbish" ? "80% — Certified Renewed" : "65% — Outlet"}) •
                      <span className="font-medium"> Processing:</span> ${processingCost} •
                      <span className="font-medium"> Scoring:</span> Product match (40%) • Proximity (30%) • Wait time (30%)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Footer — Final Recovery Summary */}
      {!loading && selectedScenario && (() => {
        const routeCons = getRouteConsequences(selectedRoute);
        const buyerCons = routingType === "warehouse" && buyers[selectedBuyer] ? getBuyerConsequences(selectedBuyer) : null;

        // Final recovery calculation
        const originalValue = config.estimatedValue;
        const recoveryPath = selectedScenario.scenario;
        const facilityShipping = routeCons.cost;
        const facilityDays = routeCons.days;

        // For sale paths: revenue = sale price - processing - last mile shipping + warehouse savings
        // For non-sale paths: revenue = scenario recovery value - facility shipping
        let finalRecovery: number;
        let breakdown: { label: string; value: number; isPositive: boolean }[];

        if (routingType === "warehouse" && buyerCons) {
          finalRecovery = salePrice - processingCost - buyerCons.shippingCost - facilityShipping + 22;
          breakdown = [
            { label: "Sale Price", value: salePrice, isPositive: true },
            { label: "Processing", value: -processingCost, isPositive: false },
            { label: "Facility Transit", value: -facilityShipping, isPositive: false },
            { label: "Last Mile", value: -buyerCons.shippingCost, isPositive: false },
            { label: "Warehouse Skip", value: 22, isPositive: true },
          ];
        } else {
          finalRecovery = selectedScenario.recoveryValue - facilityShipping;
          const valueLabel = routingType === "donation" ? "Tax Write-off"
            : routingType === "recycling" ? "Material Salvage"
              : routingType === "vendor" ? "Vendor Credit"
                : "Recovery Value";
          breakdown = [
            { label: valueLabel, value: selectedScenario.recoveryValue, isPositive: true },
            { label: "Facility Transit", value: -facilityShipping, isPositive: false },
          ];
        }

        const totalCO2 = routeCons.carbon + (buyerCons ? buyerCons.co2 : 0);
        const totalDays = facilityDays + selectedScenario.processingTimeDays + (buyerCons ? buyerCons.deliveryDays : 0);
        const recoveryRate = Math.round((finalRecovery / originalValue) * 100);

        return (
          <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl py-3 px-4 z-40 shadow-lg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Top row: breakdown */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-1 text-xs text-slate-600 flex-wrap">
                  {breakdown.map((item, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {i > 0 && <span className="text-slate-300 mx-1">→</span>}
                      <span className={item.isPositive ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
                        {item.value >= 0 ? "+" : ""}{item.value < 0 ? "-" : ""}${Math.abs(item.value).toFixed(1)}
                      </span>
                      <span className="text-slate-400">{item.label}</span>
                    </span>
                  ))}
                </div>
              </div>
              {/* Bottom row: final numbers + action */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">${finalRecovery.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Final Net Recovery</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <p className={`text-sm font-bold ${recoveryRate >= 70 ? "text-emerald-700" : recoveryRate >= 40 ? "text-amber-700" : "text-red-600"}`}>{recoveryRate}%</p>
                    <p className="text-[10px] text-slate-500">Recovery Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">{totalDays}d</p>
                    <p className="text-[10px] text-slate-500">Total Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-700">{totalCO2.toFixed(1)}kg</p>
                    <p className="text-[10px] text-slate-500">Total CO₂</p>
                  </div>
                  {isOverride && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      Override (rec: {recommended?.recommendedDecision})
                    </span>
                  )}
                </div>
                <button onClick={handleExecute} disabled={isRouting}
                  className="px-8 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-md flex items-center gap-2">
                  {isRouting ? <><Loader2 size={16} className="animate-spin" />Routing...</> : <>Execute: {selectedScenario.scenario}</>}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {isRouting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Routed</h2>
            <p className="text-sm text-slate-500 text-center">
              {data.returnId} → {selectedScenario?.scenario} via {destinations[selectedRoute]?.name || "nearest facility"}
              {routingType === "warehouse" && buyers[selectedBuyer] && (
                <><br />→ Direct fulfill to {buyers[selectedBuyer].customerName} ({buyers[selectedBuyer].city})</>
              )}
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
