export type Product = {
  id: string;
  title: string;
  area: string;
  dimensions: string;
  description: string;
  includedItems: string[];
  excludedItems: string[];
  images: string[];
};

export const CHALES_DATA: Product[] = [
  {
    id: "ch-01",
    title: "Mini Chalé 31,2 m²",
    area: "31,2 m²",
    dimensions: "4 x 7,8 metros",
    description: "Kit de Cabana em Steel Frame, com 31,2 m² sendo 4 x 7,8. É ideal para quem busca um modelo para faturar com hospedagem no Airbnb ou lazer! Se você tem um pouco de habilidade com ferramentas, consegue apertar uns parafusos e ler um manual, consegue construir de forma simples e rápida com nosso Kit.",
    includedItems: [
      "Projeto Arquitetônico",
      "Projeto Hidráulico",
      "Projeto Elétrico",
      "Projeto Estrutural Steel Frame",
      "Manual de Montagem Passo a Passo",
      "Estrutura em Aço Galvanizado Steel Frame",
      "Parafusos para Montagem"
    ],
    excludedItems: [
      "Telhas",
      "Fechamentos de Paredes",
      "Materiais de Fundação (Concreto)",
      "Mão de Obra",
      "Material Hidráulico",
      "Material Elétrico",
      "Esquadrias",
      "Pisos e Revestimentos",
      "Material de Pintura",
      "Impermeabilização"
    ],
    images: [
      "/assets/chales/ch-01-1.jpg",
      "/assets/chales/ch-01-2.jpg",
      "/assets/chales/ch-01-3.jpg",
      "/assets/chales/ch-01-4.jpg"
    ]
  },
  // Estrutura base para os demais chalés (preencha os arrays conforme a necessidade)
  {
    id: "ch-02",
    title: "Cabana 50m² - 2 Quartos",
    area: "50 m²",
    dimensions: "A definir",
    description: "Estética brutalista com esquadrias amplas. Planta livre de 60m², pé direito duplo e integração total entre ambientes.",
    includedItems: ["Estrutura Steel Frame", "Projetos Básicos"],
    excludedItems: ["Mão de Obra", "Acabamentos"],
    images: ["/assets/chales/ch-02-1.jpeg", "/assets/chales/ch-02-2.jpeg", "/assets/chales/ch-02-3.jpeg", "/assets/chales/ch-02-4.jpeg"]
  },
  {
    id: "ch-03",
    title: "Cabana 50m² - 1 Quarto",
    area: "50 m²",
    dimensions: "A definir",
    description: "Linhas retas e minimalistas. Estrutura em Steel Frame com acabamento em alto padrão. 2 dormitórios e área gourmet.",
    includedItems: ["Estrutura Steel Frame"],
    excludedItems: ["Mão de Obra"],
    images: ["/assets/chales/ch-03-1.jpeg", "/assets/chales/ch-03-2.jpeg", "/assets/chales/ch-03-3.jpeg", "/assets/chales/ch-03-4.jpeg"]
  },
  {
    id: "ch-04",
    title: "Bangalô 24m² com Lage Seca",
    area: "24 m²",
    dimensions: "A definir",
    description: "Modelo sustentável de rápida montagem. 38m² otimizados para conforto térmico e acústico. Perfeito para ecoturismo.",
    includedItems: ["Estrutura Steel Frame", "Lage Seca"],
    excludedItems: ["Mão de Obra"],
    images: ["/assets/chales/ch-04-1.jpeg", "/assets/chales/ch-04-2.jpeg", "/assets/chales/ch-04-3.jpeg", "/assets/chales/ch-04-4.jpeg"]
  },
  {
    id: "ch-05",
    title: "Bangalô 24m²",
    area: "24 m²",
    dimensions: "A definir",
    description: "Conforto residencial em 85m². Suíte master, cozinha americana e varanda perimetral. Solução para moradia permanente.",
    includedItems: ["Estrutura Steel Frame"],
    excludedItems: ["Mão de Obra"],
    images: ["/assets/chales/ch-05-1.jpeg", "/assets/chales/ch-05-2.jpeg", "/assets/chales/ch-05-3.jpeg", "/assets/chales/ch-05-4.jpeg"]
  }
];

export const BARRACAO_DATA: Product[] = [
  {
    id: "b-01",
    title: "BARRACÃO LOGÍSTICO 200M²",
    area: "200 m²",
    dimensions: "10 x 20 metros",
    description: "Pé direito de 6 metros. Vão livre otimizado para paletização e manobra de empilhadeiras.",
    includedItems: ["Estrutura Metálica Principal"],
    excludedItems: ["Fechamento Lateral", "Piso de Alta Resistência"],
    images: ["/assets/chales/foto1.jpg", "/assets/chales/foto2.jpg"]
  }
];