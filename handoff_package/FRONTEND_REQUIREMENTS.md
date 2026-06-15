# Frontend Architecture & Deliverables

We have fully decoupled the frontend into four discrete Next.js applications, unified under the **Circular Intelligence OS** brand. Each application targets a specific persona and is deployed independently on Vercel.

## 1. Customer Portal (`frontend/customer-app`)
- **Focus**: The shopping and return experience.
- **Key Features**: 
  - AI Purchase Assistant (warning users of high return rates for specific sizes/variants).
  - Return Flow with Instant Returnless Refund offers (if sustainability thresholds are met).

## 2. Operations Command Center (`frontend/ops-dashboard`)
- **Focus**: "What should happen to this returned item next?"
- **Key Features**:
  - Intelligent Triage View: A "Judge WOW Factor" screen showing a returned item, its Digital Twin lifecycle, Fraud/Trust anomaly detection, and AI Recovery Recommendations (Resell, Donate, Recycle).
  - Circular Routing: Recommends logistics based on facility capacity and carbon impact.

## 3. Executive Briefing (`frontend/executive-dashboard`)
- **Focus**: "How much money and carbon are we saving?"
- **Key Features**:
  - Circular Scorecard: A top-level panel showing total ₹ recovered, CO2 saved, and items diverted from landfills.
  - Recovery Mix visualization and Financial Impact breakdowns.

## 4. Merchant Portal (`frontend/seller-dashboard`)
- **Focus**: "Why are my products being returned?"
- **Key Features**:
  - AI Seller Insights analyzing exact root causes of returns.
  - Packaging and Listing Intelligence showing what content gaps cause expectation mismatches.

## Technical Requirements
- **Proxy Routing**: All frontends use a Next.js Serverless Proxy (`/api/proxy/[service]/[[...path]]`) to bypass browser mixed-content (HTTPS -> HTTP) security policies when talking to the AWS ELB endpoints.
- **Resilience**: Every dashboard is fully equipped with highly structured, compelling "Demo Fallback Data". If the live APIs crash during the presentation, the UI gracefully renders a flawless, realistic storyline without infinite loaders or blank screens.
