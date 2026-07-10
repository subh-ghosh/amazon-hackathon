from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.yolo_service import YoloDamageService
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version="1.0.0",
    docs_url="/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YOLO Damage Service (lazy loading inside constructor)
damage_service = YoloDamageService(model_path=settings.DAMAGE_MODEL_PATH)

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "service": settings.PROJECT_NAME,
        "yolo_model": settings.DAMAGE_MODEL_PATH,
        "is_custom_model": damage_service.is_custom_model
    }

@app.post("/api/damage-detection")
async def detect_product_damage(
    file: UploadFile = File(...),
    original_price: float = 25000.0,
    product_title: str = "",
    category: str = "",
    damage_types: str = ""
):
    """
    Endpoint that accepts an uploaded image file, runs YOLO object detection
    to detect product damages, and returns a structured damage report.
    """
    logger.info(f"Received damage detection request for file: {file.filename}, original_price: {original_price}, title: {product_title}, category: {category}, damage_types: {damage_types}")
    
    # Validate content type
    if not file.content_type.startswith("image/"):
        logger.warning(f"Rejected non-image upload: {file.content_type}")
        raise HTTPException(
            status_code=400, 
            detail="Uploaded file must be a valid image format."
        )
        
    try:
        # Read raw image bytes
        image_bytes = await file.read()
        
        # Run detection
        report = damage_service.detect_damage(
            image_bytes, 
            original_price=original_price,
            product_title=product_title,
            category=category,
            damage_types=damage_types
        )
        
        logger.info("Damage detection inference completed successfully.")
        return report
    except Exception as e:
        logger.error(f"Error during damage detection: {e}", exc_info=True)
        # Return fallback demo response to guarantee UI never crashes
        return damage_service._get_demo_prediction(None, None, str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8020, reload=True)

# Lambda handler for serverless deployment
from mangum import Mangum
handler = Mangum(app)
