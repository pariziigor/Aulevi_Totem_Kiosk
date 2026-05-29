import httpx
import os

class WhatsAppService:
    BASE_URL = "https://api.z-api.io/instances"
    INSTANCE_ID = os.getenv("ZAPI_INSTANCE_ID")
    TOKEN = os.getenv("ZAPI_TOKEN")
    CLIENT_TOKEN = os.getenv("ZAPI_CLIENT_TOKEN")

    @classmethod
    def send_pdf_quote(cls, phone: str, pdf_url: str, lead_name: str, product_name: str, quote_number: str):
        """Dispara o PDF via Z-API com nome de arquivo customizado e modelo específico."""
        if not cls.INSTANCE_ID or not cls.TOKEN:
            print("[WhatsAppService] ❌ ERRO: Credenciais da Z-API ausentes no .env!", flush=True)
            return False
            
        url = f"{cls.BASE_URL}/{cls.INSTANCE_ID}/token/{cls.TOKEN}/send-document/pdf"
        
        clean_phone = "".join(filter(str.isdigit, phone))
        
        if not clean_phone.startswith("55") and len(clean_phone) <= 11:
            clean_phone = f"55{clean_phone}"
            
        first_name = lead_name.split()[0].title()
        
        # Construindo o nome do arquivo exatamente como no Totem
        clean_name_for_file = lead_name.replace(" ", "_")
        file_name_pdf = f"{quote_number}_{clean_name_for_file}.pdf"
        
        payload = {
            "phone": clean_phone,
            "document": pdf_url, 
            "fileName": file_name_pdf,
            "caption": f"Olá, {first_name}! 👋\n\nObrigado por utilizar o nosso totem. Segue em anexo o orçamento para o seu projeto de *{product_name}* 📄.\n\n⚠️ *Aviso Importante:* Os valores apresentados neste documento são uma *estimativa inicial*. O investimento final pode sofrer alterações após uma análise técnica detalhada da nossa engenharia.\n\nNosso time de especialistas está à disposição para alinhar os detalhes, prazos e tirar qualquer dúvida que você tenha. 🤝\n\nUm abraço,\nEquipe Aulevi 🏗️"
        }
        
        headers = {}
        if cls.CLIENT_TOKEN:
            headers["Client-Token"] = cls.CLIENT_TOKEN
        
        try:
            print(f"[WhatsAppService] ⏳ Disparando para {clean_phone}...", flush=True)
            response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
            
            if response.status_code == 200:
                print(f"[WhatsAppService] ✅ Orçamento enviado com sucesso para {clean_phone}!", flush=True)
                return True
            else:
                print(f"[WhatsAppService] ❌ Falha na Z-API. Status: {response.status_code} - {response.text}", flush=True)
                return False
        except Exception as e:
            print(f"[WhatsAppService] ❌ Erro de conexão com a Z-API: {repr(e)}", flush=True)
            return False