# HackOn with Amazon — Solution Document Content

## FIRST PAGE (fill in):
- Team Name: KKR — Kolkata Kode Riders
- Hackathon Theme: Second Life Commerce: AI-Powered Returns & Sustainable Resale
- Date: June 15, 2026

**Team Members:**

| Name | College / University | Role | Email |
|------|---------------------|------|-------|
| Subarta Ghosh | Vellore Institute of Technology, Vellore | Cloud & Backend | subarta.ghosh2025@vitstudent.ac.in |
| Arhit Basu | Vellore Institute of Technology, Vellore | Backend | arhit.basu2025@vitstudent.ac.in |
| Tiyas Das | Vellore Institute of Technology, Vellore | Frontend | tiyas.das2025@vitstudent.ac.in |

---

## 1. Problem Statement & Relevance

### The Problem

Every year, over 2.6 billion kg of returned products end up in landfills despite being perfectly usable. Returns cost Amazon $25+ per item in reverse logistics, inspection, and restocking — totaling billions annually. Meanwhile, customers distrust refurbished products, and sellers lack actionable insight into why items are returned.

### Why It Matters

- 30% of all online purchases are returned (vs 8% in-store)
- $816 billion worth of merchandise was returned in the US alone in 2022
- Only 5% of returned items are resold at full value — the rest are discarded, liquidated, or destroyed
- Return shipping generates 24 million metric tons of CO₂ annually
- Customers who buy refurbished report 40% lower confidence than buying new

This isn't a niche problem — it affects every transaction in e-commerce.

### Theme Alignment

Our solution directly addresses "Second Life Commerce" by building an intelligent ecosystem where every returned product automatically finds its optimal next destination — whether that's a nearby buyer, a refurbishment center, a donation partner, or a recycling facility. We don't just process returns; we prevent them before they happen and ensure every item that does come back gets a meaningful second life.

### What Makes This Novel

No existing solution connects all three phases: prevention (before purchase), intelligent resolution (during return), and circular recovery (after return) into a single, seamless system. Our platform:

1. Prevents returns before they happen through predictive purchase guidance
2. Resolves issues without physical returns when possible (saving logistics costs)
3. Matches returned items to nearby buyers in real-time (demand-aware routing)
4. Builds customer trust in refurbished products through a certification + rewards ecosystem
5. Makes sustainability profitable — not just a cost center

---

## 2. Customer & Solution

### Target Customer

Three audiences, one connected platform:

**Customers**: Want to buy confidently, return easily, and trust renewed products. They need purchase guidance, fast resolutions, and incentives to make sustainable choices.

**Sellers**: Need to understand why their products are returned and how to reduce returns. They want actionable insights on packaging, listings, and product quality.

**Operations teams**: Need to process returns efficiently, route items to the right recovery path, and maximize value recovery while minimizing waste.

### How We Solve It

An intelligent returns ecosystem that sits invisibly behind the Amazon shopping experience:

• **Predictive Purchase Prevention** — Before checkout, customers see data-driven guidance: "This shoe runs small — check the size guide." Reduces unnecessary returns at the source.

• **Intelligent Resolution Center** — When a return is requested, the system analyzes the item's value, shipping cost, and nearby demand to offer the optimal resolution: keep-item refund, replacement, or standard return.

• **Demand-Aware Circular Routing** — Returned items are matched to active buyers in nearby regions and routed directly — skipping warehouse storage entirely. Amazon saves $22+ per item in logistics while the buyer gets a certified product faster.

• **Certified Renewed Marketplace** — A dedicated tab for certified refurbished products with quality grades, inspection reports, and a 90-day guarantee. Builds trust through transparency.

• **Sustainability Rewards** — Customers earn reward points for buying renewed, choosing keep-item resolutions, and other sustainable actions. Creates a behavioral loop that drives circular commerce.

### User Workflow

```
CUSTOMER JOURNEY:
Browse → Purchase Guidance → Buy → [Happy? Keep it]
                                    [Issue? → Return Request]
                                              ↓
                              Resolution Center (instant refund / replace / return)
                                              ↓
                              [If return] → Drop off → Refund

AMAZON INTERNAL (invisible to customer):
Return received → Fraud check → Quality grading → Recovery decision
                                                   ↓
                              Resell | Refurbish | Donate | Recycle
                                                   ↓
                              Demand matching → Route to nearest buyer
                                                   ↓
                              Listed on Renewed marketplace → Sold
```

### Working Prototype

**Live deployed across 4 applications:**

- Project Landing Page: https://amazon-hackathon-landing.vercel.app/
- Customer App: https://amazon-hackathon-customer-3kyjo2sy1.vercel.app/
- Executive Dashboard: https://amazon-hackathon-executive-5rtjgoynw.vercel.app/
- Operations Dashboard: https://amazon-hackathon-mcga0yax3-subartaghosh2025-5634s-projects.vercel.app/
- Seller Dashboard: https://amazon-hackathon-seller-j9z8oijvv.vercel.app/

**Backend: 12 microservices live on AWS Lambda (100% Serverless)**

All endpoints are live and responding. The frontend calls real backend services through server-side proxies — no mocked data.

---

## 3. Tech Architecture & Scaling

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER EXPERIENCE                        │
│  Next.js 14 + TypeScript + Tailwind (Vercel)                │
│  [Customer App] [Seller Central] [Ops Dashboard] [Executive]│
└────────────────────────────┬────────────────────────────────┘
                             │ Server-side proxy (no CORS)
┌────────────────────────────▼────────────────────────────────┐
│               12 MICROSERVICES (AWS Lambda HTTP APIs)              │
├──────────────────┬──────────────────┬───────────────────────┤
│ INTELLIGENCE     │ RECOVERY         │ PLATFORM              │
│ S1  Prevention   │ S5  Simulator    │ S4  Digital Twin      │
│ S2  Root Cause   │ S6  Optimizer    │ S11 Seller Intel      │
│ S3  Fraud/Trust  │ S7  Logistics    │ S12 Knowledge Graph   │
│ S10 Packaging    │ S8  Returnless   │     (DynamoDB)      │
│                  │ S9  Circular     │                       │
└──────────────────┴──────────────────┴───────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    AWS INFRASTRUCTURE                         │
│  Lambda · API Gateway · DynamoDB · EventBridge · CDK (Serverless) │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14, TypeScript, Tailwind CSS | SSR for proxy routes, type-safe API contracts, rapid UI iteration |
| Backend | Python 3.10, FastAPI, Pydantic v2 | Strict schema enforcement (extra="forbid"), async I/O, auto OpenAPI docs |
| Data/ML | DynamoDB, Bedrock | Event sourcing, fast lookups, LLM root cause analysis, event sourcing, LLM root cause analysis |
| Infra | AWS CDK, AWS Lambda, API Gateway, EventBridge | Infrastructure-as-code, true $0 serverless architecture, event-driven architecture |

### Key Algorithms & Complexity

**1. Multi-Factor Recovery Optimizer (S6)** — Weighted decision matrix evaluating 5+ recovery scenarios simultaneously. Balances recovery value, carbon impact, processing time, fraud risk, and seller trust into a single optimal decision. Not a simple if-else — it applies penalty/bonus modifiers for sustainability and fraud patterns.

**2. Demand-Aware Circular Routing (S9)** — Solves a constrained optimization: match returned items to facilities considering distance, capacity, facility type compatibility, and real-time demand signals. Minimizes carbon footprint while maximizing recovery value.

**3. Predictive Return Prevention (S1)** — Composite risk scoring using 9 weighted factors: customer return rate, product category return rate, seller rating, product rating, price band, purchase count, and more. Generates actionable recommendations, not just a score.

**4. Native Payload Compatibility** — All 12 services are designed so the output of Service A can be passed directly as input to Service B without transformation. This enables true pipeline execution: S5 → S6 → S7 → S9 with zero middleware.

### Scaling Strategy

- **Horizontal**: Each of the 12 services scales independently via AWS Lambda automatic concurrency scaling. A spike in returns doesn't affect product browsing.
- **Event-driven**: Services communicate via EventBridge — fully decoupled. Adding a 13th service requires zero changes to existing ones.
- **Graph intelligence**: DynamoDB On-Demand handles all our data storage instantly, costing $0 when idle.
- **Global ready**: API Gateway + AWS Lambda in any region. CDK deploys the entire stack in a new region in under 10 minutes.
- **Cost efficiency**: Lambda = pay per millisecond of execution. $0/month base cost. At 1M returns/month, estimated cost: <$1/month for all 12 services using the free tier.

---

## 4. Future Vision

### Where This Goes

In 1-3 years, this becomes Amazon's **Circular Commerce Operating System** — the invisible intelligence layer that ensures no product is ever truly "wasted." Every return becomes an opportunity: an opportunity to resell, to refurbish, to donate, or at minimum, to learn why it happened and prevent the next one.

### Roadmap

| Horizon | Milestone | Impact |
|---------|-----------|--------|
| 0-3 mo | Launch Renewed marketplace in 3 pilot categories. Deploy return prevention on top-100 SKUs. | 15% reduction in returns for pilot products. 50K certified renewed items listed. |
| 3-6 mo | Real-time demand matching for direct buyer fulfillment. Expand to all categories. Green Credits rewards program live. | $3.2M logistics savings. 200K active Renewed buyers. 40% trust improvement. |
| 6-12 mo | Seller-facing prevention tools. Automated quality grading via computer vision. Cross-border circular routing. | 25% overall return reduction. 1M items diverted from landfill. Carbon-neutral reverse logistics. |

### Multi-Segment Expansion

- **Amazon Warehouse Deals** → Powered by our certified grading and demand matching
- **Amazon Trade-In** → Customers upgrade devices; old ones flow into Renewed pipeline
- **Amazon Global** → Cross-border routing: item returned in US, sold renewed in India where demand is higher
- **Third-party logistics (3PL)** → License the recovery decision engine to other retailers
- **Amazon Business (B2B)** → Enterprise equipment renewal at scale

### Value Impact

**At Amazon's scale (500M+ returns/year):**

- $12.5B annual savings from prevented returns (at $25/return)
- 65M items given second lives instead of landfill
- 4.2M tons CO₂ prevented from unnecessary shipping
- $2.1B new revenue from Renewed marketplace
- 89% customer satisfaction improvement on return experience

---

## Links

- GitHub: https://github.com/subh-ghosh/amazon-hackathon
- Demo Video: [URL]
- Live Apps:
  - Project Landing Page: https://amazon-hackathon-landing.vercel.app/
  - Customer: https://amazon-hackathon-customer-3kyjo2sy1.vercel.app/
  - Executive Dashboard: https://amazon-hackathon-executive-5rtjgoynw.vercel.app/
  - Operations Dashboard: https://amazon-hackathon-mcga0yax3-subartaghosh2025-5634s-projects.vercel.app/
  - Seller Dashboard: https://amazon-hackathon-seller-j9z8oijvv.vercel.app/

---

## SCREENSHOTS NEEDED:

1. **Customer Home Page** — showing "All Products" and "Certified Renewed" tabs
2. **Product Detail Page** — showing purchase guidance (green checkmarks for safe product OR yellow warning for risky product)
3. **Resolution Center** — showing dynamic options after return request
4. **Renewed Marketplace** — the /renewed page with certified products
5. **Green Credits / Rewards page** — showing balance and earn methods
6. **Ops Dashboard Triage** — showing recovery decision + demand matching + buyer match economics
7. **Executive Dashboard** — top-level KPIs and recovery mix
8. **Architecture diagram** — the one from Section 3 above (create as an image)
