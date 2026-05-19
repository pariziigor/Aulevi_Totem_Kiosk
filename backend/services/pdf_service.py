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
    
    @staticmethod
    def get_chale_image_base64(chale_id: int, image_num: int) -> str:
        """
        Busca a imagem do chalé na pasta do frontend de acordo com o padrão informado,
        suportando extensões .png, .jpg e .jpeg de forma flexível.
        """
        try:
            # Formata o número do chalé com dois dígitos (ex: 1 vira '01')
            chale_str = f"{chale_id:02d}"
            base_filename = f"ch-{chale_str}-{image_num}"
            
            # Caminho relativo apontando para a pasta do frontend fornecida
            chales_dir = os.path.join(os.path.dirname(__file__), '../../frontend/public/assets/chales')
            
            # Testa as extensões mais comuns para não quebrar caso mude o formato do arquivo
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
    def get_chale_image_base64(raw_id: str, image_num: int) -> str:
        """
        Busca a imagem do chalé na pasta do frontend de forma super resiliente.
        Extrai apenas os números do ID, não importa como o frontend envie.
        """
        try:
            # Pega a string (ex: 'ch-02') e filtra apenas o que é dígito numérico (ex: '2')
            numeros = ''.join(filter(str.isdigit, str(raw_id)))
            clean_id = int(numeros) if numeros else 1
            
            # Formata garantindo os dois dígitos para casar com o nome do arquivo: ch-02-1, ch-02-2
            chale_str = f"{clean_id:02d}"
            base_filename = f"ch-{chale_str}-{image_num}"
            
            # Caminho relativo apontando para a pasta do frontend
            chales_dir = os.path.join(os.path.dirname(__file__), '../../frontend/public/assets/chales')
            
            # Testa as extensões mais comuns
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
    async def generate_chalet_pdf(product_data: dict) -> str:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('chale_template.html')
        
        logo_b64 = PDFService.get_logo_base64()
        
        # Pega o ID bruto do jeito que vier do frontend (como a string "ch-02")
        raw_id = str(product_data.get('id', '1'))
        
        # Passa o raw_id para a nossa função blindada tratar
        main_img_b64 = PDFService.get_chale_image_base64(raw_id, 1)
        sec_img_b64 = PDFService.get_chale_image_base64(raw_id, 2)
        
        html_content = template.render(
            product=product_data,
            date=datetime.now().strftime("%d/%m/%Y"),
            logo_url=logo_b64,
            main_image=main_img_b64,
            secondary_image=sec_img_b64
        )
        
        output_dir = os.path.join(os.path.dirname(__file__), '../generated_quotes')
        os.makedirs(output_dir, exist_ok=True)
        
        clean_title = product_data.get('title', 'chale').lower().replace(" ", "-")
        filename = f"especificacoes_{clean_title}_{int(datetime.now().timestamp())}.pdf"
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