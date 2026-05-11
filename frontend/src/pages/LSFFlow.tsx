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

  const submitQuoteFlow = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        lead_name: name,
        lead_phone: phone,
        tipo: quoteData.tipo,
        padrao: quoteData.padrao,
        has_facade: quoteData.has_facade,
        has_project: quoteData.has_project,
        area: parseFloat(quoteData.area)
      };

      const result = await KioskService.submitQuote(payload);
      alert(`ORÇAMENTO GERADO COM SUCESSO!\nValor Total: R$ ${result.total_value.toFixed(2)}`);
      resetSession();
      navigate('/');
    } catch (error) {
      // CORREÇÃO 1: Utilizando a variável error para evitar o bloqueio do ESLint
      console.error("Falha na comunicação com a API:", error);
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
      setIsProcessing(false);
    }
  };

  // --- SUB-COMPONENTES OTIMIZADOS PARA CLEAN CORPORATE ---

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
      // CORREÇÃO 2: Adicionado 'as const' para tipagem estrita da propriedade ease
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
              className="mt-10 bg-orange-500 text-white rounded-full px-12 py-4 xl:py-5 text-xl xl:text-2xl font-bold disabled:opacity-40 disabled:bg-slate-300 disabled:scale-100 shadow-md hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Avançar <Check size={24} />
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8 xl:mb-12">Selecione o Tipo</h2>
            <div className="grid grid-cols-2 gap-6 xl:gap-8 w-full max-w-5xl">
              {['Casa 1 pav', 'Casa 2 pav', 'Galpão', 'Galpão + escritório'].map(t => (
                <motion.button key={t} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ tipo: t }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2rem] shadow-sm text-2xl xl:text-3xl font-bold text-slate-700 p-8 xl:p-12 h-40 xl:h-48 flex items-center justify-center text-center transition-all hover:shadow-lg hover:border-orange-400 hover:text-orange-700"
                >
                  {t}
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
              {['Popular', 'Médio', 'Alto', 'Não se aplica'].map(p => (
                <motion.button key={p} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setQuoteData({ padrao: p }); handleNext(); }}
                  className="bg-white border border-slate-200 rounded-[2rem] shadow-sm text-2xl xl:text-3xl font-bold text-slate-700 p-8 xl:p-12 h-40 xl:h-48 flex items-center justify-center text-center transition-all hover:shadow-lg hover:border-orange-400 hover:text-orange-700"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-3xl xl:text-5xl font-bold text-slate-800 tracking-tight mb-8 xl:mb-12">Detalhes Adicionais</h2>
            <div className="flex flex-col gap-6 w-full max-w-3xl">
              
              {/* Card Toggle 1 */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 xl:p-8 flex justify-between items-center shadow-sm">
                <span className="text-2xl xl:text-3xl font-bold text-slate-700">Possui Fachada?</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuoteData({ has_facade: !quoteData.has_facade })} 
                  className={`rounded-full w-32 xl:w-40 py-3 xl:py-4 text-lg xl:text-xl font-bold transition-all shadow-sm ${quoteData.has_facade ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {quoteData.has_facade ? 'SIM' : 'NÃO'}
                </motion.button>
              </div>

              {/* Card Toggle 2 */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 xl:p-8 flex justify-between items-center shadow-sm">
                <span className="text-2xl xl:text-3xl font-bold text-slate-700">Projeto Estrutural?</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuoteData({ has_project: !quoteData.has_project })} 
                  className={`rounded-full w-32 xl:w-40 py-3 xl:py-4 text-lg xl:text-xl font-bold transition-all shadow-sm ${quoteData.has_project ? 'bg-orange-500 text-white shadow-orange  -200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {quoteData.has_project ? 'SIM' : 'NÃO'}
                </motion.button>
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
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-400">Possui Fachada</span>
                <span className="font-bold text-slate-800">{quoteData.has_facade ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">Projeto Estrutural</span>
                <span className="font-bold text-slate-800">{quoteData.has_project ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowLeadModal(true)} 
              className="bg-orange-500 text-white rounded-full px-10 py-5 xl:py-6 text-2xl xl:text-3xl font-bold w-full max-w-3xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex justify-center items-center gap-3">
              <Check size={32} /> Gerar Orçamento Oficial
            </motion.button>
          </motion.div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col p-6 xl:p-12 select-none overflow-hidden font-sans">
      
      {/* Cabeçalho Clean */}
      <header className="flex justify-between items-center mb-8 flex-none w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">Light Steel Frame</h1>
          <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm">
          <span className="text-lg xl:text-xl font-bold text-slate-500">Etapa <span className="text-emerald-600">{step + 1}</span> de 5</span>
        </div>
      </header>

      {/* Área de Conteúdo */}
      <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Rodapé Fixo */}
      <footer className="mt-8 flex justify-start flex-none w-full relative">
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={handleBack} 
          className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-3 xl:px-10 xl:py-4 text-lg xl:text-xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={24} /> {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>
      </footer>

      {showLeadModal && (
        <LeadCaptureModal onConfirm={submitQuoteFlow} onCancel={() => setShowLeadModal(false)} />
      )}
      
      {/* Loading State Clean */}
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
        >
          <div className="w-20 h-20 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-2xl font-bold text-slate-800 mt-8 tracking-tight">Calculando Materiais...</p>
          <p className="text-slate-500 mt-2">Isso levará apenas alguns segundos</p>
        </motion.div>
      )}
    </div>
  );
};

export default LSFFlow;