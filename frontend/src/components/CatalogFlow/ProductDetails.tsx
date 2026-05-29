import React from "react";
import { motion, type PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
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
    <div className="flex flex-col w-full h-auto gap-4 md:gap-5 lg:gap-6">
      <h2 className="text-3xl md:text-4xl lg:text-[clamp(2.5rem,4.5vw,4.75rem)] font-bold uppercase tracking-tight text-slate-900 text-center flex-none">
        {product.title}
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 2xl:gap-10 w-full">
        {/* Image Section */}
        <div className="relative flex items-center justify-center bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2rem] overflow-hidden shadow-inner border border-slate-200 w-full h-[40vh] md:h-[50vh] lg:h-[520px] lg:flex-[1.25]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevImage();
            }}
            className="absolute left-2 md:left-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-2 md:p-3 hover:bg-white transition-all z-10 shadow-md text-slate-600 pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9" />
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
            className="absolute right-2 md:right-6 bg-white/80 backdrop-blur border border-slate-200 rounded-full p-2 md:p-3 hover:bg-white transition-all z-10 shadow-md text-slate-600 pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 lg:w-9 lg:h-9" />
          </button>

          <div className="absolute bottom-4 md:bottom-8 bg-slate-900/80 backdrop-blur-md text-white rounded-full px-4 py-2 md:px-8 md:py-3 font-bold tracking-widest text-sm md:text-lg shadow-md pointer-events-none">
            {currentImageIndex + 1} / {product.images.length}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-6 w-full h-auto">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2rem] p-4 md:p-6 lg:p-6 shadow-sm flex flex-col h-auto lg:h-[520px] relative overflow-hidden">
            <div className="flex flex-col gap-4 lg:gap-4 flex-1 min-h-0 border-b border-slate-100 pb-4">
              {/* Dimensions */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 rounded-2xl p-4 md:p-5 lg:p-5 border border-slate-100 gap-4 md:gap-0 flex-none text-center md:text-left">
                <div className="flex flex-col w-full md:w-auto">
                  <span className="text-slate-400 text-xs md:text-sm lg:text-base font-bold uppercase">
                    Área Total
                  </span>
                  <span className="text-xl md:text-2xl lg:text-2xl font-black text-slate-800 mt-1">
                    {product.area}
                  </span>
                </div>
                <div className="hidden md:block h-12 w-px bg-slate-200"></div>
                <div className="w-full h-px bg-slate-200 md:hidden"></div>
                <div className="flex flex-col w-full md:w-auto md:text-right text-center">
                  <span className="text-slate-400 text-xs md:text-sm lg:text-base font-bold uppercase">
                    Dimensões
                  </span>
                  <span className="text-xl md:text-2xl lg:text-2xl font-black text-slate-800 mt-1">
                    {product.dimensions}
                  </span>
                </div>
              </div>

              <div className="lg:overflow-y-auto lg:custom-scrollbar lg:pr-3 h-auto lg:flex-1 lg:min-h-0">
                <p className="text-slate-600 font-medium text-base md:text-lg lg:text-base 2xl:text-lg leading-relaxed text-justify md:text-left">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Included/Excluded Items */}
            <div className="relative h-auto lg:flex-[1.2] lg:min-h-0 lg:overflow-hidden pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 h-auto lg:h-full lg:overflow-y-auto lg:pr-3 lg:pb-4 lg:custom-scrollbar">
                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 md:p-6 lg:p-5 flex flex-col h-fit">
                  <h4 className="text-orange-800 font-bold text-base md:text-lg lg:text-base 2xl:text-lg uppercase tracking-wider mb-4 flex items-center gap-2 md:gap-3">
                    <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" /> O que
                    acompanha
                  </h4>
                  <ul className="flex flex-col gap-2 md:gap-3 xl:gap-4">
                    {product.includedItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm md:text-base lg:text-sm 2xl:text-base font-medium text-slate-700 items-start"
                      >
                        <span className="text-orange-500 font-black mt-1">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 lg:p-5 flex flex-col h-fit">
                  <h4 className="text-slate-500 font-bold text-base md:text-lg lg:text-base 2xl:text-lg uppercase tracking-wider mb-4 flex items-center gap-2 md:gap-3">
                    <XCircle className="w-6 h-6 md:w-7 md:h-7" /> Não acompanha
                  </h4>
                  <ul className="flex flex-col gap-2 md:gap-3 xl:gap-4">
                    {product.excludedItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm md:text-base lg:text-sm 2xl:text-base font-medium text-slate-500 items-start"
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

            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onInterestClick}
            className="flex-none bg-orange-600 text-white rounded-full lg:rounded-[1.5rem] py-5 md:py-6 lg:py-5 text-2xl md:text-3xl lg:text-2xl font-bold uppercase shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all w-full mt-2 lg:mt-0"
          >
            Tenho Interesse
          </motion.button>
        </div>
      </div>
    </div>
  );
};
