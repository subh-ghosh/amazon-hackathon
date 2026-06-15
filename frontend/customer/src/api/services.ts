/**
 * Service layer - typed API calls to all backend services.
 * Contracts verified against live OpenAPI specs.
 */

import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
    PreventionAnalyzeRequest,
    PreventionAnalyzeResponse,
    TruthAnalyzeRequest,
    TruthAnalyzeResponse,
    FraudScoreRequest,
    FraudScoreResponse,
    SimulationRunRequest,
    SimulationRunResponse,
    RecoveryOptimizeRequest,
    RecoveryOptimizeResponse,
    LogisticsOptimizeRequest,
    LogisticsOptimizeResponse,
    ReturnlessEvaluateRequest,
    ReturnlessEvaluateResponse,
    CircularOptimizeRequest,
    CircularOptimizeResponse,
    PackagingAnalyzeRequest,
    PackagingAnalyzeResponse,
    SellerAnalyzeRequest,
    SellerAnalyzeResponse,
} from "./types";

// S1 - Return Prevention (AI Purchase Assistant)
export const preventionService = {
    analyze: (data: PreventionAnalyzeRequest) =>
        apiClient.post<PreventionAnalyzeResponse>(ENDPOINTS.prevention.analyze, data),
};

// S2 - Truth Discovery (Root Cause Analysis)
export const truthService = {
    analyze: (data: TruthAnalyzeRequest) =>
        apiClient.post<TruthAnalyzeResponse>(ENDPOINTS.truth.analyze, data),
};

// S3 - Fraud & Trust
export const fraudService = {
    score: (data: FraudScoreRequest) =>
        apiClient.post<FraudScoreResponse>(ENDPOINTS.fraud.score, data),
};

// S5 - Future Simulator
export const simulatorService = {
    run: (data: SimulationRunRequest) =>
        apiClient.post<SimulationRunResponse>(ENDPOINTS.simulator.run, data),
};

// S6 - Recovery Optimizer
export const recoveryService = {
    optimize: (data: RecoveryOptimizeRequest) =>
        apiClient.post<RecoveryOptimizeResponse>(ENDPOINTS.recovery.optimize, data),
};

// S7 - Reverse Logistics
export const logisticsService = {
    optimize: (data: LogisticsOptimizeRequest) =>
        apiClient.post<LogisticsOptimizeResponse>(ENDPOINTS.logistics.optimize, data),
};

// S8 - Returnless Refund
export const returnlessService = {
    evaluate: (data: ReturnlessEvaluateRequest) =>
        apiClient.post<ReturnlessEvaluateResponse>(ENDPOINTS.returnless.evaluate, data),
};

// S9 - Circular Routing
export const circularService = {
    optimize: (data: CircularOptimizeRequest) =>
        apiClient.post<CircularOptimizeResponse>(ENDPOINTS.circular.optimize, data),
    analytics: () =>
        apiClient.get<Record<string, unknown>>(ENDPOINTS.circular.analytics),
};

// S10 - Packaging Intelligence
export const packagingService = {
    analyze: (data: PackagingAnalyzeRequest) =>
        apiClient.post<PackagingAnalyzeResponse>(ENDPOINTS.packaging.analyze, data),
};

// S11 - Seller Intelligence
export const sellerService = {
    analyze: (data: SellerAnalyzeRequest) =>
        apiClient.post<SellerAnalyzeResponse>(ENDPOINTS.seller.analyze, data),
};
