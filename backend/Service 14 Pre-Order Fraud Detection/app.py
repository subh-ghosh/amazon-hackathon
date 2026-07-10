from fastapi import FastAPI
from api.fraud_api import router as fraud_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Pre-Order Fraud Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fraud_router, prefix="/api/fraud")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8021, reload=True)
