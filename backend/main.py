from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quote_routes
from database.connection import engine, Base
from services.pdf_service import PDFService

# Inicialização automática das tabelas (Supabase)
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Acontece quando o servidor LIGA: Inicia o Chromium
    await PDFService.start_browser()
    yield
    # Acontece quando o servidor DESLIGA: Limpa a memória
    await PDFService.stop_browser()

app = FastAPI(
    title="Aulevi Kiosk API",
    description="Motor de cálculo e automação comercial para geração de propostas",
    version="1.0.0",
    lifespan=lifespan # Adicionamos o gerenciador de ciclo de vida aqui
)

origins = [
    "http://localhost:5173",       # O seu ambiente de desenvolvimento
    "https://alv.aulevi.com.br"    # O seu frontend em produção
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Passando a lista exata aqui
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"] 
)

app.include_router(quote_routes.router)

@app.get("/health", tags=["Monitoramento"])
def health_check():
    """Endpoint para validação de uptime."""
    return {"status": "operacional", "offline_ready": True}