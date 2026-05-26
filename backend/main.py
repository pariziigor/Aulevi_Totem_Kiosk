from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quote_routes
from database.connection import engine, Base

# Inicialização automática das tabelas (agora apontando para o Supabase)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aulevi Kiosk API",
    description="Motor de cálculo e automação comercial para geração de propostas",
    version="1.0.0"
)

# 🔥 CONFIGURAÇÃO DE CORS ATUALIZADA PARA A NUVEM 🔥
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Libera acessos do Vercel, Locaweb e localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"] # Fundamental para o download do arquivo PDF no frontend
)

# Integração das rotas isoladas
app.include_router(quote_routes.router)

@app.get("/health", tags=["Monitoramento"])
def health_check():
    """Endpoint vitalício para o Watchdog do Electron."""
    return {"status": "operacional", "offline_ready": True} # Tipagem booleana estrita nativa mantida