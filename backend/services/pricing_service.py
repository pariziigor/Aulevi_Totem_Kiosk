import math
from schemas.quote_schema import QuoteRequestSchema

class PricingService:
    @staticmethod
    def calculate_quote(data: QuoteRequestSchema) -> dict:
        fatores_tipo = {
            "Casa 1 Pavimento": 26.5,
            "Casa 2 Pavimentos": 34.5,
            "Galpão": 18.0,
            "Galpão + escritório": 25.0
        }
        
        fatores_padrao_perfil = {
            "Popular": 0.0,
            "Médio": 1.5,
            "Alto": 3.0,
            "Não se aplica": 0.0
        }
        
        fatores_parafuso_extra = {
            "Popular": 0.0,
            "Médio": 5.75,
            "Alto": 11.5,
            "Não se aplica": 0.0
        }
        
        fatores_parabolt = {
            "Casa 1 Pavimento": 0.90,
            "Casa 2 Pavimentos": 0.45,
            "Galpão": 0.45,
            "Galpão + escritório": 0.60
        }
        
        fatores_manta = {
            "Casa 1 Pavimento": 0.70,
            "Casa 2 Pavimentos": 0.35,
            "Galpão": 0.35,
            "Galpão + escritório": 0.50
        }

        # Cálculos de quantitativos baseados na área
        fachada_multiplier = 2.5 if data.has_facade is True else 0.0
        perfil = round((fatores_tipo[data.tipo] + fatores_padrao_perfil[data.padrao] + fachada_multiplier) * data.area)
        
        parafuso = round(((75 + fatores_parafuso_extra[data.padrao]) * data.area) / 500) * 500
        parabolt = math.ceil(fatores_parabolt[data.tipo] * data.area)
        
        metros_manta = fatores_manta[data.tipo] * data.area
        rolos_manta = math.ceil(metros_manta / 10)
        
        # Validação lógica estrita do projeto utilizando booleano nativo
        projeto_valor = max(2000, round(data.area * 30)) if data.has_project is True else 0

        # Cálculo de ancoradores
        if data.area <= 30:
            ancorador = 8
        elif data.area <= 60:
            ancorador = 16
        elif data.area <= 150:
            ancorador = 24
        elif data.area <= 250:
            ancorador = 36
        elif data.area <= 350:
            ancorador = 45
        else:
            ancorador = 60

        precos = {
            "L095089E275": 13.00,
            "APAR4.8X019BRPH": 0.25,
            "APBO1/2X4": 4.30,
            "AMAN20CM10M": 69.79,
            "AANC189X49X5/16": 27.00,
            "PROJ": projeto_valor
        }

        itens = [
            {"codigo": "L095089E275", "descricao": "LSF 0,95X89 ZAR230Z275", "un": "kg", "qtd": perfil},
            {"codigo": "APAR4.8X019BRPH", "descricao": "Parafuso 4.8x19", "un": "un", "qtd": parafuso},
            {"codigo": "APBO1/2X4", "descricao": "Parabolt 1/2 x 4", "un": "un", "qtd": parabolt},
            {"codigo": "AMAN20CM10M", "descricao": "Manta asfáltica (rolo 10m)", "un": "un", "qtd": rolos_manta},
            {"codigo": "AANC189X49X5/16", "descricao": "Ancorador 3 mm", "un": "un", "qtd": ancorador},
            {"codigo": "PROJ", "descricao": "Projeto estrutural", "un": "R$", "qtd": 1}
        ]

        total_produtos = sum(item["qtd"] * precos[item["codigo"]] for item in itens if item["codigo"] != "PROJ")
        total_produtos += projeto_valor
        valor_m2 = total_produtos / data.area

        return {
            "total_value": total_produtos,
            "value_per_m2": valor_m2,
            "items": itens
        }