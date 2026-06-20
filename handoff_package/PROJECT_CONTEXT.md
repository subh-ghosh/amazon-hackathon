# Project Context: Amazon Circular Intelligence OS

## Project Name
Amazon Circular Intelligence OS

## Hackathon Objective
Build an AI-powered platform that prevents unnecessary returns before they happen, intelligently handles unavoidable returns, detects fraud, optimizes recovery value, and routes products back into the circular economy.

## Problem Statement
Amazon loses billions due to avoidable returns, return fraud, inefficient recovery operations, and products being discarded instead of re-entering the circular economy.

## Solution Overview
A unified ecosystem of 12 highly specialized microservices that sit invisibly behind the Amazon shopping experience. It intercepts return risks at the point of purchase, and when a return is requested, orchestrates a native pipeline of fraud scoring, digital twin creation, recovery optimization, and logistics routing to maximize sustainability and profit.

## Customer Journey
The platform helps customers make better purchase decisions (AI sizing/compatibility warnings, seller insights) so fewer products are returned. If a return is unavoidable, it provides a seamless resolution, often issuing returnless refunds for low-value/high-carbon items to save the customer time and Amazon money.

## Admin Journey
Operations teams gain unprecedented visibility via an Executive Dashboard that highlights Fraud Networks (Knowledge Graph), Sustainability Metrics, and Recovery Optimization paths for every digital twin in the system.

## Architecture Summary
A 12-Microservice Event-Driven Architecture segmented across 4 Logical VPC Domains (Intelligence, Recovery, Product/Business, Central Platform).

## Current Deployment Status
**100% Deployed and Live.** All 12 services are actively running in the AWS cloud.

## AWS Infrastructure Used
- **Compute:** AWS ECS Fargate
- **Infrastructure as Code:** AWS CDK (CloudFormation)
- **Networking:** Application Load Balancers (ALB) per service
- **Database:** Amazon Neptune (Tinkerpop/Gremlin) for the Knowledge Graph

## Technology Stack
- **Backend:** Python 3.10+, FastAPI, Pydantic (Strict Schema Enforcement)
- **Deployment:** Docker, AWS ECS
