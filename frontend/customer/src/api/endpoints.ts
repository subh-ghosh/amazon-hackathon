/**
 * API Endpoints - Single source of truth derived from API_DIRECTORY.md
 * NEVER hardcode endpoints elsewhere. Always import from here.
 */

// All calls go through the Next.js proxy route (/api/proxy/[service]/...)
// This allows the https Vercel frontend to reach http AWS ALB backends server-side,
// bypassing the browser's mixed-content block.
const PROXY_BASE = "/api/proxy";

export const SERVICE_URLS = {
    S1_PREVENTION: `${PROXY_BASE}/s1`,
    S2_TRUTH: `${PROXY_BASE}/s2`,
    S3_FRAUD: `${PROXY_BASE}/s3`,
    S4_DIGITAL_TWIN: `${PROXY_BASE}/s4`,
    S5_SIMULATOR: `${PROXY_BASE}/s5`,
    S6_RECOVERY: `${PROXY_BASE}/s6`,
    S7_LOGISTICS: `${PROXY_BASE}/s7`,
    S8_RETURNLESS: `${PROXY_BASE}/s8`,
    S9_CIRCULAR: `${PROXY_BASE}/s9`,
    S10_PACKAGING: `${PROXY_BASE}/s10`,
    S11_SELLER: `${PROXY_BASE}/s11`,
    S12_KNOWLEDGE: `${PROXY_BASE}/s12`,
} as const;

export const ENDPOINTS = {
    // S1 - Return Prevention Engine
    prevention: {
        analyze: `${SERVICE_URLS.S1_PREVENTION}/api/v1/prevention/analyze`,
        health: `${SERVICE_URLS.S1_PREVENTION}/health`,
    },
    // S2 - Truth Discovery Engine
    truth: {
        analyze: `${SERVICE_URLS.S2_TRUTH}/api/v1/truth/analyze`,
        health: `${SERVICE_URLS.S2_TRUTH}/health`,
    },
    // S3 - Fraud & Trust Engine
    fraud: {
        score: `${SERVICE_URLS.S3_FRAUD}/api/v1/fraud/score`,
        health: `${SERVICE_URLS.S3_FRAUD}/health`,
    },
    // S4 - Product Digital Twin
    digitalTwin: {
        create: `${SERVICE_URLS.S4_DIGITAL_TWIN}/api/v1/products`,
        get: (productId: string) => `${SERVICE_URLS.S4_DIGITAL_TWIN}/api/v1/products/${productId}`,
        events: (productId: string) => `${SERVICE_URLS.S4_DIGITAL_TWIN}/api/v1/products/${productId}/events`,
        timeline: (productId: string) => `${SERVICE_URLS.S4_DIGITAL_TWIN}/api/v1/products/${productId}/timeline`,
        health: `${SERVICE_URLS.S4_DIGITAL_TWIN}/health`,
    },
    // S5 - Future Simulator
    simulator: {
        run: `${SERVICE_URLS.S5_SIMULATOR}/api/v1/simulation/run`,
        health: `${SERVICE_URLS.S5_SIMULATOR}/health`,
    },
    // S6 - Recovery Optimizer
    recovery: {
        optimize: `${SERVICE_URLS.S6_RECOVERY}/api/v1/recovery/optimize`,
        health: `${SERVICE_URLS.S6_RECOVERY}/health`,
    },
    // S7 - Reverse Logistics Optimizer
    logistics: {
        optimize: `${SERVICE_URLS.S7_LOGISTICS}/api/v1/logistics/optimize`,
        health: `${SERVICE_URLS.S7_LOGISTICS}/health`,
    },
    // S8 - Returnless Refund Engine
    returnless: {
        evaluate: `${SERVICE_URLS.S8_RETURNLESS}/api/v1/returnless/evaluate`,
        health: `${SERVICE_URLS.S8_RETURNLESS}/health`,
    },
    // S9 - Circular Routing Engine
    circular: {
        optimize: `${SERVICE_URLS.S9_CIRCULAR}/api/v1/logistics/optimize`,
        batchOptimize: `${SERVICE_URLS.S9_CIRCULAR}/api/v1/logistics/batch-optimize`,
        analytics: `${SERVICE_URLS.S9_CIRCULAR}/api/v1/logistics/analytics`,
        health: `${SERVICE_URLS.S9_CIRCULAR}/health`,
    },
    // S10 - Packaging Intelligence
    packaging: {
        analyze: `${SERVICE_URLS.S10_PACKAGING}/api/v1/packaging/analyze`,
        health: `${SERVICE_URLS.S10_PACKAGING}/health`,
    },
    // S11 - Seller Intelligence Engine
    seller: {
        analyze: `${SERVICE_URLS.S11_SELLER}/api/v1/seller/analyze`,
        dashboard: (sellerId: string) => `${SERVICE_URLS.S11_SELLER}/api/v1/seller/${sellerId}/dashboard`,
        health: `${SERVICE_URLS.S11_SELLER}/health`,
    },
    // S12 - Learning & Knowledge Graph
    knowledge: {
        fraudCases: `${SERVICE_URLS.S12_KNOWLEDGE}/api/v1/fraud-cases/`,
        intelligence: `${SERVICE_URLS.S12_KNOWLEDGE}/api/v1/intelligence`,
        customers: `${SERVICE_URLS.S12_KNOWLEDGE}/api/v1/customers`,
        products: `${SERVICE_URLS.S12_KNOWLEDGE}/api/v1/products`,
        returns: `${SERVICE_URLS.S12_KNOWLEDGE}/api/v1/returns`,
        recoveryActions: `${SERVICE_URLS.S12_KNOWLEDGE}/api/v1/recovery-actions`,
        health: `${SERVICE_URLS.S12_KNOWLEDGE}/health`,
    },
} as const;
