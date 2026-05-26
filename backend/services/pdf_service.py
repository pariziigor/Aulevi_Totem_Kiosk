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
            logo_path = os.path.join(os.path.dirname(__file__), '../static/logo.png')
            with open(logo_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return f"data:image/png;base64,{encoded_string}"
        except Exception as e:
            print(f"[PDFService] Aviso: Não foi possível carregar a logo local. Erro: {e}")
            return "" 

    @staticmethod
    async def generate_quote_pdf(quote_data: dict, items: list, total_value: float, value_per_m2: float) -> bytes:
        """Gera o PDF de Orçamento e devolve como bytes em memória"""
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('quote_template.html')
        
        formatted_total = PDFService.format_currency(total_value)
        formatted_m2 = PDFService.format_currency(value_per_m2)
        
        for item in items:
            if 'price' in item and isinstance(item['price'], (int, float)):
                item['formatted_price'] = PDFService.format_currency(item['price'])
        
        logo_b64 = PDFService.get_logo_base64()
        
        html_content = template.render(
            quote=quote_data,
            items=items,
            total_value=formatted_total,
            value_per_m2=formatted_m2,
            date=datetime.now().strftime("%d/%m/%Y"),
            logo_url=logo_b64
        )
        
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            await page.set_content(html_content)
            await page.evaluate("document.fonts.ready")
            
            # Ao não fornecer 'path', o método devolve os bytes do PDF
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            
            await browser.close()
        
        return pdf_bytes

    @staticmethod
    def get_chale_image_base64(raw_id: str, image_num: int) -> str:
        """
        Busca a imagem do chalé na pasta do frontend de forma super resiliente.
        """
        try:
            numeros = ''.join(filter(str.isdigit, str(raw_id)))
            clean_id = int(numeros) if numeros else 1
            
            chale_str = f"{clean_id:02d}"
            base_filename = f"ch-{chale_str}-{image_num}"
            
            chales_dir = os.path.join(os.path.dirname(__file__), '../../frontend/public/assets/chales')
            
            for ext in ['.png', '.jpg', '.jpeg']:
                full_path = os.path.join(chales_dir, f"{base_filename}{ext}")
                if os.path.exists(full_path):
                    mime_type = "image/png" if ext == ".png" else "image/jpeg"
                    with open(full_path, "rb") as img_file:
                        encoded = base64.b64encode(img_file.read()).decode('utf-8')
                    return f"data:{mime_type};base64,{encoded}"
                    
            print(f"[PDFService] Aviso: Imagem local {base_filename} não encontrada em {chales_dir}")
            return ""
        except Exception as e:
            print(f"[PDFService] Erro ao carregar imagem do chalé: {e}")
            return ""

    @staticmethod
    async def generate_chalet_pdf(product_data: dict) -> bytes:
        """Gera o PDF do Chalé e devolve como bytes em memória"""
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('chale_template.html')
        
        logo_b64 = PDFService.get_logo_base64()
        raw_id = str(product_data.get('id', '1'))
        
        img1_b64 = PDFService.get_chale_image_base64(raw_id, 1)
        img2_b64 = PDFService.get_chale_image_base64(raw_id, 2)
        img3_b64 = PDFService.get_chale_image_base64(raw_id, 3)
        
        html_content = template.render(
            product=product_data,
            date=datetime.now().strftime("%d/%m/%Y"),
            logo_url=logo_b64,
            image_1=img1_b64,
            image_2=img2_b64,
            image_3=img3_b64
        )
        
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            await page.set_content(html_content)
            await page.evaluate("document.fonts.ready")
            
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            
            await browser.close()
        
        return pdf_bytes

    @staticmethod
    async def generate_madeiramento_pdf(quote_data: dict) -> bytes:
        """Gera o PDF de Madeiramento e devolve como bytes em memória"""
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('madeiramento_template.html')
        
        logo_b64 = PDFService.get_logo_base64()
        
        html_content = template.render(
            quote=quote_data,
            date=datetime.now().strftime("%d/%m/%Y"),
            logo_url=logo_b64
        )
        
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            await page.set_content(html_content)
            await page.evaluate("document.fonts.ready")
            
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            
            await browser.close()
        
        return pdf_bytes