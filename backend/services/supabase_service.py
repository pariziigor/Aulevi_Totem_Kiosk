import os
import uuid
import httpx
from urllib.parse import urlparse

class StorageService:
    @staticmethod
    def upload_pdf(pdf_bytes: bytes, prefix: str) -> str:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        print(f"[StorageService] 🔍 Validando chaves - URL OK? {bool(url)} | Key OK? {bool(key)}", flush=True)
        
        if not url or not key:
            print("[StorageService] ❌ ERRO FATAL: Credenciais ausentes no .env!", flush=True)
            return None

        try:
            # Se a URL no .env for "https://xyz.supabase.co/rest/v1", ele corta e mantém só "https://xyz.supabase.co"
            parsed_url = urlparse(url.strip())
            clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
            clean_key = key.strip()
            
            file_name = f"{prefix}_{uuid.uuid4().hex[:8]}.pdf"
            print(f"[StorageService] 📤 Iniciando upload direto via HTTPX: {file_name}", flush=True)
            
            # Endpoint oficial da API REST do Supabase Storage
            endpoint = f"{clean_url}/storage/v1/object/orcamentos/{file_name}"
            
            headers = {
                "Authorization": f"Bearer {clean_key}",
                "apikey": clean_key,
                "Content-Type": "application/pdf"
            }
            
            # Faz o upload diretamente para o servidor
            response = httpx.post(endpoint, content=pdf_bytes, headers=headers, timeout=30.0)
            
            if response.status_code in (200, 201):
                public_url = f"{clean_url}/storage/v1/object/public/orcamentos/{file_name}"
                print(f"[StorageService] ✅ Sucesso! URL Gerada: {public_url}", flush=True)
                return public_url
            else:
                print(f"[StorageService] ❌ ERRO na API do Supabase: Status {response.status_code} - {response.text}", flush=True)
                return None
                
        except Exception as e:
            print(f"[StorageService] ❌ ERRO CRÍTICO na requisição HTTP: {repr(e)}", flush=True)
            return None