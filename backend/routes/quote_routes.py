from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.quote_schema import QuoteRequestSchema, QuoteResponseSchema
from services.pricing_service import PricingService
from services.pdf_service import PDFService
from models.quote_model import QuoteModel

router = APIRouter(prefix="/api/v1/quotes", tags=["Orcamentos"])

@router.post("/", response_model=QuoteResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_quote(payload: QuoteRequestSchema, db: Session = Depends(get_db)):
    try:
        # 1. Executa o cálculo matemático
        calculation_result = PricingService.calculate_quote(payload)
        
        # 2. Persistência no SQLite
        new_quote = QuoteModel(
            lead_name=payload.lead_name,
            lead_phone=payload.lead_phone,
            area=payload.area,
            total_value=calculation_result["total_value"],
            is_synced=False
        )
        
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        
        # 3. Geração do Documento PDF
        # O model_dump() converte o schema Pydantic num dicionário para o Jinja2
        pdf_path = await PDFService.generate_quote_pdf(
            quote_data=payload.model_dump(),
            items=calculation_result["items"],
            total_value=calculation_result["total_value"],
            value_per_m2=calculation_result["value_per_m2"]
        )
        
        # Log no terminal do Watchdog para auditoria da criação do arquivo
        print(f"[PDF Generator]: Documento compilado com sucesso em -> {pdf_path}")
        
        return calculation_result
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na esteira de orçamentação: {str(e)}"
        )