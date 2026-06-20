"""
Amazon Circular Intelligence OS
Service 12: Learning & Knowledge Graph Service

FastAPI application entry point.
Wires all routes, exception handlers, and lifecycle events.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.routes import (
    customers,
    products,
    returns,
    fraud_cases,
    recovery_actions,
    intelligence,
)
from app.db.neptune_client import get_neptune_client

settings = get_settings()

# ── Logging ──────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s | %(name)-30s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Application ──────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Central memory and intelligence layer for the Amazon Circular Intelligence OS. "
        "Maintains a Knowledge Graph of Customers, Products, Sellers, Orders, Returns, "
        "Root Causes, Fraud Cases, Recovery Actions, and Warehouses."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (allow all for hackathon — lock down in prod) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Lifecycle ────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info(f"Starting {settings.PROJECT_NAME} [{settings.ENVIRONMENT}]")
    logger.info(f"Neptune endpoint: {settings.NEPTUNE_ENDPOINT}:{settings.NEPTUNE_PORT}")
    logger.info(f"EventBridge bus: {settings.EVENTBRIDGE_BUS_NAME}")


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down — closing Neptune connections")
    get_neptune_client().close()


# ── Routes ───────────────────────────────────────

prefix = settings.API_V1_PREFIX

app.include_router(customers.router,         prefix=f"{prefix}/customers",         tags=["Customers"])
app.include_router(products.router,          prefix=f"{prefix}/products",          tags=["Products"])
app.include_router(returns.router,           prefix=f"{prefix}/returns",           tags=["Returns"])
app.include_router(fraud_cases.router,       prefix=f"{prefix}/fraud-cases",       tags=["Fraud Cases"])
app.include_router(recovery_actions.router,  prefix=f"{prefix}/recovery-actions",  tags=["Recovery Actions"])
app.include_router(intelligence.router,      prefix=f"{prefix}/intelligence",      tags=["Intelligence & Analytics"])


# ── Health Check ─────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "neptune_endpoint": f"{settings.NEPTUNE_ENDPOINT}:{settings.NEPTUNE_PORT}",
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "Knowledge Graph Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }

# Lambda serverless handler
from mangum import Mangum
handler = Mangum(app)
