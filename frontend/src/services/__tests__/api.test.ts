import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KioskService } from '../api';

// 1. Criamos um mock da função POST do Axios
const mockPost = vi.hoisted(() => vi.fn());

// 2. Avisamos ao Vitest para usar nosso mock ao invés do Axios real
vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        post: mockPost,
      }),
    },
  };
});

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
    
    // O Axios sempre retorna os dados dentro da chave 'data'
    mockPost.mockResolvedValueOnce({ data: mockSuccessResponse });

    const result = await KioskService.submitQuote(mockPayload);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith('/quotes/', mockPayload);
    expect(result).toEqual(mockSuccessResponse);
    expect(result.total_value).toBe(245000.50);
  });

  it('deve lançar um erro claro caso o servidor retorne falha (Ex: HTTP 400 ou 500)', async () => {
    mockPost.mockRejectedValueOnce(new Error('Internal Server Error'));

    await expect(KioskService.submitQuote(mockPayload)).rejects.toThrow();
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro de rede caso a API esteja offline', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'));

    await expect(KioskService.submitQuote(mockPayload)).rejects.toThrow('Network Error');
  });
});