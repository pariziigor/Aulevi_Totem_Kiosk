import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { LeadCaptureModal } from "../components/LeadCaptureModal";
import { CHALES_DATA, BARRACAO_DATA, type Product } from "../data/products";

const CatalogFlow: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const catalogType = category || "CHALE";

  const products = catalogType === "BARRACAO" ? BARRACAO_DATA : CHALES_DATA;

  const [step, setStep] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
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

  const submitInterest = async (name: string, phone: string) => {
    setShowLeadModal(false);
    console.log(
      `[Lead Capturado] Nome: ${name}, WhatsApp: ${phone}, Interesse: ${selectedProduct?.title}`,
    );

    alert(
      `ATENDIMENTO REGISTRADO!\n\nObrigado, ${name}.\nEm breve você receberá o material completo do ${selectedProduct?.title} no WhatsApp: ${phone}.`,
    );
    navigate("/");
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
                  className="snap-center shrink-0 w-[80%] md:w-[45%] lg:w-[30%] xl:w-[25%] 2xl:w-[22%] max-w-[450px] h-[75%] xl:h-[80%] rounded-[2rem] xl:rounded-[2.5rem] shadow-md border border-slate-200 flex flex-col justify-end p-4 xl:p-6 cursor-pointer hover:shadow-xl hover:border-emerald-300 transition-all bg-white relative overflow-hidden group"
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
          // Removida a trava de max-w para preencher a tela inteira em 100%
          className="flex flex-col w-full h-full min-h-0 gap-6 xl:gap-8"
        >
          {/* Título Maior */}
          <h2 className="text-4xl md:text-6xl 2xl:text-7xl font-bold uppercase tracking-tight text-slate-900 text-center flex-none">
            {selectedProduct.title}
          </h2>

          <div className="flex-grow flex flex-col md:flex-row gap-6 xl:gap-12 2xl:gap-16 min-h-0 w-full">
            
            {/* Seção Esquerda: Imagem Expandida */}
            <div className="flex-[1.3] relative flex items-center justify-center bg-slate-100 rounded-[2rem] xl:rounded-[3rem] overflow-hidden shadow-inner border border-slate-200">
              <button
                onClick={prevImage}
                className="absolute left-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-4 hover:bg-white transition-all z-10 shadow-md text-slate-600"
              >
                <ChevronLeft size={48} />
              </button>

              <img
                src={selectedProduct.images[currentImageIndex]}
                alt={`${selectedProduct.title} - Imagem ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              <button
                onClick={nextImage}
                className="absolute right-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-4 hover:bg-white transition-all z-10 shadow-md text-slate-600"
              >
                <ChevronRight size={48} />
              </button>

              <div className="absolute bottom-8 bg-slate-900/80 backdrop-blur-md text-white rounded-full px-8 py-3 font-bold tracking-widest text-lg shadow-md">
                {currentImageIndex + 1} / {selectedProduct.images.length}
              </div>
            </div>

            {/* Seção Direita: Informações Maximizadas */}
            <div className="flex-1 flex flex-col gap-6 xl:gap-8 w-full">
              
              <div className="bg-white border border-slate-200 rounded-[2rem] xl:rounded-[3rem] p-8 xl:p-12 2xl:p-14 shadow-sm flex flex-col h-full min-h-0 relative">
                
                {/* Cabeçalho de Infos */}
                <div className="flex flex-col gap-6 flex-none border-b border-slate-100 pb-6 mb-6">
                  <div className="flex justify-between items-center bg-slate-50 rounded-2xl p-6 xl:p-8 border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-base xl:text-lg font-bold uppercase">Área Total</span>
                      <span className="text-2xl xl:text-4xl font-black text-slate-800 mt-1">{selectedProduct.area}</span>
                    </div>
                    <div className="h-16 w-px bg-slate-200"></div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 text-base xl:text-lg font-bold uppercase">Dimensões</span>
                      <span className="text-2xl xl:text-4xl font-black text-slate-800 mt-1">{selectedProduct.dimensions}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium text-lg xl:text-xl 2xl:text-2xl leading-relaxed mt-2">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Grid de Incluso / Não Incluso */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 flex-grow min-h-0 overflow-hidden">
                  
                  {/* Bloco: INCLUSO */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 xl:p-8 flex flex-col h-full min-h-0">
                    <h4 className="text-emerald-800 font-bold text-lg xl:text-xl 2xl:text-2xl uppercase tracking-wider mb-6 flex-none flex items-center gap-3">
                      <CheckCircle2 size={28} /> O que acompanha
                    </h4>
                    <ul className="flex flex-col flex-grow justify-evenly overflow-hidden gap-3">
                      {selectedProduct.includedItems.map((item, i) => (
                        <li key={i} className="flex gap-4 text-sm xl:text-lg 2xl:text-xl font-medium text-slate-700 items-start">
                          <span className="text-emerald-500 font-black mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bloco: NÃO INCLUSO */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 xl:p-8 flex flex-col h-full min-h-0">
                    <h4 className="text-slate-500 font-bold text-lg xl:text-xl 2xl:text-2xl uppercase tracking-wider mb-6 flex-none flex items-center gap-3">
                      <XCircle size={28} /> Não acompanha
                    </h4>
                    <ul className="flex flex-col flex-grow justify-evenly overflow-hidden gap-3">
                      {selectedProduct.excludedItems.map((item, i) => (
                        <li key={i} className="flex gap-4 text-sm xl:text-lg 2xl:text-xl font-medium text-slate-500 items-start">
                          <span className="text-slate-300 font-black mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botão Flutuante de Ação Gigante */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLeadModal(true)}
                className="flex-none bg-emerald-600 text-white rounded-[2rem] py-6 xl:py-8 text-3xl xl:text-4xl font-bold uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all w-full"
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
      
      <header className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-center flex-none w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900 uppercase">
            Catálogo: {catalogType}
          </h1>
          <div className="h-1 w-24 bg-blue-500 rounded-full"></div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-base xl:text-lg font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-6 py-3 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
        >
          Cancelar Operação
        </button>
      </header>

      <div className="flex-grow relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      {step === 1 && (
        <footer className="mt-8 flex justify-start flex-none w-full relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(0)}
            className="bg-white text-slate-600 border border-slate-200 rounded-full px-8 py-4 xl:px-12 xl:py-5 text-xl xl:text-2xl font-bold shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-3"
          >
            <ChevronLeft size={32} /> Voltar ao Catálogo
          </motion.button>
        </footer>
      )}

      {showLeadModal && (
        <LeadCaptureModal
          onConfirm={submitInterest}
          onCancel={() => setShowLeadModal(false)}
        />
      )}
    </div>
  );
};

export default CatalogFlow;