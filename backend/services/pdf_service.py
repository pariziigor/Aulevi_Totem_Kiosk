import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from playwright.async_api import async_playwright

class PDFService:
    @staticmethod
    def format_currency(value: float) -> str:
        if value is None:
            return "R$ 0,00"
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    # 2. FUNÇÃO AGORA É 'async def'
    @staticmethod
    async def generate_quote_pdf(quote_data: dict, items: list, total_value: float, value_per_m2: float) -> str:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('quote_template.html')
        
        formatted_total = PDFService.format_currency(total_value)
        formatted_m2 = PDFService.format_currency(value_per_m2)
        
        for item in items:
            if 'price' in item and isinstance(item['price'], (int, float)):
                item['formatted_price'] = PDFService.format_currency(item['price'])
        
        html_content = template.render(
            quote=quote_data,
            items=items,
            total_value=formatted_total,
            value_per_m2=formatted_m2,
            date=datetime.now().strftime("%d/%m/%Y")
        )
        
        output_dir = os.path.join(os.path.dirname(__file__), '../generated_quotes')
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"orcamento_{quote_data.get('lead_phone', 'sem-numero')}_{int(datetime.now().timestamp())}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        # 3. BLOCO PLAYWRIGHT TOTALMENTE ASSÍNCRONO COM 'await'
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