import httpx
import os

class WhatsAppService:
    BASE_URL = "https://api.z-api.io/instances"
    INSTANCE_ID = os.getenv("ZAPI_INSTANCE_ID")
    TOKEN = os.getenv("ZAPI_TOKEN")

    @classmethod
    async def send_pdf_quote(cls, phone: str, pdf_url: str, lead_name: str, product_name: str):
        """Dispara o PDF via Z-API de forma assíncrona."""
        if not cls.INSTANCE_ID or not cls.TOKEN:
            print("[WhatsAppService] ERRO: Credenciais da Z-API ausentes no .env!")
            return False
            
        url = f"{cls.BASE_URL}/{cls.INSTANCE_ID}/token/{cls.TOKEN}/send-file-from-url"
        
        # Limpa o telefone (remove +, espaços, parênteses e traços)
        clean_phone = "".join(filter(str.isdigit, phone))
        first_name = lead_name.split()[0].title()
        
        payload = {
            "phone": clean_phone,
            "url": pdf_url,
            "fileName": f"Orcamento_Aulevi_{first_name}.pdf",
            "caption": f"Olá, {first_name}! 🚀\n\nSegue o seu orçamento detalhado para o projeto de *{product_name}* que você solicitou no nosso totem.\n\nA equipe de Engenharia da Aulevi está à disposição para tirar qualquer dúvida!"
        }
        
        # Fazemos a requisição assíncrona para não travar o servidor
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, timeout=15.0)
                if response.status_code == 200:
                    print(f"[WhatsAppService] ✅ Orçamento enviado com sucesso para {clean_phone}!")
                    return True
                else:
                    print(f"[WhatsAppService] ❌ Falha no envio. Status: {response.status_code} - {response.text}")
                    return False
            except Exception as e:
                print(f"[WhatsAppService] ❌ Erro de conexão com a Z-API: {e}")
                return False