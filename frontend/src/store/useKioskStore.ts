// frontend/src/store/useKioskStore.ts
import { create } from 'zustand';

interface KioskState {
  isOffline: boolean; // Obrigatório: true ou false nativos
  sessionActive: boolean; // Obrigatório: true ou false nativos
  resetSession: () => void;
}

export const useKioskStore = create<KioskState>((set) => ({
  isOffline: true,
  sessionActive: false,
  resetSession: () => set({ sessionActive: false }),
}));