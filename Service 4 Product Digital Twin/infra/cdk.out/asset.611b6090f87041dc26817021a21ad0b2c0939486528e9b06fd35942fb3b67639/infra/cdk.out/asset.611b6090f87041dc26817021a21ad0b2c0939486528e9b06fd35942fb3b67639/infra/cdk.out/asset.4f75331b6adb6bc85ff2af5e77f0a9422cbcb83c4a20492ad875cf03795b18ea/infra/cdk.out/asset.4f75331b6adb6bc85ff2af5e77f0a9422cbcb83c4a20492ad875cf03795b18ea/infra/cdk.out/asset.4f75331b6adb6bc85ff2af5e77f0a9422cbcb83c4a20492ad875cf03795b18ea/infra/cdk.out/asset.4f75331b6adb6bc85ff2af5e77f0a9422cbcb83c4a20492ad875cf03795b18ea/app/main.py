from fastapi import FastAPI
from app.api.products import router as products_router

app = FastAPI(title="Product Digital Twin", version="1.0.0")

app.include_router(products_router, prefix="/api/v1/products", tags=["Products"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Product Digital Twin"}
