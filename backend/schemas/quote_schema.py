from pydantic import BaseModel, Field

class QuoteRequestSchema(BaseModel):
    lead_name: str = Field(..., min_length=2, description="Nome completo do lead")
    lead_phone: str = Field(..., min_length=10, description="WhatsApp do lead com DDD")
    tipo: str = Field(..., description="Casa 1 pav, Casa 2 pav, Galpão, Galpão + escritório")
    padrao: str = Field(..., description="Popular, Médio, Alto, Não se aplica")
    has_facade: bool = Field(..., description="Obrigatório utilizar True ou False")
    has_project: bool = Field(..., description="Obrigatório utilizar True ou False")
    area: float = Field(..., gt=0, description="Área em metros quadrados")

class QuoteResponseSchema(BaseModel):
    total_value: float
    value_per_m2: float
    items: list[dict]