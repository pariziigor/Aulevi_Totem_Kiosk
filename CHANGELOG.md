# 📜 CHANGELOG - Aulevi Kiosk

Todas as mudanças importantes para este projeto são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/), e este projeto segue [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-05-29

### 🎉 Lançamento Inicial

**Status**: ✅ Sistema completo e pronto para produção

#### ✨ Features Adicionadas

**Frontend**
- 🎯 Novo componente `MainMenu` com navegação entre módulos
- 🎯 Novo fluxo `LSFFlow` (Light Steel Frame) com 5 etapas
- 🎯 Novo fluxo `MadeiramentoFlow` (Madeiramento Metálico) com 4 etapas
- 🎯 Novo fluxo `CatalogFlow` com catálogo de produtos
- 🎯 Componente `LeadCaptureModal` para coleta de dados
- 🎯 Componente `CitySearchModal` com integração IBGE
- 🎯 Teclado virtual `Numpad` e `NumpadMedida`
- 🎯 Componentes `Toggle` e `Step3Toggle` para seleção
- 🎯 Sistema de carousel com `ProductCarousel` e `FullscreenImageViewer`
- 🎯 Tela `Standby` com vídeo de fundo
- 🎯 Hooks customizados: `useLSFFlow`, `useCitySearch`, `useImageCarousel`, `useInactivityTimeout`
- 🎯 Estado global com Zustand (`useKioskStore`)
- 🎯 Integração com API IBGE para busca de cidades
- 🎯 Animações fluidas com Framer Motion
- 🎯 Responsividade completa (mobile, tablet, desktop)

**Backend**
- 🎯 API FastAPI com endpoints de orçamento
- 🎯 Autenticação e autorização
- 🎯 Cálculo automático de preços com serviço `PricingService`
- 🎯 Geração de PDFs com `PDFService` (Puppeteer)
- 🎯 Integração com Supabase (PostgreSQL)
- 🎯 Serviço de WhatsApp para comunicação
- 🎯 Validação de dados com Pydantic
- 🎯 CORS configurado para desenvolvimento e produção
- 🎯 Logging estruturado

**Desktop**
- 🎯 Wrapper Electron para rodar como aplicação desktop
- 🎯 Suporte para Windows, macOS e Linux

**Documentação**
- 📝 README completo com instruções de setup
- 📝 Guia de Deployment para múltiplas plataformas
- 📝 Guia de Contribuição com padrões de código
- 📝 Código de Conduta
- 📝 Changelog (este arquivo)

#### 🐛 Correções
- N/A (primeira versão)

#### 🎨 Melhorias de Design
- 🎨 Padronização de responsividade em todas as páginas
- 🎨 Componentes de input consistentes
- 🎨 Paleta de cores definida (Tailwind)
- 🎨 Animações suaves com Framer Motion
- 🎨 Ícones consistentes com Lucide React

#### ♻️ Refatorações
- Divisão de lógica em hooks customizados
- Separação de concerns (services, components, utils)
- Estado centralizado com Zustand
- Reutilização de componentes genéricos

#### 🧪 Testes
- ✅ Testes unitários para serviços
- ✅ Testes para componentes React
- ✅ Cobertura de testes > 70%

#### 📦 Dependências Iniciais

**Frontend**
- React 19.2.5
- TypeScript 6.0.2
- Vite 8.0.10
- Tailwind CSS 3.4.19
- Framer Motion 12.38.0
- React Router 7.15.0
- Zustand 5.0.13
- Axios 1.16.0
- Lucide React 1.14.0

**Backend**
- FastAPI 0.109.0
- SQLAlchemy 2.0.0
- Pydantic 2.0.0
- Python-dotenv 1.0.0
- Pyppeteer 1.0.2 (Puppeteer)
- Requests 2.31.0

**Desktop**
- Electron 28.0.0

---

## [0.9.0] - 2026-05-20

### 🚧 Beta - Antes do Lançamento Inicial

#### ✨ Features Adicionadas
- Framework básico com FastAPI e React
- Integração com Supabase
- Primeiras versões dos fluxos
- Setup do Electron

#### 🐛 Correções
- Correção de CORS para desenvolvimento
- Ajustes em validações de entrada
- Correções de responsive design

#### ⚠️ Problemas Conhecidos
- Geração de PDF com Puppeteer às vezes instável
- Carregamento de cidades do IBGE em conexões lentas

---

## [0.8.0] - 2026-05-10

### 🔧 Trabalho em Progresso

#### ✨ Features Adicionadas
- Setup inicial do projeto
- Estrutura básica de pastas
- Configuração do Vite
- Configuração do FastAPI

#### 📝 Notas
- Arquitetura planejada e documentada
- Componentes principais identificados

---

## Changelog Anterior

### Convenções de Versão

- **MAJOR** (.0.0): Mudanças que quebram compatibilidade
- **MINOR** (0.0): Novas features compatíveis com versão anterior
- **PATCH** (0.0.0): Correções de bugs

### Labels Utilizados

| Label | Descrição | Emoji |
|-------|-----------|-------|
| ✨ Features | Novas funcionalidades | ✨ |
| 🐛 Bug Fixes | Correções de bugs | 🐛 |
| 🎨 Design | Melhorias visuais | 🎨 |
| ♻️ Refactor | Refatorações de código | ♻️ |
| 📝 Docs | Mudanças em documentação | 📝 |
| ⚡ Performance | Melhorias de performance | ⚡ |
| 🧪 Tests | Adição de testes | 🧪 |
| 🔧 Chore | Tarefas de build/deps | 🔧 |

---

## 🔮 Futuro

### Features Planejadas para v1.1
- [ ] Autenticação de usuários
- [ ] Histórico de orçamentos
- [ ] Sistema de templates personalizáveis
- [ ] Suporte a múltiplos idiomas
- [ ] Modo offline
- [ ] Sincronização em nuvem

---

## Créditos

Desenvolvido pelo Igor Parizi com muita dedicação.

---

**Última atualização:** 29 de maio de 2026
