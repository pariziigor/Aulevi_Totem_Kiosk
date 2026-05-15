import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '../store/useKioskStore';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { KioskService } from '../services/api';
import { ChevronLeft, Check } from 'lucide-react';

const LSFFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  
  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => step > 0 ? setStep((s) => s - 1) : navigate('/');

  const handleCancelOperation = () => {
    resetSession();
    navigate('/');
  };

  const submitQuoteFlow = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        lead_name: name,
        lead_phone: phone,
        tipo: quoteData.tipo,
        padrao: quoteData.padrao,
        has_facade: quoteData.has_facade,
        has_project: false, 
        area: parseFloat(quoteData.area)
      };

      const result = await KioskService.submitQuote(payload);
      alert(`ORÇAMENTO GERADO COM SUCESSO!\nValor Total: R$ ${result.total_value.toFixed(2)}`);
      resetSession();
      navigate('/');
    } catch (error) {
      console.error("Falha na comunicação com a API:", error);
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
      setIsProcessing(false);
    }
  };

  const Numpad = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','0','APAGAR'];
    const handleKey = (k: string) => {
      if (k === 'APAGAR') setQuoteData({ area: quoteData.area.slice(0, -1) });
      else if (quoteData.area.length < 4) setQuoteData({ area: quoteData.area + k });
    };

    return (
      <div className="grid grid-cols-3 gap-3 xl:gap-4 w-full max-w-lg mx-auto mt-6">
        {keys.map(k => (
          <motion.button 
            key={k} 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleKey(k)} 
            className={`
              bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center h-16 xl:h-20 transition-all hover:shadow-md hover:border-orange-300
              ${k === '0' ? 'col-span-2' : ''}
              ${k === 'APAGAR' ? 'text-lg xl:text-xl font-bold text-rose-500 bg-rose-50/50 hover:bg-rose-100 border-rose-100' : 'text-3xl xl:text-4xl font-bold text-slate-700'}
            `}
          >
            {k}
          </motion.button>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
      exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    switch(step) {
      case 0:
        return (
          <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-4">Informe a Área (m²)</h2>
            <p className="text-slate-500 text-lg xl:text-xl mb-8">Digite o tamanho estimado do projeto</p>
            
            <div className="text-6xl xl:text-8xl font-black text-orange-600 border-b-4 border-slate-200 w-64 text-center pb-2 tracking-tighter">
              {quoteData.area || <span className="text-slate-200">0</span>}
            </div>
            
            <Numpad />
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleNext} disabled={!quoteData.area || parseFloat(quoteData.area) <= 0}
              className="mt-10 bg-orange-600 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check size={24} />
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8 xl:mb-12">Selecione o Tipo</h2>
            <div className="grid grid-cols-2 gap-8 xl:gap-12 w-full max-w-5xl">
              {[
                { label: 'Casa 1 Pavimento', icon: '/assets/menu_lsf/casa_1_pav.png' },
                { label: 'Casa 2 Pavimentos', icon: '/assets/menu_lsf/casa_2_pav.png' }
              ].map(t => (
                <motion.button key={t.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ tipo: t.label }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 xl:p-12 flex flex-col items-center justify-center gap-6 xl:gap-8 h-80 xl:h-[450px] transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group"
                >
                  <div className="w-40 h-40 xl:w-56 xl:h-56 flex items-center justify-center">
                    <img 
                      src={t.icon} 
                      alt={t.label} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <span className="text-2xl xl:text-4xl font-bold text-slate-700">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8 xl:mb-12">Padrão de Acabamento</h2>
            <div className="grid grid-cols-2 gap-6 xl:gap-8 w-full max-w-5xl">
              {[
                { label: 'Popular', icon: '/assets/menu_lsf/casa_popular.png' },
                { label: 'Médio', icon: '/assets/menu_lsf/casa_medio.png' },
                { label: 'Alto', icon: '/assets/menu_lsf/casa_alto.png' },
                { label: 'Não se aplica', icon: '/assets/menu_lsf/nao_aplica.png' }
              ].map(p => (
                <motion.button key={p.label} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ padrao: p.label }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-6 xl:p-8 flex flex-col items-center justify-center gap-4 xl:gap-6 h-64 xl:h-80 transition-all hover:shadow-xl hover:border-orange-400 hover:text-orange-700 group"
                >
                  <div className="w-24 h-24 xl:w-36 xl:h-36 flex items-center justify-center">
                    <img 
                      src={p.icon} 
                      alt={p.label} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                  <span className="text-2xl xl:text-3xl font-bold text-slate-700">{p.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-2">Detalhes Adicionais</h2>
            
            <p className="text-slate-500 text-lg xl:text-xl font-medium mb-10 xl:mb-14">
              Arraste o interruptor ou toque para selecionar
            </p>

            <div className="flex flex-col gap-6 w-full max-w-2xl">
              
              <div className="bg-white border border-slate-200 rounded-[2rem] p-10 xl:p-12 flex flex-col items-center justify-center gap-10 shadow-sm">
                <span className="text-3xl xl:text-4xl font-bold text-slate-700 text-center">
                  O projeto possui fachada?
                </span>
                
                <div className="flex items-center justify-center gap-6 xl:gap-8">
                  <span className={`text-2xl xl:text-3xl font-bold transition-colors duration-300 ${!quoteData.has_facade ? 'text-slate-800' : 'text-slate-300'}`}>
                    NÃO
                  </span>
                  
                  <div 
                    onClick={() => setQuoteData({ has_facade: !quoteData.has_facade })}
                    className={`w-36 xl:w-48 h-20 xl:h-24 rounded-full p-2 flex items-center cursor-pointer transition-colors duration-300 shadow-inner ${quoteData.has_facade ? 'bg-orange-500 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 700, damping: 30 }}
                      className="w-16 h-16 xl:w-20 xl:h-20 bg-white rounded-full shadow-md"
                    />
                  </div>

                  <span className={`text-2xl xl:text-3xl font-bold transition-colors duration-300 ${quoteData.has_facade ? 'text-orange-600' : 'text-slate-300'}`}>
                    SIM
                  </span>
                </div>
              </div>

            </div>
            
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleNext} className="mt-12 bg-slate-800 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold shadow-md hover:bg-slate-900 transition-all">
              Ver Resumo
            </motion.button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8">Resumo do Pedido</h2>
            
            <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-[2rem] p-8 xl:p-10 shadow-md text-lg xl:text-2xl font-medium text-slate-600 flex flex-col gap-4 xl:gap-6 mb-10">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400">Área Estimada</span>
                <span className="font-bold text-slate-800">{quoteData.area} m²</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400">Tipo de Construção</span>
                <span className="font-bold text-slate-800">{quoteData.tipo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400">Padrão de Acabamento</span>
                <span className="font-bold text-slate-800">{quoteData.padrao}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">Possui Fachada</span>
                <span className="font-bold text-slate-800">{quoteData.has_facade ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowLeadModal(true)} 
              className="bg-orange-600 text-white rounded-full px-10 py-5 xl:py-6 text-2xl xl:text-3xl font-bold w-full max-w-3xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-3">
              <Check size={32} /> Gerar Orçamento Oficial
            </motion.button>
          </motion.div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col p-6 xl:p-12 select-none overflow-hidden font-sans">
      
      <header className="flex justify-between items-center mb-8 flex-none w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">Light Steel Frame</h1>
          <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm">
          <span className="text-lg xl:text-xl font-bold text-slate-500">Etapa <span className="text-orange-600">{step + 1}</span> de 5</span>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <footer className="mt-8 flex justify-between items-center flex-none w-full relative">
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={handleBack} 
          className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={24} /> {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>

        {step > 0 && (
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleCancelOperation} 
            className="bg-white text-slate-500 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            Cancelar Operação
          </motion.button>
        )}
      </footer>

      {showLeadModal && (
        <LeadCaptureModal onConfirm={submitQuoteFlow} onCancel={() => setShowLeadModal(false)} />
      )}
      
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
        >
          <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-2xl font-bold text-slate-800 mt-8 tracking-tight">Calculando Materiais...</p>
          <p className="text-slate-500 mt-2">Isso levará apenas alguns segundos</p>
        </motion.div>
      )}
    </div>
  );
};

export default LSFFlow;