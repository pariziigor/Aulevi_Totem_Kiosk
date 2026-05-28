interface IBGEMunicipio {
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla: string;
      };
    };
  };
}

const IBGE_API_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?ordenacao=nome";

const FALLBACK_CITIES = [
  "São Paulo - SP",
  "Rio de Janeiro - RJ",
  "Belo Horizonte - MG",
  "Curitiba - PR"
];

export const IBGEService = {
  async fetchCities(): Promise<string[]> {
    try {
      const response = await fetch(IBGE_API_URL);
      if (!response.ok) throw new Error("Falha ao buscar cidades");
      
      const data: IBGEMunicipio[] = await response.json();
      
      return data.map(item => {
        const uf = item.microrregiao?.mesorregiao?.UF?.sigla;
        return uf ? `${item.nome} - ${uf}` : item.nome;
      });
    } catch (error) {
      console.error("Erro ao carregar lista de cidades do IBGE:", error);
      return FALLBACK_CITIES;
    }
  }
};
