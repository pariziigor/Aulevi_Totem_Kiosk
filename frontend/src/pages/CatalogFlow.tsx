import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, ChevronDown, X } from "lucide-react";
import { LeadCaptureModal } from "../components/LeadCaptureModal";
import { CHALES_DATA, BARRACAO_DATA, type Product } from "../data/products";
import { KioskService } from "../services/api";

const CatalogFlow: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const catalogType = category || "CHALE";

  const products = catalogType === "BARRACAO" ? BARRACAO_DATA : CHALES_DATA;

  const [step, setStep] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Novo estado de carregamento
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setStep(1);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.5;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const nextImage = () => {
    if (selectedProduct) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % selectedProduct.images.length,
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1,
      );
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, { offset }: PanInfo) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold) {
      nextImage();
    } else if (offset.x > swipeThreshold) {
      prevImage();
    }
  };

  const submitInterest = async (name: string, phone: string) => {
    setShowLeadModal(false);
    setIsProcessing(true); // Liga a tela de carregamento
    
    try {
      const payload = {
        module: catalogType, // Vai enviar "CHALE" ou "BARRACAO"
        lead_name: name,
        lead_phone: phone,
        // Envia o objeto INTEIRO do produto para o backend montar o PDF rico!
        product: selectedProduct 
      };

      const result = await KioskService.submitQuote(payload);
      
      console.log(`[Lead Capturado] Pedido: ${result.quote_number}`);

      alert(
        `ATENDIMENTO REGISTRADO!\n\nOrçamento Nº: ${result.quote_number}\n\nObrigado, ${name}.\nEm breve você receberá o material completo do ${selectedProduct?.title} no WhatsApp.`
      );
      navigate("/");
    } catch (error) {
      console.error("Falha na comunicação com a API:", error);
      alert("ERRO: Falha ao registrar interesse. Tente novamente.");
    } finally {
      setIsProcessing(false); // Desliga a tela de carregamento independentemente de sucesso ou erro
    }
  };

  const renderStep = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
      exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
    };

    if (step === 0) {
      return (
        <motion.div
          key="catalog"
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col w-full h-full min-h-0"
        >
          <div className="flex-grow relative flex items-center justify-center min-h-0 w-full max-w-[1800px] mx-auto">
            
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-2 xl:left-8 z-10 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full p-4 hover:bg-white hover:shadow-md transition-all hidden md:flex shadow-sm"
            >
              <ChevronLeft size={48} strokeWidth={1.5} />
            </button>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory h-full w-full gap-6 xl:gap-8 pb-8 px-8 md:px-32 items-center hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((prod) => (
                <motion.div
                  key={prod.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectProduct(prod)}
                  className="snap-center shrink-0 w-[80%] md:w-[45%] lg:w-[30%] xl:w-[25%] 2xl:w-[22%] max-w-[450px] h-[75%] xl:h-[80%] rounded-[2rem] xl:rounded-[2.5rem] shadow-md border border-slate-200 flex flex-col justify-end p-4 xl:p-6 cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all bg-white relative overflow-hidden group"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                  
                  <div className="relative z-10 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-4 xl:p-5 text-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                    <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-800 uppercase leading-none">
                      {prod.title}
                    </h2>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => handleScroll("right")}
              className="absolute right-2 xl:right-8 z-10 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full p-4 hover:bg-white hover:shadow-md transition-all hidden md:flex shadow-sm"
            >
              <ChevronRight size={48} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="text-center mt-2 mb-4 flex-none">
            <span className="text-base xl:text-xl font-bold uppercase tracking-widest text-slate-400 animate-pulse">
              Arraste para os lados e toque no modelo desejado
            </span>
          </div>
        </motion.div>
      );
    }

    if (step === 1 && selectedProduct) {
      return (
        <motion.div
          key="details"
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col w-full h-full min-h-0 gap-6 xl:gap-8"
        >
          <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-bold uppercase tracking-tight text-slate-900 text-center flex-none">
            {selectedProduct.title}
          </h2>

          <div className="flex-grow flex flex-col md:flex-row gap-6 xl:gap-12 2xl:gap-16 min-h-0 w-full">
            
            <div className="flex-[1.3] relative flex items-center justify-center bg-slate-900 rounded-[2rem] xl:rounded-[3rem] overflow-hidden shadow-inner border border-slate-200">
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-4 hover:bg-white transition-all z-10 shadow-md text-slate-600 pointer-events-auto"
              >
                <ChevronLeft size={48} />
              </button>

              <motion.img
                key={currentImageIndex}
                src={selectedProduct.images[currentImageIndex]}
                alt={`${selectedProduct.title} - Imagem ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer touch-none"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onClick={() => setIsFullscreen(true)}
                whileTap={{ cursor: "grabbing" }}
                initial={{ opacity: 0.5, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-4 hover:bg-white transition-all z-10 shadow-md text-slate-600 pointer-events-auto"
              >
                <ChevronRight size={48} />
              </button>

              <div className="absolute bottom-8 bg-slate-900/80 backdrop-blur-md text-white rounded-full px-8 py-3 font-bold tracking-widest text-lg shadow-md pointer-events-none">
                {currentImageIndex + 1} / {selectedProduct.images.length}
              </div>
              
              <div className="absolute top-6 bg-slate-900/60 backdrop-blur-md text-white/90 rounded-full px-6 py-2 text-sm font-medium pointer-events-none flex items-center gap-2">
                Toque para ampliar ou arraste para os lados
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 xl:gap-8 w-full min-h-0">
              
              <div className="bg-white border border-slate-200 rounded-[2rem] xl:rounded-[3rem] p-6 xl:p-10 shadow-sm flex flex-col h-full min-h-0 relative overflow-hidden">
                
                <div className="flex flex-col gap-4 xl:gap-6 flex-1 min-h-0 border-b border-slate-100 pb-4 xl:pb-6">
                  
                  <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-5 xl:p-8 border border-slate-100 flex-none">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-sm xl:text-lg font-bold uppercase">Área Total</span>
                      <span className="text-2xl xl:text-4xl font-black text-slate-800 mt-1">{selectedProduct.area}</span>
                    </div>
                    <div className="h-12 xl:h-16 w-px bg-slate-200"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 text-sm xl:text-lg font-bold uppercase">Dimensões</span>
                      <span className="text-2xl xl:text-4xl font-black text-slate-800 mt-1">{selectedProduct.dimensions}</span>
                    </div>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar pr-4 flex-1 min-h-0">
                    <p className="text-slate-600 font-medium text-lg xl:text-xl 2xl:text-2xl leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                </div>

                <div className="relative flex-[1.2] min-h-0 overflow-hidden pt-2 xl:pt-4">
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8 h-full overflow-y-auto pr-4 pb-20 custom-scrollbar">
                    
                    <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 xl:p-8 flex flex-col h-fit">
                      <h4 className="text-orange-800 font-bold text-lg xl:text-xl 2xl:text-2xl uppercase tracking-wider mb-4 xl:mb-6 flex items-center gap-3">
                        <CheckCircle2 size={28} /> O que acompanha
                      </h4>
                      <ul className="flex flex-col gap-3 xl:gap-4">
                        {selectedProduct.includedItems.map((item, i) => (
                          <li key={i} className="flex gap-4 text-sm xl:text-lg 2xl:text-xl font-medium text-slate-700 items-start">
                            <span className="text-orange-500 font-black mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 xl:p-8 flex flex-col h-fit">
                      <h4 className="text-slate-500 font-bold text-lg xl:text-xl 2xl:text-2xl uppercase tracking-wider mb-4 xl:mb-6 flex items-center gap-3">
                        <XCircle size={28} /> Não acompanha
                      </h4>
                      <ul className="flex flex-col gap-3 xl:gap-4">
                        {selectedProduct.excludedItems.map((item, i) => (
                          <li key={i} className="flex gap-4 text-sm xl:text-lg 2xl:text-xl font-medium text-slate-500 items-start">
                            <span className="text-slate-300 font-black mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-4 h-24 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none flex items-end justify-center pb-2">
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="bg-slate-800 text-white rounded-full px-6 py-2.5 shadow-lg flex items-center gap-2 mb-2 pointer-events-auto"
                    >
                      <span className="text-sm xl:text-base font-bold uppercase tracking-widest">
                        Role para ver mais
                      </span>
                      <ChevronDown size={20} strokeWidth={2.5} />
                    </motion.div>
                  </div>
                </div>

              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLeadModal(true)}
                className="flex-none bg-orange-600 text-white rounded-[2rem] py-6 xl:py-8 text-3xl xl:text-4xl font-bold uppercase shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all w-full"
              >
                Tenho Interesse
              </motion.button>
            </div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col p-6 xl:p-12 select-none overflow-hidden font-sans">
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <header className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-center flex-none w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">
            Catálogo: {catalogType}
          </h1>
          <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
        </div>
        {step === 0 && (
          <button
            onClick={() => navigate("/")}
            className="text-base xl:text-lg font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-6 py-3 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
          >
            Cancelar Operação
          </button>
        )}
      </header>

      <div className="flex-grow relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      {step === 1 && (
        <footer className="mt-8 flex justify-between items-center flex-none w-full relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(0)}
            className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-4 xl:px-12 xl:py-5 text-xl xl:text-2xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-3"
          >
            <ChevronLeft size={32} /> Voltar ao Catálogo
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-white text-slate-500 border border-slate-200 rounded-full px-8 py-4 xl:px-12 xl:py-5 text-xl xl:text-2xl font-bold shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-3"
          >
            Cancelar Operação
          </motion.button>
        </footer>
      )}

      {showLeadModal && (
        <LeadCaptureModal
          onConfirm={submitInterest}
          onCancel={() => setShowLeadModal(false)}
        />
      )}

      <AnimatePresence>
        {isFullscreen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 xl:p-12"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-8 right-8 xl:top-12 xl:right-12 bg-white/10 text-white rounded-full p-4 hover:bg-white/20 transition-all z-50 shadow-lg"
            >
              <X size={40} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }} 
              className="absolute left-8 xl:left-12 bg-white/10 text-white rounded-full p-6 hover:bg-white/20 transition-all z-50 shadow-lg"
            >
              <ChevronLeft size={48} />
            </button>

            <div className="w-full h-full max-w-7xl flex items-center justify-center overflow-hidden">
              <motion.img
                key={`fullscreen-${currentImageIndex}`}
                src={selectedProduct.images[currentImageIndex]}
                alt={`${selectedProduct.title} - Zoom`}
                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing touch-none"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0.5, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }} 
              className="absolute right-8 xl:right-12 bg-white/10 text-white rounded-full p-6 hover:bg-white/20 transition-all z-50 shadow-lg"
            >
              <ChevronRight size={48} />
            </button>

            <div className="absolute bottom-8 xl:bottom-12 bg-slate-800/80 text-white rounded-full px-8 py-3 font-bold tracking-widest text-lg shadow-md pointer-events-none">
              {currentImageIndex + 1} / {selectedProduct.images.length}
            </div>
            
            <div className="absolute top-8 xl:top-12 bg-white/10 backdrop-blur-sm text-white rounded-full px-6 py-2 text-sm font-medium tracking-wide pointer-events-none">
              Arraste para os lados para navegar
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de carregamento durante a geração do PDF */}
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-[150] flex items-center justify-center flex-col"
        >
          <div className="w-20 h-20 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin shadow-md"></div>
          <p className="text-2xl font-bold text-slate-800 mt-8 tracking-tight">Gerando Catálogo...</p>
          <p className="text-slate-500 mt-2">Preparando imagens e especificações técnicas</p>
        </motion.div>
      )}

    </div>
  );
};

export default CatalogFlow;