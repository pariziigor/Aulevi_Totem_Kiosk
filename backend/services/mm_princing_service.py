"""
Serviço de quantificação de madeiramento para telhados 1/2 águas.
Baseado na planilha AULEVI - MADEIRAMENTO - QUANTIFICADOR 1-2 ÁGUAS.

Lógica extraída integralmente das fórmulas da planilha:

  SEM LAJE
  --------
  - VIGA  : perfil informado pelo usuário (não calculado automaticamente)
  - TERÇA : calculada por critério de deflexão L/120

  COM LAJE
  --------
  - VIGA  : calculada por critério de deflexão L/120
            com vão = b / (pontaletes_por_linha + 1)
  - TERÇA : calculada por critério de deflexão L/120

Uso rápido
----------
    from madeiramento_service import calcular_sem_laje, calcular_com_laje
"""

import math
from dataclasses import dataclass, field, asdict

# ---------------------------------------------------------------------------
# Tabelas de referência (transcrição das abas *_PROCV)
# ---------------------------------------------------------------------------

TELHAS: dict = {
    "Cerâmico":        {"carga_kn_m2": 0.60, "inclinacao": 0.35, "esp_terca_m": 0.30, "parafusos_m2": 10},
    "Concreto":        {"carga_kn_m2": 0.51, "inclinacao": 0.35, "esp_terca_m": 0.30, "parafusos_m2": 10},
    "Fibrocimento":    {"carga_kn_m2": 0.24, "inclinacao": 0.27, "esp_terca_m": 1.76, "parafusos_m2":  8},
    "Aço galvanizado": {"carga_kn_m2": 0.14, "inclinacao": 0.07, "esp_terca_m": 1.50, "parafusos_m2":  5},
    "Termoacustico":   {"carga_kn_m2": 0.13, "inclinacao": 0.07, "esp_terca_m": 1.50, "parafusos_m2":  5},
    "Shingle":         {"carga_kn_m2": 0.64, "inclinacao": 0.17, "esp_terca_m": 0.30, "parafusos_m2": 12},
}

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

PERFIS_NOMES: list = [p[0] for p in PERFIS]

# Módulo de elasticidade do aço (kN/m²)
E_ACO_KN_M2 = 206_000_000.0


# ---------------------------------------------------------------------------
# Funções auxiliares
# ---------------------------------------------------------------------------

def _inertia_minima_mm4(carga_kn_m: float, vao_m: float) -> float:
    """
    Inércia mínima (mm⁴) — viga biapoiada, carga distribuída, critério L/120.
    I = (5 · q · L⁴) / (384 · E · δ_max) × 10¹²
    """
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


# ---------------------------------------------------------------------------
# Lógica de seleção de perfil da terça (igual nos dois cenários)
# ---------------------------------------------------------------------------

def _calcular_perfil_terca(
    tipo_telha: str,
    carga_telha: float,
    esp_terca: float,
    vao_maximo: float,
    alertas: list,
) -> str:
    carga_terca = carga_telha * esp_terca
    inertia = _inertia_minima_mm4(carga_terca, vao_maximo)
    perfil_raw = _menor_perfil(inertia)

    if tipo_telha == "Cerâmico" and vao_maximo != 1.0:
        alertas.append("Para telha cerâmica o vão máximo entre apoios deve ser exatamente 1 m.")
        return "Vão máximo entre apoios deve ser 1 m"

    if tipo_telha in ("Cerâmico", "Concreto") and vao_maximo > 1.2:
        alertas.append("Vão > 1,2 m com cerâmica/concreto: perfil elevado para Caibro Aberto 0,80.")
        if perfil_raw in ("Ripa 0,65", "Ripa 0,80"):
            return "Caibro Aberto 0,80"
        return perfil_raw

    if vao_maximo > 1.0 and tipo_telha not in ("Cerâmico", "Concreto"):
        if perfil_raw in ("Ripa 0,65", "Ripa 0,80"):
            return "Caibro Aberto 0,80"
        return perfil_raw

    if tipo_telha == "Cerâmico" and perfil_raw != "Ripa 0,65":
        alertas.append("Perfil calculado para a terça não atende para telha cerâmica (deve ser Ripa 0,65).")
        return "Não atendido"

    return perfil_raw


# ---------------------------------------------------------------------------
# Estruturas de retorno
# ---------------------------------------------------------------------------

@dataclass
class ResultadoSemLaje:
    a: float
    b: float
    tipo_telha: str
    tem_placa: bool
    vao_maximo: float
    perfil_viga: str

    inclinacao: float
    angulo_rad: float
    carga_telha_kn_m2: float
    esp_terca_m: float

    perfil_terca: str

    qtd_vigas: int
    comp_viga_m: float
    total_viga_m: float

    qtd_tercas: int
    comp_terca_m: float
    total_terca_m: float

    parafusos_48: int
    parafusos_42: int
    conexoes_p: int
    conexoes_m: int
    conexoes_g: int

    alertas: list = field(default_factory=list)


@dataclass
class ResultadoComLaje:
    a: float
    b: float
    tipo_telha: str
    tem_placa: bool
    vao_maximo: float
    pontaletes_por_linha: int
    altura_pontaletes_m: float

    inclinacao: float
    angulo_rad: float
    carga_telha_kn_m2: float
    esp_terca_m: float

    perfil_viga: str
    perfil_terca: str

    qtd_vigas: int
    comp_viga_m: float
    total_viga_m: float

    qtd_tercas: int
    comp_terca_m: float
    total_terca_m: float

    perfil_pontalete: str
    total_pontalete_m: float

    total_contraventamento_m: float

    parafusos_48: int
    parafusos_42: int
    conexoes_p: int

    alertas: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# Cálculo SEM LAJE
# ---------------------------------------------------------------------------

def calcular_sem_laje(
    a: float,
    b: float,
    tipo_telha: str,
    tem_placa: bool,
    vao_maximo: float,
    perfil_viga: str,
) -> ResultadoSemLaje:
    """
    a           : largura total do telhado (m) — eixo das vigas
    b           : profundidade do caimento (m) — eixo das terças
    tipo_telha  : chave de TELHAS
    tem_placa   : +0,25 kN/m² se True
    vao_maximo  : vão máximo entre apoios (m)
    perfil_viga : escolhido pelo usuário (não calculado)
    """
    if tipo_telha not in TELHAS:
        raise ValueError(f"tipo_telha inválido: '{tipo_telha}'. Opções: {list(TELHAS)}")
    if perfil_viga not in PERFIS_NOMES:
        raise ValueError(f"perfil_viga inválido: '{perfil_viga}'. Opções: {PERFIS_NOMES}")

    alertas: list = []
    telha = TELHAS[tipo_telha]

    inclinacao  = telha["inclinacao"]
    angulo_rad  = math.atan(inclinacao)
    carga_telha = telha["carga_kn_m2"] + (0.25 if tem_placa else 0.0)
    esp_terca   = telha["esp_terca_m"]

    perfil_terca = _calcular_perfil_terca(tipo_telha, carga_telha, esp_terca, vao_maximo, alertas)

    # Viga percorre eixo b; 1 viga a cada vao_maximo metros ao longo de a
    qtd_vigas  = int(_ceiling(a / vao_maximo, 1) + 1)
    comp_viga  = _ceiling((b / abs(math.cos(angulo_rad))) + 0.15, 0.05)
    total_viga = qtd_vigas * comp_viga

    # Terça percorre eixo a; 1 terça a cada esp_terca metros ao longo de b
    qtd_tercas  = int(_ceiling(b / esp_terca, 1) + 1)
    comp_terca  = a
    total_terca = qtd_tercas * comp_terca

    parafusos_48 = int(round(telha["parafusos_m2"] * a * b))
    parafusos_42 = (qtd_tercas * 2 + 2) if tipo_telha in ("Cerâmico", "Concreto") else 0

    conexoes_p = conexoes_m = conexoes_g = 0
    for perfil, multiplicador in [(perfil_viga, qtd_vigas * 2), (perfil_terca, qtd_tercas * qtd_vigas)]:
        if _contem("Caibro", perfil):
            conexoes_p += multiplicador
        elif _contem("Terça", perfil):
            conexoes_m += multiplicador
        elif _contem("Viga", perfil):
            conexoes_g += multiplicador

    return ResultadoSemLaje(
        a=a, b=b, tipo_telha=tipo_telha, tem_placa=tem_placa,
        vao_maximo=vao_maximo, perfil_viga=perfil_viga,
        inclinacao=inclinacao, angulo_rad=angulo_rad,
        carga_telha_kn_m2=carga_telha, esp_terca_m=esp_terca,
        perfil_terca=perfil_terca,
        qtd_vigas=qtd_vigas, comp_viga_m=comp_viga, total_viga_m=total_viga,
        qtd_tercas=qtd_tercas, comp_terca_m=comp_terca, total_terca_m=total_terca,
        parafusos_48=parafusos_48, parafusos_42=parafusos_42,
        conexoes_p=conexoes_p, conexoes_m=conexoes_m, conexoes_g=conexoes_g,
        alertas=alertas,
    )


# ---------------------------------------------------------------------------
# Cálculo COM LAJE
# ---------------------------------------------------------------------------

def calcular_com_laje(
    a: float,
    b: float,
    tipo_telha: str,
    tem_placa: bool,
    vao_maximo: float,
    pontaletes_por_linha: int,
    altura_pontaletes_m: float,
) -> ResultadoComLaje:
    """
    a                    : largura total (m)
    b                    : comprimento total (m)
    tipo_telha           : chave de TELHAS
    tem_placa            : +0,25 kN/m² se True
    vao_maximo           : vão máximo entre apoios (m), recomendado 1–2 m
    pontaletes_por_linha : pontaletes intermediários por linha de vigas
    altura_pontaletes_m  : altura média dos pontaletes (m)
    """
    if tipo_telha not in TELHAS:
        raise ValueError(f"tipo_telha inválido: '{tipo_telha}'. Opções: {list(TELHAS)}")

    alertas: list = []
    telha = TELHAS[tipo_telha]

    inclinacao  = telha["inclinacao"]
    angulo_rad  = math.atan(inclinacao)
    carga_telha = telha["carga_kn_m2"] + (0.25 if tem_placa else 0.0)
    esp_terca   = telha["esp_terca_m"]

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
# Serialização para JSON / API REST
# ---------------------------------------------------------------------------

def para_dict(resultado) -> dict:
    return asdict(resultado)


def tipos_de_telha() -> list:
    return list(TELHAS.keys())


def perfis_disponiveis() -> list:
    return PERFIS_NOMES


# ---------------------------------------------------------------------------
# Smoke test com os valores do template da planilha
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== SEM LAJE (a=15, b=2.6, Cerâmico, com placa, vão=1, viga=Terça 0,95) ===")
    r1 = calcular_sem_laje(a=15, b=2.6, tipo_telha="Cerâmico", tem_placa=True,
                           vao_maximo=1, perfil_viga="Terça 0,95")
    print(f"  Perfil viga      : {r1.perfil_viga}")
    print(f"  Perfil terça     : {r1.perfil_terca}")
    print(f"  Vigas            : {r1.qtd_vigas} × {r1.comp_viga_m:.2f} m = {r1.total_viga_m:.2f} m")
    print(f"  Terças           : {r1.qtd_tercas} × {r1.comp_terca_m:.0f} m = {r1.total_terca_m:.0f} m")
    print(f"  Parafusos 4,8    : {r1.parafusos_48}  | 4,2: {r1.parafusos_42}")
    print(f"  Conexões P/M/G   : {r1.conexoes_p} / {r1.conexoes_m} / {r1.conexoes_g}")
    print(f"  Esperado         : vigas=16×2.95m=47.2m | terças=10×15m=150m | 4,8=390 | M=32")

    print()
    print("=== COM LAJE (a=17, b=5, Cerâmico, sem placa, vão=1, pont=4, h=1) ===")
    r2 = calcular_com_laje(a=17, b=5, tipo_telha="Cerâmico", tem_placa=False,
                           vao_maximo=1, pontaletes_por_linha=4, altura_pontaletes_m=1)
    print(f"  Perfil viga      : {r2.perfil_viga}")
    print(f"  Perfil terça     : {r2.perfil_terca}")
    print(f"  Vigas            : {r2.qtd_vigas} × {r2.comp_viga_m:.2f} m = {r2.total_viga_m:.2f} m")
    print(f"  Terças           : {r2.qtd_tercas} × {r2.comp_terca_m:.0f} m = {r2.total_terca_m:.0f} m")
    print(f"  Pontaletes       : {r2.perfil_pontalete} | {r2.total_pontalete_m:.0f} m")
    print(f"  Contraventamento : {r2.total_contraventamento_m:.2f} m")
    print(f"  Parafusos 4,8    : {r2.parafusos_48}  | 4,2: {r2.parafusos_42}")
    print(f"  Conexões P       : {r2.conexoes_p}")
    print(f"  Esperado         : vigas=18×5.45m=98.1m | terças=18×17m=306m | pont=72m | contra=248.9m | 4,8=1138 | 4,2=38 | P=180")