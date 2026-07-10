import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraud_engine.db")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "xgboost_model.pkl")
