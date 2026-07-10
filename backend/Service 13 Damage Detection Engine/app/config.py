import os

class Settings:
    PROJECT_NAME: str = "Damage Detection Engine"
    API_V1_STR: str = "/api"
    
    # Model configuration
    # Allow custom trained YOLO model via environment variable
    # Searches common workspace paths for custom trained weights
    _default_model = "yolov8n.pt"
    _custom_paths = [
        "/home/arhit/Desktop/amazon hack/runs/detect/train/weights/best.pt",
        "/home/arhit/Desktop/amazon hack/model training/damage/runs/detect/train/weights/best.pt"
    ]
    
    DAMAGE_MODEL_PATH: str = os.getenv("DAMAGE_MODEL_PATH", "")
    if not DAMAGE_MODEL_PATH:
        for path in _custom_paths:
            if os.path.exists(path):
                DAMAGE_MODEL_PATH = path
                break
        else:
            DAMAGE_MODEL_PATH = _default_model
    
    # Fallback/Demo settings
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # AWS configuration if needed for Digital Twin integrations
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    DIGITAL_TWIN_SERVICE_URL: str = os.getenv(
        "DIGITAL_TWIN_SERVICE_URL", 
        "http://localhost:8004"
    )

settings = Settings()
