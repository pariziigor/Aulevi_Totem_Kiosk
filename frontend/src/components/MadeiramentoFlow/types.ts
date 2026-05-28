import type { TipoLaje } from "../../constants/madeiramentoFlowConstants";

export type EditingDim = "A" | "B";

export interface MadeiramentoStepState {
  tipoLaje: TipoLaje;
  dimA: string;
  dimB: string;
  editingDim: EditingDim;
  tipoTelha: string;
  temPlaca: boolean;
  city?: string;
}
