/**
 * Typed models derived from LIVE OpenAPI contracts.
 * Verified against actual backend responses on June 15, 2026.
 */

// === Product Models ===
export interface Product {
    product_id: string;
    title: string;
    category: string;
    brand: string;
    price: number;
    seller_id: string;
    warehouse_id?: string | null;
    // Frontend enrichment
    image: string;
    rating: number;
    reviews_count: number;
    description: string;
    features: string[];
    delivery_days: number;
    // Packaging metadata for S10
    weight_kg: number;
    packaging_weight_kg: number;
    packaging_material: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
}

// === S1 Prevention Engine (camelCase) ===
export interface PreventionAnalyzeRequest {
    customerId: string;
    productId: string;
    category: string;
    productRating: number;
    customerReturnRate: number;
    customerPurchaseCount: number;
    productReturnRate: number;
    sellerRating: number;
    price: number;
}

export interface PreventionAnalyzeResponse {
    returnRiskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    recommendedActions: string[];
    confidence: number;
    explanation: string[];
}

// === S2 Truth Discovery Engine (camelCase) ===
export interface TruthAnalyzeRequest {
    returnId: string;
    customerId: string;
    productId: string;
    sellerId: string;
    statedReason: string;
    customerComment: string;
}

export interface TruthAnalyzeResponse {
    returnId: string;
    actualRootCause: string;
    confidence: number;
    requiresManualReview: boolean;
    evidence: TruthEvidence[];
}

export interface TruthEvidence {
    type: string;
    description: string;
    weight: number;
}

// === S3 Fraud & Trust Engine (snake_case) ===
export interface FraudScoreRequest {
    customer_id: string;
    product_id: string;
    return_id: string;
    device_id: string;
    payment_method_hash: string;
}

export interface FraudScoreResponse {
    fraud_score: number;
    trust_score: number;
    risk_level: string;
    recommended_action: string;
    risk_factors: string[];
}

// === S4 Product Digital Twin ===
export interface DigitalTwinCreateRequest {
    productId: string;
    category: string;
    name?: string;
    conditionScore?: number;
    utilityScore?: number;
}

export interface DigitalTwinResponse {
    productId: string;
    category: string;
    conditionScore: number;
    utilityScore: number;
    returnCount: number;
    currentStatus: string;
    createdAt: string;
    updatedAt: string;
}

// === S5 Future Simulator (camelCase) ===
export interface SimulationRunRequest {
    returnId: string;
    productId: string;
    category: string;
    conditionScore: number;
    utilityScore: number;
    fraudScore: number;
    estimatedValue: number;
    returnReason: string;
    sellerTrustScore: number;
}

export interface SimulationRunResponse {
    bestScenario: string;
    recommendedAction: string;
    simulations: SimulationResult[];
}

export interface SimulationResult {
    scenario: string;
    recoveryValue: number;
    carbonImpact: number;
    processingTimeDays: number;
    confidence: number;
}

// === S6 Recovery Optimizer (camelCase) ===
export interface RecoveryOptimizeRequest {
    returnId: string;
    productId: string;
    fraudScore: number;
    sellerTrustScore: number;
    simulations: SimulationInput[];
}

export interface SimulationInput {
    scenario: string;
    recoveryValue: number;
    carbonImpact: number;
    processingTimeDays: number;
    confidence: number;
}

export interface RecoveryOptimizeResponse {
    recommendedDecision: string;
    expectedProfit: number;
    carbonSavings: number;
    processingDays: number;
    confidence: number;
    reasoning: string[];
}

// === S7 Reverse Logistics Optimizer (camelCase) ===
export interface LogisticsOptimizeRequest {
    returnId: string;
    productId: string;
    recommendedDecision: string;
    customerLocation: string;
    expectedProfit: number;
    carbonSavings: number;
    processingDays: number;
    confidence: number;
    reasoning: string[];
    warehouses: WarehouseInput[];
}

export interface WarehouseInput {
    warehouseId: string;
    city: string;
    capacity: number;
    distanceKm: number;
}

export interface LogisticsOptimizeResponse {
    recommendedWarehouse: string;
    recommendedRoute: string;
    estimatedCost: number;
    estimatedDays: number;
    carbonScore: number;
    reasoning: string[];
}

// === S8 Returnless Refund Engine (camelCase) ===
export interface ReturnlessEvaluateRequest {
    requestId: string;
    customerId: string;
    productId: string;
    orderValue: number;
    returnShippingCost: number;
    fraudRiskScore: number;
    returnRiskScore: number;
    condition: "NEW" | "OPEN_BOX" | "USED" | "DAMAGED";
    sellerPolicy: "STANDARD" | "EASY_REFUND";
    customerTrustScore: number;
    category: string;
    weightKg?: number;
    packagingInsights?: PackagingInsightInput[];
    sellerHealthInsights?: SellerHealthInsightInput[];
}

export interface PackagingInsightInput {
    insight: string;
    severity: string;
}

export interface SellerHealthInsightInput {
    insight: string;
    severity: string;
}

export interface ReturnlessEvaluateResponse {
    requestId: string;
    decision: string;
    confidenceScore: number;
    refundAmount: number;
    estimatedSavings: number;
    sustainabilityImpact: string;
    businessReason: string;
    overallRiskLevel: string;
    recommendedAction: string;
    decisionReason: string;
    decisionFactors: DecisionFactor[];
    estimatedCO2Saved: number;
    estimatedWasteDivertedKg: number;
    circularityScore: number;
    recommendedDestination: string;
    recommendations?: { actions: string[] };
}

export interface DecisionFactor {
    factor: string;
    weight: number;
}

// === S9 Circular Routing Engine (camelCase) ===
export interface CircularOptimizeRequest {
    requestId: string;
    returnId: string;
    productId: string;
    category: string;
    condition: "NEW" | "OPEN_BOX" | "LIKE_NEW" | "USED" | "REFURBISHABLE" | "DAMAGED" | "BROKEN" | "LOW_VALUE" | "UNRECOVERABLE";
    estimatedValue: number;
    weightKg: number;
    customerLatitude: number;
    customerLongitude: number;
    recommendedWarehouse?: string;
    recommendedRoute?: string;
    estimatedCost?: number;
    estimatedDays?: number;
    carbonScore?: number;
    reasoning?: string[];
    facilityOptions: FacilityOption[];
}

export interface FacilityOption {
    facilityId: string;
    facilityType: "REFURBISHMENT" | "DONATION" | "RECYCLING" | "LIQUIDATION" | "DISPOSAL";
    distanceKm: number;
    capacityAvailable: boolean;
}

export interface CircularOptimizeResponse {
    decisionId: string;
    requestId: string;
    returnId: string;
    selectedFacilityId: string;
    selectedFacilityType: string;
    optimizationScore: number;
    routingReason: string;
    sustainabilityMetrics: SustainabilityMetrics;
}

export interface SustainabilityMetrics {
    estimatedCO2Saved: number;
    estimatedWasteDivertedKg: number;
    circularityScore: number;
}

// === S10 Packaging Intelligence (camelCase) ===
export interface PackagingAnalyzeRequest {
    productId: string;
    category: string;
    productWeight: number;
    packagingWeight: number;
    packagingMaterial: string;
    length: number;
    width: number;
    height: number;
}

export interface PackagingAnalyzeResponse {
    productId: string;
    sustainabilityScore: number;
    packagingEfficiencyScore: number;
    carbonImpactScore: number;
    recyclabilityScore: number;
    confidence: number;
    recommendations: string[];
    explanations: string[];
    packagingInsights: PackagingInsight[];
}

export interface PackagingInsight {
    insight: string;
    severity: string;
}

// === S11 Seller Intelligence (camelCase) ===
export interface SellerAnalyzeRequest {
    sellerId: string;
    sellerName: string;
    totalOrders: number;
    totalReturns: number;
    fraudCases: number;
    averageRating: number;
    packagingScore: number;
}

export interface SellerAnalyzeResponse {
    sellerId: string;
    sellerHealthScore: number;
    sellerTier: string;
    returnRiskScore: number;
    fraudRiskScore: number;
    sustainabilityScore: number;
    estimatedRevenueLoss: number;
    returnsPer100Orders: number;
    fraudExposureLevel: string;
    sellerHealthTrend: string;
    recommendations: string[];
    insights: string[];
    topIssues: string[];
}

// === Cart & Order (Frontend-managed) ===
export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Order {
    order_id: string;
    customer_id: string;
    items: CartItem[];
    total: number;
    status: "confirmed" | "shipped" | "delivered" | "return_requested" | "returned";
    created_at: string;
    delivery_date: string;
    address: Address;
}

export interface Address {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

// === Return Flow ===
export type ReturnReason =
    | "wrong_size"
    | "defective"
    | "changed_mind"
    | "not_as_expected"
    | "other";

export interface ReturnRequest {
    return_id: string;
    order_id: string;
    customer_id: string;
    product_id: string;
    reason: ReturnReason;
    comment?: string;
}
