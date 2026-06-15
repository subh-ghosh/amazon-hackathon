/**
 * API Endpoints - Single source of truth derived from API_DIRECTORY.md
 * NEVER hardcode endpoints elsewhere. Always import from here.
 */

export const SERVICE_URLS = {
    S1_PREVENTION: "http://Circul-Preve-Rs6gi1hesUgp-476733633.us-east-1.elb.amazonaws.com",
    S2_TRUTH: "http://Circul-Truth-HR7ES9usthBv-33182633.us-east-1.elb.amazonaws.com",
    S3_FRAUD: "http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com",
    S4_DIGITAL_TWIN: "http://Circul-Digit-XXDMcCWoqhd0-1019952249.us-east-1.elb.amazonaws.com",
    S5_SIMULATOR: "http://Circul-Simul-a4nmYbuxVUrr-319139381.us-east-1.elb.amazonaws.com",
    S6_RECOVERY: "http://Circul-Optim-mcZ0NzPDZK07-890558390.us-east-1.elb.amazonaws.com",
    S7_LOGISTICS: "http://Circul-Logis-hgIeVqBbAk0h-362510022.us-east-1.elb.amazonaws.com",
    S8_RETURNLESS: "http://Circul-Retur-AkanfcKdPytd-593568738.us-east-1.elb.amazonaws.com",
    S9_CIRCULAR: "http://Circul-Circu-sybvn5Ar6ipQ-119322148.us-east-1.elb.amazonaws.com",
    S10_PACKAGING: "http://Circul-Packa-AN1B5mVKsku9-408281128.us-east-1.elb.amazonaws.com",
    S11_SELLER: "http://Circul-Selle-Q7zRyEczbzCg-2088084796.us-east-1.elb.amazonaws.com",
    S12_KNOWLEDGE: "http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com",
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
