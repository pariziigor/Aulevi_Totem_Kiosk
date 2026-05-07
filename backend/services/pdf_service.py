from jinja2 import Environment, FileSystemLoader
import pdfkit # Wrapper para wkhtmltopdf ou similar

class PDFService:
    @staticmethod
    def generate_quote_pdf(quote_data: dict, items: list):
        env = Environment(loader=FileSystemLoader('templates'))
        template = env.get_template('quote_template.html')
        
        # Estilo brutalista no PDF: Fontes sans-serif, bordas grossas, alto contraste
        html_content = template.render(
            quote=quote_data,
            items=items,
            company_name="AULEVI STEEL FRAME"
        )
        
        options = {
            'page-size': 'A4',
            'margin-top': '0mm',
            'margin-right': '0mm',
            'margin-bottom': '0mm',
            'margin-left': '0mm',
        }
        
        # O arquivo é gerado localmente no Totem para acesso imediato
        output_path = f"generated_quotes/orcamento_{quote_data['id']}.pdf"
        pdfkit.from_string(html_content, output_path, options=options)
        return output_path