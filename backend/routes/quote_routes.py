import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.quote_schema import QuoteRequestSchema, QuoteResponseSchema
from services.pricing_service import PricingService
from services.pdf_service import PDFService
from models.quote_model import QuoteModel

router = APIRouter(prefix="/api/v1/quotes", tags=["Orcamentos"])

def generate_quote_number(module_name: str) -> str:
    """
    Gera um número único de orçamento corporativo
    Ex: AUL-LSF-14OI.26
    """
    prefix_map = {"LSF": "LSF", "CHALE": "CHL", "BARRACAO": "BAR"}
    prefix = prefix_map.get(module_name.upper(), "GEN")
    
    year_str = datetime.now().strftime("%y")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    return f"AUL-{prefix}-{random_str}.{year_str}"

@router.post("/", response_model=QuoteResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_quote(payload: QuoteRequestSchema, db: Session = Depends(get_db)):
    try:
        payload_dict = payload.model_dump()
        module = payload_dict.pop("module", "LSF").upper()
        quote_number = generate_quote_number(module)
        
        # 1. CÁLCULO CONDICIONAL DE PREÇOS
        if module == "LSF":
            # Se for LSF, roda o motor de precificação pesado
            calculation_result = PricingService.calculate_quote(payload)
        else:
            # Se for Chalé ou Barracão, não precisamos de cálculo de itens aqui,
            # pois o PDF de Catálogo não usa tabela de preços, apenas a ficha técnica.
            calculation_result = {
                "total_value": 0.0,
                "value_per_m2": 0.0,
                "items": []
            }
        
        # 2. Extração dos dados fixos
        lead_name = payload_dict.pop("lead_name", "Não Informado")
        lead_phone = payload_dict.pop("lead_phone", "Não Informado")
        area = payload_dict.pop("area", None)
        
        # Extrai o objeto completo do Chalé enviado pelo frontend
        product_data = payload_dict.get("product", {})
        
        selections = payload_dict

        # 3. Persistência no SQLite
        new_quote = QuoteModel(
            quote_number=quote_number,
            module=module,
            lead_name=lead_name,
            lead_phone=lead_phone,
            area=area,
            total_value=calculation_result.get("total_value", 0.0),
            selections=selections,
            is_synced=False # Mantida a rigorosidade: tipo nativo Booleano
        )
        
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        
        # 4. GERAÇÃO DO DOCUMENTO PDF CONDICIONAL (A Mágica Acontece Aqui)
        pdf_data = payload.model_dump()
        pdf_data["quote_number"] = quote_number
        
        if module == "LSF":
            # Se for LSF, gera o Orçamento Paramétrico (Tabelas)
            pdf_path = await PDFService.generate_quote_pdf(
                quote_data=pdf_data,
                items=calculation_result.get("items", []),
                total_value=calculation_result.get("total_value", 0.0),
                value_per_m2=calculation_result.get("value_per_m2", 0.0)
            )
        elif module in ["CHALE", "BARRACAO"]:
            # Se for Chalé/Barracão, gera o Catálogo/Memorial Descritivo (Imagens)
            # Passamos o product_data direto para a função nova que criamos!
            pdf_path = await PDFService.generate_chalet_pdf(product_data)
        
        print(f"[PDF Generator]: Documento {quote_number} compilado com sucesso em -> {pdf_path}")
        
        calculation_result["quote_number"] = quote_number
        
        return calculation_result
    except Exception as e:
        db.rollback()
        # O print abaixo vai ajudar a mostrar no terminal exatamente qual linha quebrou, caso ocorra outro erro
        print(f"Erro detalhado na criação do orçamento: {str(e)}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na esteira de orçamentação: {str(e)}"
        )