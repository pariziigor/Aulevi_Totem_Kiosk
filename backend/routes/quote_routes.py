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
    Ex: AUL-LSF-A9F2.26
    """
    prefix_map = {"LSF": "LSF", "CHALE": "CHL", "BARRACAO": "BAR"}
    prefix = prefix_map.get(module_name.upper(), "GEN")
    
    # Extrai apenas os dois últimos dígitos do ano atual (ex: '26' para 2026)
    year_str = datetime.now().strftime("%y")
    
    # Gera 4 caracteres aleatórios (Letras Maiúsculas e Números)
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    # Retorna o formato final: AUL-MODULO-ALEATORIO.ANO
    return f"AUL-{prefix}-{random_str}.{year_str}"

@router.post("/", response_model=QuoteResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_quote(payload: QuoteRequestSchema, db: Session = Depends(get_db)):
    try:
        # 1. Transformamos o payload validado em dicionário para manipulação flexível
        payload_dict = payload.model_dump()
        
        # 2. Identificação do módulo e geração do número do orçamento
        # Caso o frontend não envie o módulo, adotamos LSF por segurança
        module = payload_dict.pop("module", "LSF").upper()
        quote_number = generate_quote_number(module)
        
        # 3. Executa o cálculo matemático usando o payload original intacto
        calculation_result = PricingService.calculate_quote(payload)
        
        # 4. Extração dos dados fixos da raiz do banco de dados
        lead_name = payload_dict.pop("lead_name", "Não Informado")
        lead_phone = payload_dict.pop("lead_phone", "Não Informado")
        area = payload_dict.pop("area", None)
        
        # O que sobrar em payload_dict será salvo na coluna JSON "selections"
        # Isso permite salvar "has_facade", "padrao" ou "modelo_chale" dinamicamente
        selections = payload_dict

        # 5. Persistência no SQLite
        new_quote = QuoteModel(
            quote_number=quote_number,
            module=module,
            lead_name=lead_name,
            lead_phone=lead_phone,
            area=area,
            total_value=calculation_result.get("total_value", 0.0),
            selections=selections,
            is_synced=False # Mantida a rigorosidade da tipagem booleana
        )
        
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)
        
        # 6. Geração do Documento PDF
        # Montamos um novo dicionário específico para o PDF, injetando o número do pedido
        pdf_data = payload.model_dump()
        pdf_data["quote_number"] = quote_number
        
        pdf_path = await PDFService.generate_quote_pdf(
            quote_data=pdf_data,
            items=calculation_result.get("items", []),
            total_value=calculation_result.get("total_value", 0.0),
            value_per_m2=calculation_result.get("value_per_m2", 0.0)
        )
        
        # Log no terminal do Watchdog para auditoria da criação do arquivo
        print(f"[PDF Generator]: Documento {quote_number} compilado com sucesso em -> {pdf_path}")
        
        # Injetamos o número do orçamento no retorno para que o Frontend possa exibir em tela
        calculation_result["quote_number"] = quote_number
        
        return calculation_result
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na esteira de orçamentação: {str(e)}"
        )