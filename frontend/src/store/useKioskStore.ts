import { create } from 'zustand';

interface QuoteData {
  area: string;
  tipo: string;
  padrao: string;
  has_facade: boolean;  // Tipagem estrita
  has_project: boolean; // Tipagem estrita
  has_land?: boolean;
  own_resources?: boolean;
  city?: string;
}

interface KioskState {
  isOffline: boolean;
  sessionActive: boolean;
  quoteData: QuoteData;
  setQuoteData: (data: Partial<QuoteData>) => void;
  resetSession: () => void;
}

const initialQuoteData: QuoteData = {
  area: '',
  tipo: '',
  padrao: '',
  has_facade: false,
  has_project: false,
};

export const useKioskStore = create<KioskState>((set) => ({
  isOffline: true,
  sessionActive: true,
  quoteData: initialQuoteData,
  setQuoteData: (newData) => 
    set((state) => ({ quoteData: { ...state.quoteData, ...newData } })),
  resetSession: () => set({ sessionActive: false, quoteData: initialQuoteData }),
}));