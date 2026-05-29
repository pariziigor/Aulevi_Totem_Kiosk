import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../store/useKioskStore';
import { KioskService } from '../services/api';

export const useLSFFlow = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  const isTotemRequest = () => new URLSearchParams(window.location.search).get('origem') === 'totem';
  const mainMenuPath = () => isTotemRequest() ? '/?origem=totem' : '/';

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
      return;
    }

    navigate(mainMenuPath());
  };

  const handleCancelOperation = () => {
    resetSession();
    navigate(mainMenuPath());
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
        city: quoteData.city || 'Nao informado',
        area: parseFloat(quoteData.area),
      };

      const response = await KioskService.submitQuote(payload);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao processar orçamento.');
      }

      const isTotem = isTotemRequest();

      resetSession();

      if (isTotem) {
        navigate('/sucesso?origem=totem');
        return;
      }

      alert('Orçamento gerado com sucesso!');
      navigate(mainMenuPath());
    } catch (error) {
      console.error('Falha na comunicação com a API:', error);
      alert('ERRO: Falha ao processar orçamento. Tente novamente.');
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
    submitQuoteFlow,
  };
};
