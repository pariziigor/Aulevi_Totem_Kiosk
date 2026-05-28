import { useState, useRef } from 'react';
import { type PanInfo } from 'framer-motion';
import { type Product } from '../data/products';

export const useImageCarousel = (product: Product | null) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    { offset }: PanInfo
  ) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold) {
      nextImage();
    } else if (offset.x > swipeThreshold) {
      prevImage();
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.5;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return {
    currentImageIndex,
    isFullscreen,
    setIsFullscreen,
    carouselRef,
    nextImage,
    prevImage,
    handleDragEnd,
    handleScroll
  };
};
