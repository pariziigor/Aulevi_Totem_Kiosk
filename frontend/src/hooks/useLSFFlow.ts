import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../store/useKioskStore';
import { KioskService } from '../services/api';

export const useLSFFlow = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  
  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  const handleNext = () => {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleCancelOperation = () => {
    resetSession();
    navigate('/');
  };

  const submitQuoteFlow = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        module: 'LSF',
        lead_name: name,
        lead_phone: phone,
        tipo: quoteData.tipo,
        padrao: quoteData.padrao,
        has_facade: quoteData.has_facade ?? false,
        has_project: quoteData.has_project ?? false,
        has_land: quoteData.has_land ?? false,
        own_resources: quoteData.own_resources ?? false,
        city: quoteData.city || 'Não informado',
        area: parseFloat(quoteData.area)
      };

      await KioskService.submitQuote(payload);
      
      alert(`ORÇAMENTO GERADO COM SUCESSO!\n\nO arquivo PDF com o detalhamento completo do Light Steel Frame foi baixado.`);
      
      resetSession();
      navigate('/');
    } catch (error) {
      console.error("Falha na comunicação com a API:", error);
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    step,
    setStep,
    showLeadModal,
    setShowLeadModal,
    isProcessing,
    showCityModal,
    setShowCityModal,
    quoteData,
    setQuoteData,
    handleNext,
    handleBack,
    handleCancelOperation,
    submitQuoteFlow
  };
};
