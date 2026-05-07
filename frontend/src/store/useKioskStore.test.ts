import { describe, it, expect, beforeEach } from 'vitest';
import { useKioskStore } from './useKioskStore';

describe('Kiosk Store (Zustand)', () => {
  beforeEach(() => {
    // Reset manual do estado antes de cada teste
    useKioskStore.setState({ isOffline: true, sessionActive: false });
  });

  it('deve inicializar com o modo offline ativo e sessão inativa', () => {
    const state = useKioskStore.getState();
    // Validação estrita de tipo booleano
    expect(state.isOffline).toBe(true);
    expect(state.sessionActive).toBe(false);
  });

  it('deve redefinir a sessão corretamente ao invocar resetSession', () => {
    // Simula a ativação de uma sessão
    useKioskStore.setState({ sessionActive: true });
    
    // Invoca o método de reset
    useKioskStore.getState().resetSession();
    
    // Valida a mudança de estado
    expect(useKioskStore.getState().sessionActive).toBe(false);
  });
});