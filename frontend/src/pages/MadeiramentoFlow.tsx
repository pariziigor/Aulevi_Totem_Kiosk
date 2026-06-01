import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { LeadCaptureModal } from "../components/LeadCaptureModal";
import { CitySearchModal } from "../components/MadeiramentoFlow/CitySearchModal";
import { StepRenderer } from "../components/MadeiramentoFlow/StepRenderer";
import type { EditingDim } from "../components/MadeiramentoFlow/types";
import {
  MADEIRAMENTO_TOTAL_STEPS,
  type TipoLaje,
} from "../constants/madeiramentoFlowConstants";
import { useCitySearch } from "../hooks/useCitySearch";
import { KioskService } from "../services/api";
import { useKioskStore } from "../store/useKioskStore";

const MadeiramentoFlow: React.FC = () => {
  const navigate = useNavigate();
  const { quoteData, setQuoteData, resetSession } = useKioskStore();
  const isTotemRequest = () => new URLSearchParams(window.location.search).get("origem") === "totem";
  const mainMenuPath = () => isTotemRequest() ? "/?origem=totem" : "/";

  const [step, setStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [tipoLaje, setTipoLaje] = useState<TipoLaje>("SEM_LAJE");
  const [dimA, setDimA] = useState("");
  const [dimB, setDimB] = useState("");
  const [editingDim, setEditingDim] = useState<EditingDim>("A");
  const [tipoTelha, setTipoTelha] = useState("");
  const [temPlaca, setTemPlaca] = useState(false);

  const {
    citySearch,
    setCitySearch,
    filteredCities,
    isLoadingCities,
  } = useCitySearch();

  const handleNext = () => {
    setStep((currentStep) => currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((currentStep) => currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate(mainMenuPath());
  };

  const handleCancel = () => {
    resetSession();
    navigate(mainMenuPath());
  };

  const handleOpenCityModal = () => {
    setCitySearch(quoteData.city && quoteData.city !== "Nao informado" ? quoteData.city : "");
    setShowCityModal(true);
  };

  const handleSelectCity = (city: string) => {
    setQuoteData({ city });
    setCitySearch(city);
    setShowCityModal(false);
  };

  const handleConfirmCustomCity = (city: string) => {
    setQuoteData({ city });
    setShowCityModal(false);
  };

  const submitQuote = async (name: string, phone: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        module: "MADEIRAMENTO",
        lead_name: name,
        lead_phone: phone,
        tipo_laje: tipoLaje,
        tipo_telha: tipoTelha,
        tem_placa: temPlaca,
        dim_a: parseFloat(dimA.replace(",", ".")),
        dim_b: parseFloat(dimB.replace(",", ".")),
        city: quoteData.city || "Nao informado",
      };

      const response = await KioskService.submitQuote(payload);

      if (!response.success) {
        throw new Error(response.message || "Falha ao processar orçamento.");
      }

      const isTotem = isTotemRequest();

      resetSession();

      if (isTotem) {
        navigate("/sucesso?origem=totem");
        return;
      }

      alert("Orçamento gerado com sucesso!");
      navigate(mainMenuPath());
    } catch (error) {
      console.error("Falha na API:", error);
      alert("ERRO: Falha ao processar orçamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:min-h-0 w-full lg:w-screen bg-slate-50 text-slate-800 flex flex-col p-4 md:p-6 lg:p-8 select-none overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 md:mb-6 flex-none w-full lg:max-w-none mx-auto gap-4 md:gap-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-[clamp(1.75rem,2.1vw,2.35rem)] font-black tracking-tight text-slate-900 uppercase">
            Madeiramento
          </h1>
          <div className="h-1 w-16 md:w-24 bg-orange-500 rounded-full" />
        </div>
        <div className="bg-white border border-slate-200 px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-sm">
          <span className="text-sm md:text-lg lg:text-lg font-bold text-slate-500">
            Etapa <span className="text-orange-600">{step + 1}</span> de {MADEIRAMENTO_TOTAL_STEPS}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center lg:items-stretch justify-center relative w-full lg:max-w-none mx-auto pb-6 md:pb-4 lg:pb-0 min-h-0 lg:overflow-hidden">
        <StepRenderer
          currentStep={step}
          state={{
            tipoLaje,
            dimA,
            dimB,
            editingDim,
            tipoTelha,
            temPlaca,
            city: quoteData.city,
          }}
          setTipoLaje={setTipoLaje}
          setDimA={setDimA}
          setDimB={setDimB}
          setEditingDim={setEditingDim}
          setTipoTelha={setTipoTelha}
          setTemPlaca={setTemPlaca}
          onNext={handleNext}
          onOpenCityModal={handleOpenCityModal}
          onConfirmSummary={() => setShowLeadModal(true)}
          isLoadingCities={isLoadingCities}
        />
      </main>

      <footer className="mt-4 md:mt-6 flex flex-col-reverse md:flex-row justify-between items-center flex-none w-full lg:max-w-none mx-auto relative gap-3 md:gap-0">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleBack}
          className="w-full md:w-auto bg-white text-slate-600 border border-slate-200 rounded-full px-6 md:px-8 py-3 lg:px-8 lg:py-3 text-base md:text-lg lg:text-lg font-bold shadow-sm hover:bg-slate-100 transition-colors flex justify-center items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /> {step === 0 ? "Cancelar" : "Voltar"}
        </motion.button>
        {step > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleCancel}
            className="w-full md:w-auto bg-white text-slate-500 border border-slate-200 rounded-full px-6 md:px-8 py-3 lg:px-8 lg:py-3 text-base md:text-lg lg:text-lg font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center gap-2"
          >
            Cancelar Operação
          </motion.button>
        )}
      </footer>

      <AnimatePresence>
        {showCityModal && (
          <CitySearchModal
            isOpen={showCityModal}
            onClose={() => setShowCityModal(false)}
            searchValue={citySearch}
            onSearchChange={setCitySearch}
            filteredCities={filteredCities}
            isLoading={isLoadingCities}
            onSelectCity={handleSelectCity}
            onConfirmCustomCity={handleConfirmCustomCity}
          />
        )}
      </AnimatePresence>

      {showLeadModal && (
        <LeadCaptureModal
          onConfirm={submitQuote}
          onCancel={() => setShowLeadModal(false)}
        />
      )}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-50/90 backdrop-blur-sm z-[200] flex items-center justify-center flex-col px-4 text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md" />
          <p className="text-xl md:text-2xl font-bold text-slate-800 mt-6 md:mt-8 tracking-tight">
            Calculando Materiais...
          </p>
          <p className="text-sm md:text-base text-slate-500 mt-2">
            Isso levará apenas alguns segundos
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MadeiramentoFlow;
