import os
import uuid
from supabase import create_client, Client

class StorageService:
    @staticmethod
    def upload_pdf(pdf_bytes: bytes, prefix: str) -> str:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        print(f"[StorageService] 🔍 Validando chaves - URL OK? {bool(url)} | Key OK? {bool(key)}", flush=True)
        
        if not url or not key:
            print("[StorageService] ❌ ERRO FATAL: Credenciais do Supabase ausentes no .env!", flush=True)
            return None

        try:
            supabase: Client = create_client(url.strip(), key.strip())
            file_name = f"{prefix}_{uuid.uuid4().hex[:8]}.pdf"
            
            print(f"[StorageService] 📤 Uploading para o bucket 'orcamentos': {file_name}", flush=True)
            
            # CORREÇÃO: A biblioteca do Supabase exige os bytes puros
            response = supabase.storage.from_("orcamentos").upload(
                path=file_name,
                file=pdf_bytes,
                file_options={"content-type": "application/pdf"}
            )
            
            public_url = supabase.storage.from_("orcamentos").get_public_url(file_name)
            print(f"[StorageService] ✅ Sucesso! URL Gerada: {public_url}", flush=True)
            
            return public_url
            
        except Exception as e:
            print(f"[StorageService] ❌ ERRO CRÍTICO no upload: {repr(e)}", flush=True)
            return None