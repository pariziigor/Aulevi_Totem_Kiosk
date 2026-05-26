import os
from PIL import Image
import io
import base64
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from playwright.async_api import async_playwright

class PDFService:
    playwright = None
    browser = None

    @classmethod
    async def start_browser(cls):
        """Inicia o navegador uma única vez na memória com otimizações para Nuvem."""
        if cls.browser is None:
            cls.playwright = await async_playwright().start()
            cls.browser = await cls.playwright.chromium.launch(
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            )
            print("[PDFService] Motor do Chromium iniciado em background.")

    @classmethod
    async def stop_browser(cls):
        """Desliga o navegador de forma segura."""
        if cls.browser:
            await cls.browser.close()
            await cls.playwright.stop()
            cls.browser = None
            cls.playwright = None
            print("[PDFService] Motor do Chromium encerrado.")

    @staticmethod
    def format_currency(value: float) -> str:
        if value is None:
            return "R$ 0,00"
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        
    @staticmethod
    def get_logo_base64() -> str:
        try:
            logo_path = os.path.join(os.path.dirname(__file__), '../static/logo.png')
            with open(logo_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return f"data:image/png;base64,{encoded_string}"
        except Exception as e:
            print(f"[PDFService] Aviso: Não foi possível carregar a logo. Erro: {e}")
            return "" 

    @classmethod
    async def generate_quote_pdf(cls, quote_data: dict, items: list, total_value: float, value_per_m2: float) -> bytes:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('quote_template.html')
        
        formatted_total = PDFService.format_currency(total_value)
        formatted_m2 = PDFService.format_currency(value_per_m2)
        
        for item in items:
            if 'price' in item and isinstance(item['price'], (int, float)):
                item['formatted_price'] = PDFService.format_currency(item['price'])
        
        logo_b64 = PDFService.get_logo_base64()
        
        html_content = template.render(
            quote=quote_data, items=items, total_value=formatted_total,
            value_per_m2=formatted_m2, date=datetime.now().strftime("%d/%m/%Y"), logo_url=logo_b64
        )
        
        # Cria apenas uma aba rápida em vez de um navegador inteiro
        page = await cls.browser.new_page()
        await page.set_content(html_content)
        await page.evaluate("document.fonts.ready")
        
        pdf_bytes = await page.pdf(
            format="A4", print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        
        await page.close() # Fecha a aba para liberar memória RAM
        return pdf_bytes

    @staticmethod
    @staticmethod
    def get_chale_image_base64(raw_id: str, image_num: int) -> str:
        try:
            numeros = ''.join(filter(str.isdigit, str(raw_id)))
            clean_id = int(numeros) if numeros else 1
            chale_str = f"{clean_id:02d}"
            base_filename = f"ch-{chale_str}-{image_num}"
            chales_dir = os.path.join(os.path.dirname(__file__), '../../frontend/public/assets/chales')
            
            for ext in ['.png', '.jpg', '.jpeg']:
                full_path = os.path.join(chales_dir, f"{base_filename}{ext}")
                if os.path.exists(full_path):
                    # OTIMIZAÇÃO: Redimensiona antes de converter para base64
                    with Image.open(full_path) as img:
                        # Converte para RGB se for PNG com transparência (para evitar erros em JPEG)
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGB")
                        
                        # Redimensiona mantendo a proporção (largura máx 800px)
                        max_width = 800
                        w_percent = (max_width / float(img.size[0]))
                        if w_percent < 1: # Só redimensiona se for maior que 800px
                            h_size = int((float(img.size[1]) * float(w_percent)))
                            img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
                        
                        buffer = io.BytesIO()
                        img.save(buffer, format="JPEG", quality=75)
                        encoded = base64.b64encode(buffer.getvalue()).decode('utf-8')
                        return f"data:image/jpeg;base64,{encoded}"
            return ""
        except Exception as e:
            print(f"[PDFService] Erro ao otimizar imagem: {e}")
            return ""

    @classmethod
    async def generate_chalet_pdf(cls, product_data: dict) -> bytes:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('chale_template.html')
        
        logo_b64 = PDFService.get_logo_base64()
        raw_id = str(product_data.get('id', '1'))
        
        img1_b64 = PDFService.get_chale_image_base64(raw_id, 1)
        img2_b64 = PDFService.get_chale_image_base64(raw_id, 2)
        img3_b64 = PDFService.get_chale_image_base64(raw_id, 3)
        
        html_content = template.render(
            product=product_data, date=datetime.now().strftime("%d/%m/%Y"),
            logo_url=logo_b64, image_1=img1_b64, image_2=img2_b64, image_3=img3_b64
        )
        
        page = await cls.browser.new_page()
        await page.set_content(html_content)
        await page.evaluate("document.fonts.ready")
        
        pdf_bytes = await page.pdf(
            format="A4", print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        await page.close()
        return pdf_bytes

    @classmethod
    async def generate_madeiramento_pdf(cls, quote_data: dict) -> bytes:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('madeiramento_template.html')
        logo_b64 = PDFService.get_logo_base64()
        
        html_content = template.render(
            quote=quote_data, date=datetime.now().strftime("%d/%m/%Y"), logo_url=logo_b64
        )
        
        page = await cls.browser.new_page()
        await page.set_content(html_content)
        await page.evaluate("document.fonts.ready")
        
        pdf_bytes = await page.pdf(
            format="A4", print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        await page.close()
        return pdf_bytes