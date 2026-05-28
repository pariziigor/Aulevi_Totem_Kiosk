import React from "react";
import { motion, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { type Product } from "../../data/products";

interface ProductDetailsProps {
  product: Product;
  currentImageIndex: number;
  onNextImage: () => void;
  onPrevImage: () => void;
  onOpenFullscreen: () => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
  onInterestClick: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  currentImageIndex,
  onNextImage,
  onPrevImage,
  onOpenFullscreen,
  onDragEnd,
  onInterestClick,
}) => {
  return (
    <div className="flex flex-col w-full h-auto lg:h-full lg:min-h-0 gap-4 md:gap-6 xl:gap-8">
      <h2 className="text-3xl md:text-4xl lg:text-6xl 2xl:text-7xl font-bold uppercase tracking-tight text-slate-900 text-center flex-none">
        {product.title}
      </h2>

      <div className="flex-grow flex flex-col lg:flex-row gap-6 xl:gap-12 2xl:gap-16 lg:min-h-0 w-full">
        {/* Image Section */}
        <div className="relative flex items-center justify-center bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] xl:rounded-[3rem] overflow-hidden shadow-inner border border-slate-200 w-full h-[40vh] md:h-[50vh] lg:h-auto lg:flex-[1.3]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevImage();
            }}
            className="absolute left-2 md:left-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-2 md:p-4 hover:bg-white transition-all z-10 shadow-md text-slate-600 pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 xl:w-12 xl:h-12" />
          </button>

          <motion.img
            key={currentImageIndex}
            src={product.images[currentImageIndex]}
            alt={`${product.title} - Imagem ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer touch-none"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            onClick={onOpenFullscreen}
            whileTap={{ cursor: "grabbing" }}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextImage();
            }}
            className="absolute right-2 md:right-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-2 md:p-4 hover:bg-white transition-all z-10 shadow-md text-slate-600 pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 xl:w-12 xl:h-12" />
          </button>

          <div className="absolute bottom-4 md:bottom-8 bg-slate-900/80 backdrop-blur-md text-white rounded-full px-4 py-2 md:px-8 md:py-3 font-bold tracking-widest text-sm md:text-lg shadow-md pointer-events-none">
            {currentImageIndex + 1} / {product.images.length}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-8 w-full h-auto lg:min-h-0">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] xl:rounded-[3rem] p-4 md:p-6 xl:p-10 shadow-sm flex flex-col h-auto lg:h-full lg:min-h-0 relative overflow-hidden">
            <div className="flex flex-col gap-4 xl:gap-6 flex-1 h-auto lg:min-h-0 border-b border-slate-100 pb-4 xl:pb-6">
              {/* Dimensions */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 rounded-2xl p-4 md:p-5 xl:p-8 border border-slate-100 gap-4 md:gap-0 flex-none text-center md:text-left">
                <div className="flex flex-col w-full md:w-auto">
                  <span className="text-slate-400 text-xs md:text-sm xl:text-lg font-bold uppercase">
                    Área Total
                  </span>
                  <span className="text-xl md:text-2xl xl:text-4xl font-black text-slate-800 mt-1">
                    {product.area}
                  </span>
                </div>
                <div className="hidden md:block h-12 xl:h-16 w-px bg-slate-200"></div>
                <div className="w-full h-px bg-slate-200 md:hidden"></div>
                <div className="flex flex-col w-full md:w-auto md:text-right text-center">
                  <span className="text-slate-400 text-xs md:text-sm xl:text-lg font-bold uppercase">
                    Dimensões
                  </span>
                  <span className="text-xl md:text-2xl xl:text-4xl font-black text-slate-800 mt-1">
                    {product.dimensions}
                  </span>
                </div>
              </div>

              <div className="lg:overflow-y-auto lg:custom-scrollbar lg:pr-4 h-auto lg:flex-1 lg:min-h-0">
                <p className="text-slate-600 font-medium text-base md:text-lg xl:text-xl 2xl:text-2xl leading-relaxed text-justify md:text-left">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Included/Excluded Items */}
            <div className="relative h-auto lg:flex-[1.2] lg:min-h-0 lg:overflow-hidden pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-8 h-auto lg:h-full lg:overflow-y-auto lg:pr-4 lg:pb-20 lg:custom-scrollbar">
                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 md:p-6 xl:p-8 flex flex-col h-fit">
                  <h4 className="text-orange-800 font-bold text-base md:text-lg xl:text-xl 2xl:text-2xl uppercase tracking-wider mb-4 xl:mb-6 flex items-center gap-2 md:gap-3">
                    <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" /> O que
                    acompanha
                  </h4>
                  <ul className="flex flex-col gap-2 md:gap-3 xl:gap-4">
                    {product.includedItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm md:text-base xl:text-lg 2xl:text-xl font-medium text-slate-700 items-start"
                      >
                        <span className="text-orange-500 font-black mt-1">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 xl:p-8 flex flex-col h-fit">
                  <h4 className="text-slate-500 font-bold text-base md:text-lg xl:text-xl 2xl:text-2xl uppercase tracking-wider mb-4 xl:mb-6 flex items-center gap-2 md:gap-3">
                    <XCircle className="w-6 h-6 md:w-7 md:h-7" /> Não acompanha
                  </h4>
                  <ul className="flex flex-col gap-2 md:gap-3 xl:gap-4">
                    {product.excludedItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm md:text-base xl:text-lg 2xl:text-xl font-medium text-slate-500 items-start"
                      >
                        <span className="text-slate-300 font-black mt-1">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="hidden lg:flex absolute bottom-0 left-0 right-4 h-24 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none items-end justify-center pb-2">
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
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
            type="button"
            onClick={onInterestClick}
            className="flex-none bg-orange-600 text-white rounded-full lg:rounded-[2rem] py-5 md:py-6 xl:py-8 text-2xl md:text-3xl xl:text-4xl font-bold uppercase shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all w-full mt-2 lg:mt-0"
          >
            Tenho Interesse
          </motion.button>
        </div>
      </div>
    </div>
  );
};
