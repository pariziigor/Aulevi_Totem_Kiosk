from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import quote_routes
from database.connection import engine, Base
from services.pdf_service import PDFService

# Inicializacao automatica das tabelas (Supabase)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Acontece quando o servidor liga: inicia o Chromium.
    await PDFService.start_browser()
    yield
    # Acontece quando o servidor desliga: limpa a memoria.
    await PDFService.stop_browser()


app = FastAPI(
    title="Aulevi Kiosk API",
    description="Motor de calculo e automacao comercial para geracao de propostas",
    version="1.0.0",
    lifespan=lifespan,
)

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://alv.aulevi.com.br",
    "https://www.alv.aulevi.com.br",
]

extra_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

origins = [*default_origins, *extra_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.(aulevi\.com\.br|vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(quote_routes.router)


@app.get("/health", tags=["Monitoramento"])
def health_check():
    """Endpoint para validacao de uptime."""
    return {"status": "operacional", "offline_ready": True}

@app.get("/", tags=["Monitoramento"])
def home():
    """Rota raiz genérica para responder aos pings do cron-job com status 200 OK."""
    return {"status": "online", "message": "Aulevi Kiosk API está operacional"}