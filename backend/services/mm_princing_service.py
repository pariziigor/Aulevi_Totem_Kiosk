"""
Serviço de quantificação de madeiramento — telhados 1/2 águas.
Baseado na planilha AULEVI - MADEIRAMENTO - QUANTIFICADOR 1-2 ÁGUAS.

Regras automáticas (sem entrada do usuário):
  - Vão máximo : Cerâmico/Concreto → 1,0 m | demais → 1,5 m
  - Perfil viga SEM LAJE : calculado por critério de deflexão L/120
  - Pontaletes COM LAJE  : ceil(b / 1,5)  — cada tramo ≤ 1,5 m
  - Altura pontaletes    : estimada como inclinação_média × (b/2), mínimo 0,3 m

Interface pública
-----------------
    calcular_sem_laje(a, b, tipo_telha, tem_placa) -> ResultadoSemLaje
    calcular_com_laje(a, b, tipo_telha, tem_placa) -> ResultadoComLaje
    para_dict(resultado)  -> dict  (serializável em JSON)
    tipos_de_telha()      -> list[str]
"""

import math
from dataclasses import dataclass, field, asdict

# ---------------------------------------------------------------------------
# Tabelas de referência
# ---------------------------------------------------------------------------

TELHAS: dict = {
    "Cerâmico":        {"carga_kn_m2": 0.60, "inclinacao": 0.35, "esp_terca_m": 0.30, "parafusos_m2": 10},
    "Concreto":        {"carga_kn_m2": 0.51, "inclinacao": 0.35, "esp_terca_m": 0.30, "parafusos_m2": 10},
    "Fibrocimento":    {"carga_kn_m2": 0.24, "inclinacao": 0.27, "esp_terca_m": 1.76, "parafusos_m2":  8},
    "Aço galvanizado": {"carga_kn_m2": 0.14, "inclinacao": 0.07, "esp_terca_m": 1.50, "parafusos_m2":  5},
    "Termoacustico":   {"carga_kn_m2": 0.13, "inclinacao": 0.07, "esp_terca_m": 1.50, "parafusos_m2":  5},
    "Shingle":         {"carga_kn_m2": 0.64, "inclinacao": 0.17, "esp_terca_m": 0.30, "parafusos_m2": 12},
}

# Telhas que exigem vão = 1,0 m; demais usam 1,5 m
_TELHAS_VAO_1M = {"Cerâmico", "Concreto"}

# Perfis em ordem crescente de inércia (mm⁴)
PERFIS: list = [
    ("Ripa 0,65",           13_487.4),
    ("Ripa 0,80",           16_283.2),
    ("Caibro Aberto 0,80",  21_938.9),
    ("Caibro Aberto 0,95",  26_616.0),
    ("Caibro Fechado 0,65", 99_473.056_366_666_53),
    ("Caibro Fechado 0,80", 121_517.903_866_666_37),
    ("Caibro Fechado 0,95", 143_228.383_366_666_88),
    ("Terça 0,80",          684_498.295_908_334_3),
    ("Terça 0,95",          762_821.318_075_001_2),
    ("Terça 1,25",          995_047.109_375),
    ("Viga 1,25",         3_548_025.182_291_666_5),
    ("Viga 1,50",         4_237_363.75),
]

E_ACO_KN_M2 = 206_000_000.0


# ---------------------------------------------------------------------------
# Automações: regras que eliminam inputs técnicos do usuário
# ---------------------------------------------------------------------------

def _vao_automatico(tipo_telha: str) -> float:
    """Vão máximo entre apoios definido automaticamente pelo tipo de telha."""
    return 1.0 if tipo_telha in _TELHAS_VAO_1M else 1.5


def _pontaletes_automatico(b: float, vao_maximo: float) -> int:
    """
    Quantidade de pontaletes por linha.

    Fórmula validada contra a planilha:
        pont = ceil(b / (vao_maximo * 1,5))

    Exemplos conferidos:
        b=5,  vao=1,0 -> ceil(5 / 1,5)  = ceil(3,33) = 4  (template planilha)
        b=9,  vao=1,5 -> ceil(9 / 2,25) = ceil(4,00) = 4  (caso real validado)
    """
    return max(1, math.ceil(b / (vao_maximo * 1.5)))


# Altura padrão dos pontaletes — campo era input manual na planilha.
# Calculada como: inclinação × (b/2), mínimo 0,3 m
_ALTURA_PONTALETES_PADRAO = 1.0

def _altura_pontaletes_automatica(b: float, inclinacao: float) -> float:
    return max(0.3, inclinacao * (b / 2))


# ---------------------------------------------------------------------------
# Funções auxiliares internas
# ---------------------------------------------------------------------------

def _inertia_minima_mm4(carga_kn_m: float, vao_m: float) -> float:
    """Inércia mínima (mm⁴) — viga biapoiada, critério deflexão L/120."""
    delta_max = vao_m / 120.0
    return ((5.0 * carga_kn_m * (vao_m ** 4)) / (384.0 * E_ACO_KN_M2 * delta_max)) * 1e12


def _menor_perfil(inertia_mm4: float, a_partir_de: int = 0) -> str:
    for nome, inercia in PERFIS[a_partir_de:]:
        if inercia > inertia_mm4:
            return nome
    return "Não atendido"


def _ceiling(valor: float, multiplo: float) -> float:
    if multiplo == 0:
        return 0.0
    return math.ceil(valor / multiplo) * multiplo


def _contem(substring: str, texto: str) -> bool:
    return substring.lower() in texto.lower()


def _calcular_perfil_terca(
    tipo_telha: str, carga_telha: float, esp_terca: float,
    vao_maximo: float, alertas: list
) -> str:
    """Seleciona o perfil da terça por inércia, aplicando regras de negócio."""
    carga_terca = carga_telha * esp_terca
    inertia = _inertia_minima_mm4(carga_terca, vao_maximo)
    perfil_raw = _menor_perfil(inertia)

    # Cerâmica com vão != 1 m (não deve ocorrer com automação, mas mantém como guarda)
    if tipo_telha == "Cerâmico" and vao_maximo != 1.0:
        alertas.append("Para telha cerâmica o vão máximo deve ser 1 m.")
        return "Vão máximo entre apoios deve ser 1 m"

    # Cerâmica/Concreto com vão > 1,2 m → upgrade mínimo
    if tipo_telha in ("Cerâmico", "Concreto") and vao_maximo > 1.2:
        alertas.append("Vão > 1,2 m com cerâmica/concreto: perfil elevado para Caibro Aberto 0,80.")
        return "Caibro Aberto 0,80" if perfil_raw in ("Ripa 0,65", "Ripa 0,80") else perfil_raw

    # Outros tipos com vão > 1 m → upgrade mínimo
    if vao_maximo > 1.0 and tipo_telha not in ("Cerâmico", "Concreto"):
        return "Caibro Aberto 0,80" if perfil_raw in ("Ripa 0,65", "Ripa 0,80") else perfil_raw

    # Cerâmica com vão = 1 m deve usar apenas Ripa 0,65
    if tipo_telha == "Cerâmico" and perfil_raw != "Ripa 0,65":
        alertas.append("Perfil da terça não atende para telha cerâmica (deve ser Ripa 0,65).")
        return "Não atendido"

    return perfil_raw


def _calcular_perfil_viga_sem_laje(
    a: float, carga_telha: float, vao_maximo: float
) -> str:
    """
    Calcula o perfil da viga para o cenário SEM LAJE.
    Vão livre da viga = vao_maximo (espaçamento entre vigas).
    Carga linear = carga_telha × vao_maximo.
    """
    carga_viga = carga_telha * vao_maximo
    inertia = _inertia_minima_mm4(carga_viga, vao_maximo)
    return _menor_perfil(inertia)


# ---------------------------------------------------------------------------
# Estruturas de retorno
# ---------------------------------------------------------------------------

@dataclass
class ResultadoSemLaje:
    # Inputs do usuário
    a: float
    b: float
    tipo_telha: str
    tem_placa: bool

    # Derivados automáticos (não requerem input do usuário)
    vao_maximo: float
    inclinacao: float
    angulo_rad: float
    carga_telha_kn_m2: float
    esp_terca_m: float

    # Perfis calculados
    perfil_viga: str
    perfil_terca: str

    # Quantitativos — Viga
    qtd_vigas: int
    comp_viga_m: float
    total_viga_m: float

    # Quantitativos — Terça
    qtd_tercas: int
    comp_terca_m: float
    total_terca_m: float

    # Fixadores e conexões
    parafusos_48: int
    parafusos_42: int
    conexoes_p: int
    conexoes_m: int
    conexoes_g: int

    alertas: list = field(default_factory=list)


@dataclass
class ResultadoComLaje:
    # Inputs do usuário
    a: float
    b: float
    tipo_telha: str
    tem_placa: bool

    # Derivados automáticos
    vao_maximo: float
    pontaletes_por_linha: int
    altura_pontaletes_m: float
    inclinacao: float
    angulo_rad: float
    carga_telha_kn_m2: float
    esp_terca_m: float

    # Perfis calculados
    perfil_viga: str
    perfil_terca: str

    # Quantitativos — Viga
    qtd_vigas: int
    comp_viga_m: float
    total_viga_m: float

    # Quantitativos — Terça
    qtd_tercas: int
    comp_terca_m: float
    total_terca_m: float

    # Pontaletes
    perfil_pontalete: str
    total_pontalete_m: float

    # Contraventamento
    total_contraventamento_m: float

    # Fixadores e conexões
    parafusos_48: int
    parafusos_42: int
    conexoes_p: int

    alertas: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# API pública
# ---------------------------------------------------------------------------

def calcular_sem_laje(
    a: float,
    b: float,
    tipo_telha: str,
    tem_placa: bool,
) -> ResultadoSemLaje:
    """
    Calcula o quantitativo SEM LAJE a partir apenas das dimensões e tipo de telha.

    Parâmetros
    ----------
    a          : largura total do telhado (m) — eixo das vigas
    b          : profundidade do caimento (m) — eixo das terças
    tipo_telha : um de tipos_de_telha()
    tem_placa  : True se há placa fotovoltaica (+0,25 kN/m²)
    """
    if tipo_telha not in TELHAS:
        raise ValueError(f"tipo_telha inválido: '{tipo_telha}'. Opções: {list(TELHAS)}")

    alertas: list = []
    telha = TELHAS[tipo_telha]

    inclinacao  = telha["inclinacao"]
    angulo_rad  = math.atan(inclinacao)
    carga_telha = telha["carga_kn_m2"] + (0.25 if tem_placa else 0.0)
    esp_terca   = telha["esp_terca_m"]

    # Automação: vão máximo fixo por tipo de telha
    vao_maximo = _vao_automatico(tipo_telha)

    # Automação: perfil da viga calculado (não mais escolhido pelo usuário)
    perfil_viga  = _calcular_perfil_viga_sem_laje(a, carga_telha, vao_maximo)
    perfil_terca = _calcular_perfil_terca(tipo_telha, carga_telha, esp_terca, vao_maximo, alertas)

    qtd_vigas  = int(_ceiling(a / vao_maximo, 1) + 1)
    comp_viga  = _ceiling((b / abs(math.cos(angulo_rad))) + 0.15, 0.05)
    total_viga = qtd_vigas * comp_viga

    qtd_tercas  = int(_ceiling(b / esp_terca, 1) + 1)
    comp_terca  = a
    total_terca = qtd_tercas * comp_terca

    parafusos_48 = int(round(telha["parafusos_m2"] * a * b))
    parafusos_42 = (qtd_tercas * 2 + 2) if tipo_telha in ("Cerâmico", "Concreto") else 0

    conexoes_p = conexoes_m = conexoes_g = 0
    for perfil, mult in [(perfil_viga, qtd_vigas * 2), (perfil_terca, qtd_tercas * qtd_vigas)]:
        if _contem("Caibro", perfil):
            conexoes_p += mult
        elif _contem("Terça", perfil):
            conexoes_m += mult
        elif _contem("Viga", perfil):
            conexoes_g += mult

    return ResultadoSemLaje(
        a=a, b=b, tipo_telha=tipo_telha, tem_placa=tem_placa,
        vao_maximo=vao_maximo,
        inclinacao=inclinacao, angulo_rad=angulo_rad,
        carga_telha_kn_m2=carga_telha, esp_terca_m=esp_terca,
        perfil_viga=perfil_viga, perfil_terca=perfil_terca,
        qtd_vigas=qtd_vigas, comp_viga_m=comp_viga, total_viga_m=total_viga,
        qtd_tercas=qtd_tercas, comp_terca_m=comp_terca, total_terca_m=total_terca,
        parafusos_48=parafusos_48, parafusos_42=parafusos_42,
        conexoes_p=conexoes_p, conexoes_m=conexoes_m, conexoes_g=conexoes_g,
        alertas=alertas,
    )


def calcular_com_laje(
    a: float,
    b: float,
    tipo_telha: str,
    tem_placa: bool,
) -> ResultadoComLaje:
    """
    Calcula o quantitativo COM LAJE a partir apenas das dimensões e tipo de telha.

    Parâmetros
    ----------
    a          : largura total do telhado (m)
    b          : comprimento total do telhado (m)
    tipo_telha : um de tipos_de_telha()
    tem_placa  : True se há placa fotovoltaica (+0,25 kN/m²)
    """
    if tipo_telha not in TELHAS:
        raise ValueError(f"tipo_telha inválido: '{tipo_telha}'. Opções: {list(TELHAS)}")

    alertas: list = []
    telha = TELHAS[tipo_telha]

    inclinacao  = telha["inclinacao"]
    angulo_rad  = math.atan(inclinacao)
    carga_telha = telha["carga_kn_m2"] + (0.25 if tem_placa else 0.0)
    esp_terca   = telha["esp_terca_m"]

    # Automação: vão e pontaletes calculados
    vao_maximo           = _vao_automatico(tipo_telha)
    pontaletes_por_linha = _pontaletes_automatico(b, vao_maximo)
    altura_pontaletes_m  = _altura_pontaletes_automatica(b, inclinacao)

    vao_viga     = b / (pontaletes_por_linha + 1)
    carga_viga   = carga_telha * vao_maximo
    inertia_viga = _inertia_minima_mm4(carga_viga, vao_viga)
    perfil_viga  = _menor_perfil(inertia_viga, a_partir_de=2)  # mínimo Caibro Aberto 0,80

    qtd_vigas  = int(_ceiling(a / vao_maximo, 1) + 1)
    comp_viga  = _ceiling((b / abs(math.cos(angulo_rad))) + 0.15, 0.05)
    total_viga = qtd_vigas * comp_viga

    perfil_terca = _calcular_perfil_terca(tipo_telha, carga_telha, esp_terca, vao_maximo, alertas)

    if esp_terca > 1.2:
        alertas.append("Recomenda-se não passar de 1,2 m o vão da ripa.")

    qtd_tercas  = int(_ceiling(b / esp_terca, 1) + 1)
    comp_terca  = a
    total_terca = qtd_tercas * comp_terca

    total_pontalete = altura_pontaletes_m * pontaletes_por_linha * qtd_vigas

    diag_long = (
        math.sqrt((b / (pontaletes_por_linha + 1)) ** 2 + altura_pontaletes_m ** 2)
        * 2 * qtd_vigas * (pontaletes_por_linha - 1)
    )
    diag_trans = (
        math.sqrt(altura_pontaletes_m ** 2 + vao_maximo ** 2)
        * (qtd_vigas - 1) * pontaletes_por_linha
    )
    total_contraventamento = diag_long + diag_trans

    parafusos_48 = int(round(
        telha["parafusos_m2"] * a * b + pontaletes_por_linha * qtd_vigas * 4
    ))
    parafusos_42 = (qtd_tercas * 2 + 2) if tipo_telha in ("Cerâmico", "Concreto") else 0

    conexoes_p = 0
    if _contem("Caibro", perfil_viga):
        conexoes_p += qtd_vigas * 2
    if _contem("Caibro", perfil_terca):
        conexoes_p += qtd_tercas * qtd_vigas
    conexoes_p += pontaletes_por_linha * qtd_vigas * 2

    return ResultadoComLaje(
        a=a, b=b, tipo_telha=tipo_telha, tem_placa=tem_placa,
        vao_maximo=vao_maximo,
        pontaletes_por_linha=pontaletes_por_linha,
        altura_pontaletes_m=altura_pontaletes_m,
        inclinacao=inclinacao, angulo_rad=angulo_rad,
        carga_telha_kn_m2=carga_telha, esp_terca_m=esp_terca,
        perfil_viga=perfil_viga, perfil_terca=perfil_terca,
        qtd_vigas=qtd_vigas, comp_viga_m=comp_viga, total_viga_m=total_viga,
        qtd_tercas=qtd_tercas, comp_terca_m=comp_terca, total_terca_m=total_terca,
        perfil_pontalete=perfil_viga,
        total_pontalete_m=total_pontalete,
        total_contraventamento_m=total_contraventamento,
        parafusos_48=parafusos_48, parafusos_42=parafusos_42,
        conexoes_p=conexoes_p,
        alertas=alertas,
    )


# ---------------------------------------------------------------------------
# Utilitários
# ---------------------------------------------------------------------------

def para_dict(resultado) -> dict:
    """Converte resultado em dict serializável (JSON)."""
    return asdict(resultado)


def tipos_de_telha() -> list:
    return list(TELHAS.keys())


# ---------------------------------------------------------------------------
# Smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== SEM LAJE (a=15, b=2.6, Cerâmico, com placa) ===")
    r1 = calcular_sem_laje(a=15, b=2.6, tipo_telha="Cerâmico", tem_placa=True)
    print(f"  Vão automático   : {r1.vao_maximo} m")
    print(f"  Perfil viga      : {r1.perfil_viga}  (calculado)")
    print(f"  Perfil terça     : {r1.perfil_terca}")
    print(f"  Vigas            : {r1.qtd_vigas} × {r1.comp_viga_m:.2f} m = {r1.total_viga_m:.2f} m")
    print(f"  Terças           : {r1.qtd_tercas} × {r1.comp_terca_m:.0f} m = {r1.total_terca_m:.0f} m")
    print(f"  Parafusos 4,8    : {r1.parafusos_48}  | 4,2: {r1.parafusos_42}")
    print(f"  Conexões P/M/G   : {r1.conexoes_p}/{r1.conexoes_m}/{r1.conexoes_g}")
    if r1.alertas:
        print(f"  Alertas          : {r1.alertas}")

    print()
    print("=== COM LAJE (a=17, b=5, Cerâmico, sem placa) ===")
    r2 = calcular_com_laje(a=17, b=5, tipo_telha="Cerâmico", tem_placa=False)
    print(f"  Vão automático   : {r2.vao_maximo} m")
    print(f"  Pontaletes/linha : {r2.pontaletes_por_linha}  (auto: ceil(5/1.5)={math.ceil(5/1.5)})")
    print(f"  Altura pont.     : {r2.altura_pontaletes_m} m  (auto: inclinação × b/2)")
    print(f"  Perfil viga      : {r2.perfil_viga}")
    print(f"  Perfil terça     : {r2.perfil_terca}")
    print(f"  Vigas            : {r2.qtd_vigas} × {r2.comp_viga_m:.2f} m = {r2.total_viga_m:.2f} m")
    print(f"  Terças           : {r2.qtd_tercas} × {r2.comp_terca_m:.0f} m = {r2.total_terca_m:.0f} m")
    print(f"  Pontaletes total : {r2.total_pontalete_m:.2f} m")
    print(f"  Contraventamento : {r2.total_contraventamento_m:.2f} m")
    print(f"  Parafusos 4,8    : {r2.parafusos_48}  | 4,2: {r2.parafusos_42}")
    print(f"  Conexões P       : {r2.conexoes_p}")

    print()
    print("=== SEM LAJE (a=20, b=8, Fibrocimento, sem placa) ===")
    r3 = calcular_sem_laje(a=20, b=8, tipo_telha="Fibrocimento", tem_placa=False)
    print(f"  Vão automático   : {r3.vao_maximo} m  (não-cerâmico → 1,5 m)")
    print(f"  Perfil viga      : {r3.perfil_viga}  (calculado)")
    print(f"  Perfil terça     : {r3.perfil_terca}")