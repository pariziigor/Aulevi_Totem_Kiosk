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
    <div className="flex flex-col w-full flex-1 min-h-0">
      <div className="flex-1 relative flex items-stretch justify-center w-full mx-auto py-4 md:py-6 lg:py-0 min-h-0">
        <button
          onClick={() => onScroll('left')}
          className="absolute left-2 lg:left-6 z-10 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full p-3 lg:p-3 hover:bg-white hover:shadow-md transition-all hidden md:flex shadow-sm"
        >
          <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={1.5} />
        </button>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory w-full gap-4 md:gap-6 lg:gap-8 pb-4 md:pb-6 lg:pb-0 px-4 md:px-16 lg:px-24 items-center lg:items-stretch hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((prod) => (
            <motion.div
              key={prod.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectProduct(prod)}
              className="snap-center shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[31%] xl:w-[24%] 2xl:w-[22%] max-w-[430px] lg:max-w-none h-[60vh] md:h-[62vh] lg:h-auto lg:min-h-0 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2rem] shadow-md border border-slate-200 flex flex-col justify-end p-4 lg:p-5 cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all bg-white relative overflow-hidden group"
            >
              <img
                src={prod.images[0]}
                alt={prod.title}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

              <div className="relative z-10 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-3 md:p-4 lg:p-4 text-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                <h2 className="text-lg md:text-xl lg:text-xl 2xl:text-2xl font-bold tracking-tight text-slate-800 uppercase leading-none">
                  {prod.title}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => onScroll('right')}
          className="absolute right-2 lg:right-6 z-10 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full p-3 lg:p-3 hover:bg-white hover:shadow-md transition-all hidden md:flex shadow-sm"
        >
          <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" strokeWidth={1.5} />
        </button>
      </div>

      <div className="text-center mt-2 mb-4 lg:mb-0 flex-none">
        <span className="text-xs md:text-base lg:text-lg font-bold uppercase tracking-widest text-slate-400 animate-pulse px-4 block">
          Arraste para os lados e toque no modelo desejado
        </span>
      </div>
    </div>
  );
};
