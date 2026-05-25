"""
Serviço de quantificação e precificação de madeiramento — telhados 1/2 águas.
Baseado na planilha AULEVI - MADEIRAMENTO - QUANTIFICADOR 1-2 ÁGUAS.

Regras automáticas (sem entrada do usuário):
  - Vão máximo      : Cerâmico/Concreto → 1,0 m | demais → 1,5 m
  - Perfil viga     : calculado por critério de deflexão L/120
  - Pontaletes      : ceil(b / (vao_maximo × 1,5))
  - Altura pont.    : 1,0 m fixo (padrão de projeto)

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
# Tabela de preços (R$ por metro linear ou por unidade)
# ---------------------------------------------------------------------------

PRECOS: dict = {
    # Perfis — R$/m
    "Ripa 0,65":           6.45,
    "Ripa 0,80":           6.45,
    "Caibro Aberto 0,80":  10.80,
    "Caibro Aberto 0,95":  10.80,   # mesmo produto, espessura diferente → usa Caibro Aberto
    "Caibro Fechado 0,65": 13.00,
    "Caibro Fechado 0,80": 15.00,
    "Caibro Fechado 0,95": 15.00,   # próximo disponível na tabela
    "Terça 0,80":          33.50,   # usa preço da Terça 0,95 (menor disponível na tabela)
    "Terça 0,95":          33.50,
    "Terça 1,25":          42.90,
    "Viga 1,25":           63.90,
    "Viga 1,50":           74.90,
    # Contraventamento — R$/m
    "Contraventamento":     2.50,
    # Conexões — R$/un
    "Conexao P":            1.25,   # Conexão U 40×80 (P)
    "Conexao M":            2.50,   # Conexão U 70×126 (M)
    "Conexao G":            5.90,   # Conexão U 89×197 (G)
    "Conexao H":            3.90,   # Conexão H 40×80 (P)  — pontaletes
    "Conexao Z":            4.10,   # Conexão Z 72×0×900   — contraventamento
    # Fixadores — R$/un
    "Parafuso 4.8":         0.25,
    "Parafuso 4.2":         0.20,
    "Parabolt 5/16":        2.20,
    "Parabolt 1/2":         4.30,
}

# ---------------------------------------------------------------------------
# Tabelas de referência estrutural
# ---------------------------------------------------------------------------

TELHAS: dict = {
    "Cerâmico":        {"carga_kn_m2": 0.60, "inclinacao": 0.35, "esp_terca_m": 0.30, "parafusos_m2": 10},
    "Concreto":        {"carga_kn_m2": 0.51, "inclinacao": 0.35, "esp_terca_m": 0.30, "parafusos_m2": 10},
    "Fibrocimento":    {"carga_kn_m2": 0.24, "inclinacao": 0.27, "esp_terca_m": 1.76, "parafusos_m2":  8},
    "Aço galvanizado": {"carga_kn_m2": 0.14, "inclinacao": 0.07, "esp_terca_m": 1.50, "parafusos_m2":  5},
    "Termoacustico":   {"carga_kn_m2": 0.13, "inclinacao": 0.07, "esp_terca_m": 1.50, "parafusos_m2":  5},
    "Shingle":         {"carga_kn_m2": 0.64, "inclinacao": 0.17, "esp_terca_m": 0.30, "parafusos_m2": 12},
}

_TELHAS_VAO_1M = {"Cerâmico", "Concreto"}

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

E_ACO_KN_M2     = 206_000_000.0
_ALTURA_PONT    = 1.0   # altura padrão dos pontaletes (m)


# ---------------------------------------------------------------------------
# Automações
# ---------------------------------------------------------------------------

def _vao_automatico(tipo_telha: str) -> float:
    return 1.0 if tipo_telha in _TELHAS_VAO_1M else 1.5


def _pontaletes_automatico(b: float, vao_maximo: float) -> int:
    """
    pont = ceil(b / (vao_maximo × 1,5))
    Validado: b=5/vao=1 → 4 | b=9/vao=1.5 → 4
    """
    return max(1, math.ceil(b / (vao_maximo * 1.5)))


# ---------------------------------------------------------------------------
# Funções auxiliares
# ---------------------------------------------------------------------------

def _inertia_minima_mm4(carga_kn_m: float, vao_m: float) -> float:
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


def _preco_perfil(perfil: str) -> float:
    """Retorna o preço por metro do perfil. Fallback para 0 se não mapeado."""
    return PRECOS.get(perfil, 0.0)


def _arredondar_parafusos(qtd: int) -> int:
    """Arredonda quantidade de parafusos para múltiplos de 500 (caixa padrão)."""
    if qtd == 0:
        return 0
    return max(500, math.ceil(qtd / 500) * 500)


def _barras_6m(metros: float) -> int:
    """Calcula quantidade de barras de 6m necessárias (arredonda para cima)."""
    if metros <= 0:
        return 0
    return math.ceil(metros / 6.0)


def _barras_3m(metros: float) -> int:
    """Calcula quantidade de barras de 3m necessárias (arredonda para cima)."""
    if metros <= 0:
        return 0
    return math.ceil(metros / 3.0)


def _calcular_perfil_terca(
    tipo_telha: str, carga_telha: float, esp_terca: float,
    vao_maximo: float, alertas: list
) -> str:
    carga_terca = carga_telha * esp_terca
    inertia     = _inertia_minima_mm4(carga_terca, vao_maximo)
    perfil_raw  = _menor_perfil(inertia)

    if tipo_telha == "Cerâmico" and vao_maximo != 1.0:
        alertas.append("Para telha cerâmica o vão máximo deve ser 1 m.")
        return "Vão máximo entre apoios deve ser 1 m"

    if tipo_telha in ("Cerâmico", "Concreto") and vao_maximo > 1.2:
        alertas.append("Vão > 1,2 m com cerâmica/concreto: perfil elevado para Caibro Aberto 0,80.")
        return "Caibro Aberto 0,80" if perfil_raw in ("Ripa 0,65", "Ripa 0,80") else perfil_raw

    if vao_maximo > 1.0 and tipo_telha not in ("Cerâmico", "Concreto"):
        return "Caibro Aberto 0,80" if perfil_raw in ("Ripa 0,65", "Ripa 0,80") else perfil_raw

    if tipo_telha == "Cerâmico" and perfil_raw != "Ripa 0,65":
        alertas.append("Perfil da terça não atende para telha cerâmica (deve ser Ripa 0,65).")
        return "Não atendido"

    return perfil_raw


def _calcular_perfil_viga_sem_laje(a: float, carga_telha: float, vao_maximo: float) -> str:
    carga_viga = carga_telha * vao_maximo
    inertia    = _inertia_minima_mm4(carga_viga, a)
    return _menor_perfil(inertia)


# ---------------------------------------------------------------------------
# Estrutura de um item de orçamento
# ---------------------------------------------------------------------------

@dataclass
class ItemOrcamento:
    codigo:    str
    descricao: str
    un:        str
    qtd:       float
    preco_un:  float
    total:     float


# ---------------------------------------------------------------------------
# Estruturas de retorno
# ---------------------------------------------------------------------------

@dataclass
class ResultadoSemLaje:
    # Inputs
    a: float
    b: float
    tipo_telha: str
    tem_placa: bool

    # Automáticos
    vao_maximo:        float
    inclinacao:        float
    angulo_rad:        float
    carga_telha_kn_m2: float
    esp_terca_m:       float

    # Perfis
    perfil_viga:  str
    perfil_terca: str

    # Quantitativos
    qtd_vigas:     int
    comp_viga_m:   float
    total_viga_m:  float
    qtd_tercas:    int
    comp_terca_m:  float
    total_terca_m: float

    # Fixadores e conexões
    parafusos_48: int
    parafusos_42: int
    conexoes_p:   int
    conexoes_m:   int
    conexoes_g:   int

    # Orçamento
    itens:        list   # list[ItemOrcamento]
    total_value:  float
    value_per_m2: float

    alertas: list = field(default_factory=list)


@dataclass
class ResultadoComLaje:
    # Inputs
    a: float
    b: float
    tipo_telha: str
    tem_placa: bool

    # Automáticos
    vao_maximo:           float
    pontaletes_por_linha: int
    altura_pontaletes_m:  float
    inclinacao:           float
    angulo_rad:           float
    carga_telha_kn_m2:    float
    esp_terca_m:          float

    # Perfis
    perfil_viga:     str
    perfil_terca:    str
    perfil_pontalete: str

    # Quantitativos
    qtd_vigas:               int
    comp_viga_m:             float
    total_viga_m:            float
    qtd_tercas:              int
    comp_terca_m:            float
    total_terca_m:           float
    total_pontalete_m:       float
    total_contraventamento_m: float

    # Fixadores e conexões
    parafusos_48: int
    parafusos_42: int
    conexoes_p:   int

    # Orçamento
    itens:        list   # list[ItemOrcamento]
    total_value:  float
    value_per_m2: float

    alertas: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# Montagem do orçamento
# ---------------------------------------------------------------------------

def _montar_itens_sem_laje(r: dict) -> tuple[list, float]:
    """
    Recebe um dict com todos os campos calculados e retorna
    (lista de ItemOrcamento, total_value).
    Converte perfis de metros para barras de 6m.
    Arredonda parafusos para múltiplos de 500.
    """
    itens = []

    def add(codigo, descricao, un, qtd, chave_preco, eh_caixa_parafuso=False):
        preco = PRECOS.get(chave_preco, 0.0)
        # Para caixas de parafuso, o preço é unitário × 500
        if eh_caixa_parafuso:
            preco = preco * 500
        total = round(qtd * preco, 2)
        itens.append(ItemOrcamento(
            codigo=codigo, descricao=descricao, un=un,
            qtd=round(qtd, 2), preco_un=preco, total=total
        ))

    # Vigas (em barras de 6m)
    barras_viga = _barras_6m(r['total_viga_m'])
    add("VIGA", f"Viga principal — {r['perfil_viga']} (barras de 6m)",
        "barras", barras_viga, r['perfil_viga'])

    # Terças (em barras de 6m)
    barras_terca = _barras_6m(r['total_terca_m'])
    add("TERCA", f"Terça de cobertura — {r['perfil_terca']} (barras de 6m)",
        "barras", barras_terca, r['perfil_terca'])

    # Parafusos 4.8×19 (arredondados para múltiplos de 500)
    par48_arredondado = _arredondar_parafusos(r['parafusos_48'])
    add("PAR48", "Parafuso 4.8×19 (cx 500)", "cx", par48_arredondado / 500, "Parafuso 4.8", eh_caixa_parafuso=True)

    # Parafusos 4.2×13 (apenas cerâmica/concreto, arredondados)
    if r['parafusos_42'] > 0:
        par42_arredondado = _arredondar_parafusos(r['parafusos_42'])
        add("PAR42", "Parafuso 4.2×13 (cx 500)", "cx", par42_arredondado / 500, "Parafuso 4.2", eh_caixa_parafuso=True)

    # Conexões P (Caibro)
    if r['conexoes_p'] > 0:
        add("CONP", "Conexão U 40×80 (P)", "un", r['conexoes_p'], "Conexao P")

    # Conexões M (Terça)
    if r['conexoes_m'] > 0:
        add("CONM", "Conexão U 70×126 (M)", "un", r['conexoes_m'], "Conexao M")

    # Conexões G (Viga)
    if r['conexoes_g'] > 0:
        add("CONG", "Conexão U 89×197 (G)", "un", r['conexoes_g'], "Conexao G")

    total = round(sum(i.total for i in itens), 2)
    return itens, total


def _montar_itens_com_laje(r: dict) -> tuple[list, float]:
    """
    Recebe um dict com todos os campos calculados e retorna
    (lista de ItemOrcamento, total_value).
    Converte perfis de metros para barras de 6m.
    Arredonda parafusos para múltiplos de 500.
    """
    itens = []

    def add(codigo, descricao, un, qtd, chave_preco, eh_caixa_parafuso=False):
        preco = PRECOS.get(chave_preco, 0.0)
        # Para caixas de parafuso, o preço é unitário × 500
        if eh_caixa_parafuso:
            preco = preco * 500
        total = round(qtd * preco, 2)
        itens.append(ItemOrcamento(
            codigo=codigo, descricao=descricao, un=un,
            qtd=round(qtd, 2), preco_un=preco, total=total
        ))

    # Vigas (em barras de 6m)
    barras_viga = _barras_6m(r['total_viga_m'])
    add("VIGA", f"Viga principal — {r['perfil_viga']} (barras de 6m)",
        "barras", barras_viga, r['perfil_viga'])

    # Terças (em barras de 6m)
    barras_terca = _barras_6m(r['total_terca_m'])
    add("TERCA", f"Terça de cobertura — {r['perfil_terca']} (barras de 6m)",
        "barras", barras_terca, r['perfil_terca'])

    # Pontaletes (em barras de 6m)
    barras_pont = _barras_6m(r['total_pontalete_m'])
    add("PONT", f"Pontalete — {r['perfil_viga']} (barras de 6m)",
        "barras", barras_pont, r['perfil_viga'])

    # Contraventamento (em barras de 3m)
    barras_contrav = _barras_3m(r['total_contraventamento_m'])
    add("CONTRAV", "Contraventamento 0,80×1000 ZC100 (barras de 3m)",
        "barras", barras_contrav, "Contraventamento")

    # Parafusos 4.8×19 (arredondados para múltiplos de 500)
    par48_arredondado = _arredondar_parafusos(r['parafusos_48'])
    add("PAR48", "Parafuso 4.8×19 (cx 500)", "cx", par48_arredondado / 500, "Parafuso 4.8", eh_caixa_parafuso=True)

    # Parafusos 4.2×13 (arredondados)
    if r['parafusos_42'] > 0:
        par42_arredondado = _arredondar_parafusos(r['parafusos_42'])
        add("PAR42", "Parafuso 4.2×13 (cx 500)", "cx", par42_arredondado / 500, "Parafuso 4.2", eh_caixa_parafuso=True)

    # Conexões P (vigas + terças + pontaletes)
    if r['conexoes_p'] > 0:
        add("CONP", "Conexão U 40×80 (P)", "un", r['conexoes_p'], "Conexao P")

    # Conexão H para base dos pontaletes sobre a laje
    qtd_h = r['pontaletes_por_linha'] * r['qtd_vigas']
    add("CONH", "Conexão H 40×80 (P) — base pontalete", "un", qtd_h, "Conexao H")

    # Conexão Z para o contraventamento
    # Estimativa: 2 conexões Z por nó de contraventamento
    qtd_z = r['pontaletes_por_linha'] * r['qtd_vigas'] * 2
    add("CONZ", "Conexão Z 72×0×900 — contraventamento", "un", qtd_z, "Conexao Z")

    total = round(sum(i.total for i in itens), 2)
    return itens, total


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
    Quantitativo + orçamento SEM LAJE.

    Parâmetros
    ----------
    a          : largura total (m) — eixo das vigas
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
    vao_maximo  = _vao_automatico(tipo_telha)

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

    # Arredondar parafusos para múltiplos de 500
    parafusos_48_arredondado = _arredondar_parafusos(parafusos_48)
    parafusos_42_arredondado = _arredondar_parafusos(parafusos_42) if parafusos_42 > 0 else 0

    campos = dict(
        perfil_viga=perfil_viga, perfil_terca=perfil_terca,
        total_viga_m=total_viga, total_terca_m=total_terca,
        parafusos_48=parafusos_48_arredondado, parafusos_42=parafusos_42_arredondado,
        conexoes_p=conexoes_p, conexoes_m=conexoes_m, conexoes_g=conexoes_g,
    )
    itens, total_value = _montar_itens_sem_laje(campos)
    area = a * b
    value_per_m2 = round(total_value / area, 2) if area > 0 else 0.0

    return ResultadoSemLaje(
        a=a, b=b, tipo_telha=tipo_telha, tem_placa=tem_placa,
        vao_maximo=vao_maximo,
        inclinacao=inclinacao, angulo_rad=angulo_rad,
        carga_telha_kn_m2=carga_telha, esp_terca_m=esp_terca,
        perfil_viga=perfil_viga, perfil_terca=perfil_terca,
        qtd_vigas=qtd_vigas, comp_viga_m=comp_viga, total_viga_m=total_viga,
        qtd_tercas=qtd_tercas, comp_terca_m=comp_terca, total_terca_m=total_terca,
        parafusos_48=parafusos_48_arredondado, parafusos_42=parafusos_42_arredondado,
        conexoes_p=conexoes_p, conexoes_m=conexoes_m, conexoes_g=conexoes_g,
        itens=itens, total_value=total_value, value_per_m2=value_per_m2,
        alertas=alertas,
    )


def calcular_com_laje(
    a: float,
    b: float,
    tipo_telha: str,
    tem_placa: bool,
) -> ResultadoComLaje:
    """
    Quantitativo + orçamento COM LAJE.

    Parâmetros
    ----------
    a          : largura total (m)
    b          : comprimento total (m)
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

    vao_maximo           = _vao_automatico(tipo_telha)
    pontaletes_por_linha = _pontaletes_automatico(b, vao_maximo)
    altura_pontaletes_m  = _ALTURA_PONT

    vao_viga     = b / (pontaletes_por_linha + 1)
    carga_viga   = carga_telha * vao_maximo
    inertia_viga = _inertia_minima_mm4(carga_viga, vao_viga)
    perfil_viga  = _menor_perfil(inertia_viga, a_partir_de=2)

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

    # Arredondar parafusos para múltiplos de 500
    parafusos_48_arredondado = _arredondar_parafusos(parafusos_48)
    parafusos_42_arredondado = _arredondar_parafusos(parafusos_42) if parafusos_42 > 0 else 0

    campos = dict(
        perfil_viga=perfil_viga, perfil_terca=perfil_terca,
        total_viga_m=total_viga, total_terca_m=total_terca,
        total_pontalete_m=total_pontalete,
        total_contraventamento_m=total_contraventamento,
        parafusos_48=parafusos_48_arredondado, parafusos_42=parafusos_42_arredondado,
        conexoes_p=conexoes_p,
        pontaletes_por_linha=pontaletes_por_linha,
        qtd_vigas=qtd_vigas,
    )
    itens, total_value = _montar_itens_com_laje(campos)
    area = a * b
    value_per_m2 = round(total_value / area, 2) if area > 0 else 0.0

    return ResultadoComLaje(
        a=a, b=b, tipo_telha=tipo_telha, tem_placa=tem_placa,
        vao_maximo=vao_maximo,
        pontaletes_por_linha=pontaletes_por_linha,
        altura_pontaletes_m=altura_pontaletes_m,
        inclinacao=inclinacao, angulo_rad=angulo_rad,
        carga_telha_kn_m2=carga_telha, esp_terca_m=esp_terca,
        perfil_viga=perfil_viga, perfil_terca=perfil_terca,
        perfil_pontalete=perfil_viga,
        qtd_vigas=qtd_vigas, comp_viga_m=comp_viga, total_viga_m=total_viga,
        qtd_tercas=qtd_tercas, comp_terca_m=comp_terca, total_terca_m=total_terca,
        total_pontalete_m=total_pontalete,
        total_contraventamento_m=total_contraventamento,
        parafusos_48=parafusos_48_arredondado, parafusos_42=parafusos_42_arredondado,
        conexoes_p=conexoes_p,
        itens=itens, total_value=total_value, value_per_m2=value_per_m2,
        alertas=alertas,
    )


# ---------------------------------------------------------------------------
# Utilitários
# ---------------------------------------------------------------------------

def para_dict(resultado) -> dict:
    return asdict(resultado)


def tipos_de_telha() -> list:
    return list(TELHAS.keys())


# ---------------------------------------------------------------------------
# Smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    SEP = "-" * 56

    print(SEP)
    print("SEM LAJE — a=15, b=2.6, Cerâmico, com placa")
    print(SEP)
    r1 = calcular_sem_laje(a=15, b=2.6, tipo_telha="Cerâmico", tem_placa=True)
    print(f"  Perfil viga  : {r1.perfil_viga}")
    print(f"  Perfil terça : {r1.perfil_terca}")
    print(f"  Vigas        : {r1.qtd_vigas} × {r1.comp_viga_m:.2f} m = {r1.total_viga_m:.2f} m")
    print(f"  Terças       : {r1.qtd_tercas} × {r1.comp_terca_m:.0f} m = {r1.total_terca_m:.0f} m")
    print(f"  Par 4,8/4,2  : {r1.parafusos_48} / {r1.parafusos_42}")
    print(f"  Conexões P/M/G: {r1.conexoes_p}/{r1.conexoes_m}/{r1.conexoes_g}")
    print(f"\n  {'CÓDIGO':<10} {'DESCRIÇÃO':<40} {'QTD':>8} {'UN':<4} {'UNIT':>8} {'TOTAL':>10}")
    for i in r1.itens:
        print(f"  {i.codigo:<10} {i.descricao:<40} {i.qtd:>8.1f} {i.un:<4} {i.preco_un:>8.2f} {i.total:>10.2f}")
    print(f"\n  {'TOTAL':>64} R$ {r1.total_value:>10.2f}")
    print(f"  {'R$/m²':>64}     {r1.value_per_m2:>10.2f}")

    print()
    print(SEP)
    print("COM LAJE — a=17, b=5, Cerâmico, sem placa")
    print(SEP)
    r2 = calcular_com_laje(a=17, b=5, tipo_telha="Cerâmico", tem_placa=False)
    print(f"  Pontaletes/linha : {r2.pontaletes_por_linha}")
    print(f"  Altura pont.     : {r2.altura_pontaletes_m} m")
    print(f"  Perfil viga      : {r2.perfil_viga}")
    print(f"  Perfil terça     : {r2.perfil_terca}")
    print(f"  Vigas            : {r2.qtd_vigas} × {r2.comp_viga_m:.2f} m = {r2.total_viga_m:.2f} m")
    print(f"  Terças           : {r2.qtd_tercas} × {r2.comp_terca_m:.0f} m = {r2.total_terca_m:.0f} m")
    print(f"  Pontaletes       : {r2.total_pontalete_m:.2f} m")
    print(f"  Contraventamento : {r2.total_contraventamento_m:.2f} m")
    print(f"\n  {'CÓDIGO':<10} {'DESCRIÇÃO':<40} {'QTD':>8} {'UN':<4} {'UNIT':>8} {'TOTAL':>10}")
    for i in r2.itens:
        print(f"  {i.codigo:<10} {i.descricao:<40} {i.qtd:>8.1f} {i.un:<4} {i.preco_un:>8.2f} {i.total:>10.2f}")
    print(f"\n  {'TOTAL':>64} R$ {r2.total_value:>10.2f}")
    print(f"  {'R$/m²':>64}     {r2.value_per_m2:>10.2f}")

    print()
    print(SEP)
    print("COM LAJE — a=25, b=9, Termoacustico, com placa")
    print(SEP)
    r3 = calcular_com_laje(a=25, b=9, tipo_telha="Termoacustico", tem_placa=True)
    print(f"  Pontaletes/linha : {r3.pontaletes_por_linha}")
    print(f"  Vigas  : {r3.qtd_vigas} × {r3.comp_viga_m:.2f} m = {r3.total_viga_m:.2f} m")
    print(f"  Terças : {r3.qtd_tercas} × {r3.comp_terca_m:.0f} m = {r3.total_terca_m:.0f} m")
    print(f"  Pont.  : {r3.total_pontalete_m:.2f} m | Contrav: {r3.total_contraventamento_m:.2f} m")
    print(f"\n  {'CÓDIGO':<10} {'DESCRIÇÃO':<40} {'QTD':>8} {'UN':<4} {'UNIT':>8} {'TOTAL':>10}")
    for i in r3.itens:
        print(f"  {i.codigo:<10} {i.descricao:<40} {i.qtd:>8.1f} {i.un:<4} {i.preco_un:>8.2f} {i.total:>10.2f}")
    print(f"\n  {'TOTAL':>64} R$ {r3.total_value:>10.2f}")
    print(f"  {'R$/m²':>64}     {r3.value_per_m2:>10.2f}")