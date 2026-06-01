# 🏗️ Aulevi Kiosk - Sistema de Orçamento Interativo

Um sistema completo de kiosk digital para geração de orçamentos de estruturas metálicas, desenvolvido com tecnologias modernas e focado em responsividade e experiência do usuário.

**Status:** ✅ Sistema finalizado e pronto para produção

---

## 📋 Sumário

- [🎯 Visão Geral](#-visão-geral)
- [✨ Features Principais](#-features-principais)
- [🏛️ Arquitetura](#-arquitetura)
- [💻 Tecnologias](#-tecnologias)
- [📋 Pré-requisitos](#-pré-requisitos)
- [🚀 Instalação](#-instalação)
- [⚙️ Configuração](#-configuração)
- [▶️ Como Rodar](#-como-rodar)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔧 Scripts Disponíveis](#-scripts-disponíveis)
- [🌍 Variáveis de Ambiente](#-variáveis-de-ambiente)
- [📡 API Endpoints](#-api-endpoints)
- [🎨 Responsividade e Design](#-responsividade-e-design)
- [🧪 Testes](#-testes)
- [🤝 Contribuindo](#-contribuindo)
- [📝 Licença](#-licença)

---

## 🎯 Visão Geral

O **Aulevi Kiosk** é uma aplicação desktop para quiosques de autoatendimento que permite aos usuários gerar orçamentos personalizados para diferentes tipos de estruturas metálicas. O sistema calcula automaticamente materiais, dimensões e custos baseado em dados do IBGE (localização) e APIs de precificação.

**Casos de uso:**
- 🏢 Fachadas de lojas em shoppings
- 🏭 Quiosques em canteiros de obra
- 🏢 Pontos de atendimento comercial

---

## ✨ Features Principais

### 🎯 Módulos de Orçamento

- **Madeiramento Metálico**: Cálculo de estruturas de telhado com suporte a telhas diversas
- **Light Steel Frame (LSF)**: Sistema construtivo em aço leve com padrões de acabamento
- **Galpões**: Estruturas industriais e comerciais
- **Chalés**: Construções residenciais em aço
- **Catálogo**: Visualização de produtos com zoom e carrossel

### 💡 Funcionalidades

✅ **Captura de Leads**: Modal para coleta de dados do cliente (nome, telefone)
✅ **Integração IBGE**: Busca dinâmica de cidades por estado
✅ **Geração de PDFs**: Orçamentos personalizados com cálculos detalhados
✅ **Integração WhatsApp**: Envio automático de links para clientes
✅ **Tela de Standby**: Screensaver com vídeo de fundo
✅ **Responsividade**: Suporta mobile, tablet e desktop
✅ **Animações Fluidas**: Transições com Framer Motion
✅ **Persistência de Estado**: Gerenciamento com Zustand

---

## 🏛️ Arquitetura

### Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                   Electron Wrapper                      │
│              (Desktop Application Shell)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pages: MainMenu, LSFFlow, Madeiramento, etc.   │   │
│  │  Hooks: useLSFFlow, useCitySearch, etc.         │   │
│  │  Components: Modal, Carousel, Toggle, etc.      │   │
│  │  State: Zustand (useKioskStore)                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes: /quote, /health, /cities               │   │
│  │  Services: PDF, Pricing, WhatsApp, Supabase     │   │
│  │  Database: PostgreSQL via Supabase              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│  • IBGE API (Cidades/Estados)                           │
│  • Supabase (Database & Auth)                           │
│  • WhatsApp API (Comunicação)                           │
│  • Puppeteer (Geração de PDFs)                          │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
User Interaction
      ↓
React Component State (Zustand)
      ↓
HTTP Request (Axios)
      ↓
FastAPI Backend
      ↓
Services (PDF, Pricing, Database)
      ↓
External APIs (IBGE, Supabase, WhatsApp)
      ↓
Response → Frontend → Update UI
```

---

## 💻 Tecnologias

### Frontend
- **React 19**: Interface de usuário
- **TypeScript**: Type safety e developer experience
- **Vite 8**: Build tool ultra-rápido
- **Tailwind CSS 3**: Utility-first styling
- **Framer Motion 12**: Animações e transições
- **React Router 7**: Navegação SPA
- **Zustand 5**: State management
- **Axios**: HTTP client
- **Lucide React**: Ícones SVG
- **React Simple Keyboard**: Teclado virtual
- **Vitest & @testing-library**: Testes unitários

### Backend
- **FastAPI**: Framework web assíncrono
- **Python 3.x**: Linguagem
- **SQLAlchemy**: ORM
- **PostgreSQL (Supabase)**: Banco de dados
- **Puppeteer (via Pyppeteer)**: Geração de PDFs
- **Requests**: HTTP client
- **Python-dotenv**: Configuração via .env

### Desktop
- **Electron**: Shell de aplicação desktop
- **Node.js**: Runtime JavaScript

### DevOps
- **Git**: Controle de versão
- **ESLint**: Linting de código
- **TypeScript Compiler**: Verificação de tipos

---

## 📋 Pré-requisitos

### Sistema

- **Node.js**: v18+ (para Frontend e Electron)
- **Python**: v3.10+ (para Backend)
- **npm** ou **yarn**: Gerenciador de pacotes
- **Git**: Controle de versão

### Contas e Serviços

- **Supabase Account**: Para banco de dados PostgreSQL
- **IBGE API**: Gratuita, sem autenticação necessária
- **WhatsApp Business API**: Para integração (opcional)

### Variáveis de Ambiente

```bash
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
WHATSAPP_API_KEY=your_whatsapp_key
CORS_ALLOWED_ORIGINS=https://seu-dominio.com.br

# Frontend (variáveis do Vite)
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/aulevi-kiosk.git
cd aulevi-kiosk
```

### 2. Configurar Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env
cp .env.example .env
# Editar .env com suas credenciais
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

### 4. Configurar Electron Wrapper (Opcional)

```bash
cd ../electron-wrapper

# Instalar dependências
npm install
```

---

## ⚙️ Configuração

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aulevi
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anonima

# API Externa
WHATSAPP_API_KEY=sua-chave-whatsapp
WHATSAPP_PHONE_ID=seu-phone-id

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://alv.aulevi.com.br

# Modo
DEBUG=false
ENVIRONMENT=production
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000
VITE_LOG_LEVEL=info
```

### Database (Supabase)

1. Criar novo projeto no Supabase
2. Executar migrations (se houver):
   ```bash
   cd backend
   # Adicionar suas migrations SQL em database/migrations/
   ```

---

## ▶️ Como Rodar

### Modo Desenvolvimento

#### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate no Windows
python main.py

# Acessar API docs em: http://localhost:8000/docs
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev

# Aplicação em: http://localhost:5173
```

#### Terminal 3 - Electron (Opcional)

```bash
cd electron-wrapper
npm start
```

### Modo Produção

#### Build Frontend

```bash
cd frontend
npm run build

# Saída em: dist/
```

#### Build Backend

```bash
cd backend
# Usar um servidor ASGI como Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

#### Deploy Electron

```bash
cd electron-wrapper
npm run build
# Usar electron-builder para gerar instalador
```

---

## 📁 Estrutura do Projeto

```
aulevi-kiosk/
├── backend/                          # 🐍 API FastAPI
│   ├── main.py                       # Entrada principal
│   ├── requirements.txt              # Dependências Python
│   ├── pytest.ini                    # Configuração Pytest
│   │
│   ├── config/
│   │   └── settings.py               # Configurações da aplicação
│   │
│   ├── database/
│   │   └── connection.py             # Conexão Supabase/PostgreSQL
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── quote_model.py            # Modelo de Orçamento
│   │
│   ├── routes/
│   │   └── quote_routes.py           # Endpoints de orçamento
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── quote_schema.py           # Schemas Pydantic
│   │
│   ├── services/
│   │   ├── pdf_service.py            # Geração de PDFs (Puppeteer)
│   │   ├── pricing_service.py        # Cálculos de preço
│   │   ├── mm_pricing_service.py     # Preço Madeiramento
│   │   ├── supabase_service.py       # Integração Supabase
│   │   └── whatsapp_service.py       # Integração WhatsApp
│   │
│   ├── templates/
│   │   ├── quote_template.html       # Template HTML para PDF
│   │   ├── madeiramento_template.html
│   │   └── chale_template.html
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_pricing_service.py   # Testes unitários
│   │
│   └── static/
│       └── [arquivos estáticos]
│
├── frontend/                         # ⚛️ React + TypeScript + Vite
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   │
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx                  # Entrada React
│   │   ├── App.tsx                   # Componente raiz
│   │   ├── index.css                 # Estilos globais
│   │   ├── App.css
│   │   │
│   │   ├── pages/                    # Páginas/Rotas
│   │   │   ├── MainMenu.tsx          # Menu principal
│   │   │   ├── LSFFlow.tsx           # Fluxo LSF
│   │   │   ├── MadeiramentoFlow.tsx  # Fluxo Madeiramento
│   │   │   ├── CatalogFlow.tsx       # Catálogo de produtos
│   │   │   └── Standby.tsx           # Tela de espera
│   │   │
│   │   ├── components/               # Componentes reutilizáveis
│   │   │   ├── LeadCaptureModal.tsx
│   │   │   │
│   │   │   ├── LSFFlow/
│   │   │   │   ├── StepRenderer.tsx  # Renderização de passos
│   │   │   │   ├── Numpad.tsx        # Teclado numérico
│   │   │   │   ├── Step3Toggle.tsx   # Toggle SIM/NÃO
│   │   │   │   └── CitySearchModal.tsx
│   │   │   │
│   │   │   ├── MadeiramentoFlow/
│   │   │   │   ├── StepRenderer.tsx
│   │   │   │   ├── NumpadMedida.tsx
│   │   │   │   ├── Toggle.tsx
│   │   │   │   ├── TelhadoSVG.tsx
│   │   │   │   └── CitySearchModal.tsx
│   │   │   │
│   │   │   ├── CatalogFlow/
│   │   │   │   ├── ProductCarousel.tsx
│   │   │   │   ├── ProductDetails.tsx
│   │   │   │   └── FullscreenImageViewer.tsx
│   │   │   │
│   │   │   └── LeadCaptureModal.tsx
│   │   │
│   │   ├── hooks/                    # Hooks customizados
│   │   │   ├── useLSFFlow.ts
│   │   │   ├── useCitySearch.ts
│   │   │   ├── useImageCarousel.ts
│   │   │   ├── useInactivityTimeout.ts
│   │   │   └── useCatalogFlow.ts
│   │   │
│   │   ├── services/                 # Serviços (API, etc)
│   │   │   ├── api.ts                # Cliente Axios
│   │   │   ├── ibgeService.ts        # Integração IBGE
│   │   │   └── __tests__/            # Testes
│   │   │
│   │   ├── store/                    # Estado global (Zustand)
│   │   │   └── useKioskStore.ts
│   │   │
│   │   ├── constants/                # Constantes
│   │   │   ├── lsfFlowConstants.ts
│   │   │   └── madeiramentoFlowConstants.ts
│   │   │
│   │   ├── utils/                    # Funções auxiliares
│   │   │   └── textFormat.ts
│   │   │
│   │   ├── data/
│   │   │   └── products.ts           # Dados de produtos
│   │   │
│   │   ├── assets/
│   │   │   ├── menu/
│   │   │   ├── telhas/
│   │   │   ├── chales/
│   │   │   └── [imagens]
│   │   │
│   │   └── public/
│   │       └── [arquivos estáticos]
│   │
│   └── generated_quotes/             # PDFs gerados
│
├── electron-wrapper/                 # 🖥️ Wrapper Electron
│   ├── package.json
│   ├── main.js                       # Processo principal Electron
│   └── preload.js                    # Preload scripts
│
├── .git/                             # Git repository
├── .gitignore
├── REFACTORING_SUMMARY.md            # Resumo de refatorações
└── README.md                         # Este arquivo
```

---

## 🔧 Scripts Disponíveis

### Frontend

```bash
npm run dev          # Servidor de desenvolvimento (hot reload)
npm run build        # Build para produção
npm run lint         # Executar ESLint
npm run preview      # Visualizar build em produção
npm run test         # Executar testes (Vitest)
```

### Backend

```bash
python main.py                              # Rodar servidor
pytest tests/                               # Executar testes
pytest tests/ -v                            # Com verbose
python -m pytest tests/ --cov=services      # Com cobertura
```

### Electron

```bash
npm start            # Iniciar aplicação desktop
npm run build        # Build do instalador (com electron-builder)
```

---

## 🌍 Variáveis de Ambiente

### Backend

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@localhost/db` |
| `SUPABASE_URL` | URL do projeto Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Chave anônima Supabase | `eyJhb...` |
| `WHATSAPP_API_KEY` | Chave da API WhatsApp | `xxxxx` |
| `WHATSAPP_PHONE_ID` | ID do telefone WhatsApp | `1234567890` |
| `CORS_ALLOWED_ORIGINS` | Origens CORS permitidas | `http://localhost:5173,https://domain.com` |
| `DEBUG` | Modo debug | `false` |
| `ENVIRONMENT` | Ambiente | `production`, `development` |

### Frontend

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API backend | `http://localhost:8000` |
| `VITE_LOG_LEVEL` | Nível de log | `info`, `debug`, `error` |

---

## 📡 API Endpoints

### Base URL
- Desenvolvimento: `http://localhost:8000`
- Produção: `https://api.aulevi.com.br`

### Documentação Interativa
- Swagger UI: `GET /docs`
- ReDoc: `GET /redoc`

### Endpoints Principais

#### Orçamentos
```
POST   /quote/madeiramento    - Gerar orçamento Madeiramento
POST   /quote/lsf             - Gerar orçamento LSF
POST   /quote/galpao          - Gerar orçamento Galpão
POST   /quote/chale           - Gerar orçamento Chalé
GET    /quotes/{id}           - Recuperar orçamento
```

#### Localização
```
GET    /cities?state=SP       - Listar cidades por estado
GET    /states                - Listar todos os estados
```

#### Saúde
```
GET    /health                - Verificar saúde da API
GET    /health/db             - Status do banco de dados
```

### Exemplo de Request

```bash
curl -X POST http://localhost:8000/quote/madeiramento \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "João Silva",
    "lead_phone": "11999999999",
    "tipo_laje": "SEM_LAJE",
    "tipo_telha": "CERÂMICA",
    "tem_placa": false,
    "dim_a": 10.5,
    "dim_b": 8.2,
    "city": "São Paulo"
  }'
```

---

## 🎨 Responsividade e Design

### Breakpoints Tailwind

- **Mobile**: `< 768px` (xs, sm)
- **Tablet**: `768px - 1024px` (md, lg)
- **Desktop**: `> 1024px` (xl, 2xl)

### Padrões de Responsividade Implementados

#### Textos
```tailwind
text-2xl md:text-3xl xl:text-5xl   # Escalas proporcionais
text-sm md:text-lg xl:text-xl      # Legibilidade
```

#### Espaçamento
```tailwind
p-4 md:p-6 xl:p-8                  # Padding adaptativo
gap-3 md:gap-4 xl:gap-6            # Gaps proporcionais
mt-6 md:mt-8 xl:mt-12              # Margens em cascata
```

#### Layouts
```tailwind
grid-cols-1 md:grid-cols-2         # Grid responsivo
flex-col md:flex-row                # Direção adaptativa
w-full md:w-auto                    # Widths flexíveis
```

### Componentes Responsivos

- ✅ Botões com hit-area confortável
- ✅ Modals com padding adaptativo
- ✅ Carrossel com suporte touch e mouse
- ✅ Teclado virtual otimizado para toque
- ✅ Vídeo de fundo com object-fit

---

## 🧪 Testes

### Frontend

```bash
cd frontend

# Rodar testes
npm run test

# Watch mode
npm run test -- --watch

# Com cobertura
npm run test -- --coverage
```

### Backend

```bash
cd backend

# Rodar testes
pytest tests/

# Com verbose
pytest tests/ -v

# Com cobertura
pytest tests/ --cov=services --cov-report=html
```

---

## 🤝 Contribuindo

### Processo de Contribuição

1. **Fork** o repositório
2. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m "✨ Adiciona minha feature"
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/minha-feature
   ```
5. **Abra um Pull Request**

### Conventions

#### Commit Messages
```
✨ feat: Adiciona nova funcionalidade
🐛 fix: Corrige bug
📝 docs: Atualiza documentação
🎨 style: Muda estilos/formatting
♻️ refactor: Refatora código
⚡ perf: Melhora performance
✅ test: Adiciona testes
```

#### Branches
```
feature/nome-da-feature
bugfix/nome-do-bug
hotfix/nome-do-hotfix
docs/nome-da-documentacao
```

---

## 📝 Licença

Este projeto é propriedade da **Aulevi** e está protegido por direitos autorais.

**Uso Permitido:**
- ✅ Uso interno na empresa
- ✅ Desenvolvimento de features
- ✅ Deploy em servidores próprios

**Uso Não Permitido:**
- ❌ Redistribuição do código
- ❌ Uso comercial sem autorização
- ❌ Criação de produtos derivados

---

## 📞 Suporte e Contato

- **Email**: parizi57@gmail.com
- **Website**: [www.aulevi.com.br](https://www.aulevi.com.br)

---

## 🙏 Agradecimentos

Desenvolvido por Igor Parizi desenvolvimento Aulevi.

Tecnologias utilizadas:
- React & TypeScript
- FastAPI & Python
- Supabase & PostgreSQL
- Electron & Vite
- Tailwind CSS & Framer Motion

---

**Última atualização:** 29 de maio de 2026  
**Versão:** 1.0.0
