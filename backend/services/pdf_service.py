import os
import base64
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from playwright.async_api import async_playwright

class PDFService:
    @staticmethod
    def format_currency(value: float) -> str:
        if value is None:
            return "R$ 0,00"
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        
    @staticmethod
    def get_logo_base64() -> str:
        """Lê o arquivo logo.png local e converte para uma string Base64 pronta para o HTML"""
        try:
            # Aponta para a pasta 'static' que deve estar na mesma altura da pasta 'services' e 'templates'
            logo_path = os.path.join(os.path.dirname(__file__), '../static/logo.png')
            
            with open(logo_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                
            return f"data:image/png;base64,{encoded_string}"
        except Exception as e:
            print(f"[PDFService] Aviso: Não foi possível carregar a logo local. Erro: {e}")
            return "" 

    @staticmethod
    async def generate_quote_pdf(quote_data: dict, items: list, total_value: float, value_per_m2: float) -> str:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('quote_template.html')
        
        formatted_total = PDFService.format_currency(total_value)
        formatted_m2 = PDFService.format_currency(value_per_m2)
        
        for item in items:
            if 'price' in item and isinstance(item['price'], (int, float)):
                item['formatted_price'] = PDFService.format_currency(item['price'])
        
        # 1. Puxa a logo convertida em Base64
        logo_b64 = PDFService.get_logo_base64()
        
        # 2. Injeta a variável 'logo_url' no template
        html_content = template.render(
            quote=quote_data,
            items=items,
            total_value=formatted_total,
            value_per_m2=formatted_m2,
            date=datetime.now().strftime("%d/%m/%Y"),
            logo_url=logo_b64
        )
        
        output_dir = os.path.join(os.path.dirname(__file__), '../generated_quotes')
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"orcamento_{quote_data.get('lead_phone', 'sem-numero')}_{int(datetime.now().timestamp())}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            await page.set_content(html_content)
            await page.evaluate("document.fonts.ready")
            
            await page.pdf(
                path=output_path,
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            
            await browser.close()
        
        return output_path