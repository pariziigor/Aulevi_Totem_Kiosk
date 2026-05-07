from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.quote_schema import QuoteRequestSchema, QuoteResponseSchema
from services.pricing_service import PricingService
from models.quote_model import QuoteModel

router = APIRouter(prefix="/api/v1/quotes", tags=["Orcamentos"])

@router.post("/", response_model=QuoteResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_quote(payload: QuoteRequestSchema, db: Session = Depends(get_db)):
    try:
        # 1. Executa o cálculo matemático (Service)
        calculation_result = PricingService.calculate_quote(payload)
        
        # 2. Persistência no SQLite (Repositório/Modelo)
        new_quote = QuoteModel(
            lead_name=payload.lead_name,
            lead_phone=payload.lead_phone,
            area=payload.area,
            total_value=calculation_result["total_value"],
            is_synced=False # Offline-first: aguarda sincronização posterior
        )
        
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        
        return calculation_result
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha interna no processamento do orçamento: {str(e)}"
        )