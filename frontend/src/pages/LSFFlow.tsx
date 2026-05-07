import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../store/useKioskStore';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { KioskService } from '../services/api';

const LSFFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  
  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Evita duplo clique

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
      
      // Sucesso na comunicação! Aqui entraremos com a tela de sucesso/PDF no futuro.
      alert(`ORÇAMENTO GERADO COM SUCESSO!\nValor Total: R$ ${result.total_value.toFixed(2)}`);
      
      resetSession();
      navigate('/');
    } catch (error) {
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
      setIsProcessing(false);
    }
  };

  // --- SUB-COMPONENTES DE TELA (BRUTALISTAS) ---

  const Numpad = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','0','APAGAR'];
    const handleKey = (k: string) => {
      if (k === 'APAGAR') setQuoteData({ area: quoteData.area.slice(0, -1) });
      else if (quoteData.area.length < 4) setQuoteData({ area: quoteData.area + k });
    };

    return (
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto mt-8">
        {keys.map(k => (
          <button key={k} onClick={() => handleKey(k)} className={`border-8 border-black text-4xl font-black p-8 hover:bg-black hover:text-white transition-colors ${k === '0' ? 'col-span-2' : ''}`}>
            {k}
          </button>
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-5xl font-black uppercase mb-8">Informe a Área (m²)</h2>
            <div className="text-8xl font-black border-b-8 border-black w-64 text-center pb-4 mb-8">
              {quoteData.area || '0'}
            </div>
            <Numpad />
            <button 
              onClick={handleNext} disabled={!quoteData.area || parseFloat(quoteData.area) <= 0}
              className="mt-12 bg-black text-white px-16 py-6 text-3xl font-black disabled:opacity-30"
            >
              AVANÇAR
            </button>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-5xl font-black uppercase mb-12">Selecione o Tipo</h2>
            <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
              {['Casa 1 pav', 'Casa 2 pav', 'Galpão', 'Galpão + escritório'].map(t => (
                <button key={t} onClick={() => { setQuoteData({ tipo: t }); handleNext(); }}
                  className="border-8 border-black text-4xl font-black p-12 hover:bg-black hover:text-white uppercase">
                  {t}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-5xl font-black uppercase mb-12">Padrão de Acabamento</h2>
            <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
              {['Popular', 'Médio', 'Alto', 'Não se aplica'].map(p => (
                <button key={p} onClick={() => { setQuoteData({ padrao: p }); handleNext(); }}
                  className="border-8 border-black text-4xl font-black p-12 hover:bg-black hover:text-white uppercase">
                  {p}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-5xl font-black uppercase mb-12">Adicionais</h2>
            <div className="flex flex-col gap-8 w-full max-w-3xl">
              <div className="border-8 border-black p-8 flex justify-between items-center">
                <span className="text-4xl font-black uppercase">Possui Fachada?</span>
                <button onClick={() => setQuoteData({ has_facade: !quoteData.has_facade })} 
                  className={`border-8 border-black px-8 py-4 text-3xl font-black ${quoteData.has_facade ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  {quoteData.has_facade ? 'SIM' : 'NÃO'}
                </button>
              </div>
              <div className="border-8 border-black p-8 flex justify-between items-center">
                <span className="text-4xl font-black uppercase">Incluir Projeto Estrutural?</span>
                <button onClick={() => setQuoteData({ has_project: !quoteData.has_project })} 
                  className={`border-8 border-black px-8 py-4 text-3xl font-black ${quoteData.has_project ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  {quoteData.has_project ? 'SIM' : 'NÃO'}
                </button>
              </div>
            </div>
            <button onClick={handleNext} className="mt-12 bg-black text-white px-16 py-6 text-3xl font-black">
              VER RESUMO
            </button>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-5xl font-black uppercase mb-8">Resumo do Pedido</h2>
            <div className="w-full max-w-3xl border-8 border-black p-8 text-3xl font-bold flex flex-col gap-4 mb-12">
              <p>ÁREA: {quoteData.area} m²</p>
              <p>TIPO: {quoteData.tipo.toUpperCase()}</p>
              <p>PADRÃO: {quoteData.padrao.toUpperCase()}</p>
              <p>FACHADA: {quoteData.has_facade ? 'SIM' : 'NÃO'}</p>
              <p>PROJETO: {quoteData.has_project ? 'SIM' : 'NÃO'}</p>
            </div>
            <button onClick={() => setShowLeadModal(true)} className="bg-black text-white px-16 py-8 text-4xl font-black w-full max-w-3xl hover:opacity-90 transition-opacity">
              GERAR ORÇAMENTO OFICIAL
            </button>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col p-12 select-none relative">
      <header className="border-b-8 border-black pb-4 mb-12 flex justify-between items-center">
        <h1 className="text-5xl font-black tracking-tighter">FLUXO LSF</h1>
        <span className="text-3xl font-bold">ETAPA {step + 1} DE 5</span>
      </header>

      <div className="flex-grow flex items-center justify-center">
        {renderStep()}
      </div>

      <footer className="mt-auto border-t-8 border-black pt-8">
        <button onClick={handleBack} className="border-8 border-black px-12 py-6 text-2xl font-black hover:bg-gray-200 uppercase">
          ← {step === 0 ? 'CANCELAR E VOLTAR' : 'VOLTAR ETAPA'}
        </button>
      </footer>

      {showLeadModal && (
        <LeadCaptureModal 
          onConfirm={submitQuoteFlow} 
          onCancel={() => setShowLeadModal(false)} 
        />
      )}
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center flex-col">
          <div className="w-32 h-32 border-t-8 border-black border-solid rounded-full animate-spin"></div>
          <p className="text-4xl font-black uppercase mt-8">Calculando Materiais...</p>
        </div>
      )}
    </div>
  );
};

export default LSFFlow;