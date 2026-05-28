export const MADEIRAMENTO_TOTAL_STEPS = 5;

export const MADEIRAMENTO_FLOW_STEPS = {
  TIPO_LAJE: 0,
  DIMENSOES: 1,
  TELHA: 2,
  LOCAL: 3,
  RESUMO: 4,
} as const;

export type TipoLaje = "SEM_LAJE" | "COM_LAJE";

export const TIPOS_TELHA = [
  "Cerâmico",
  "Concreto",
  "Fibrocimento",
  "Aço galvanizado",
  "Termoacustico",
  "Shingle",
] as const;

export type TipoTelha = (typeof TIPOS_TELHA)[number];

export const TELHA_ICONS: Record<TipoTelha, string> = {
  Cerâmico: "/assets/telhas/ceramica.png",
  Concreto: "/assets/telhas/concreto.png",
  Fibrocimento: "/assets/telhas/fibrocimento.png",
  "Aço galvanizado": "/assets/telhas/acogalvo.png",
  Termoacustico: "/assets/telhas/termoacustico.png",
  Shingle: "/assets/telhas/shingle.png",
};

export const CITY_KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
  ["z", "x", "c", "v", "b", "n", "m", "-", "APAGAR"],
];
