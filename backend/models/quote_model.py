from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from database.connection import Base

class QuoteModel(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    lead_name = Column(String, nullable=False)
    lead_phone = Column(String, nullable=False)
    area = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    is_synced = Column(Boolean, default=False, nullable=False) # Tipagem booleana estrita
    created_at = Column(DateTime, default=datetime.utcnow)