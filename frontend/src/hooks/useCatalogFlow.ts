import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Product, CHALES_DATA, BARRACAO_DATA } from '../data/products';

export const useCatalogFlow = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const catalogType = category || 'CHALE';

  const products = catalogType === 'BARRACAO' ? BARRACAO_DATA : CHALES_DATA;

  const [step, setStep] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGallery = () => {
    setStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    navigate('/');
  };

  return {
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
  };
};
