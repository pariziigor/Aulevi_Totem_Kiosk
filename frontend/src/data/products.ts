export type Product = {
  id: string;
  title: string;
  area: string;
  dimensions: string;
  valorKit: string;
  description: string;
  includedItems: string[];
  excludedItems: string[];
  images: string[];
  previsaoCustosAdicionais: string[];
  totalEstimado: string;
  maoDeObra: string;
  treinamento: string;
};

export const CHALES_DATA: Product[] = [
  {
    id: "ch-01",
    title: "Mini Chalé 31,2 m²",
    area: "31,2 m²",
    dimensions: "4 x 7,8 metros",
    valorKit: "R$ 126.900,00",
    description:
      "Kit de Cabana em Steel Frame, com 31,2 m² sendo 4 x 7,8. É ideal para quem busca um modelo para faturar com hospedagem no Airbnb ou lazer! Se você tem um pouco de habilidade com ferramentas, consegue apertar uns parafusos e ler um manual, consegue construir de forma simples e rápida com nosso Kit.",
    includedItems: [
      "Projeto Arquitetônico",
      "Projeto Hidráulico",
      "Projeto Elétrico",
      "Projeto Estrutural Steel Frame",
      "Manual de Montagem Passo a Passo",
      "Estrutura em Aço Galvanizado Steel Frame",
      "Parafusos para Montagem",
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
      "Impermeabilização",
    ],
    images: [
      "/assets/chales/ch-01-1.jpg",
      "/assets/chales/ch-01-2.jpg",
      "/assets/chales/ch-01-3.jpg",
      "/assets/chales/ch-01-4.jpg",
    ],
    previsaoCustosAdicionais: [
      "Fundação Concreto Radier 13cm:	R$ 3.500,00",
      "Telha Sanduíche com Cor: R$ 7.500,00",
      "Placa Cimentícia Parede Fundos: R$ 1.300,00",
      "Fechamento Interno Drywall: R$ 3.200,00",
      "Portas e Janelas: R$ 7.000,00",
      "Acabamento Pintura e Revestimento: R$ 2.500,00",
      "Materiais Eletrônicos e Hidráulicos: R$ 2.000,00",
    ],
    totalEstimado: "R$ 39.690,00",
    maoDeObra:
      "Variável de acordo com a região e modelo de contratação. Não oferecemos mão de obra.",
    treinamento:
      "Todos os meses temos Treinamento Presencial para você aprender a montar na prática, são dois dias de imersão dentro da fábrica para você ter uma experiência 100% prática! Confira nossa agenda e locais de treinamento. Os treinamentos são pagos independentemente de você adquirir o kit ou não.",
  },

  {
    id: "ch-02",
    title: "Cabana 50m² - 2 Quartos",
    area: "50 m²",
    dimensions: "6,5 x 6,6 Metros",
    valorKit: "R$ 18.690,00",
    description:
      "Kit de Cabana em Steel Frame com 50m² e 2 quartos sendo 6,5 x 6,6 de base mais mezanino. É ideal para quem busca um modelo para faturar com hospedagem no Airbnb ou lazer! Se você tem um pouco de habilidade, consegue apertar uns parafusos e ler um manual, consegue construir de forma simples e rápida com o nosso kit.",
    includedItems: [
      "Projeto Arquitetônico",
      "Projetos Hidráulico",
      "Projeto Elétrico",
      "Projeto Estrutural Steel Frame",
      "Manual de Montagem Passo a Passo",
      "Estrutura em Aço Galvanizado Steel Frame",
      "Parafusos para Montagem",
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
      "Impermeabilização",
    ],
    images: [
      "/assets/chales/ch-02-1.jpeg",
      "/assets/chales/ch-02-2.jpeg",
      "/assets/chales/ch-02-3.jpeg",
      "/assets/chales/ch-02-4.jpeg",
    ],
    previsaoCustosAdicionais: [
      "Fundação Concreto Radier 13cm	R$ 5.500,00",
      "Telha Sanduíche com Cor	R$ 10.000,00",
      "Placa Cimentícia Parede Fundos	R$ 2.000,00",
      "Fechamento Interno Drywall	R$ 5.000,00",
      "Portas e Janelas	R$ 10.000,00",
      "Acabamento Pintura e Revestimento	R$ 3.500,00",
      "Materiais Eletrônicos e Hidráulicos	R$ 3.000,00",
    ],
    totalEstimado: "R$ 57.690,00",
    maoDeObra:
      "Variável de acordo com a região e modelo de contratação. Não oferecemos mão de obra.",
    treinamento:
      "Todos os meses temos Treinamento Presencial para você aprender a montar na prática, são dois dias de imersão dentro da fábrica para você ter uma experiência 100% prática! Confira nossa agenda e locais de treinamento. Os treinamentos são pagos independentemente de você adquirir o kit ou não.",
  },

  {
    id: "ch-03",
    title: "Cabana 50m² - 1 Quarto",
    area: "50 m²",
    dimensions: "6,5 x 6,6 Metros",
    valorKit: "R$ 17.690,00",
    description:
      "Kit de Cabana em Steel Frame com 50m² e 1 quarto sendo 6,5 x 6,6 de base mais mezanino. É ideal para quem busca um modelo para faturar com hospedagem no Airbnb ou lazer! Se você tem um pouco de habilidade, consegue apertar uns parafusos e ler um manual, consegue construir de forma simples e rápida com o nosso kit.",
    includedItems: [
      "Projeto Arquitetônico",
      "Projetos Hidráulico",
      "Projeto Elétrico",
      "Projeto Estrutural Steel Frame",
      "Manual de Montagem Passo a Passo",
      "Estrutura em Aço Galvanizado Steel Frame",
      "Parafusos para Montagem",
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
      "Impermeabilização",
    ],
    images: [
      "/assets/chales/ch-03-1.jpeg",
      "/assets/chales/ch-03-2.jpeg",
      "/assets/chales/ch-03-3.jpeg",
      "/assets/chales/ch-03-4.jpeg",
    ],
    previsaoCustosAdicionais: [
      "Fundação Concreto Radier 13cm	R$ 5.000,00",
      "Telha Sanduíche com Cor	R$ 9.500,00",
      "Placa Cimentícia Parede Fundos	R$ 1.800,00",
      "Fechamento Interno Drywall	R$ 4.500,00",
      "Portas e Janelas	R$ 9.000,00",
      "Acabamento Pintura e Revestimento	R$ 3.000,00",
      "Materiais Eletrônicos e Hidráulicos	R$ 2.500,00",
    ],
    totalEstimado: "R$ 52.990,00",
    maoDeObra:
      "Variável de acordo com a região e modelo de contratação. Não oferecemos mão de obra.",
    treinamento:
      "Todos os meses temos Treinamento Presencial para você aprender a montar na prática, são dois dias de imersão dentro da fábrica para você ter uma experiência 100% prática! Confira nossa agenda e locais de treinamento. Os treinamentos são pagos independentemente de você adquirir o kit ou não.",
  },
  {
    id: "ch-04",
    title: "Bangalô 24m² com Lage Seca",
    area: "24 m²",
    dimensions: "6,2 x 3,9 Metros",
    valorKit: "R$ 14.690,00",
    description:
      "Kit de Cabana em Steel Frame com 24m² sendo 6,2 x 3,9 com laje seca elevada do chão. É ideal para quem busca um modelo para faturar com hospedagem no Airbnb ou lazer! Se você tem um pouco de habilidade, consegue apertar uns parafusos e ler um manual, consegue construir de forma simples e rápida com o nosso kit.",
    includedItems: [
      "Projeto Arquitetônico",
      "Projetos Hidráulico",
      "Projeto Elétrico",
      "Projeto Estrutural Steel Frame",
      "Manual de Montagem Passo a Passo",
      "Estrutura em Aço Galvanizado Steel Frame",
      "Parafusos para Montagem",
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
      "Impermeabilização",
    ],
    images: [
      "/assets/chales/ch-04-1.jpeg",
      "/assets/chales/ch-04-2.jpeg",
      "/assets/chales/ch-04-3.jpeg",
      "/assets/chales/ch-04-4.jpeg",
    ],
    previsaoCustosAdicionais: [
      "Laje Seca Elevada	R$ 3.000,00",
      "Telha Sanduiche com Cor	R$ 6.500,00",
      "Placa Cimentícia Parede Fundos	R$ 1.000,00",
      "Fechamento Interno Drywall	R$ 2.500,00",
      "Portas e Janelas	R$ 6.000,00",
      "Acabamento Pintura e Revestimento	R$ 2.000,00",
      "Materiais Eletrônicos e Hidráulicos	R$ 1.500,00",
    ],
    totalEstimado: "R$ 37.190,00",
    maoDeObra:
      "Variável de acordo com a região e modelo de contratação. Não oferecemos mão de obra.",
    treinamento:
      "Todos os meses temos Treinamento Presencial para você aprender a montar na prática, são dois dias de imersão dentro da fábrica para você ter uma experiência 100% prática! Confira nossa agenda e locais de treinamento. Os treinamentos são pagos independentemente de você adquirir o kit ou não.",
  },

  {
    id: "ch-05",
    title: "Bangalô 24m²",
    area: "24 m²",
    dimensions: "6,2 x 3,9 Metros",
    valorKit: "R$ 12.690,00",
    description:
      "Kit de Cabana em Steel Frame com 24m² sendo 6,2 x 3,9. É ideal para quem busca um modelo para faturar com hospedagem no Airbnb ou lazer! Se você tem um pouco de habilidade, consegue apertar uns parafusos e ler um manual, consegue construir de forma simples e rápida com o nosso kit.",
    includedItems: [
      "Projeto Arquitetônico",
      "Projetos Hidráulico",
      "Projeto Elétrico",
      "Projeto Estrutural Steel Frame",
      "Manual de Montagem Passo a Passo",
      "Estrutura em Aço Galvanizado Steel Frame",
      "Parafusos para Montagem",
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
      "Impermeabilização",
    ],
    images: [
      "/assets/chales/ch-05-1.jpeg",
      "/assets/chales/ch-05-2.jpeg",
      "/assets/chales/ch-05-3.jpeg",
      "/assets/chales/ch-05-4.jpeg",
    ],
    previsaoCustosAdicionais: [
      "Fundação Concreto Radier 13cm	R$ 3.000,00",
      "Telha Sanduíche com Cor	R$ 6.500,00",
      "Placa Cimentícia Parede Fundos	R$ 1.000,00",
      "Fechamento Interno Drywall	R$ 2.500,00",
      "Portas e Janelas	R$ 6.000,00",
      "Acabamento Pintura e Revestimento	R$ 2.000,00",
      "Materiais Eletrônicos e Hidráulicos	R$ 1.500,00",
    ],
    totalEstimado: "R$ 35.190,00",
    maoDeObra:
      "Variável de acordo com a região e modelo de contratação. Não oferecemos mão de obra.",
    treinamento:
      "Todos os meses temos Treinamento Presencial para você aprender a montar na prática, são dois dias de imersão dentro da fábrica para você ter uma experiência 100% prática! Confira nossa agenda e locais de treinamento. Os treinamentos são pagos independentemente de você adquirir o kit ou não.",
  },
];

export const BARRACAO_DATA: Product[] = [
  {
    id: "b-01",
    title: "BARRACÃO LOGÍSTICO 200M²",
    area: "200 m²",
    dimensions: "10 x 20 metros",
    valorKit: "R$ 49.900,00",
    description:
      "Pé direito de 6 metros. Vão livre otimizado para paletização e manobra de empilhadeiras.",
    includedItems: ["Estrutura Metálica Principal"],
    excludedItems: ["Fechamento Lateral", "Piso de Alta Resistência"],
    images: ["/assets/chales/foto1.jpg", "/assets/chales/foto2.jpg"],
    previsaoCustosAdicionais: ["Fechamento Lateral: R$ 30.000,00"],
    totalEstimado: "R$ 79.900,00",
    maoDeObra:
      "Variável de acordo com a região e modelo de contratação. Não oferecemos mão de obra.",
    treinamento:
      "Todos os meses temos Treinamento Presencial para você aprender a montar na prática, são dois dias de imersão dentro da fábrica para você ter uma experiência 100% prática! Confira nossa agenda e locais de treinamento. Os treinamentos são pagos independentemente de você adquirir o kit ou não.",
  },
];
