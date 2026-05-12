import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { KioskService } from './api'; // Ajuste o caminho se necessário

// 1. Utilizamos globalThis ao invés de global (padrão ECMAScript moderno)
globalThis.fetch = vi.fn();

describe('Serviço: KioskService', () => {
  const mockPayload = {
    lead_name: 'João Silva',
    lead_phone: '11999999999',
    tipo: 'Casa 1 pav',
    padrao: 'Alto',
    has_facade: true,
    has_project: false,
    area: 120,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve formatar o payload corretamente e retornar o valor total em caso de sucesso (HTTP 200)', async () => {
    const mockSuccessResponse = { total_value: 245000.50 };
    
    // 2. Substituímos 'any' por 'Mock', que é a tipagem oficial do Vitest
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const result = await KioskService.submitQuote(mockPayload);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockPayload),
      })
    );

    expect(result).toEqual(mockSuccessResponse);
    expect(result.total_value).toBe(245000.50);
  });

  it('deve lançar um erro claro caso o servidor retorne falha (Ex: HTTP 400 ou 500)', async () => {
    // Aplicando a tipagem Mock aqui também
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(KioskService.submitQuote(mockPayload)).rejects.toThrow();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro de rede caso a API esteja offline (Falha no Fetch)', async () => {
    // Aplicando a tipagem Mock aqui também
    (globalThis.fetch as Mock).mockRejectedValueOnce(new Error('Network response was not ok'));

    await expect(KioskService.submitQuote(mockPayload)).rejects.toThrow('Network response was not ok');
  });
});