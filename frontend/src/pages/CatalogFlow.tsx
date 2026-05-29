import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useCatalogFlow } from '../hooks/useCatalogFlow';
import { useImageCarousel } from '../hooks/useImageCarousel';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { ProductCarousel } from '../components/CatalogFlow/ProductCarousel';
import { ProductDetails } from '../components/CatalogFlow/ProductDetails';
import { FullscreenImageViewer } from '../components/CatalogFlow/FullscreenImageViewer';
import { KioskService } from '../services/api';

const CatalogFlow: React.FC = () => {
  const {
    step,
    catalogType,
    products,
    selectedProduct,
    showLeadModal,
    setShowLeadModal,
    isProcessing,
    setIsProcessing,
    handleSelectProduct,
    handleBackToGallery,
    handleCancel
  } = useCatalogFlow();

  const {
    currentImageIndex,
    isFullscreen,
    setIsFullscreen,
    carouselRef,
    nextImage,
    prevImage,
    handleDragEnd,
    handleScroll
  } = useImageCarousel(selectedProduct);

  const submitInterest = async (name: string, phone: string) => {
    if (!selectedProduct) {
      alert('ERRO: Nenhum produto selecionado. Volte ao catálogo e escolha um modelo.');
      return;
    }

    setShowLeadModal(false);
    setIsProcessing(true);

    try {
      const payload = {
        module: catalogType,
        lead_name: name,
        lead_phone: phone,
        product: selectedProduct,
      };

      await KioskService.submitQuote(payload);

      console.log(`[Lead Capturado] Especificações enviadas com sucesso para ${name}`);

      alert(
        `ATENDIMENTO REGISTRADO!\n\nObrigado, ${name}.\nO catálogo em PDF do ${selectedProduct?.title} foi baixado com sucesso!`,
      );
      handleCancel();
    } catch (error) {
      console.error('Falha na comunicação com a API:', error);
      alert('ERRO: Falha ao registrar interesse. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col p-4 md:p-6 lg:p-8 select-none overflow-x-hidden font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Header */}
      <header className="border-b border-slate-200 pb-4 mb-4 md:mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 flex-none w-full max-w-[1800px] mx-auto">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-[clamp(1.75rem,2.1vw,2.35rem)] font-black tracking-tight text-slate-900 uppercase">
            Catálogo: {catalogType}
          </h1>
          <div className="h-1 w-16 md:w-24 bg-orange-500 rounded-full"></div>
        </div>
        {step === 0 && (
          <button
            onClick={handleCancel}
            className="w-full md:w-auto text-sm md:text-base lg:text-base font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-5 py-2.5 md:px-6 md:py-3 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
          >
            Cancelar Operação
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative w-full max-w-[1800px] mx-auto">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="catalog"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <ProductCarousel
                products={products}
                onSelectProduct={handleSelectProduct}
                onScroll={handleScroll}
                carouselRef={carouselRef}
              />
            </motion.div>
          ) : step === 1 && selectedProduct ? (
            <motion.div
              key="details"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <ProductDetails
                product={selectedProduct}
                currentImageIndex={currentImageIndex}
                onNextImage={nextImage}
                onPrevImage={prevImage}
                onOpenFullscreen={() => setIsFullscreen(true)}
                onDragEnd={handleDragEnd}
                onInterestClick={() => setShowLeadModal(true)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {step === 1 && (
        <footer className="mt-6 flex flex-col-reverse md:flex-row justify-between items-center gap-4 md:gap-0 flex-none w-full max-w-[1800px] mx-auto relative mb-4 lg:mb-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToGallery}
            className="w-full md:w-auto bg-white text-slate-600 border border-slate-200 rounded-full px-6 py-3 md:px-8 md:py-4 lg:px-9 lg:py-3 text-lg md:text-xl lg:text-lg font-bold shadow-sm hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 md:gap-3"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /> Voltar ao Catálogo
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="w-full md:w-auto bg-white text-slate-500 border border-slate-200 rounded-full px-6 py-3 md:px-8 md:py-4 lg:px-9 lg:py-3 text-lg md:text-xl lg:text-lg font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center gap-2 md:gap-3"
          >
            Cancelar Operação
          </motion.button>
        </footer>
      )}

      {/* Modals */}
      {showLeadModal && (
        <LeadCaptureModal
          onConfirm={submitInterest}
          onCancel={() => setShowLeadModal(false)}
        />
      )}

      <AnimatePresence>
        {isFullscreen && selectedProduct && (
          <FullscreenImageViewer
            product={selectedProduct}
            currentImageIndex={currentImageIndex}
            onNextImage={nextImage}
            onPrevImage={prevImage}
            onClose={() => setIsFullscreen(false)}
            onDragEnd={handleDragEnd}
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-50/90 backdrop-blur-sm z-[150] flex items-center justify-center flex-col px-4 text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-xl md:text-2xl font-bold text-slate-800 mt-6 md:mt-8 tracking-tight">
            Gerando Catálogo...
          </p>
          <p className="text-sm md:text-base text-slate-500 mt-2">
            Preparando imagens e especificações técnicas
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CatalogFlow;
