from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String, primary_key=True, index=True)
    account_age_days = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_returns = Column(Integer, default=0)
    fraud_flags = Column(Integer, default=0)
    avg_order_value = Column(Float, default=0.0)
    last_login_ip = Column(String)
    device_id = Column(String)

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    amount = Column(Float)
    category = Column(String)
    payment_method = Column(String)
    delivery_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
