import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
import pdfkit

class PDFService:
    @staticmethod
    def generate_quote_pdf(quote_data: dict, items: list, total_value: float, value_per_m2: float) -> str:
        env = Environment(loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates')))
        template = env.get_template('quote_template.html')
        
        html_content = template.render(
            quote=quote_data,
            items=items,
            total_value=total_value,
            value_per_m2=value_per_m2,
            date=datetime.now().strftime("%d/%m/%Y")
        )
        
        output_dir = os.path.join(os.path.dirname(__file__), '../generated_quotes')
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"orcamento_{quote_data['lead_phone']}_{int(datetime.now().timestamp())}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        options = {
            'page-size': 'A4',
            'margin-top': '0mm',
            'margin-right': '0mm',
            'margin-bottom': '0mm',
            'margin-left': '0mm',
            'encoding': "UTF-8",
        }
        
        # Estratégia de Auto-Discovery do executável no Windows
        possiveis_caminhos = [
            r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe',
            r'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe'
        ]
        
        caminho_wkhtmltopdf = None
        for caminho in possiveis_caminhos:
            if os.path.exists(caminho):
                caminho_wkhtmltopdf = caminho
                break
                
        if not caminho_wkhtmltopdf:
            raise RuntimeError("Motor wkhtmltopdf não encontrado. Verifique se o instalador foi executado na máquina hospedeira.")
            
        config = pdfkit.configuration(wkhtmltopdf=caminho_wkhtmltopdf)
        
        pdfkit.from_string(html_content, output_path, options=options, configuration=config)
        
        return output_path