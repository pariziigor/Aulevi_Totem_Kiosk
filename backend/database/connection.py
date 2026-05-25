import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

# Puxa a URL da nuvem. Se não existir, mantém o SQLite local como plano de segurança
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")

# Correção de compatibilidade: o SQLAlchemy exige 'postgresql://' 
# mas muitas nuvens (como Supabase) fornecem 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configurações específicas por tipo de banco
if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # O PostgreSQL gerencia múltiplas conexões nativamente de forma robusta
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()