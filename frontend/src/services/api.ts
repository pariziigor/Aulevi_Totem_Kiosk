import axios from 'axios';

// Em ambiente de Kiosk, o backend e o frontend rodam na mesma máquina (localhost)
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000, // 10 segundos de limite para operações críticas locais
  headers: {
    'Content-Type': 'application/json',
  },
});

export const KioskService = {
  submitQuote: async (payload: any) => {
    try {
      const response = await api.post('/quotes/', payload);
      return response.data;
    } catch (error) {
      console.error("Erro na comunicação com o motor de orçamentos local:", error);
      throw error;
    }
  }
};