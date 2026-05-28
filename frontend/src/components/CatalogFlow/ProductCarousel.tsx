import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Product } from '../../data/products';

interface ProductCarouselProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onScroll: (direction: 'left' | 'right') => void;
  carouselRef: React.RefObject<HTMLDivElement | null>;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  onSelectProduct,
  onScroll,
  carouselRef
}) => {
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex-grow relative flex items-center justify-center min-h-0 w-full max-w-[1800px] mx-auto py-4">
        <button
          onClick={() => onScroll('left')}
          className="absolute left-2 xl:left-8 z-10 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full p-3 xl:p-4 hover:bg-white hover:shadow-md transition-all hidden md:flex shadow-sm"
        >
          <ChevronLeft className="w-8 h-8 xl:w-12 xl:h-12" strokeWidth={1.5} />
        </button>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory h-full w-full gap-4 md:gap-6 xl:gap-8 pb-4 md:pb-8 px-4 md:px-32 items-center hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((prod) => (
            <motion.div
              key={prod.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectProduct(prod)}
              className="snap-center shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[30%] xl:w-[25%] 2xl:w-[22%] max-w-[450px] h-[60vh] md:h-[75%] xl:h-[80%] rounded-[1.5rem] md:rounded-[2rem] xl:rounded-[2.5rem] shadow-md border border-slate-200 flex flex-col justify-end p-4 xl:p-6 cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all bg-white relative overflow-hidden group"
            >
              <img
                src={prod.images[0]}
                alt={prod.title}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

              <div className="relative z-10 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-3 md:p-4 xl:p-5 text-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                <h2 className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-800 uppercase leading-none">
                  {prod.title}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => onScroll('right')}
          className="absolute right-2 xl:right-8 z-10 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full p-3 xl:p-4 hover:bg-white hover:shadow-md transition-all hidden md:flex shadow-sm"
        >
          <ChevronRight className="w-8 h-8 xl:w-12 xl:h-12" strokeWidth={1.5} />
        </button>
      </div>

      <div className="text-center mt-2 mb-4 flex-none">
        <span className="text-xs md:text-base xl:text-xl font-bold uppercase tracking-widest text-slate-400 animate-pulse px-4 block">
          Arraste para os lados e toque no modelo desejado
        </span>
      </div>
    </div>
  );
};
