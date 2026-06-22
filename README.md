# Amazon Second Life Commerce

> **HackOn with Amazon 2026** — Team KKR (Kolkata Kode Riders)

> ⚠️ **IMPORTANT NOTE FOR JUDGES:** Our original Vercel hosting was suspended due to usage limits. All frontends have been migrated to **Netlify** for maximum reliability. The original submission document may contain old Vercel URLs — **please use the links in this README as the authoritative source.** All services are fully live and operational.

> 💡 **Architecture Note:** Our backend runs on a **100% Serverless Architecture** (AWS Lambda, API Gateway, DynamoDB On-Demand) deployed via AWS CDK. Frontends are hosted on **Netlify** for maximum reliability and global edge performance. The entire platform scales to zero and costs practically $0 when idle.

An intelligent ecosystem where returned or unused products automatically find their next best owner — through resale, refurbishment, donation, or recycling.

## 🚀 Live Demo

| Application | URL | Audience |
|-------------|-----|----------|
| 🏠 **Project Landing Page** | [slc-landing.netlify.app](https://slc-landing.netlify.app/) | Overview |
| 🛒 Customer Experience | [slc-customer.netlify.app](https://slc-customer.netlify.app/) | Shoppers |
| 📊 Executive Dashboard | [slc-executive.netlify.app](https://slc-executive.netlify.app/) | Leadership |
| 🏭 Operations Dashboard | [slc-ops.netlify.app](https://slc-ops.netlify.app/) | Warehouse Ops |
| 📦 Seller Dashboard | [slc-seller.netlify.app](https://slc-seller.netlify.app/) | Third-party Sellers |


## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14 + TypeScript + Tailwind)              │
│  Hosted on Netlify (Global Edge Network)           │
│  Customer · Seller Central · Operations · Executive         │
└───────────────────────────┬─────────────────────────────────┘
                            │ Server-side proxy
┌───────────────────────────▼─────────────────────────────────┐
│           12 MICROSERVICES (AWS Lambda HTTP APIs)            │
├─────────────────┬─────────────────┬─────────────────────────┤
│ INTELLIGENCE    │ RECOVERY        │ PLATFORM                │
│ S1  Prevention  │ S5  Simulator   │ S4  Digital Twin        │
│ S2  Root Cause  │ S6  Optimizer   │ S11 Seller Intel        │
│ S3  Fraud       │ S7  Logistics   │ S12 Knowledge Graph     │
│ S10 Packaging   │ S8  Returnless  │     (DynamoDB)          │
│                 │ S9  Circular    │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  AWS: Lambda · API Gateway · DynamoDB · EventBridge · CDK   │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

**For Customers:**
- Predictive purchase guidance (warns before bad buys)
- Certified Renewed marketplace (30% cheaper, quality-graded)
- Sustainability rewards program
- Intelligent return resolution (instant refund for low-value items)

**For Amazon Operations:**
- Recovery decision engine (resell / refurbish / donate / recycle)
- Demand-aware routing (match items to nearest buyers)
- Direct buyer fulfillment (skip warehouse, save $22+ per item)
- Real-time facility triage with interactive recovery scenarios

**For Sellers:**
- Return cause analytics
- Packaging intelligence
- Product quality insights
- Actionable recommendations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Hosting | Netlify (Edge Network) |
| Backend | Python 3.10, FastAPI, Pydantic v2 |
| Data | DynamoDB On-Demand, EventBridge |
| Infra | AWS CDK, AWS Lambda, API Gateway |

## Repository Structure

```
├── frontend/
│   ├── landing/             # Project landing page
│   ├── customer/            # Shopper-facing app
│   ├── executive-dashboard/ # Leadership metrics
│   ├── ops-dashboard/       # Warehouse operations
│   ├── seller-dashboard/    # Seller analytics
│   └── shared/              # Shared API adapters
├── backend/
│   ├── Service 1-12/        # 12 microservices
│   ├── infra-lambda/        # AWS CDK serverless stack
│   └── shared/              # Event schemas
├── shared/                  # Cross-service schemas
└── API_DIRECTORY.md         # Endpoint registry
```

## Team

| Name | Role |
|------|------|
| Subarta Ghosh | Cloud & Backend |
| Arhit Basu | Backend |
| Tiyas Das | Frontend |

Vellore Institute of Technology, Vellore
