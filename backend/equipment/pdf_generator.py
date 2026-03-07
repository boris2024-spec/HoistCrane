"""
PDF Generator for Equipment Inspection Report (תסקיר בדיקה תקופתית)
Based on: פקודת הבטיחות בעבודה (נוסח חדש) תש״ל-1970 - סעיף 81
Generates the official Israeli periodic inspection form for cranes and lifting equipment.
"""
import io
import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Try to use python-bidi for proper RTL text
try:
    from bidi.algorithm import get_display
    HAS_BIDI = True
except ImportError:
    HAS_BIDI = False

# ---------------------------------------------------------------------------
# Font registration
# ---------------------------------------------------------------------------
_FONT_REGISTERED = False
HEBREW_FONT = 'HebrewFont'
HEBREW_FONT_BOLD = 'HebrewFontBold'


def _register_fonts():
    global _FONT_REGISTERED
    if _FONT_REGISTERED:
        return

    if os.path.exists(r'C:\Windows\Fonts\arial.ttf'):
        pdfmetrics.registerFont(
            TTFont(HEBREW_FONT, r'C:\Windows\Fonts\arial.ttf'))
    elif os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        pdfmetrics.registerFont(
            TTFont(HEBREW_FONT, '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))

    if os.path.exists(r'C:\Windows\Fonts\arialbd.ttf'):
        pdfmetrics.registerFont(
            TTFont(HEBREW_FONT_BOLD, r'C:\Windows\Fonts\arialbd.ttf'))
    elif os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        pdfmetrics.registerFont(TTFont(
            HEBREW_FONT_BOLD, '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))

    _FONT_REGISTERED = True


def b(text):
    """Apply bidi algorithm for RTL rendering."""
    if not text:
        return ''
    text = str(text)
    if HAS_BIDI:
        return get_display(text)
    return text


def b_long(text, chars_per_line=35):
    """
    Apply bidi algorithm to long RTL text, splitting into lines
    to prevent reversed line order when ReportLab wraps the text.

    get_display() reverses the entire string for LTR visual display.
    When ReportLab then word-wraps this reversed string, the lines
    appear in reverse order.  By splitting into per-line chunks first
    and applying get_display() to each chunk individually, the correct
    top-to-bottom line order is preserved.
    """
    if not text:
        return ''
    text = str(text)
    if not HAS_BIDI:
        return text

    # Short text that fits on one line — use regular bidi
    if len(text) <= chars_per_line:
        return get_display(text)

    # Split into words and build lines that fit the column width
    words = text.split()
    lines = []
    current_words = []
    current_len = 0

    for word in words:
        word_len = len(word)
        new_len = current_len + word_len + (1 if current_words else 0)
        if new_len > chars_per_line and current_words:
            lines.append(' '.join(current_words))
            current_words = [word]
            current_len = word_len
        else:
            current_words.append(word)
            current_len = new_len

    if current_words:
        lines.append(' '.join(current_words))

    # Apply bidi to each line individually
    bidi_lines = [get_display(line) for line in lines]
    return '<br/>'.join(bidi_lines)


# Keep old name for backward compat
bidi_text = b

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
BLACK = colors.black
WHITE = colors.white
LIGHT_GRAY = colors.HexColor('#f0f0f0')
HEADER_BG = colors.HexColor('#1a237e')
SECTION_BG = colors.HexColor('#e8eaf6')
BORDER = colors.HexColor('#333333')
LIGHT_BORDER = colors.HexColor('#aaaaaa')

# ---------------------------------------------------------------------------
# Type labels
# ---------------------------------------------------------------------------
TYPE_LABELS = {
    'crane': 'מנוף',
    'hoist': 'מנוף רמה / מנופון',
    'forklift': 'מלגזה / מזלגון',
    'elevator': 'מעלית',
    'platform': 'במה מתרוממת',
    'other': 'מכונת הרמה',
}


def _fmt(date_val):
    """Format date to DD-MM-YYYY."""
    if not date_val:
        return ''
    if isinstance(date_val, str):
        try:
            date_val = datetime.strptime(date_val, '%Y-%m-%d').date()
        except Exception:
            return date_val
    try:
        return date_val.strftime('%d-%m-%Y')
    except Exception:
        return str(date_val)


# Keep old name for backward compat
_format_date = _fmt


def _cell(items):
    """Stack multiple Paragraphs/Spacers vertically inside a cell."""
    data = [[p] for p in items]
    t = Table(data, colWidths=[None])
    t.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t


def generate_equipment_pdf(equipment, inspection=None):
    """
    Generate a PDF inspection report (תסקיר בדיקה תקופתית) for the given Equipment.
    Optionally takes an Inspection object for additional data.
    Returns a BytesIO buffer containing the PDF.
    """
    _register_fonts()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=12 * mm, leftMargin=12 * mm,
        topMargin=10 * mm, bottomMargin=10 * mm,
    )

    styles = getSampleStyleSheet()
    W = A4[0] - 24 * mm  # total available width

    # ── Style definitions ──────────────────────────────────────────────
    s_title = ParagraphStyle('s_title', fontName=HEBREW_FONT_BOLD, fontSize=12,
                             alignment=TA_CENTER, textColor=WHITE, leading=16)
    s_subtitle = ParagraphStyle('s_subtitle', fontName=HEBREW_FONT_BOLD, fontSize=10,
                                alignment=TA_CENTER, textColor=WHITE, leading=14)
    s_num = ParagraphStyle('s_num', fontName=HEBREW_FONT_BOLD, fontSize=10,
                           alignment=TA_CENTER, textColor=BLACK, leading=13)
    s_lbl = ParagraphStyle('s_lbl', fontName=HEBREW_FONT_BOLD, fontSize=8.5,
                           alignment=TA_RIGHT, textColor=BLACK, leading=11)
    s_lbl_c = ParagraphStyle('s_lbl_c', fontName=HEBREW_FONT_BOLD, fontSize=8.5,
                             alignment=TA_CENTER, textColor=BLACK, leading=11)
    s_val = ParagraphStyle('s_val', fontName=HEBREW_FONT, fontSize=9,
                           alignment=TA_RIGHT, textColor=BLACK, leading=12)
    s_val_c = ParagraphStyle('s_val_c', fontName=HEBREW_FONT, fontSize=9,
                             alignment=TA_CENTER, textColor=BLACK, leading=12)
    s_val_b = ParagraphStyle('s_val_b', fontName=HEBREW_FONT_BOLD, fontSize=9,
                             alignment=TA_RIGHT, textColor=BLACK, leading=12)
    s_val_bc = ParagraphStyle('s_val_bc', fontName=HEBREW_FONT_BOLD, fontSize=9,
                              alignment=TA_CENTER, textColor=BLACK, leading=12)
    s_sm = ParagraphStyle('s_sm', fontName=HEBREW_FONT, fontSize=7,
                          alignment=TA_RIGHT, textColor=BLACK, leading=9)
    s_sm_c = ParagraphStyle('s_sm_c', fontName=HEBREW_FONT, fontSize=7,
                            alignment=TA_CENTER, textColor=BLACK, leading=9)
    s_desc = ParagraphStyle('s_desc', fontName=HEBREW_FONT, fontSize=8,
                            alignment=TA_RIGHT, textColor=BLACK, leading=11)
    s_decl = ParagraphStyle('s_decl', fontName=HEBREW_FONT, fontSize=7,
                            alignment=TA_RIGHT, textColor=BLACK, leading=10)
    s_foot = ParagraphStyle('s_foot', fontName=HEBREW_FONT, fontSize=6.5,
                            alignment=TA_CENTER, textColor=colors.HexColor('#666666'), leading=9)

    eq = equipment

    # ── Resolve latest inspection / report data ────────────────────────
    insp = inspection
    if insp is None:
        try:
            insp = eq.inspections.order_by('-inspection_date').first()
        except Exception:
            insp = None

    report = None
    try:
        report = eq.inspection_reports.order_by('-inspection_date').first()
    except Exception:
        report = None

    # Fields with fallback chain: equipment → inspection → report
    def _pick(*sources):
        for s in sources:
            if s:
                return str(s)
        return ''

    employer = _pick(eq.employer,
                     getattr(insp, 'employer', None),
                     getattr(report, 'employer', None))
    site_address = eq.site_name or ''
    workplace = _pick(eq.workplace_name,
                      getattr(insp, 'workplace_name', None),
                      getattr(report, 'workplace_name', None))
    department = eq.department or ''
    location = eq.location_details or ''

    fab = _pick(getattr(insp, 'fab', None), getattr(report, 'fab', None))
    site_sub = _pick(getattr(insp, 'site', None),
                     getattr(report, 'site', None))

    inspector_name = _pick(eq.inspector_name,
                           getattr(insp, 'inspector_name', None),
                           getattr(report, 'inspector_name', None))
    inspector_license = _pick(getattr(insp, 'inspector_license', None),
                              getattr(report, 'inspector_license', None))

    inspection_date = getattr(insp, 'inspection_date',
                              None) or eq.last_inspection_date
    next_date = (getattr(insp, 'next_due_date', None)
                 or getattr(report, 'next_inspection_date', None)
                 or eq.next_inspection_date)

    eq_type_label = TYPE_LABELS.get(
        eq.equipment_type, eq.equipment_type or 'מכונת הרמה')

    capacity_str = ''
    if eq.capacity:
        unit = eq.capacity_unit or 'ק"ג'
        capacity_str = f'{eq.capacity} {unit}'

    height_str = f"{eq.height} מ'" if eq.height else ''

    description = eq.description or eq_type_label
    serial_line = f'Ser {eq.serial_number}' if eq.serial_number else ''

    # Defects – only from inspection report / inspection, NOT from equipment notes
    defects = ''
    defects_detail = ''
    if report:
        defects = getattr(report, 'defects_description', '') or ''
        defects_detail = getattr(report, 'repairs_required', '') or ''
        if not defects:
            defects = getattr(report, 'no_defects_note', '') or 'אין'
    elif insp:
        defects = getattr(insp, 'notes', '') or 'אין'
    else:
        defects = 'אין'
    if not defects_detail and defects.strip() != 'אין':
        defects_detail = defects
    if not defects_detail:
        defects_detail = ''

    # Location composite for "הבדיקה נערכה ב"
    inspection_location = _pick(site_sub, workplace, fab, department, location)

    # Location for FAB column
    fab_display = ''
    if fab:
        fab_display = f'FAB {fab}'
    elif site_sub:
        fab_display = site_sub
    elif department:
        fab_display = department

    elements = []
    TS = TableStyle  # shorthand

    # ── Report numbers (תסקיר מס' / תסקיר קודם) ───────────────────────
    report_number = ''
    prev_report_number = ''
    if report:
        report_number = getattr(report, 'report_number', '') or ''
        # Try to find previous report
        try:
            prev_report = eq.inspection_reports.filter(
                inspection_date__lt=report.inspection_date
            ).order_by('-inspection_date').first()
            if prev_report:
                prev_report_number = getattr(
                    prev_report, 'report_number', '') or ''
        except Exception:
            pass

    # ── Style for top strip ────────────────────────────────────────────
    s_topbox = ParagraphStyle('s_topbox', fontName=HEBREW_FONT_BOLD, fontSize=8,
                              alignment=TA_RIGHT, textColor=BLACK, leading=11)
    s_topbox_c = ParagraphStyle('s_topbox_c', fontName=HEBREW_FONT_BOLD, fontSize=8,
                                alignment=TA_CENTER, textColor=BLACK, leading=11)

    # ══════════════════════════════════════════════════════════════════════
    # TOP STRIP — report numbers (left) + disclaimer box (right)
    # ══════════════════════════════════════════════════════════════════════
    report_num_text = f"תסקיר מס'  {report_number}" if report_number else "תסקיר מס'  ________"
    prev_num_text = f'תסקיר קודם  {prev_report_number}' if prev_report_number else 'תסקיר קודם  ________'

    top_strip = Table([[
        # Left: Report numbers
        _cell([
            Paragraph(b(report_num_text), s_topbox),
            Paragraph(b(prev_num_text), s_topbox),
        ]),
        # Spacer in the middle
        Paragraph('', s_topbox),
        # Right: "יש לשמור תסקיר זה לביקורת מפקח עבודה"
        _cell([
            Paragraph(b('יש לשמור תסקיר זה'), s_topbox_c),
            Paragraph(b('לביקורת מפקח עבודה'), s_topbox_c),
        ]),
    ]], colWidths=[W * 0.30, W * 0.40, W * 0.30])
    top_strip.setStyle(TS([
        ('BOX', (0, 0), (0, 0), 0.75, BORDER),
        ('BOX', (2, 0), (2, 0), 0.75, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(top_strip)
    elements.append(Spacer(1, 2 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # HEADER — Legal reference
    # ══════════════════════════════════════════════════════════════════════
    header = Table([
        [Paragraph(b('פקודת הבטיחות בעבודה (נוסח חדש) תש״ל-1970 - סעיף 81'), s_title)],
        [Paragraph(
            b('תסקיר על בדיקה תקופתית של עגורנים ומכונות הרמה ואביזריהם'), s_subtitle)],
    ], colWidths=[W])
    header.setStyle(TS([
        ('BACKGROUND', (0, 0), (-1, -1), HEADER_BG),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(header)
    elements.append(Spacer(1, 1.5 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # ROW 1: Section 1 + "הבדיקה נערכה ב" + "איש קשר"
    # ══════════════════════════════════════════════════════════════════════
    r1 = Table([[
        _cell([Paragraph(b('איש קשר:'), s_lbl),
               Paragraph(b(inspector_name), s_val)]),
        _cell([Paragraph(b('הבדיקה נערכה ב:'), s_lbl),
               Paragraph(b(inspection_location), s_val)]),
        _cell([Paragraph(b('.1 נעשתה בדיקה תקופתית'), s_lbl)]),
    ]], colWidths=[W * 0.28, W * 0.37, W * 0.35])
    r1.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(r1)

    # ══════════════════════════════════════════════════════════════════════
    # ROW 2: Section 2 (factory) + Section 3 (address) + Section 4 (date)
    # ══════════════════════════════════════════════════════════════════════
    r2 = Table([[
        _cell([Paragraph(b('.4 תאריך הבדיקה:'), s_lbl),
               Paragraph(b(_fmt(inspection_date)), s_val_b)]),
        _cell([Paragraph(b('.3 כתובת המפעל:'), s_lbl),
               Paragraph(b(site_address), s_val),
               Paragraph(b('טלפון:                    פקס:'), s_sm)]),
        _cell([Paragraph(b('.2 שם המפעל בו נמצאת מכונת ההרמה:'), s_lbl),
               Paragraph(b(employer), s_val_b),
               Paragraph(b(workplace), s_val)]),
    ]], colWidths=[W * 0.20, W * 0.38, W * 0.42])
    r2.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(r2)
    elements.append(Spacer(1, 2 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # EQUIPMENT TABLE — Columns 5-8
    # ══════════════════════════════════════════════════════════════════════
    cw = [
        W * 0.12,   # col 8 — עומס עבודה בטוח
        W * 0.07,   # גובה
        W * 0.11,   # FAB / מיקום
        W * 0.10,   # col 7 — מס' רישום
        W * 0.12,   # מס' סידורי יצרן
        W * 0.16,   # col 6 — שם היצרן והדגם
        W * 0.32,   # col 5 — תיאור מכונת ההרמה
    ]

    # Number header row
    num_row = [
        Paragraph(b('8'), s_num), Paragraph('', s_num), Paragraph('', s_num),
        Paragraph(b('7'), s_num), Paragraph('', s_num),
        Paragraph(b('6'), s_num), Paragraph(b('5'), s_num),
    ]

    # Labels row
    lbl_row = [
        _cell([Paragraph(b('עומס עבודה בטוח'), s_sm_c),
               Paragraph(b('בק"ג'), s_sm_c)]),
        Paragraph(b('גובה'), s_sm_c),
        Paragraph(b('FAB / מיקום'), s_sm_c),
        Paragraph(b("מס' רישום"), s_sm_c),
        _cell([Paragraph(b("מס' סידורי"), s_sm_c),
               Paragraph(b('יצרן'), s_sm_c)]),
        _cell([Paragraph(b('שם היצרן'), s_sm_c),
               Paragraph(b('והדגם'), s_sm_c)]),
        Paragraph(b('תיאור מכונת ההרמה'), s_sm_c),
    ]

    # Data row
    data_row = [
        Paragraph(b(capacity_str), s_val_bc),
        Paragraph(b(height_str), s_val_c),
        Paragraph(b(fab_display), s_val_c),
        Paragraph(b(eq.equipment_number), s_val_bc),
        Paragraph(b(serial_line), s_val_c),
        _cell([Paragraph(b(eq.manufacturer or ''), s_val_c),
               Paragraph(b(eq.model or ''), s_val_c)]),
        Paragraph(b_long(description), s_desc),
    ]

    eq_table = Table([num_row, lbl_row, data_row], colWidths=cw)
    eq_table.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 1, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('BACKGROUND', (0, 0), (-1, 0), SECTION_BG),
        ('BACKGROUND', (0, 1), (-1, 1), LIGHT_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, 1), 3),
        ('TOPPADDING', (0, 2), (-1, 2), 6),
        ('BOTTOMPADDING', (0, 2), (-1, 2), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('ROWHEIGHT', (0, 2), (-1, 2), 38 * mm),
    ]))
    elements.append(eq_table)
    elements.append(Spacer(1, 2 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # SECTIONS 9-10: Defects
    # ══════════════════════════════════════════════════════════════════════
    # Number header
    dh = Table([[
        Paragraph(b('10'), s_num),
        Paragraph(b('9'), s_num),
    ]], colWidths=[W * 0.50, W * 0.50])
    dh.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), SECTION_BG),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(dh)

    # Labels
    dl = Table([[
        _cell([Paragraph(b('תאור הליקויים והאמצעים'), s_sm_c),
               Paragraph(b('שיש לנקוט לתיקון הליקויים'), s_sm_c)]),
        _cell([Paragraph(b('.9 ליקויים שנתגלו בבדיקה'), s_lbl_c),
               Paragraph(b('(כשאין ליקויים תכתב המילה "אין" לגבי הפריט)'), s_sm_c)]),
    ]], colWidths=[W * 0.50, W * 0.50])
    dl.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(dl)

    # Defects data
    dd = Table([[
        Paragraph(b(defects_detail), s_val),
        Paragraph(b(defects), s_val_b),
    ]], colWidths=[W * 0.50, W * 0.50])
    dd.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWHEIGHT', (0, 0), (-1, -1), 20 * mm),
    ]))
    elements.append(dd)
    elements.append(Spacer(1, 2 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # DATES ROW — inspection date + next inspection date
    # ══════════════════════════════════════════════════════════════════════
    dr = Table([[
        _cell([Paragraph(b('תאריך הבדיקה:'), s_lbl),
               Paragraph(b(_fmt(inspection_date)), s_val_b)]),
        _cell([Paragraph(b('תאריך הבדיקה הבאה:'), s_lbl),
               Paragraph(b(_fmt(next_date)), s_val_b)]),
    ]], colWidths=[W * 0.50, W * 0.50])
    dr.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('BACKGROUND', (0, 0), (-1, -1), SECTION_BG),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(dr)
    elements.append(Spacer(1, 3 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # INSPECTOR DECLARATION
    # ══════════════════════════════════════════════════════════════════════
    insp_name = inspector_name or '________'
    # Split declaration into individual visual lines so bidi is applied
    # per-line and reportlab doesn't reverse the line order.
    decl_lines = [
        f'אני {insp_name} בודק מוסמך שהוסמכתי ע"י מפקח עבודה ראשי.'
        ' לפי סימן ז\' לפרק הבטיחות בעבודה (נוסח חדש) תש"ל - 1970'
        ' לעשות ניסויים ובדיקות. מצהיר כי: הרישומים',

        'בסעיפים וטורים 1-7 הם תאור נכון של מכונות ההרמה ואביזריהם'
        ' שבדקתי. הרישומים בטור 8 הם תאור נאמן על פרטי הניסוי במכונות ההרמה האמורות.'
        ' הרישומים בסעיף 10 בדבר הליקויים',

        'שנתגלו הם תאור נכון של תוצאות הבדיקות והרישומים בדבר התיקונים הדרושים'
        ' ועומסי העבודה הבטוחים שצוינו על ידי'
        ' בסעיף 9 עשויים למיטב ידיעתי להבטיח פעולה בטוחה של מכונות ההרמה.',
    ]
    decl_html = '<br/>'.join(b(line) for line in decl_lines)

    dec_t = Table([[Paragraph(decl_html, s_decl)]], colWidths=[W])
    dec_t.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(dec_t)
    elements.append(Spacer(1, 2 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # SIGNATURE BLOCK
    # ══════════════════════════════════════════════════════════════════════
    inspector_lic_p = Paragraph(
        b(f'רישיון: {inspector_license}'), s_sm) if inspector_license else Paragraph('', s_sm)

    sig = Table([[
        _cell([Paragraph(b('חתימה הבודק המוסמך'), s_lbl_c),
               Spacer(1, 8 * mm),
               Paragraph(b('___________________'), s_val_c)]),
        _cell([Paragraph(b(inspector_name), s_val_b),
               inspector_lic_p]),
        _cell([Paragraph(b(_fmt(inspection_date)), s_val_b)]),
    ]], colWidths=[W * 0.35, W * 0.40, W * 0.25])
    sig.setStyle(TS([
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(sig)
    elements.append(Spacer(1, 2 * mm))

    # ══════════════════════════════════════════════════════════════════════
    # DISCLAIMER + AUTO-GENERATION FOOTER
    # ══════════════════════════════════════════════════════════════════════
    disclaimer = 'מועד זה אינו יפה במקרה ולפני התאריך הנקוב חל קלקול שיש בו השפעה לגבי העומס הבטוח'
    elements.append(Paragraph(b(disclaimer), s_foot))
    elements.append(Spacer(1, 3 * mm))
    now = datetime.now().strftime('%d/%m/%Y %H:%M')
    elements.append(
        Paragraph(b(f'הופק אוטומטית בתאריך {now} | מערכת ניהול ציוד הרמה'), s_foot))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
