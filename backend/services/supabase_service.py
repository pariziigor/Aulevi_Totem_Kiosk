import os
import uuid
from supabase import create_client, Client

class StorageService:
    @staticmethod
    def upload_pdf(pdf_bytes: bytes, prefix: str) -> str:
        """Sobe o PDF para o Supabase Storage e retorna a URL pública."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            print("[StorageService] ERRO: Credenciais do Supabase ausentes no .env!")
            return None

        try:
            supabase: Client = create_client(url, key)
            # Cria um nome único para o arquivo para não sobrescrever
            file_name = f"{prefix}_{uuid.uuid4().hex[:8]}.pdf"
            
            # Faz o upload para o bucket 'orcamentos'
            supabase.storage.from_("orcamentos").upload(
                path=file_name,
                file=pdf_bytes,
                file_options={"content-type": "application/pdf"}
            )
            
            # Resgata a URL pública do arquivo recém-upado
            public_url = supabase.storage.from_("orcamentos").get_public_url(file_name)
            return public_url
            
        except Exception as e:
            print(f"[StorageService] ❌ Erro no upload para Supabase: {e}")
            return None