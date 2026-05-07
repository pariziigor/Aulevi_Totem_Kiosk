from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quote_routes
from database.connection import engine, Base

# Inicialização automática das tabelas no SQLite local
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aulevi Kiosk API",
    description="Motor de cálculo LSF e gestão de leads offline-first",
    version="1.0.0"
)

# Configuração rigorosa de CORS para o ambiente local do Totem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Integração das rotas isoladas
app.include_router(quote_routes.router)

@app.get("/health", tags=["Monitoramento"])
def health_check():
    """Endpoint vitalício para o Watchdog do Electron."""
    return {"status": "operacional", "offline_ready": True} # Tipagem booleana estrita