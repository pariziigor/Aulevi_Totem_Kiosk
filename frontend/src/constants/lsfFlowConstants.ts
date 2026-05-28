export const LSF_FLOW_STEPS = {
  AREA: 0,
  TYPE: 1,
  STANDARD: 2,
  QUALIFICATIONS: 3,
  SUMMARY: 4
} as const;

export const CONSTRUCTION_TYPES = [
  { label: 'Casa 1 Pavimento', icon: '/assets/menu_lsf/casa_1_pav.png' },
  { label: 'Casa 2 Pavimentos', icon: '/assets/menu_lsf/casa_2_pav.png' }
] as const;

export const CONSTRUCTION_STANDARDS = [
  { label: 'Popular', icon: '/assets/menu_lsf/casa_popular.png' },
  { label: 'Médio', icon: '/assets/menu_lsf/casa_medio.png' },
  { label: 'Alto', icon: '/assets/menu_lsf/casa_alto.png' },
  { label: 'Não se aplica', icon: '/assets/menu_lsf/nao_aplica.png' }
] as const;

export const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','0','APAGAR'];

export const CITY_KEYBOARD_LAYOUT = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç"],
  ["z", "x", "c", "v", "b", "n", "m", "-", "APAGAR"]
];
