import { describe, it, expect, beforeEach } from 'vitest';
import { useKioskStore } from './useKioskStore';
import { renderHook, act } from '@testing-library/react';

describe('Store: useKioskStore', () => {
  // Configuração inicial para garantir isolamento entre os testes
  beforeEach(() => {
    const { result } = renderHook(() => useKioskStore());
    act(() => {
      result.current.resetSession();
    });
  });

  it('deve inicializar com o estado padrão vazio e tipos nativos corretos', () => {
    const { result } = renderHook(() => useKioskStore());

    expect(result.current.quoteData).toEqual({
      area: '',
      tipo: '',
      padrao: '',
      has_facade: false,
      has_project: false,
    });
  });

  it('deve atualizar os parâmetros do orçamento parcialmente preservando o estado anterior', () => {
    const { result } = renderHook(() => useKioskStore());

    act(() => {
      result.current.setQuoteData({ area: '120', tipo: 'Casa 2 pav' });
    });

    expect(result.current.quoteData.area).toBe('120');
    expect(result.current.quoteData.tipo).toBe('Casa 2 pav');
    
    // Validação de que os campos booleanos nativos permaneceram inalterados
    expect(result.current.quoteData.has_facade).toBe(false);
    expect(result.current.quoteData.padrao).toBe('');
  });

  it('deve atualizar variáveis booleanas como tipos nativos', () => {
    const { result } = renderHook(() => useKioskStore());

    act(() => {
      result.current.setQuoteData({ has_facade: true, has_project: true });
    });

    expect(result.current.quoteData.has_facade).toBe(true);
    expect(typeof result.current.quoteData.has_facade).toBe('boolean');
    expect(result.current.quoteData.has_project).toBe(true);
    expect(typeof result.current.quoteData.has_project).toBe('boolean');
  });

  it('deve limpar a sessão completamente e retornar ao estado inicial ao executar resetSession', () => {
    const { result } = renderHook(() => useKioskStore());

    // 1. Modifica o estado com dados simulados
    act(() => {
      result.current.setQuoteData({
        area: '500',
        tipo: 'Galpão',
        padrao: 'Alto',
        has_facade: true,
        has_project: false
      });
    });

    // Confirma a alteração
    expect(result.current.quoteData.area).toBe('500');
    expect(result.current.quoteData.has_facade).toBe(true);

    // 2. Executa a função de limpeza
    act(() => {
      result.current.resetSession();
    });

    // 3. Valida a redefinição estrutural
    expect(result.current.quoteData).toEqual({
      area: '',
      tipo: '',
      padrao: '',
      has_facade: false,
      has_project: false,
    });
  });
});