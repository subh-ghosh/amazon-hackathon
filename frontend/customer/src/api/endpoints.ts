/**
 * API Endpoints - Routes through Next.js proxy to avoid CORS.
 * Browser calls: /api/proxy/s1/api/v1/prevention/analyze
 * Proxy forwards to: http://ALB-URL/api/v1/prevention/analyze
 *
 * Source of truth: API_DIRECTORY.md
 */

const PROXY = "/api/proxy";

export const ENDPOINTS = {
    // S1 - Return Prevention Engine
    prevention: {
        analyze: `${PROXY}/s1/api/v1/prevention/analyze`,
        health: `${PROXY}/s1/health`,
    },
    // S2 - Truth Discovery Engine
    truth: {
        analyze: `${PROXY}/s2/api/v1/truth/analyze`,
        health: `${PROXY}/s2/health`,
    },
    // S3 - Fraud & Trust Engine
    fraud: {
        score: `${PROXY}/s3/api/v1/fraud/score`,
        health: `${PROXY}/s3/health`,
    },
    // S4 - Product Digital Twin
    digitalTwin: {
        create: `${PROXY}/s4/api/v1/products`,
        get: (productId: string) => `${PROXY}/s4/api/v1/products/${productId}`,
        events: (productId: string) => `${PROXY}/s4/api/v1/products/${productId}/events`,
        timeline: (productId: string) => `${PROXY}/s4/api/v1/products/${productId}/timeline`,
        health: `${PROXY}/s4/health`,
    },
    // S5 - Future Simulator
    simulator: {
        run: `${PROXY}/s5/api/v1/simulation/run`,
        health: `${PROXY}/s5/health`,
    },
    // S6 - Recovery Optimizer
    recovery: {
        optimize: `${PROXY}/s6/api/v1/recovery/optimize`,
        health: `${PROXY}/s6/health`,
    },
    // S7 - Reverse Logistics Optimizer
    logistics: {
        optimize: `${PROXY}/s7/api/v1/logistics/optimize`,
        health: `${PROXY}/s7/health`,
    },
    // S8 - Returnless Refund Engine
    returnless: {
        evaluate: `${PROXY}/s8/api/v1/returnless/evaluate`,
        health: `${PROXY}/s8/health`,
    },
    // S9 - Circular Routing Engine
    circular: {
        optimize: `${PROXY}/s9/api/v1/logistics/optimize`,
        batchOptimize: `${PROXY}/s9/api/v1/logistics/batch-optimize`,
        analytics: `${PROXY}/s9/api/v1/logistics/analytics`,
        health: `${PROXY}/s9/health`,
    },
    // S10 - Packaging Intelligence
    packaging: {
        analyze: `${PROXY}/s10/api/v1/packaging/analyze`,
        health: `${PROXY}/s10/health`,
    },
    // S11 - Seller Intelligence Engine
    seller: {
        analyze: `${PROXY}/s11/api/v1/seller/analyze`,
        dashboard: (sellerId: string) => `${PROXY}/s11/api/v1/seller/${sellerId}/dashboard`,
        health: `${PROXY}/s11/health`,
    },
    // S12 - Learning & Knowledge Graph
    knowledge: {
        fraudCases: `${PROXY}/s12/api/v1/fraud-cases/`,
        intelligence: `${PROXY}/s12/api/v1/intelligence`,
        customers: `${PROXY}/s12/api/v1/customers`,
        products: `${PROXY}/s12/api/v1/products`,
        returns: `${PROXY}/s12/api/v1/returns`,
        recoveryActions: `${PROXY}/s12/api/v1/recovery-actions`,
        health: `${PROXY}/s12/health`,
    },
} as const;
