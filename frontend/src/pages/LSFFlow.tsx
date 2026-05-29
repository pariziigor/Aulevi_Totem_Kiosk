import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useLSFFlow } from '../hooks/useLSFFlow';
import { useCitySearch } from '../hooks/useCitySearch';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { CitySearchModal } from '../components/LSFFlow/CitySearchModal.tsx';
import { StepRenderer } from '../components/LSFFlow/StepRenderer';
import { LSF_FLOW_STEPS } from '../constants/lsfFlowConstants';

const LSFFlow: React.FC = () => {
  const {
    step,
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
  } = useLSFFlow();

  const {
    citySearch,
    setCitySearch,
    filteredCities,
    isLoadingCities
  } = useCitySearch();

  const handleSelectCity = (city: string) => {
    setQuoteData({ city });
    setCitySearch(city);
    setShowCityModal(false);
  };

  const handleConfirmCustomCity = (city: string) => {
    setQuoteData({ city });
    setShowCityModal(false);
  };

  const handleSummaryConfirm = () => {
    setShowLeadModal(true);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:min-h-0 w-full lg:w-screen bg-slate-50 text-slate-800 flex flex-col p-4 md:p-6 lg:p-8 select-none overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 md:mb-6 flex-none w-full lg:max-w-none mx-auto gap-4 md:gap-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-[clamp(1.75rem,2.1vw,2.35rem)] font-black tracking-tight text-slate-900 uppercase">Light Steel Frame</h1>
          <div className="h-1 w-16 md:w-24 bg-orange-500 rounded-full"></div>
        </div>
        <div className="bg-white border border-slate-200 px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-sm">
          <span className="text-sm md:text-lg lg:text-lg font-bold text-slate-500">Etapa <span className="text-orange-600">{step + 1}</span> de 5</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start lg:items-stretch justify-center relative w-full lg:max-w-none mx-auto pb-6 md:pb-4 lg:pb-0 min-h-0 lg:overflow-hidden">
        <StepRenderer
          currentStep={step}
          quoteData={quoteData}
          onSetQuoteData={setQuoteData}
          onNext={() => {
            if (step === LSF_FLOW_STEPS.QUALIFICATIONS) {
              if (!quoteData.city || quoteData.city.trim().length < 2) {
                setShowCityModal(true);
                return;
              }
            }
            handleNext();
          }}
          onSummaryConfirm={handleSummaryConfirm}
          onOpenCityModal={() => {
            setCitySearch(quoteData.city && quoteData.city !== 'Não informado' ? quoteData.city : "");
            setShowCityModal(true);
          }}
          isLoadingCities={isLoadingCities}
        />
      </main>

      {/* Footer */}
      <footer className="mt-4 md:mt-6 flex flex-col-reverse md:flex-row justify-between items-center flex-none w-full lg:max-w-none mx-auto relative gap-3 md:gap-0">
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={handleBack} 
          className="w-full md:w-auto bg-white text-slate-600 border border-slate-200 rounded-full px-6 md:px-8 py-3 lg:px-8 lg:py-3 text-base md:text-lg lg:text-lg font-bold shadow-sm hover:bg-slate-100 transition-colors flex justify-center items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /> {step === 0 ? 'Cancelar' : 'Voltar'}
        </motion.button>

        {step > 0 && (
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={handleCancelOperation} 
            className="w-full md:w-auto bg-white text-slate-500 border border-slate-200 rounded-full px-6 md:px-8 py-3 lg:px-8 lg:py-3 text-base md:text-lg lg:text-lg font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center gap-2"
          >
            Cancelar Operação
          </motion.button>
        )}
      </footer>

      {/* Modals */}
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
          onConfirm={submitQuoteFlow} 
          onCancel={() => setShowLeadModal(false)} 
        />
      )}
      
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-50/90 backdrop-blur-sm z-[200] flex items-center justify-center flex-col px-4 text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-xl md:text-2xl font-bold text-slate-800 mt-6 md:mt-8 tracking-tight">Calculando Materiais...</p>
          <p className="text-sm md:text-base text-slate-500 mt-2">Isso levará apenas alguns segundos</p>
        </motion.div>
      )}
    </div>
  );
};

export default LSFFlow;
