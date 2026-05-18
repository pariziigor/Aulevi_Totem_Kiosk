from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from datetime import datetime
from database.connection import Base

class QuoteModel(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    
    # NOVAS COLUNAS PARA O LEAD COMPLETO
    quote_number = Column(String, unique=True, index=True, nullable=True) # Ex: AUL-LSF-20260518-X8B2
    module = Column(String, index=True, nullable=True) # 'LSF', 'CHALE', 'BARRACAO'
    selections = Column(JSON, nullable=True) # Salva dados dinâmicos: {"tipo": "Casa", "padrao": "Alto"} ou {"modelo": "Chalé Alpes"}
    
    # COLUNAS EXISTENTES
    lead_name = Column(String, nullable=False)
    lead_phone = Column(String, nullable=False)
    
    # ALTERADAS PARA NULLABLE (Para não quebrar quando vier um Lead de Chalé)
    area = Column(Float, nullable=True) 
    total_value = Column(Float, nullable=True) 
    
    # MANTIDA TIPAGEM BOOLEANA ESTRITA (Nativo True/False)
    is_synced = Column(Boolean, default=False, nullable=False) 
    
    created_at = Column(DateTime, default=datetime.utcnow)