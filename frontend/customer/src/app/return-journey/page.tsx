"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, Circle } from "lucide-react";
import { getProductById } from "@/data/products";
import { fraudService, simulatorService, recoveryService, logisticsService, circularService } from "@/api/services";

interface TrackingStep {
    title: string;
    detail: string;
    status: "completed" | "in_progress" | "pending";
}

function ReturnJourneyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const returnId = searchParams.get("returnId") || "RET-DEMO";
    const productId = searchParams.get("productId") || "PROD-002";
    const product = getProductById(productId);

    const [steps, setSteps] = useState<TrackingStep[]>([
        { title: "Return request submitted", detail: "We received your return request", status: "completed" },
        { title: "Verification complete", detail: "Your account is in good standing", status: "pending" },
        { title: "Processing plan ready", detail: "We've determined the best way to handle your return", status: "pending" },
        { title: "Pickup scheduled", detail: "Your item will be collected", status: "pending" },
        { title: "Item routed to facility", detail: "Your item is heading to the right place", status: "pending" },
        { title: "Refund issued", detail: "Your refund has been processed", status: "pending" },
    ]);

    useEffect(() => { runPipeline(); }, []);

    async function runPipeline() {
        await new Promise((r) => setTimeout(r, 1000));

        // Step 1: Fraud/verification (S3)
        updateStep(1, "in_progress");
        const journeyCustomerId = `CUST-JRN-${Math.random().toString(36).substring(2, 8)}`;
        try {
            const fraud = await fraudService.score({
                customer_id: journeyCustomerId, product_id: productId,
                return_id: returnId, device_id: "DEVICE-WEB-001", payment_method_hash: "HASH-VISA-4242",
            });
            updateStep(1, "completed", `Your account is verified — trust score confirmed`);
        } catch { updateStep(1, "completed"); }
        await new Promise((r) => setTimeout(r, 1200));

        // Step 2: Simulation + Recovery (S5 → S6)
        updateStep(2, "in_progress");
        try {
            const sim = await simulatorService.run({
                returnId, productId, category: product?.category || "Electronics",
                conditionScore: 75, utilityScore: 60, fraudScore: 20,
                estimatedValue: product?.price || 150, returnReason: "wrong_size", sellerTrustScore: 0.85,
            });
            const recovery = await recoveryService.optimize({
                returnId, productId, fraudScore: 20, sellerTrustScore: 0.85,
                simulations: sim.simulations,
            });
            const action = recovery.recommendedDecision.toLowerCase().replace(/_/g, " ");
            updateStep(2, "completed", `Best option: ${action} — estimated ${recovery.processingDays} day processing`);
        } catch { updateStep(2, "completed"); }
        await new Promise((r) => setTimeout(r, 1200));

        // Step 3: Logistics (S7)
        updateStep(3, "in_progress");
        try {
            const logistics = await logisticsService.optimize({
                returnId, productId, recommendedDecision: "RESELL", customerLocation: "New York",
                expectedProfit: 100, carbonSavings: 1.5, processingDays: 3, confidence: 0.85,
                reasoning: ["Optimal route"], warehouses: [
                    { warehouseId: "WH-EAST-01", city: "Newark", capacity: 60, distanceKm: 25 },
                    { warehouseId: "WH-CENTRAL-01", city: "Chicago", capacity: 80, distanceKm: 1200 },
                ],
            });
            updateStep(3, "completed", `Pickup via ${logistics.recommendedRoute} — est. ${logistics.estimatedDays} day transit`);
        } catch { updateStep(3, "completed", "Pickup arranged — prepaid label sent to your email"); }
        await new Promise((r) => setTimeout(r, 1200));

        // Step 4: Circular Routing (S9)
        updateStep(4, "in_progress");
        try {
            const circular = await circularService.optimize({
                requestId: `CIR-${Date.now()}`, returnId, productId,
                category: product?.category || "Footwear", condition: "USED",
                estimatedValue: product?.price || 150, weightKg: product?.weight_kg || 0.8,
                customerLatitude: 40.7128, customerLongitude: -74.006,
                facilityOptions: [
                    { facilityId: "FAC-REFURB-01", facilityType: "REFURBISHMENT", distanceKm: 50, capacityAvailable: true },
                    { facilityId: "FAC-DONATE-01", facilityType: "DONATION", distanceKm: 15, capacityAvailable: true },
                ],
            });
            updateStep(4, "completed", `Item directed to ${circular.selectedFacilityType.toLowerCase()} — giving it a second life`);
        } catch { updateStep(4, "completed", "Item routed to nearest facility"); }
        await new Promise((r) => setTimeout(r, 1000));

        // Step 5: Refund issued
        updateStep(5, "in_progress");
        await new Promise((r) => setTimeout(r, 800));
        updateStep(5, "completed", `₹${Math.round((product?.price || 150) * 83).toLocaleString("en-IN")} refund initiated to your payment method`);
    }

    function updateStep(index: number, status: "completed" | "in_progress", detail?: string) {
        setSteps((prev) => prev.map((s, i) => i === index ? { ...s, status, ...(detail ? { detail } : {}) } : s));
    }

    return (
        <div className="max-w-[600px] mx-auto px-4 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Return Status</h1>
            <p className="text-sm text-gray-500 mb-6">Return ID: {returnId}</p>

            {/* Product */}
            {product && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                    <img src={product.image} alt={product.title} className="w-14 h-14 object-cover rounded" />
                    <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500">₹{Math.round(product.price * 83).toLocaleString("en-IN")}</p>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="relative pl-8">
                {steps.map((step, i) => (
                    <div key={i} className="relative pb-8 last:pb-0">
                        {/* Vertical line */}
                        {i < steps.length - 1 && (
                            <div className={`absolute left-[-20px] top-6 w-0.5 h-[calc(100%-12px)] ${step.status === "completed" ? "bg-emerald-400" : "bg-gray-200"}`} />
                        )}
                        {/* Icon */}
                        <div className="absolute left-[-28px] top-0.5">
                            {step.status === "completed" ? (
                                <CheckCircle size={18} className="text-emerald-500" />
                            ) : step.status === "in_progress" ? (
                                <Loader2 size={18} className="text-[#007185] animate-spin" />
                            ) : (
                                <Circle size={18} className="text-gray-300" />
                            )}
                        </div>
                        {/* Content */}
                        <div>
                            <p className={`text-sm font-medium ${step.status === "pending" ? "text-gray-400" : "text-gray-900"}`}>
                                {step.title}
                            </p>
                            <p className={`text-xs mt-0.5 ${step.status === "pending" ? "text-gray-300" : "text-gray-500"}`}>
                                {step.detail}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Done */}
            {steps.every((s) => s.status === "completed") && (
                <div className="mt-8 pt-6 border-t border-gray-200 text-center animate-fade-in">
                    <p className="text-sm text-gray-700 mb-4">Your return is being handled. You&apos;ll receive email updates at each step.</p>
                    <button onClick={() => router.push("/orders")} className="btn-amazon">
                        Back to Your Orders
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ReturnJourneyPage() {
    return (
        <Suspense fallback={<div className="max-w-[600px] mx-auto px-4 py-12"><div className="skeleton h-64 rounded-lg" /></div>}>
            <ReturnJourneyContent />
        </Suspense>
    );
}
