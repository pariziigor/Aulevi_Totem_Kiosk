import React from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type Product } from "../../data/products";

interface FullscreenImageViewerProps {
  product: Product;
  currentImageIndex: number;
  onNextImage: () => void;
  onPrevImage: () => void;
  onClose: () => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  product,
  currentImageIndex,
  onNextImage,
  onPrevImage,
  onClose,
  onDragEnd,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 md:p-4 xl:p-12"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 xl:top-12 xl:right-12 bg-white/10 text-white rounded-full p-2 md:p-4 hover:bg-white/20 transition-all z-50 shadow-lg"
      >
        <X className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrevImage();
        }}
        className="absolute left-2 md:left-8 xl:left-12 bg-white/10 text-white rounded-full p-3 md:p-6 hover:bg-white/20 transition-all z-50 shadow-lg"
      >
        <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
      </button>

      <div className="w-full h-full max-w-7xl flex items-center justify-center overflow-hidden">
        <motion.img
          key={`fullscreen-${currentImageIndex}`}
          src={product.images[currentImageIndex]}
          alt={`${product.title} - Zoom`}
          className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing touch-none"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNextImage();
        }}
        className="absolute right-2 md:right-8 xl:right-12 bg-white/10 text-white rounded-full p-3 md:p-6 hover:bg-white/20 transition-all z-50 shadow-lg"
      >
        <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
      </button>

      <div className="absolute bottom-4 md:bottom-8 xl:bottom-12 bg-slate-800/80 text-white rounded-full px-6 py-2 md:px-8 md:py-3 font-bold tracking-widest text-sm md:text-lg shadow-md pointer-events-none">
        {currentImageIndex + 1} / {product.images.length}
      </div>
    </motion.div>
  );
};
