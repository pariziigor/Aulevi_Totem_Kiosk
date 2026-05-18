from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class QuoteRequestSchema(BaseModel):
    # DADOS FIXOS E OBRIGATÓRIOS (Comuns a todos os módulos)
    module: str = Field(default="LSF", description="Módulo de origem: LSF, CHALE, BARRACAO")
    lead_name: str = Field(..., min_length=2, description="Nome completo do lead")
    lead_phone: str = Field(..., min_length=10, description="WhatsApp do lead com DDD")
    
    # ESPECIFICAÇÕES DO LSF (Agora opcionais para não quebrar outros módulos)
    area: Optional[float] = Field(default=None, gt=0, description="Área em metros quadrados")
    tipo: Optional[str] = Field(default=None, description="Casa 1 pav, Casa 2 pav, Galpão, Galpão + escritório")
    padrao: Optional[str] = Field(default=None, description="Popular, Médio, Alto, Não se aplica")
    has_facade: Optional[bool] = Field(default=None, description="Obrigatório utilizar tipo nativo True ou False")
    has_project: Optional[bool] = Field(default=None, description="Obrigatório utilizar tipo nativo True ou False")

    # PERMISSÃO PARA CAMPOS EXTRAS
    # Isso avisa ao FastAPI: "Aceite qualquer chave não mapeada (ex: modelo_escolhido) e adicione ao payload"
    model_config = ConfigDict(extra='allow')


class QuoteResponseSchema(BaseModel):
    # Adicionado o número do orçamento para o Frontend receber de volta
    quote_number: Optional[str] = None 
    total_value: float
    value_per_m2: Optional[float] = 0.0
    items: Optional[list[dict]] = []