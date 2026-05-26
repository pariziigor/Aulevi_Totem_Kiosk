import axios from 'axios';

// Usando variável de ambiente, o mesmo código vai funcionar 
// tanto no Totem (localhost) quanto no site dos Vendedores (Nuvem).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 segundos (gerar PDF na nuvem pode demorar alguns segundos a mais)
  headers: {
    'Content-Type': 'application/json',
  },
});

export const KioskService = {
  submitQuote: async (payload: any) => {
    try {
      // 1. Avisamos ao Axios que a resposta será um arquivo (Blob) e não um texto/JSON
      const response = await api.post('/quotes/', payload, {
        responseType: 'blob' 
      });

      // 2. Tentamos extrair o nome exato do arquivo que o FastAPI gerou no backend
      let filename = 'Orcamento_Aulevi.pdf';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches != null && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }

      // 3. Criamos uma URL temporária na memória do navegador com os bytes do PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      // 4. Criamos uma âncora <a> invisível, clicamos nela para forçar o download e a apagamos
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // 5. Limpeza de memória do navegador para não deixar o Totem lento com o tempo
      link.remove();
      window.URL.revokeObjectURL(url);

      // Como o backend não devolve mais os dados em JSON, retornamos um status de sucesso
      return { success: true };

    } catch (error) {
      console.error("Erro na comunicação com o motor de orçamentos:", error);
      throw error;
    }
  }
};