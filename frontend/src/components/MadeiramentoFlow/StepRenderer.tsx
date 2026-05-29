import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Layers, MapPin, Search } from "lucide-react";
import {
  MADEIRAMENTO_FLOW_STEPS,
  TELHA_ICONS,
  TIPOS_TELHA,
  type TipoLaje,
} from "../../constants/madeiramentoFlowConstants";
import { NumpadMedida } from "./NumpadMedida";
import { TelhadoSVG } from "./TelhadoSVG";
import { Toggle } from "./Toggle";
import type { EditingDim, MadeiramentoStepState } from "./types";

interface StepRendererProps {
  currentStep: number;
  state: MadeiramentoStepState;
  setTipoLaje: (value: TipoLaje) => void;
  setDimA: (value: string) => void;
  setDimB: (value: string) => void;
  setEditingDim: (value: EditingDim) => void;
  setTipoTelha: (value: string) => void;
  setTemPlaca: React.Dispatch<React.SetStateAction<boolean>>;
  onNext: () => void;
  onOpenCityModal: () => void;
  onConfirmSummary: () => void;
  isLoadingCities: boolean;
}

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  state,
  setTipoLaje,
  setDimA,
  setDimB,
  setEditingDim,
  setTipoTelha,
  setTemPlaca,
  onNext,
  onOpenCityModal,
  onConfirmSummary,
  isLoadingCities,
}) => {
  const {
    tipoLaje,
    dimA,
    dimB,
    editingDim,
    tipoTelha,
    temPlaca,
    city,
  } = state;

  const renderStep = () => {
    switch (currentStep) {
      case MADEIRAMENTO_FLOW_STEPS.TIPO_LAJE:
        return (
          <motion.div key="s0" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-2 md:mb-3 text-center">
              Tipo de Telhado
            </h2>
            <p className="text-slate-500 text-sm md:text-lg lg:text-lg mb-6 md:mb-8 text-center">
              O telhado será apoiado sobre laje existente?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-8 w-full max-w-4xl">
              {[
                { val: "SEM_LAJE" as TipoLaje, label: "Sem Laje", sub: "Telhado com estrutura própria", color: "text-orange-400" },
                { val: "COM_LAJE" as TipoLaje, label: "Com Laje", sub: "Telhado apoiado sobre laje", color: "text-blue-400" },
              ].map((option) => (
                <motion.button
                  key={option.val}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setTipoLaje(option.val);
                    onNext();
                  }}
                  className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm p-6 md:p-10 lg:p-10 flex flex-col items-center justify-center gap-4 md:gap-6 h-auto md:h-72 lg:h-72 transition-all hover:shadow-xl hover:border-orange-400 group text-center"
                >
                  <Layers className={`w-16 h-16 md:w-20 md:h-20 xl:w-[72px] xl:h-[72px] ${option.color}`} />
                  <div>
                    <span className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-700 block">{option.label}</span>
                    <span className="text-sm md:text-base lg:text-base text-slate-400 mt-1 md:mt-2 block">{option.sub}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case MADEIRAMENTO_FLOW_STEPS.DIMENSOES: {
        const currentValue = editingDim === "A" ? dimA : dimB;
        const setCurrentValue = (value: string) => (editingDim === "A" ? setDimA(value) : setDimB(value));
        const canAdvance = parseFloat(dimA.replace(",", ".")) > 0 && parseFloat(dimB.replace(",", ".")) > 0;

        return (
          <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-10 w-full px-4 md:px-0">
            <div className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0 w-full lg:w-auto">
              <TelhadoSVG dimA={dimA} dimB={dimB} activeDim={editingDim} />
              <p className="text-xs md:text-sm xl:text-base text-slate-400 text-center leading-relaxed max-w-xs px-4">
                Toque em <strong className="text-orange-500">A</strong> ou <strong className="text-orange-500">B</strong> ao lado para digitar cada dimensão
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 lg:gap-4 w-full max-w-xs lg:max-w-sm">
              <h2 className="hidden lg:block text-2xl lg:text-2xl font-bold text-slate-800 tracking-tight self-start">
                Dimensões
              </h2>

              <div className="flex gap-3 md:gap-4 w-full">
                {(["A", "B"] as const).map((dim) => {
                  const value = dim === "A" ? dimA : dimB;
                  const active = editingDim === dim;
                  return (
                    <button
                      key={dim}
                      type="button"
                      onClick={() => setEditingDim(dim)}
                      className={`flex flex-col items-center justify-center flex-1 h-20 md:h-24 lg:h-24 rounded-xl md:rounded-2xl border-2 transition-all shadow-sm
                        ${active ? "border-orange-500 bg-orange-50 shadow-orange-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5 ${active ? "text-orange-500" : "text-slate-400"}`}>
                        Dim. {dim}
                      </span>
                      <span className={`text-2xl md:text-3xl lg:text-3xl font-black tracking-tight ${active ? "text-orange-600" : "text-slate-700"}`}>
                        {value || <span className="text-slate-300">-</span>}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-400 mt-0.5">metros</span>
                    </button>
                  );
                })}
              </div>

              <NumpadMedida value={currentValue} onChange={setCurrentValue} />

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onNext}
                disabled={!canAdvance}
                className="w-full mt-2 bg-orange-600 text-white rounded-full py-3 md:py-4 lg:py-4 text-lg md:text-xl lg:text-xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
              >
                Avançar <Check className="w-5 h-5 md:w-6 md:h-6" />
              </motion.button>
            </div>
          </motion.div>
        );
      }

      case MADEIRAMENTO_FLOW_STEPS.TELHA:
        return (
          <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-4 md:mb-8 text-center">
              Tipo de Telha
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-5 w-full max-w-4xl mb-6">
              {TIPOS_TELHA.map((telha) => (
                <motion.button
                  key={telha}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setTipoTelha(telha)}
                  className={`rounded-xl md:rounded-2xl border-2 px-2 md:px-4 py-4 md:py-6 lg:py-5 transition-all shadow-sm flex flex-col items-center justify-center gap-2 md:gap-3
                    ${tipoTelha === telha ? "border-orange-500 bg-orange-50 shadow-orange-100" : "border-slate-200 bg-white hover:border-orange-300"}`}
                >
                  <img src={TELHA_ICONS[telha]} alt={telha} className="w-12 h-12 md:w-20 md:h-20 lg:w-20 lg:h-20 object-contain" />
                  <span className={`text-sm md:text-lg lg:text-lg font-bold text-center leading-tight ${tipoTelha === telha ? "text-orange-700" : "text-slate-700"}`}>
                    {telha}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="w-full max-w-4xl">
              <Toggle label="Placa fotovoltaica?" value={temPlaca} onChange={() => setTemPlaca((prev) => !prev)} />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onNext}
              disabled={!tipoTelha}
              className="mt-6 md:mt-8 bg-orange-600 text-white rounded-full px-8 md:px-12 py-3 md:py-4 lg:py-4 text-lg md:text-xl lg:text-xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        );

      case MADEIRAMENTO_FLOW_STEPS.LOCAL:
        return (
          <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-2 md:mb-3 text-center">
              Local da Obra
            </h2>
            <p className="text-slate-500 text-sm md:text-lg lg:text-lg mb-6 md:mb-8 text-center">
              Informe a cidade onde o telhado será instalado
            </p>
            <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
              <label className="text-xs md:text-sm xl:text-base font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                <MapPin className="text-orange-500 w-4 h-4 md:w-5 md:h-5" /> Cidade
              </label>
              <button
                type="button"
                onClick={onOpenCityModal}
                className="w-full text-left pl-4 md:pl-6 pr-3 md:pr-4 py-3 md:py-5 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl text-base md:text-xl lg:text-xl font-bold cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between outline-none"
              >
                <span className={`truncate mr-2 ${city ? "text-slate-800" : "text-slate-400"}`}>
                  {city || (isLoadingCities ? "Carregando cidades..." : "Toque para buscar a cidade...")}
                </span>
                <Search className="text-slate-400 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onNext}
              className="mt-8 md:mt-10 bg-slate-800 text-white rounded-full px-8 md:px-12 py-3 md:py-4 lg:py-4 text-base md:text-xl lg:text-xl font-bold shadow-md hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              Ver Resumo <ChevronLeft className="rotate-180 w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        );

      case MADEIRAMENTO_FLOW_STEPS.RESUMO: {
        const vaoAuto = tipoTelha === "Cerâmico" || tipoTelha === "Concreto" ? "1,0 m" : "1,5 m";
        const rows = [
          { label: "Tipo", value: tipoLaje === "SEM_LAJE" ? "Sem Laje" : "Com Laje" },
          { label: "Dim. A (larg.)", value: `${dimA} m` },
          { label: "Dim. B (prof.)", value: `${dimB} m` },
          { label: "Telha", value: tipoTelha },
          { label: "Fotovoltaica", value: temPlaca ? "Sim" : "Não" },
          { label: "Vão (auto)", value: vaoAuto },
          { label: "Local", value: city || "Não informado" },
        ];

        return (
          <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-6 md:mb-7 text-center">
              Resumo do Pedido
            </h2>
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 lg:p-8 shadow-md flex flex-col gap-2 md:gap-3 mb-6 md:mb-8">
              {rows.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-100 pb-2 md:pb-3 last:border-0 last:pb-0 gap-4">
                  <span className="text-slate-400 uppercase font-bold text-xs md:text-sm xl:text-base whitespace-nowrap">
                    {label}
                  </span>
                  <span className="font-bold text-slate-800 text-sm md:text-base xl:text-lg text-right truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs md:text-sm xl:text-base text-center max-w-2xl mb-4 md:mb-6 leading-relaxed px-4">
              Os perfis estruturais e quantitativos serão calculados automaticamente pelo sistema.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onConfirmSummary}
              className="bg-orange-600 text-white rounded-full px-6 md:px-10 py-4 md:py-5 lg:py-5 text-lg md:text-2xl lg:text-2xl font-bold w-full max-w-4xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-2 md:gap-3"
            >
              <Check className="w-5 h-5 md:w-8 md:h-8" /> Confirmar e Gerar Orçamento
            </motion.button>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>;
};
