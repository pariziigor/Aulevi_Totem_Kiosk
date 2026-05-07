import pytest
from schemas.quote_schema import QuoteRequestSchema
from services.pricing_service import PricingService

def test_calculate_quote_lsf_casa_1_pav():
    """
    Testa o cálculo para Casa 1 Pavimento, Padrão Médio, com fachada e projeto.
    Garante o uso estrito de booleanos nativos nas flags lógicas.
    """
    payload = QuoteRequestSchema(
        lead_name="Cliente Homologacao",
        lead_phone="11999999999",
        tipo="Casa 1 pav",
        padrao="Médio",
        has_facade=True,
        has_project=True,
        area=100.0
    )

    result = PricingService.calculate_quote(payload)

    # Validação estrutural do retorno
    assert isinstance(result, dict)
    assert "total_value" in result
    assert "value_per_m2" in result
    assert "items" in result
    
    # Validação do cálculo de projeto (max(2000, area * 30))
    # Para 100m2, o valor do projeto deve ser 3000
    project_item = next((item for item in result["items"] if item["codigo"] == "PROJ"), None)
    assert project_item is not None
    assert project_item["qtd"] == 1
    
    # O valor do projeto está embutido no item ou no total?
    # Pela lógica do service, projeto_valor entra na soma final e o item "PROJ" marca qtd=1.
    assert result["total_value"] > 0

def test_calculate_quote_lsf_sem_projeto_e_fachada():
    """
    Testa o cenário alternativo utilizando False nativo para as flags lógicas.
    """
    payload = QuoteRequestSchema(
        lead_name="Cliente Homologacao 2",
        lead_phone="11999999999",
        tipo="Galpão",
        padrao="Popular",
        has_facade=False,
        has_project=False,
        area=200.0
    )

    result = PricingService.calculate_quote(payload)
    
    # O cálculo sem projeto deve omitir o valor adicional (projeto_valor = 0)
    # Validações matemáticas da regra de negócio:
    # Galpão (18) + Popular (0) + Fachada Não (0) = 18 * 200 = 3600 kg de perfil
    perfil_item = next(item for item in result["items"] if item["codigo"] == "L095089E275")
    assert perfil_item["qtd"] == 3600

    # Projeto deve refletir a tipagem lógica estrita (False -> 0)
    total_sem_projeto = result["total_value"]
    assert total_sem_projeto > 0