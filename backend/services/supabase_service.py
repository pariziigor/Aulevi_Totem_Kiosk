import os
import uuid
import io
from supabase import create_client, Client

class StorageService:
    @staticmethod
    def upload_pdf(pdf_bytes: bytes, prefix: str) -> str:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        print(f"[StorageService] 🔍 Verificando chaves: URL existe? {bool(url)} | Key existe? {bool(key)}")
        
        if not url or not key:
            print("[StorageService] ❌ ERRO FATAL: Credenciais do Supabase ausentes no .env da Render!")
            return None

        try:
            # Garante que a URL não tenha espaços acidentais
            clean_url = url.strip()
            clean_key = key.strip()
            
            supabase: Client = create_client(clean_url, clean_key)
            file_name = f"{prefix}_{uuid.uuid4().hex[:8]}.pdf"
            
            print(f"[StorageService] 📤 Iniciando upload no bucket 'orcamentos': {file_name}")
            
            # Transformando bytes puros em Objeto de Arquivo (File-Like) para evitar bugs da biblioteca
            file_object = io.BytesIO(pdf_bytes)
            
            response = supabase.storage.from_("orcamentos").upload(
                path=file_name,
                file=file_object,
                file_options={"content-type": "application/pdf"}
            )
            
            print(f"[StorageService] ✅ Upload concluído! Resposta do servidor: {response}")
            
            public_url = supabase.storage.from_("orcamentos").get_public_url(file_name)
            print(f"[StorageService] 🔗 URL Pública gerada: {public_url}")
            
            return public_url
            
        except Exception as e:
            # Isso vai capturar o erro exato (ex: Bucket não existe, Chave errada, etc)
            print(f"[StorageService] ❌ ERRO CRÍTICO no Supabase: {repr(e)}")
            return None