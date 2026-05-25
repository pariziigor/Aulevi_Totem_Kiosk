from database.connection import Base, engine
from models.quote_model import QuoteModel 

def setup_database():
    print("[Setup]: Conectando ao banco de dados na nuvem...")
    try:
        # Cria as tabelas se elas não existirem
        Base.metadata.create_all(bind=engine)
        print("[Setup]: Estrutura de tabelas criada com sucesso no Supabase!")
        print("[Setup]: O sistema está pronto para capturar leads reais.")
    except Exception as e:
        print(f"[Setup]: ERRO ao criar tabelas: {str(e)}")

if __name__ == "__main__":
    setup_database()