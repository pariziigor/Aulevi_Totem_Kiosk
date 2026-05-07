import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '../store/useKioskStore';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { KioskService } from '../services/api';

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
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
      setIsProcessing(false);
    }
  };

  // --- SUB-COMPONENTES OTIMIZADOS ---

  const Numpad = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','0','APAGAR'];
    const handleKey = (k: string) => {
      if (k === 'APAGAR') setQuoteData({ area: quoteData.area.slice(0, -1) });
      else if (quoteData.area.length < 4) setQuoteData({ area: quoteData.area + k });
    };

    return (
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg mx-auto mt-2">
        {keys.map(k => (
          <motion.button 
            key={k} 
            whileTap={{ scale: 0.9, backgroundColor: "#000", color: "#FFF" }}
            onClick={() => handleKey(k)} 
            className={`border-8 border-black text-3xl font-black flex items-center justify-center h-16 transition-colors ${k === '0' ? 'col-span-2' : ''}`}
          >
            {k}
          </motion.button>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
    };

    switch(step) {
      case 0:
        return (
          <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-black uppercase mb-2">Informe a Área (m²)</h2>
            <div className="text-6xl font-black border-b-8 border-black w-48 text-center pb-2 mb-4">
              {quoteData.area || '0'}
            </div>
            <Numpad />
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleNext} disabled={!quoteData.area || parseFloat(quoteData.area) <= 0}
              className="mt-6 bg-black text-white px-12 py-4 text-2xl font-black disabled:opacity-30 disabled:scale-100 uppercase"
            >
              Avançar
            </motion.button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-black uppercase mb-6">Selecione o Tipo</h2>
            <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
              {['Casa 1 pav', 'Casa 2 pav', 'Galpão', 'Galpão + escritório'].map(t => (
                <motion.button key={t} whileTap={{ scale: 0.95, backgroundColor: "#000", color: "#FFF" }} onClick={() => { setQuoteData({ tipo: t }); handleNext(); }}
                  className="border-8 border-black text-2xl font-black p-6 uppercase h-32 flex items-center justify-center text-center">
                  {t}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-black uppercase mb-6">Padrão de Acabamento</h2>
            <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
              {['Popular', 'Médio', 'Alto', 'Não se aplica'].map(p => (
                <motion.button key={p} whileTap={{ scale: 0.95, backgroundColor: "#000", color: "#FFF" }} onClick={() => { setQuoteData({ padrao: p }); handleNext(); }}
                  className="border-8 border-black text-2xl font-black p-6 uppercase h-32 flex items-center justify-center text-center">
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-black uppercase mb-6">Adicionais</h2>
            <div className="flex flex-col gap-6 w-full max-w-2xl">
              <div className="border-8 border-black p-4 flex justify-between items-center">
                <span className="text-2xl font-black uppercase">Possui Fachada?</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuoteData({ has_facade: !quoteData.has_facade })} 
                  className={`border-8 border-black w-28 py-3 text-xl font-black transition-colors ${quoteData.has_facade ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  {quoteData.has_facade ? 'SIM' : 'NÃO'}
                </motion.button>
              </div>
              <div className="border-8 border-black p-4 flex justify-between items-center">
                <span className="text-2xl font-black uppercase">Projeto Estrutural?</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuoteData({ has_project: !quoteData.has_project })} 
                  className={`border-8 border-black w-28 py-3 text-xl font-black transition-colors ${quoteData.has_project ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  {quoteData.has_project ? 'SIM' : 'NÃO'}
                </motion.button>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleNext} className="mt-8 bg-black text-white px-12 py-4 text-2xl font-black uppercase">
              Ver Resumo
            </motion.button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-black uppercase mb-6">Resumo do Pedido</h2>
            <div className="w-full max-w-2xl border-8 border-black p-6 text-xl font-bold flex flex-col gap-3 mb-6">
              <div className="flex justify-between border-b-4 border-gray-200 pb-2"><span className="uppercase">Área:</span><span>{quoteData.area} m²</span></div>
              <div className="flex justify-between border-b-4 border-gray-200 pb-2"><span className="uppercase">Tipo:</span><span>{quoteData.tipo.toUpperCase()}</span></div>
              <div className="flex justify-between border-b-4 border-gray-200 pb-2"><span className="uppercase">Padrão:</span><span>{quoteData.padrao.toUpperCase()}</span></div>
              <div className="flex justify-between border-b-4 border-gray-200 pb-2"><span className="uppercase">Fachada:</span><span>{quoteData.has_facade ? 'SIM' : 'NÃO'}</span></div>
              <div className="flex justify-between"><span className="uppercase">Projeto:</span><span>{quoteData.has_project ? 'SIM' : 'NÃO'}</span></div>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowLeadModal(true)} className="bg-black text-white px-10 py-5 text-3xl font-black w-full max-w-2xl uppercase">
              Gerar Orçamento Oficial
            </motion.button>
          </motion.div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-white text-black flex flex-col p-8 select-none overflow-hidden">
      {/* Cabeçalho Proporcional */}
      <header className="border-b-8 border-black pb-4 mb-4 flex justify-between items-end flex-none">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Fluxo LSF</h1>
        <span className="text-xl font-bold uppercase">Etapa {step + 1} de 5</span>
      </header>

      {/* min-h-0 mantém o Flexbox contido na tela */}
      <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Rodapé Fixo */}
      <footer className="mt-4 border-t-8 border-black pt-4 flex-none">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleBack} className="border-8 border-black px-8 py-3 text-xl font-black uppercase">
          ← {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>
      </footer>

      {showLeadModal && (
        <LeadCaptureModal onConfirm={submitQuoteFlow} onCancel={() => setShowLeadModal(false)} />
      )}
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center flex-col">
          <div className="w-20 h-20 border-t-8 border-black border-solid rounded-full animate-spin"></div>
          <p className="text-2xl font-black uppercase mt-6">Calculando Materiais...</p>
        </div>
      )}
    </div>
  );
};

export default LSFFlow;