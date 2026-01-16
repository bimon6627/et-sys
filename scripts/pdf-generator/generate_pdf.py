import sys
import os
import openpyxl
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, Image, TopPadder, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.units import cm, inch, mm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

# --- Helper Class ---
class EmptyCheckbox(Flowable):
    def __init__(self, size=3.5*mm, line_width=0.5):
        self.width = size
        self.height = size
        self.line_width = line_width
        
    def draw(self):
        canvas = self.canv
        canvas.saveState()
        canvas.setLineWidth(self.line_width)
        canvas.setStrokeColor(colors.black)
        x = 0
        y = 0
        canvas.rect(x, y, self.width, self.height)
        canvas.restoreState()

# --- Data Fetching ---
def get_data_from_excel(file_bytes, sheet_name='Ark1'):
    try:
        workbook = openpyxl.load_workbook(filename=BytesIO(file_bytes))
        sheet = workbook[sheet_name]
    except KeyError:
        sys.stderr.write(f"Error: Sheet '{sheet_name}' not found.\n")
        return
    except Exception as e:
        sys.stderr.write(f"Error reading Excel data: {e}\n")
        return

    for row in sheet.iter_rows(min_row=2):
        row_data = [cell.value for cell in row]
        yield row_data

# --- Page Formatting ---
def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    text = "Side %s" % page_num
    x = doc.width + doc.leftMargin - (0.1 * inch) 
    y = 0.5 * inch
    
    font_name = 'Helvetica'
    if 'Graphik' in pdfmetrics.getRegisteredFontNames():
        font_name = 'Graphik'
        
    canvas.setFont(font_name, 9)
    canvas.drawRightString(x, y, text) 

# --- Main Execution ---
def generate_pdf(document_title="Dokument"):
    # 1. Read Binary Input from Node.js (stdin)
    try:
        input_data = sys.stdin.buffer.read()
        if not input_data:
            sys.stderr.write("Error: No input data received on stdin.\n")
            sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"Error reading stdin: {e}\n")
        sys.exit(1)

    # 2. Font Registration
    try:
        # Determine the directory where the script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        pdfmetrics.registerFont(TTFont('Graphik', os.path.join(script_dir, 'Graphik-Regular.ttf')))
        pdfmetrics.registerFont(TTFont('Graphik-Semibold', os.path.join(script_dir, 'Graphik-Semibold.ttf')))
        CUSTOM_FONT_NAME = 'Graphik'
        CUSTOM_FONT_BOLD_NAME = 'Graphik-Semibold'
    except:
        # sys.stderr.write("Warning: Custom fonts not found. Using Helvetica.\n")
        CUSTOM_FONT_NAME = 'Helvetica'
        CUSTOM_FONT_BOLD_NAME = 'Helvetica-Bold'

    # 3. Setup PDF Buffer
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
    styles = getSampleStyleSheet()

    # Apply Fonts
    styles['Normal'].fontName = CUSTOM_FONT_NAME
    styles['Normal'].fontSize = 10
    styles['h1'].fontName = CUSTOM_FONT_BOLD_NAME
    styles['h1'].fontSize = 26
    styles['h1'].leading = 32
    styles['h1'].alignment = TA_CENTER
    styles['h2'].fontName = CUSTOM_FONT_NAME
    styles['h2'].fontSize = 18

    newStyle = styles['Normal'].clone('forslag')
    newStyle.fontName = CUSTOM_FONT_BOLD_NAME
    newStyle.fontSize = 14
    styles.add(newStyle)

    rightAlign = ParagraphStyle(
        name='RightAlign',
        parent=styles['h2'],
        alignment=TA_RIGHT
    )

    story = []

    # Title Page
    story.append(Paragraph(document_title, styles['h1']))
    story.append(Spacer(1, 2*cm))

    data_header = [
        [
            Paragraph("Tilhører:", style=rightAlign),
            Paragraph("____________________________", style=styles['h2'])
        ],
        [
            Paragraph("Skole:", style=rightAlign),
            Paragraph("____________________________", styles['h2'])
        ]
    ]

    table_header = Table(data_header, colWidths=[6*cm, None])
    story.append(table_header)

    # Image
    imagePath = "EO-Sort.png" # Default value to prevent UnboundLocalError
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        imagePath = os.path.join(script_dir, 'EO-Sort.png')
        
        imageWidth = 8.47 * cm * 0.25
        imageHeight = 4.67 * cm * 0.25
        image = Image(imagePath, width=imageWidth, height=imageHeight, hAlign="CENTER")
        story.append(TopPadder(image))
    except Exception as e:
        sys.stderr.write(f"Warning: Could not load image at {imagePath}. Error: {e}\n")
        pass

    story.append(PageBreak())

    # --- Processing Excel Data ---
    EXCEL_SHEET_NAME = 'Maskinlesbart format'

    w1_cm = 2.44
    w2_cm = 8.25
    w3_cm = 4.00
    w4_cm = 1.69
    col_widths_points = [w1_cm * cm, w2_cm * cm, w3_cm * cm, w4_cm * cm]
    
    CHECKBOX_SIZE = 3.5 * mm
    SPACE_AFTER_CHECKBOX = 1.5 * mm
    PARAGRAPH_WIDTH = (w4_cm * cm) - (CHECKBOX_SIZE + SPACE_AFTER_CHECKBOX) + (0.5 * mm)

    for row_data in get_data_from_excel(input_data, EXCEL_SHEET_NAME):
        if not row_data or row_data[0] is None:
            continue

        suggestion = row_data[0]

        name = row_data[1] or ""
        school = row_data[2] or ""
        changeType = row_data[3] or ""
        place = row_data[4] or ""
        change = row_data[5] or ""
        recommendationCodeRaw = row_data[6] or ""
        recommendationCode = recommendationCodeRaw.split(" ")[0]

        voteFor = int(row_data[7]) if row_data[7] is not None else 0
        voteAgainst = int(row_data[8]) if row_data[8] is not None else 0
        voteAbstain = int(row_data[9]) if row_data[9] is not None else 0
        voteTally = f"({voteFor}-{voteAgainst}-{voteAbstain})"

        recommendation = ""
        if recommendationCode == "A":
            recommendation = f"Innstilt avvist {voteTally}"
        elif recommendationCode == "AF":
            recco_text = row_data[10] if len(row_data) > 10 else "?"
            recommendation = f"Innstilt avvist til fordel for {recco_text} {voteTally}"
        elif recommendationCode == "V":
            recommendation = f"Innstilt vedtatt {voteTally}"
        elif recommendationCode == "IFV":
            recommendation = f"Ingen forslag til vedtak {voteTally}"
        elif recommendationCode == "IF":
            recommendation = f"Ingen forslag til vedtak ({voteFor} for, {voteAgainst} mot, {voteAbstain} avholdende)"
        elif recommendationCode == "IRH":
            recommendation = "Ikke realitetsbehandlet"
        elif recommendationCode == "I":
            recommendation = "Ivaretatt"
        elif recommendationCode == "O":
            recommendation = f"Oversendt til Landsstyret {voteTally}"

        changeParagraphs = change.split("\n")
        if changeParagraphs:
            changeParagraphs[0] = "<b>Endring:</b> " + changeParagraphs[0]

        checkbox_for = Table(
            [[EmptyCheckbox(size=CHECKBOX_SIZE), Spacer(SPACE_AFTER_CHECKBOX, 1), Paragraph("For", style=styles['Normal'])]],
            colWidths=[CHECKBOX_SIZE, SPACE_AFTER_CHECKBOX, PARAGRAPH_WIDTH],
            style=TableStyle([
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ])
        )

        checkbox_mot = Table(
            [[EmptyCheckbox(size=CHECKBOX_SIZE), Spacer(SPACE_AFTER_CHECKBOX, 1), Paragraph("Mot", style=styles['Normal'])]],
            colWidths=[CHECKBOX_SIZE, SPACE_AFTER_CHECKBOX, PARAGRAPH_WIDTH],
            style=TableStyle([
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ])
        )

        data_row = [
            [
                suggestion,
                Paragraph(f"{name}<br/>{school}", style=styles['Normal']),
                Paragraph(f"Kapittel<br/>{place}", style=styles['Normal']),
                [checkbox_for, checkbox_mot]
            ],
            [changeType],
            [[Paragraph("Innstilt:", style=styles['Normal']), Paragraph(recommendation, style=styles['forslag'])]],
        ]

        t_style = TableStyle([
            ('SPAN', (0, 1), (3, 1)),
            ('SPAN', (0, 2), (3, 2)),
            ('SPAN', (0, -1), (-1, -1)),
            ('GRID', (0, 0), (-1, 1), 1, colors.black),
            ('GRID', (0, -1), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 0), (0, 0), CUSTOM_FONT_BOLD_NAME),
            ('FONTSIZE', (0, 0), (0, 0), 20),
            ('ALIGN', (0, 0), (0, 0), 'CENTER'),
            ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
            ('VALIGN', (1, 0), (-1, 0), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (0, 0), 0.5 * cm),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 0.2 * cm),
        ])

        insertIndex = 2
        for paragraph in changeParagraphs:
            data_row.insert(insertIndex, [Paragraph(paragraph, style=styles['Normal'])])
            t_style.add('SPAN', (0, insertIndex), (3, insertIndex))
            t_style.add('LINEBEFORE', (0, insertIndex), (3, insertIndex), 1, colors.black)
            t_style.add('LINEAFTER', (0, insertIndex), (3, insertIndex), 1, colors.black)
            insertIndex += 1

        table = Table(data_row, colWidths=col_widths_points)
        table.setStyle(t_style)

        try:
            story.append(KeepTogether([table, Spacer(1, 0.5 * cm)]))
        except Exception:
             sys.stderr.write(f"ERROR: Formatting issue for suggestion {suggestion}\n")

    try:
        doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
        sys.stdout.buffer.write(pdf_buffer.getvalue())
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(f"Critical Error building PDF: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    title_arg = "Redaksjonskomitéens innstilling til Politisk Måldokument"
    if len(sys.argv) > 1:
        title_arg = sys.argv[1]
    
    generate_pdf(title_arg)