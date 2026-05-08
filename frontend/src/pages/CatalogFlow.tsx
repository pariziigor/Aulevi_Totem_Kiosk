import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
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
      animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
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
          <div className="flex-grow relative flex items-center min-h-0">
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 z-10 bg-white border-8 border-black p-4 active:bg-black active:text-white hidden md:block"
            >
              <ChevronLeft size={64} />
            </button>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory h-full w-full gap-12 pb-8 px-24 items-center hide-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {products.map((prod) => (
                <motion.div
                  key={prod.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectProduct(prod)}
                  className="snap-center shrink-0 w-3/4 max-w-2xl h-[80%] border-16 border-black flex flex-col justify-end p-8 cursor-pointer hover:bg-gray-100 transition-colors bg-white relative"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <h2 className="text-4xl md:text-5xl font-black uppercase z-10 bg-white border-8 border-black p-4 text-center">
                    {prod.title}
                  </h2>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 z-10 bg-white border-8 border-black p-4 active:bg-black active:text-white hidden md:block"
            >
              <ChevronRight size={64} />
            </button>
          </div>
          <div className="text-center mt-4">
            <p className="text-2xl font-bold uppercase">
              Arraste para os lados para ver as opções e toque no produto
              desejado
            </p>
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
          className="flex flex-col w-full h-full min-h-0 gap-6"
        >
          <h2 className="text-4xl md:text-5xl font-black uppercase text-center border-b-8 border-black pb-4 flex-none">
            {selectedProduct.title}
          </h2>

          <div className="flex-grow flex flex-col md:flex-row gap-8 min-h-0">
            <div className="flex-1 border-8 border-black relative flex items-center justify-center bg-gray-100">
              <button
                onClick={prevImage}
                className="absolute left-4 border-8 border-black bg-white p-2 active:bg-black active:text-white z-10"
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
                className="absolute right-4 border-8 border-black bg-white p-2 active:bg-black active:text-white z-10"
              >
                <ChevronRight size={48} />
              </button>

              <div className="absolute bottom-4 bg-white border-4 border-black px-4 py-2 font-bold uppercase">
                {currentImageIndex + 1} / {selectedProduct.images.length}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-8">
              <div className="flex-grow border-8 border-black p-4 xl:p-8 font-bold uppercase overflow-hidden flex flex-col justify-between h-full">
                {/* Agrupamento Superior: Cabeçalho e Descrição (flex-none para não esmagar) */}
                <div className="flex flex-col gap-4 xl:gap-8 flex-none">
                  {/* Cabeçalho Escalonável */}
                  <div className="flex justify-between border-b-4 xl:border-b-8 border-black pb-3 xl:pb-6 text-xl xl:text-3xl 2xl:text-4xl font-black">
                    <span>ÁREA: {selectedProduct.area}</span>
                    <span>DIMENSÃO: {selectedProduct.dimensions}</span>
                  </div>

                  {/* Descrição Escalonável */}
                  <p className="text-gray-800 leading-snug text-sm xl:text-lg 2xl:text-2xl">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Agrupamento Inferior: Grid Flexível que absorve o resto da tela */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8 mt-6 xl:mt-10 flex-grow min-h-0">
                  {/* Bloco: INCLUSO */}
                  <div className="border-4 xl:border-8 border-black p-4 xl:p-6 flex flex-col h-full min-h-0">
                    <h4 className="bg-black text-white p-3 xl:p-5 mb-4 xl:mb-6 font-black text-base xl:text-2xl 2xl:text-3xl text-center uppercase tracking-widest flex-none">
                      [ O QUE ACOMPANHA ]
                    </h4>
                    {/* justify-evenly espalha as linhas verticalmente para ocupar 100% do espaço */}
                    <ul className="flex flex-col flex-grow justify-evenly overflow-hidden">
                      {selectedProduct.includedItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 xl:gap-5 text-xs xl:text-base 2xl:text-xl leading-tight items-center"
                        >
                          <span className="font-black text-lg xl:text-3xl mt-[-2px] xl:mt-[-4px]">
                            +
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bloco: NÃO INCLUSO */}
                  <div className="border-4 xl:border-8 border-gray-400 p-4 xl:p-6 flex flex-col text-gray-500 h-full min-h-0">
                    <h4 className="bg-gray-200 text-black p-3 xl:p-5 mb-4 xl:mb-6 font-black text-base xl:text-2xl 2xl:text-3xl text-center uppercase tracking-widest border-b-4 xl:border-b-8 border-gray-400 flex-none">
                      [ NÃO ACOMPANHA ]
                    </h4>
                    <ul className="flex flex-col flex-grow justify-evenly overflow-hidden">
                      {selectedProduct.excludedItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 xl:gap-5 text-xs xl:text-base 2xl:text-xl leading-tight items-center"
                        >
                          <span className="font-black text-lg xl:text-3xl mt-[-2px] xl:mt-[-4px]">
                            -
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLeadModal(true)}
                className="flex-none bg-black text-white border-8 border-black py-6 text-3xl font-black uppercase hover:opacity-90"
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
    <div className="h-screen w-screen bg-white text-black flex flex-col p-8 select-none overflow-hidden">
      <header className="border-b-8 border-black pb-4 mb-4 flex justify-between items-end flex-none">
        <h1 className="text-4xl font-black tracking-tighter uppercase">
          Módulo {catalogType}
        </h1>
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold uppercase border-4 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Cancelar Operação
        </button>
      </header>

      <div className="flex-grow relative w-full h-full min-h-0">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      {step === 1 && (
        <footer className="mt-4 border-t-8 border-black pt-4 flex-none">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(0)}
            className="border-8 border-black px-8 py-3 text-xl font-black uppercase"
          >
            ← Voltar ao Catálogo
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
