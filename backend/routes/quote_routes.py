import math
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

# 🔥 Import corrigido
from services.mm_princing_service import calcular_sem_laje, calcular_com_laje, para_dict

router = APIRouter(prefix="/api/v1/quotes", tags=["Orcamentos"])

def generate_quote_number(module_name: str) -> str:
    """
    Gera um número único de orçamento corporativo
    Ex: AUL-MAD-14OI.26
    """
    prefix_map = {"LSF": "LSF", "CHALE": "CHL", "BARRACAO": "BAR", "MADEIRAMENTO": "MAD"}
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
        
        # Variáveis auxiliares para o Madeiramento
        mm_resultado_dict = {}
        mm_calculated_area = 0.0

        # 1. CÁLCULO CONDICIONAL DE PREÇOS
        if module == "LSF":
            calculation_result = PricingService.calculate_quote(payload)
            
        elif module == "MADEIRAMENTO":
            # Extrai apenas as variáveis cruciais
            dim_a = payload_dict.get("dim_a", 0.0)
            dim_b = payload_dict.get("dim_b", 0.0)
            tipo_laje = payload_dict.get("tipo_laje", "SEM_LAJE")
            tipo_telha = payload_dict.get("tipo_telha", "Cerâmico")
            tem_placa = payload_dict.get("tem_placa", False)
            
            # 🔥 CHAMA O SERVIÇO (Enviando apenas os 4 parâmetros originais)
            if tipo_laje == "SEM_LAJE":
                calc_result = calcular_sem_laje(
                    a=dim_a, b=dim_b, tipo_telha=tipo_telha, tem_placa=tem_placa
                )
            else:
                calc_result = calcular_com_laje(
                    a=dim_a, b=dim_b, tipo_telha=tipo_telha, tem_placa=tem_placa
                )
            
            # Prepara o Dicionário para o PDF
            mm_resultado_dict = para_dict(calc_result)
            mm_resultado_dict["altura_pontaletes"] = mm_resultado_dict.get("altura_pontaletes_m", 0)
            mm_calculated_area = round(dim_a * dim_b, 2)
            
            total = getattr(calc_result, 'valor_total', 0.0)
            
            calculation_result = {
                "total_value": total,
                "value_per_m2": total / mm_calculated_area if mm_calculated_area > 0 else 0,
                "items": []
            }
            
        else:
            # Chalé e Barracão
            calculation_result = {
                "total_value": 0.0,
                "value_per_m2": 0.0,
                "items": []
            }
        
        # 2. Extração dos dados fixos para Persistência
        lead_name = payload_dict.pop("lead_name", "Não Informado")
        lead_phone = payload_dict.pop("lead_phone", "Não Informado")
        
        # Salva a área real calculada para o Madeiramento
        area = mm_calculated_area if module == "MADEIRAMENTO" else payload_dict.pop("area", None)
        
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
            is_synced=False # Mantida a tipagem booleana
        )
        
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        
        # 4. GERAÇÃO DO DOCUMENTO PDF CONDICIONAL
        pdf_data = payload.model_dump()
        pdf_data["quote_number"] = quote_number
        
        if module == "LSF":
            pdf_path = await PDFService.generate_quote_pdf(
                quote_data=pdf_data,
                items=calculation_result.get("items", []),
                total_value=calculation_result.get("total_value", 0.0),
                value_per_m2=calculation_result.get("value_per_m2", 0.0)
            )

        elif module in ["CHALE", "BARRACAO"]:
            pdf_path = await PDFService.generate_chalet_pdf(product_data)
            
        elif module == "MADEIRAMENTO":
            pdf_data.update(mm_resultado_dict)
            pdf_data["calculated_area"] = mm_calculated_area
            pdf_path = await PDFService.generate_madeiramento_pdf(pdf_data)
        
        print(f"[PDF Generator]: Documento {quote_number} compilado com sucesso em -> {pdf_path}")
        
        calculation_result["quote_number"] = quote_number
        return calculation_result
        
    except Exception as e:
        db.rollback()
        print(f"Erro detalhado na criação do orçamento: {str(e)}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na esteira de orçamentação: {str(e)}"
        )