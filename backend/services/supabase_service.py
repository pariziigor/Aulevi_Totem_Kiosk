import os
import uuid
import httpx

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
            # Limpa as variáveis para evitar espaços ou barras invertidas acidentais
            clean_url = url.strip().rstrip('/')
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
            
            # Faz o upload diretamente para o servidor, sem intermediários
            response = httpx.post(endpoint, content=pdf_bytes, headers=headers, timeout=30.0)
            
            if response.status_code in (200, 201):
                # Se o upload deu certo, montamos a URL pública nativa
                public_url = f"{clean_url}/storage/v1/object/public/orcamentos/{file_name}"
                print(f"[StorageService] ✅ Sucesso! URL Gerada: {public_url}", flush=True)
                return public_url
            else:
                # Se der erro, agora o servidor vai dizer exatamente o que foi (ex: RLS, Bucket not found, etc)
                print(f"[StorageService] ❌ ERRO na API do Supabase: Status {response.status_code} - {response.text}", flush=True)
                return None
                
        except Exception as e:
            print(f"[StorageService] ❌ ERRO CRÍTICO na requisição HTTP: {repr(e)}", flush=True)
            return None