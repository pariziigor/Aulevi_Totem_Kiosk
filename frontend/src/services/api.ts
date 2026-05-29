import axios from 'axios';

// TESTE TESTE TESTE
// Usando variável de ambiente, o mesmo código vai funcionar 
// tanto no Totem (localhost) quanto no site dos Vendedores (Nuvem).
const DEFAULT_API_URL = 'https://pi-aulevi-totem.onrender.com';
const rawApiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');
const BASE_URL = normalizedApiUrl.endsWith('/api/v1')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api/v1`;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 180000, // 60 segundos (gerar PDF na nuvem pode demorar alguns segundos a mais)
  headers: {
    'Content-Type': 'application/json',
  },
});

export const KioskService = {
  submitQuote: async (payload: Record<string, unknown>) => {
    try {
      // 1. Verifica a origem na URL (retorna estritamente um booleano nativo)
      const isTotem = new URLSearchParams(window.location.search).get("origem") === "totem";
      
      // Injeta a flag no payload antes de enviar para o backend
      payload.is_totem = isTotem;

      // Se for totem, espera JSON. Se não, espera o arquivo (blob)
      const response = await api.post('/quotes/', payload, {
        responseType: isTotem ? 'json' : 'blob' 
      });

      // Fluxo do Totem (Quiosque Público)
      if (isTotem) {
        console.log("Acesso via Totem detectado. Download bloqueado, WhatsApp disparado.");
        // Não fazemos o download, apenas informamos o sucesso
        return { success: true, message: response.data?.message || "Orçamento enviado!" };
      }

      // Fluxo de Acesso Pessoal (Celular/Desktop)
      let filename = 'Orcamento_Aulevi.pdf';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches != null && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };

    } catch (error) {
      console.error("Erro na comunicação com o motor de orçamentos:", error);
      throw error;
    }
  }
};
