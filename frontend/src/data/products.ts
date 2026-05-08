export type Product = {
  id: string;
  title: string;
  description: string;
  images: string[];
};

export const CHALES_DATA: Product[] = [
  {
    id: "ch-01",
    title: "Mini Chalé 31,2 m²",
    description:
      "Design clássico com telhado em A. Área total de 45m², incluindo mezanino e deck frontal em madeira tratada.",
    images: [
      "/assets/chales/ch-01-1.jpg",
      "/assets/chales/ch-01-2.jpg",
      "/assets/chales/ch-01-3.jpg",
      "/assets/chales/ch-01-4.jpg"
    ],
  },
  {
    id: "ch-02",
    title: "Cabana 50m² - 2 Quartos",
    description:
      "Estética brutalista com esquadrias amplas. Planta livre de 60m², pé direito duplo e integração total entre ambientes.",
    images: [
      "/assets/chales/ch-02-1.jpeg",
      "/assets/chales/ch-02-2.jpeg",
      "/assets/chales/ch-02-3.jpeg",
      "/assets/chales/ch-02-4.jpeg"
    ],
  },
  {
    id: "ch-03",
    title: "Cabana 50m² - 1 Quarto",
    description:
      "Linhas retas e minimalistas. Estrutura em Steel Frame com acabamento em alto padrão. 2 dormitórios e área gourmet.",
    images: [
      "/assets/chales/ch-03-1.jpeg",
      "/assets/chales/ch-03-2.jpeg",
      "/assets/chales/ch-03-3.jpeg",
      "/assets/chales/ch-03-4.jpeg"
    ],
  },
  {
    id: "ch-04",
    title: "Bangalô 24m² com Lage Seca",
    description:
      "Modelo sustentável de rápida montagem. 38m² otimizados para conforto térmico e acústico. Perfeito para ecoturismo.",
    images: [
      "/assets/chales/ch-04-1.jpeg",
      "/assets/chales/ch-04-2.jpeg",
      "/assets/chales/ch-04-3.jpeg",
      "/assets/chales/ch-04-4.jpeg"
    ],
  },
  {
    id: "ch-05",
    title: "Bangalô 24m²",
    description:
      "Conforto residencial em 85m². Suíte master, cozinha americana e varanda perimetral. Solução para moradia permanente.",
    images: [
      "/assets/chales/ch-05-1.jpeg",
      "/assets/chales/ch-05-2.jpeg",
      "/assets/chales/ch-05-3.jpeg",
      "/assets/chales/ch-05-4.jpeg"
    ],
  },
];

export const BARRACAO_DATA: Product[] = [
  {
    id: "b-01",
    title: "BARRACÃO LOGÍSTICO 200M²",
    description:
      "Pé direito de 6 metros. Vão livre otimizado para paletização e manobra de empilhadeiras.",
    images: [
      "/assets/chales/foto1.jpg", 
      "/assets/chales/foto2.jpg"
    ],
  },
];