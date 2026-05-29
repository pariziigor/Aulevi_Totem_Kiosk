import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, MapPin, Search } from 'lucide-react';
import { Numpad } from './Numpad';
import { Step3Toggle } from './Step3Toggle';
import { CONSTRUCTION_TYPES, CONSTRUCTION_STANDARDS, LSF_FLOW_STEPS } from '../../constants/lsfFlowConstants';

interface LSFQuoteData {
  area: string;
  tipo: string;
  padrao: string;
  has_facade: boolean;
  has_project: boolean;
  has_land?: boolean;
  own_resources?: boolean;
  city?: string;
}

interface StepRendererProps {
  currentStep: number;
  quoteData: LSFQuoteData;
  onSetQuoteData: (data: Partial<LSFQuoteData>) => void;
  onNext: () => void;
  onSummaryConfirm: () => void;
  onOpenCityModal: () => void;
  isLoadingCities: boolean;
}

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  quoteData,
  onSetQuoteData,
  onNext,
  onSummaryConfirm,
  onOpenCityModal,
  isLoadingCities
}) => {
  const renderStep = () => {
    switch(currentStep) {
      case LSF_FLOW_STEPS.AREA:
        return (
          <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-2 md:mb-4">Informe a Área (m²)</h2>
            <p className="text-slate-500 text-sm md:text-lg lg:text-lg mb-5 md:mb-6 text-center px-4">Digite o tamanho estimado do projeto</p>
            
            <div className="text-5xl md:text-6xl lg:text-[clamp(3.5rem,5vw,5rem)] font-black text-orange-600 border-b-4 border-slate-200 w-48 md:w-64 text-center pb-2 tracking-tighter">
              {quoteData.area || <span className="text-slate-200">0</span>}
            </div>
            
            <Numpad value={quoteData.area} onChange={(value) => onSetQuoteData({ area: value })} />
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={onNext} disabled={!quoteData.area || parseFloat(quoteData.area) <= 0}
              className="mt-7 md:mt-8 bg-orange-600 text-white rounded-full px-8 md:px-12 py-3 md:py-4 lg:py-4 text-lg md:text-xl lg:text-xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        );

      case LSF_FLOW_STEPS.TYPE:
        return (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-6 md:mb-7">Selecione o Tipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-8 w-full max-w-5xl px-4 md:px-0">
              {CONSTRUCTION_TYPES.map((t: { label: string; icon: string }) => (
                <motion.button key={t.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { onSetQuoteData({ tipo: t.label }); onNext(); }}
                  className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm p-6 md:p-8 lg:p-8 flex flex-col md:flex-row lg:flex-col items-center justify-center gap-4 md:gap-6 lg:gap-5 h-auto md:h-80 lg:h-72 transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group w-full text-left md:text-center"
                >
                  <div className="w-24 h-24 md:w-40 md:h-40 lg:w-36 lg:h-36 flex items-center justify-center flex-shrink-0">
                    <img src={t.icon} alt={t.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-lg md:text-2xl lg:text-2xl font-bold text-slate-700 flex-1">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case LSF_FLOW_STEPS.STANDARD:
        return (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-6 md:mb-7">Padrão de Acabamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-5 w-full max-w-7xl px-4 md:px-0">
              {CONSTRUCTION_STANDARDS.map((p: { label: string; icon: string }) => (
                <motion.button key={p.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { onSetQuoteData({ padrao: p.label }); onNext(); }}
                  className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] lg:rounded-[2rem] shadow-sm p-4 md:p-6 lg:p-5 flex flex-row lg:flex-col items-center justify-start lg:justify-center gap-4 md:gap-6 lg:gap-4 h-auto md:h-64 lg:h-64 transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group w-full text-left md:text-center"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 lg:w-24 lg:h-24 flex items-center justify-center flex-shrink-0">
                    <img src={p.icon} alt={p.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-base md:text-2xl lg:text-xl font-bold text-slate-700 flex-1">{p.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case LSF_FLOW_STEPS.QUALIFICATIONS:
        return (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full relative z-0">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-2 text-center">Qualificação do Projeto</h2>
            <p className="text-slate-500 text-sm md:text-lg lg:text-lg font-medium mb-6 md:mb-7 text-center">Precisamos de alguns detalhes finais</p>

            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-4xl px-4 md:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 xl:gap-6">
                <Step3Toggle label="Fachada Frontal?" value={!!quoteData.has_facade} onChange={() => onSetQuoteData({ has_facade: !quoteData.has_facade })} />
                <Step3Toggle label="Projeto Arquitetônico?" value={!!quoteData.has_project} onChange={() => onSetQuoteData({ has_project: !quoteData.has_project })} />
                <Step3Toggle label="Possui Terreno?" value={!!quoteData.has_land} onChange={() => onSetQuoteData({ has_land: !quoteData.has_land })} />
                <Step3Toggle label="Recurso Próprio?" value={!!quoteData.own_resources} onChange={() => onSetQuoteData({ own_resources: !quoteData.own_resources })} />
              </div>

              <div className="w-full relative bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
                <label className="text-xs md:text-sm xl:text-base font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500 md:w-5 md:h-5" /> Local da Obra
                </label>
                
                <button 
                  type="button"
                  onClick={() => onOpenCityModal()}
                  className="w-full text-left pl-4 md:pl-6 pr-3 md:pr-4 py-3 md:py-4 lg:py-4 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl text-sm md:text-xl lg:text-xl font-bold text-slate-800 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between outline-none"
                >
                  <span className={`truncate mr-2 ${quoteData.city ? "text-slate-800" : "text-slate-400"}`}>
                    {quoteData.city || (isLoadingCities ? "Carregando IBGE..." : "Toque para buscar cidade...")}
                  </span>
                  <Search className="text-slate-400 flex-shrink-0 w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={onNext} 
              className="mt-8 md:mt-10 relative z-10 w-full max-w-[90%] md:max-w-md mx-auto flex items-center justify-center gap-2 md:gap-3 bg-slate-800 text-white rounded-full px-6 md:px-12 py-3 md:py-4 lg:py-4 text-base md:text-xl lg:text-xl font-bold shadow-md hover:bg-slate-900 transition-all outline-none"
            >
              Ver Resumo Completo <ChevronLeft className="rotate-180 w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        );

      case LSF_FLOW_STEPS.SUMMARY:
        return (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl lg:text-[clamp(2rem,3vw,3rem)] font-bold text-slate-800 tracking-tight mb-6 md:mb-7 text-center">Resumo do Pedido</h2>
            
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 lg:p-8 shadow-md text-sm md:text-lg lg:text-lg font-medium text-slate-600 flex flex-col gap-3 md:gap-4 mb-7 md:mb-8">
              
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Construção</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.tipo} ({quoteData.area} m²)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Padrão / Fachada</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.padrao} • Fachada: {quoteData.has_facade ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Localização</span>
                <span className="font-bold text-orange-600 text-right truncate">{quoteData.city}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Projeto?</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.has_project ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Terreno?</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.has_land ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between pb-1 gap-4">
                <span className="text-slate-400 uppercase font-bold text-xs md:text-sm">Recurso Próprio?</span>
                <span className="font-bold text-slate-800 text-right">{quoteData.own_resources ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }} 
              type="button"
              onClick={onSummaryConfirm}
              className="bg-orange-600 text-white rounded-full px-6 md:px-10 py-4 md:py-5 lg:py-5 text-lg md:text-2xl lg:text-2xl font-bold w-full max-w-4xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-2 md:gap-3"
            >
              <Check className="w-6 h-6 md:w-8 md:h-8" /> Confirmar e Gerar Orçamento
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderStep()}
    </AnimatePresence>
  );
};
