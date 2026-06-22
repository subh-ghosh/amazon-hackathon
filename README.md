# Amazon Second Life Commerce

> **HackOn with Amazon 2026** — Team KKR (Kolkata Kode Riders)

> ⚠️ **IMPORTANT NOTE FOR JUDGES:** Our original Vercel account was blocked due to usage limits. All demo links have been migrated to new deployments below. The submission document may contain old URLs — please use the links in this README as the authoritative source. All services are fully live and operational.

An intelligent ecosystem where returned or unused products automatically find their next best owner — through resale, refurbishment, donation, or recycling.

## 🚀 Live Demo (Updated Links)

| Application | URL | Audience |
|-------------|-----|----------|
| 🏠 **Project Landing Page** | [amazon-hackathon-landing.vercel.app](https://amazon-hackathon-landing.pages.dev/) | Overview |
| 🛒 Customer Experience | [amazon-hackathon-customer-3kyjo2sy1.vercel.app](https://amazon-hackathon-customer.pages.dev/) | Shoppers |
| 📊 Executive Dashboard | [amazon-hackathon-executive-5rtjgoynw.vercel.app](https://amazon-hackathon-executive-dashboard.pages.dev/) | Leadership |
| 🏭 Operations Dashboard | [amazon-hackathon-mcga0yax3-subartaghosh2025-5634s-projects.vercel.app](https://amazon-hackathon-ops-dashboard.pages.dev/) | Warehouse Ops |
| 📦 Seller Dashboard | [amazon-hackathon-seller-j9z8oijvv.vercel.app](https://amazon-hackathon-seller-dashboard.pages.dev/) | Third-party Sellers |

> 💡 **Architecture Migration Note (Important for Judges):** Please note that the backend architecture described in our original submission PDF (ECS Fargate, Neptune, ALB) has been completely rewritten. We quickly realized the original design exhausted our AWS Free Tier credits. Because we are constantly learning and adapting, we successfully migrated our entire 12-microservice backend to a **100% Serverless Architecture** (AWS Lambda, API Gateway, DynamoDB On-Demand). This new setup scales to zero and costs practically $0 when idle. We sincerely apologize for the inconvenience and any confusion between the submission document and this live repository!

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14 + TypeScript + Tailwind, Vercel)  │
│  Customer · Seller Central · Operations · Executive     │
└───────────────────────────┬─────────────────────────────┘
                            │ Server-side proxy
┌───────────────────────────▼─────────────────────────────┐
│           12 MICROSERVICES (AWS Lambda HTTP APIs)       │
├─────────────────┬─────────────────┬─────────────────────┤
│ INTELLIGENCE    │ RECOVERY        │ PLATFORM            │
│ S1  Prevention  │ S5  Simulator   │ S4  Digital Twin    │
│ S2  Root Cause  │ S6  Optimizer   │ S11 Seller Intel    │
│ S3  Fraud       │ S7  Logistics   │ S12 Knowledge Graph │
│ S10 Packaging   │ S8  Returnless  │     (DynamoDB)      │
│                 │ S9  Circular    │                     │
└─────────────────┴─────────────────┴─────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  AWS: Lambda · API Gateway · DynamoDB · CDK (Serverless)│
└─────────────────────────────────────────────────────────┘
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
| Backend | Python 3.10, FastAPI, Pydantic v2 |
| Data | Amazon Neptune (Graph), DynamoDB |
| Infra | AWS CDK, ECS Fargate, ALB, EventBridge |

## Repository Structure

```
├── frontend/
│   ├── customer/           # Shopper-facing app
│   ├── executive-dashboard/ # Leadership metrics
│   ├── ops-dashboard/      # Warehouse operations
│   ├── seller-dashboard/   # Seller analytics
│   └── shared/             # Shared API adapters
├── backend/
│   ├── Service 1-12/       # 12 microservices
│   └── shared/             # Event schemas
├── shared/                 # Cross-service schemas
└── API_DIRECTORY.md        # Endpoint registry
```

## Team

| Name | Role |
|------|------|
| Subarta Ghosh | Cloud & Backend |
| Arhit Basu | Backend |
| Tiyas Das | Frontend |

Vellore Institute of Technology, Vellore
