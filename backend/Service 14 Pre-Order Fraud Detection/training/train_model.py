import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
import pickle
import os

def train():
    data_path = os.path.join(os.path.dirname(__file__), "data", "fraud_dataset.csv")
    if not os.path.exists(data_path):
        print("Dataset not found. Run generate_dataset.py first.")
        return
        
    df = pd.read_csv(data_path)
    X = df.drop("fraud", axis=1)
    y = df["fraud"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model trained with accuracy: {accuracy:.4f}")
    
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
    os.makedirs(model_dir, exist_ok=True)
    
    with open(os.path.join(model_dir, "xgboost_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    print("Model saved to models/xgboost_model.pkl")

if __name__ == "__main__":
    train()
