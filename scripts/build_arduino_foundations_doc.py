from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUTPUT = Path(__file__).resolve().parents[1] / "public" / "downloads" / "arduino-foundations.docx"

FONT = "Arial"
FONT_EAST_ASIA = "Malgun Gothic"
NAVY = "0F172A"
AMBER = "FBBF24"
AMBER_LIGHT = "FFF7D6"
CYAN = "06B6D4"
CYAN_LIGHT = "ECFEFF"
SLATE = "475569"
MUTED = "64748B"
LIGHT = "F8FAFC"
LINE = "DCE3EA"
WHITE = "FFFFFF"
GREEN_LIGHT = "ECFDF5"
GREEN = "047857"


def set_run_font(run, size=11, bold=False, color=NAVY, italic=False, name=FONT):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:ascii"), name)
    rfonts.set(qn("w:hAnsi"), name)
    rfonts.set(qn("w:eastAsia"), FONT_EAST_ASIA)


def set_paragraph(p, before=0, after=6, line=1.25, align=None, keep=False):
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = line
    if align is not None:
        p.alignment = align
    if keep:
        p.paragraph_format.keep_with_next = True


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=140, bottom=100, end=140):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for tag, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{tag}"))
        if node is None:
            node = OxmlElement(f"w:{tag}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color=LINE, size=6):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), str(size))
        tag.set(qn("w:color"), color)


def set_table_geometry(table, widths_dxa, indent_dxa=120):
    total = sum(widths_dxa)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr

    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(total))
    tbl_w.set(qn("w:type"), "dxa")

    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(indent_dxa))
    tbl_ind.set(qn("w:type"), "dxa")

    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            width = widths_dxa[min(idx, len(widths_dxa) - 1)]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    flag = OxmlElement("w:tblHeader")
    flag.set(qn("w:val"), "true")
    tr_pr.append(flag)


def clear_cell(cell):
    p = cell.paragraphs[0]
    for run in list(p.runs):
        p._element.remove(run._element)
    return p


def add_cell_text(cell, text, size=10.5, bold=False, color=NAVY, align=WD_ALIGN_PARAGRAPH.LEFT, font=FONT):
    p = clear_cell(cell)
    set_paragraph(p, after=0, line=1.2, align=align)
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, color=color, name=font)
    return p


def add_paragraph(doc, text, size=11, bold=False, color=NAVY, before=0, after=7, line=1.25, align=None, italic=False, keep=False):
    p = doc.add_paragraph()
    set_paragraph(p, before=before, after=after, line=line, align=align, keep=keep)
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, color=color, italic=italic)
    return p


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    sizes = {1: 16, 2: 13, 3: 12}
    befores = {1: 18, 2: 14, 3: 10}
    afters = {1: 10, 2: 7, 3: 5}
    colors = {1: NAVY, 2: "B45309", 3: SLATE}
    set_paragraph(p, before=befores[level], after=afters[level], line=1.15, keep=True)
    run = p.add_run(text)
    set_run_font(run, size=sizes[level], bold=True, color=colors[level])
    return p


def add_note_box(doc, label, text, fill=AMBER_LIGHT, accent="B45309"):
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [9360])
    set_table_borders(table, color=fill, size=4)
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    p = clear_cell(cell)
    set_paragraph(p, after=0, line=1.25)
    r1 = p.add_run(f"{label}  ")
    set_run_font(r1, size=10.5, bold=True, color=accent)
    r2 = p.add_run(text)
    set_run_font(r2, size=10.5, color=NAVY)
    add_paragraph(doc, "", size=2, after=1)
    return table


def add_code_block(doc, code):
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [9360])
    set_table_borders(table, color=NAVY, size=4)
    cell = table.cell(0, 0)
    set_cell_shading(cell, NAVY)
    p = clear_cell(cell)
    set_paragraph(p, after=0, line=1.25)
    for idx, line in enumerate(code.splitlines()):
        if idx:
            p.add_run().add_break()
        run = p.add_run(line or " ")
        set_run_font(run, size=9.2, color="CFFAFE", name="Consolas")
    add_paragraph(doc, "", size=2, after=1)
    return table


def add_footer(section):
    footer = section.footer
    p = footer.paragraphs[0]
    set_paragraph(p, after=0, line=1.0, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p.add_run("ARDUINO → PICO LAB  ·  아두이노 시작 전 핵심 교재  ·  ")
    set_run_font(r, size=8.5, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    p._p.append(fld)


def style_document(doc):
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.72)
    section.bottom_margin = Inches(0.68)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    section.header_distance = Inches(0.36)
    section.footer_distance = Inches(0.36)
    add_footer(section)

    normal = doc.styles["Normal"]
    normal.font.name = FONT
    normal.font.size = Pt(11)
    normal._element.rPr.rFonts.set(qn("w:ascii"), FONT)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_EAST_ASIA)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    for level, size, color in ((1, 16, NAVY), (2, 13, "B45309"), (3, 12, SLATE)):
        style = doc.styles[f"Heading {level}"]
        style.font.name = FONT
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style._element.rPr.rFonts.set(qn("w:ascii"), FONT)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
        style._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_EAST_ASIA)


def add_cover(doc):
    add_paragraph(doc, "ARDUINO → PICO LAB · 사전 학습", size=10.5, bold=True, color="B45309", before=28, after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "아두이노 시작 전 핵심 교재", size=29, bold=True, color=NAVY, after=8, line=1.1, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "비트 · 시리얼 통신 · 출력 형식", size=16, bold=True, color=CYAN, after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(
        doc,
        "실습과 중간고사 학습에 바로 사용할 수 있도록 핵심 개념과 실행 코드를 정확하게 정리한 학생용 자료입니다.",
        size=11.5,
        color=SLATE,
        after=26,
        line=1.35,
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )

    table = doc.add_table(rows=2, cols=3)
    set_table_geometry(table, [3120, 3120, 3120])
    set_table_borders(table, color="F3D48A", size=7)
    labels = [("01", "0과 1 · ASCII"), ("02", "Serial.begin()"), ("03", "print · format")]
    for idx, (number, title) in enumerate(labels):
        set_cell_shading(table.cell(0, idx), NAVY)
        add_cell_text(table.cell(0, idx), number, size=14, bold=True, color=AMBER, align=WD_ALIGN_PARAGRAPH.CENTER)
        set_cell_shading(table.cell(1, idx), AMBER_LIGHT)
        add_cell_text(table.cell(1, idx), title, size=11, bold=True, color=NAVY, align=WD_ALIGN_PARAGRAPH.CENTER)

    add_paragraph(doc, "", size=3, after=7)
    add_note_box(
        doc,
        "학습 방법",
        "개념을 읽은 뒤 예제 코드의 출력 결과를 먼저 예상하고, Arduino IDE 시리얼 모니터에서 실제 결과를 확인하세요.",
        fill=CYAN_LIGHT,
        accent="0E7490",
    )
    add_paragraph(doc, "대상  고등학교 소프트웨어와 생활 · Arduino 기초 실습", size=9.5, color=MUTED, before=18, after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "자료 범위  비트·ASCII·시리얼 통신·출력 형식의 필수 개념", size=9.5, color=MUTED, after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "확장 계획  이후 강의 캡처를 같은 체계로 누적하여 최종 중간고사 대비 자료로 통합", size=9.5, color=MUTED, after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    doc.add_page_break()


def add_bit_section(doc):
    add_heading(doc, "1. 컴퓨터는 0과 1로 정보를 표현한다", 1)
    add_paragraph(doc, "비트(bit)는 컴퓨터가 정보를 표현하는 가장 작은 단위입니다. 한 비트에는 0 또는 1 가운데 하나만 저장됩니다. 여러 비트를 묶으면 숫자, 문자, 센서값, 명령을 표현할 수 있습니다.", size=11.2)

    table = doc.add_table(rows=5, cols=4)
    set_table_geometry(table, [1800, 2160, 2160, 3240])
    set_table_borders(table)
    headers = ["문자", "10진수(DEC)", "16진수(HEX)", "2진수(BIN)"]
    for i, text in enumerate(headers):
        set_cell_shading(table.cell(0, i), NAVY)
        add_cell_text(table.cell(0, i), text, size=10, bold=True, color=WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [("A", "65", "41", "1000001"), ("B", "66", "42", "1000010"), ("a", "97", "61", "1100001"), ("0", "48", "30", "110000")]
    for r_idx, row in enumerate(rows, 1):
        for c_idx, value in enumerate(row):
            set_cell_shading(table.cell(r_idx, c_idx), WHITE if r_idx % 2 else LIGHT)
            add_cell_text(table.cell(r_idx, c_idx), value, size=10.2, bold=c_idx == 0, color=NAVY, align=WD_ALIGN_PARAGRAPH.CENTER, font="Consolas" if c_idx else FONT)
    set_repeat_table_header(table.rows[0])

    add_note_box(doc, "시험 핵심", "ASCII는 문자와 숫자 코드를 대응시키는 문자 부호 체계입니다. 문자 'B'의 ASCII 10진수 값은 66이며, 이를 16진수로 나타내면 42, 2진수로 나타내면 1000010입니다.")
    add_heading(doc, "문자와 문자열의 표기", 2)
    add_paragraph(doc, "Arduino C/C++에서 작은따옴표는 문자 하나(char), 큰따옴표는 여러 문자가 이어진 문자열을 뜻합니다.")
    add_code_block(doc, "Serial.println('B');      // 문자 1개\nSerial.println(\"B\");      // 문자열\nSerial.println('B', DEC); // ASCII 값 66")
    add_note_box(doc, "주의", "화면에 보이는 글자 수와 전송 바이트 수는 항상 같지 않습니다. 영문 ASCII 문자는 보통 1바이트이지만, 한글은 UTF-8에서 보통 한 글자가 3바이트입니다.", fill=GREEN_LIGHT, accent=GREEN)
    doc.add_page_break()


def add_serial_section(doc):
    add_heading(doc, "2. Serial.begin(speed)와 통신 속도", 1)
    add_paragraph(doc, "Arduino Uno와 PC의 시리얼 모니터가 데이터를 주고받으려면 통신 속도를 먼저 정해야 합니다. setup()에서 한 번 실행하는 Serial.begin(speed)이 이 속도를 설정합니다.", size=11.2)
    add_code_block(doc, "void setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n}")

    table = doc.add_table(rows=4, cols=3)
    set_table_geometry(table, [2100, 2700, 4560])
    set_table_borders(table)
    headers = ["속도 예", "의미", "수업에서 확인할 점"]
    for i, text in enumerate(headers):
        set_cell_shading(table.cell(0, i), NAVY)
        add_cell_text(table.cell(0, i), text, size=10, bold=True, color=WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [
        ("9600", "초당 9,600비트", "기초 예제에서 자주 사용"),
        ("115200", "초당 115,200비트", "빠른 출력과 센서값 확인에 자주 사용"),
        ("그 밖의 값", "300, 600, 1200, 2400, 4800, 14400, 19200, 38400, 57600 등", "보드 코드와 시리얼 모니터 속도가 반드시 같아야 함"),
    ]
    for r_idx, row in enumerate(rows, 1):
        for c_idx, value in enumerate(row):
            set_cell_shading(table.cell(r_idx, c_idx), WHITE if r_idx % 2 else LIGHT)
            add_cell_text(table.cell(r_idx, c_idx), value, size=10.1, bold=c_idx == 0, color=NAVY, align=WD_ALIGN_PARAGRAPH.CENTER if c_idx < 2 else WD_ALIGN_PARAGRAPH.LEFT)
    set_repeat_table_header(table.rows[0])

    add_heading(doc, "115200 bps에서 왜 약 11,520바이트인가?", 2)
    add_paragraph(doc, "일반적인 8N1 방식에서는 한 바이트를 보낼 때 시작 비트 1개, 데이터 비트 8개, 정지 비트 1개가 필요합니다. 따라서 한 바이트를 전송하는 데 모두 10비트가 사용됩니다.")
    add_note_box(doc, "계산", "115,200 bit/s ÷ 10 bit/byte = 이론상 약 11,520 byte/s", fill=CYAN_LIGHT, accent="0E7490")
    add_paragraph(doc, "이 값은 통신 방식의 오버헤드를 고려한 이론적 최대치입니다. 실제 프로그램에서는 처리 시간, 버퍼, USB 변환 등의 영향으로 체감 속도가 달라질 수 있습니다.", size=10.5, color=SLATE)
    add_note_box(doc, "자주 틀리는 표현", "115200은 '초당 115200문자'가 아니라 초당 전송하는 비트 수(bps)입니다. 영문 ASCII 1바이트 문자를 8N1로 보낼 때 이론상 약 11,520개에 해당합니다.")
    doc.add_page_break()


def add_print_section(doc):
    add_heading(doc, "3. Serial.print()와 Serial.println()", 1)
    add_paragraph(doc, "두 함수는 모두 시리얼 모니터에 값을 출력합니다. 차이는 값을 출력한 뒤 줄을 바꾸는지 여부입니다.", size=11.2)

    table = doc.add_table(rows=3, cols=3)
    set_table_geometry(table, [2700, 2700, 3960])
    set_table_borders(table)
    headers = ["함수", "출력 후 동작", "예시"]
    for i, text in enumerate(headers):
        set_cell_shading(table.cell(0, i), NAVY)
        add_cell_text(table.cell(0, i), text, size=10, bold=True, color=WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [
        ("Serial.print(val)", "같은 줄에 이어서 출력", "print(10); print(20); → 1020"),
        ("Serial.println(val)", "출력한 다음 줄바꿈", "println(10); println(20); → 10과 20이 서로 다른 줄"),
    ]
    for r_idx, row in enumerate(rows, 1):
        for c_idx, value in enumerate(row):
            set_cell_shading(table.cell(r_idx, c_idx), WHITE if r_idx % 2 else LIGHT)
            add_cell_text(table.cell(r_idx, c_idx), value, size=10.2, bold=c_idx == 0, color=NAVY, align=WD_ALIGN_PARAGRAPH.LEFT)
    set_repeat_table_header(table.rows[0])

    add_heading(doc, "두 번째 인수 format의 의미", 2)
    add_paragraph(doc, "정수를 출력할 때는 진법, 실수를 출력할 때는 소수점 아래 자릿수를 지정합니다. 같은 숫자라도 format에 따라 화면에 보이는 표현이 달라집니다.")

    table = doc.add_table(rows=7, cols=3)
    set_table_geometry(table, [3900, 2300, 3160])
    set_table_borders(table)
    headers = ["코드", "출력", "의미"]
    for i, text in enumerate(headers):
        set_cell_shading(table.cell(0, i), NAVY)
        add_cell_text(table.cell(0, i), text, size=10, bold=True, color=WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [
        ("Serial.println(23, DEC);", "23", "10진수"),
        ("Serial.println(23, HEX);", "17", "16진수"),
        ("Serial.println(23, BIN);", "10111", "2진수"),
        ("Serial.println('B', DEC);", "66", "문자 B의 ASCII 10진수"),
        ("Serial.println('B', HEX);", "42", "문자 B의 ASCII 16진수"),
        ("Serial.println('B', BIN);", "1000010", "문자 B의 ASCII 2진수"),
    ]
    for r_idx, row in enumerate(rows, 1):
        for c_idx, value in enumerate(row):
            set_cell_shading(table.cell(r_idx, c_idx), WHITE if r_idx % 2 else LIGHT)
            add_cell_text(table.cell(r_idx, c_idx), value, size=9.8, bold=c_idx == 0, color=NAVY, align=WD_ALIGN_PARAGRAPH.LEFT if c_idx != 1 else WD_ALIGN_PARAGRAPH.CENTER, font="Consolas" if c_idx < 2 else FONT)
    set_repeat_table_header(table.rows[0])

    add_note_box(doc, "실수 출력", "Serial.println(12.235, 1)은 소수점 아래 1자리, (12.235, 2)는 2자리, (12.235, 3)은 3자리까지 표현합니다. 지정한 다음 자리의 값에 따라 반올림될 수 있습니다.", fill=GREEN_LIGHT, accent=GREEN)
    doc.add_page_break()


def add_code_reading_section(doc):
    add_heading(doc, "4. 전체 코드를 읽고 결과를 예측하기", 1)
    code = """void setup() {
  Serial.begin(115200);

  Serial.println(23, DEC);
  Serial.println(23, HEX);
  Serial.println(23, BIN);

  Serial.println('B', DEC);
  Serial.println('B', HEX);
  Serial.println('B', BIN);

  Serial.println(12.235, 1);
  Serial.println(12.235, 2);
  Serial.println(12.235, 3);
}

void loop() {
}"""
    add_code_block(doc, code)

    table = doc.add_table(rows=6, cols=3)
    set_table_geometry(table, [2600, 2980, 3780])
    set_table_borders(table)
    headers = ["코드 요소", "역할", "해석"]
    for i, text in enumerate(headers):
        set_cell_shading(table.cell(0, i), NAVY)
        add_cell_text(table.cell(0, i), text, size=10, bold=True, color=WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [
        ("void setup()", "초기 설정", "전원을 켜거나 리셋했을 때 한 번 실행"),
        ("Serial.begin(115200)", "통신 준비", "보드와 PC 사이의 통신 속도 설정"),
        ("Serial.println(23, HEX)", "정수 출력", "23을 16진수 17로 표현"),
        ("Serial.println('B', BIN)", "문자 코드 출력", "B의 ASCII 값 66을 2진수로 표현"),
        ("void loop()", "반복 실행", "비어 있으므로 반복해서 수행할 명령이 없음"),
    ]
    for r_idx, row in enumerate(rows, 1):
        for c_idx, value in enumerate(row):
            set_cell_shading(table.cell(r_idx, c_idx), WHITE if r_idx % 2 else LIGHT)
            add_cell_text(table.cell(r_idx, c_idx), value, size=10, bold=c_idx == 0, color=NAVY, font="Consolas" if c_idx == 0 else FONT)
    set_repeat_table_header(table.rows[0])

    add_heading(doc, "실습 오류를 찾는 순서", 2)
    errors = doc.add_table(rows=5, cols=2)
    set_table_geometry(errors, [2500, 6860])
    set_table_borders(errors)
    error_rows = [
        ("1. 화면이 비어 있음", "보드·포트 선택, 업로드 성공 여부, 시리얼 모니터 열기 확인"),
        ("2. 글자가 깨짐", "코드의 Serial.begin 속도와 시리얼 모니터 속도를 같게 설정"),
        ("3. 한 번만 출력됨", "출력문이 setup()에 있으면 정상이며, 반복 출력은 loop()에 작성"),
        ("4. 결과가 예상과 다름", "DEC·HEX·BIN 또는 소수점 자릿수 인수를 확인"),
        ("5. 컴파일 오류", "대소문자, 세미콜론, 괄호, 작은따옴표·큰따옴표를 점검"),
    ]
    for r_idx, row in enumerate(error_rows):
        for c_idx, value in enumerate(row):
            set_cell_shading(errors.cell(r_idx, c_idx), AMBER_LIGHT if c_idx == 0 else WHITE)
            add_cell_text(errors.cell(r_idx, c_idx), value, size=10.2, bold=c_idx == 0, color=NAVY)
    doc.add_page_break()


def add_exam_section(doc):
    add_heading(doc, "5. 실습·중간고사 대비 정리", 1)
    add_paragraph(doc, "아래 항목은 시작 전 기초에서 문제은행에 등록할 핵심 개념입니다. 이후 실습 자료가 추가되면 같은 분류에 누적하여 최종 예상문제 문서로 통합합니다.", size=11.2)

    table = doc.add_table(rows=7, cols=4)
    set_table_geometry(table, [1500, 2200, 3580, 2080])
    set_table_borders(table)
    headers = ["범위", "핵심어", "학생이 설명해야 할 내용", "출제 준비 유형"]
    for i, text in enumerate(headers):
        set_cell_shading(table.cell(0, i), NAVY)
        add_cell_text(table.cell(0, i), text, size=9.6, bold=True, color=WHITE, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [
        ("기초", "bit", "0과 1로 정보를 표현하는 최소 단위", "개념 선택"),
        ("기초", "ASCII", "문자와 숫자 코드의 대응", "변환·해석"),
        ("기초", "baud rate", "bps와 8N1의 전송량 계산", "계산·서술"),
        ("기초", "Serial.begin", "시리얼 통신 속도 설정과 위치", "빈칸·코드"),
        ("기초", "print / println", "줄바꿈 여부와 출력 결과", "출력 예측"),
        ("기초", "DEC·HEX·BIN", "정수와 문자 코드를 여러 진법으로 표현", "코드 해석"),
    ]
    for r_idx, row in enumerate(rows, 1):
        for c_idx, value in enumerate(row):
            set_cell_shading(table.cell(r_idx, c_idx), WHITE if r_idx % 2 else LIGHT)
            add_cell_text(table.cell(r_idx, c_idx), value, size=9.7, bold=c_idx in (0, 1), color=NAVY, align=WD_ALIGN_PARAGRAPH.CENTER if c_idx in (0, 1, 3) else WD_ALIGN_PARAGRAPH.LEFT)
    set_repeat_table_header(table.rows[0])

    add_heading(doc, "지금 스스로 설명해 보기", 2)
    prompts = [
        "115200 bps를 '초당 115200문자'라고 말하면 왜 정확하지 않은가?",
        "Serial.print()와 Serial.println()의 차이는 무엇인가?",
        "문자 'B'를 DEC, HEX, BIN 형식으로 출력하면 각각 무엇이 나오는가?",
        "시리얼 모니터의 글자가 깨질 때 가장 먼저 확인할 설정은 무엇인가?",
        "setup()과 loop()에 출력문을 넣었을 때 실행 횟수가 어떻게 달라지는가?",
    ]
    check = doc.add_table(rows=len(prompts), cols=2)
    set_table_geometry(check, [700, 8660])
    set_table_borders(check, color="CDE7EA")
    for idx, prompt in enumerate(prompts, 1):
        set_cell_shading(check.cell(idx - 1, 0), CYAN_LIGHT)
        add_cell_text(check.cell(idx - 1, 0), str(idx), size=11, bold=True, color="0E7490", align=WD_ALIGN_PARAGRAPH.CENTER)
        add_cell_text(check.cell(idx - 1, 1), prompt, size=10.3, bold=False, color=NAVY)

    add_note_box(doc, "다음 단계", "추가 캡처가 제공되면 핵심 개념, 코드 해석, 실습 결과, 오류 점검, 문제 유형을 같은 구조로 누적합니다. 전체 범위가 확정되면 객관식·서술형·코드 실행 결과 예측 문제를 한 번에 문서화합니다.", fill=AMBER_LIGHT, accent="B45309")
    add_paragraph(doc, "자료 안내  제공된 수업 캡처의 핵심 개념을 바탕으로 교실 수업 목적에 맞게 요약·재구성함.", size=9, color=MUTED, before=10, after=2)
    add_paragraph(doc, "이 문서는 화면을 복제한 자료가 아니라 개념과 코드를 독자적으로 설명한 학습자료입니다.", size=9, color=MUTED, after=2)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    style_document(doc)
    add_cover(doc)
    add_bit_section(doc)
    add_serial_section(doc)
    add_print_section(doc)
    add_code_reading_section(doc)
    add_exam_section(doc)
    doc.core_properties.title = "아두이노 시작 전 핵심 교재"
    doc.core_properties.subject = "비트, ASCII, 시리얼 통신, Serial.print/println"
    doc.core_properties.author = "PICO LAB"
    doc.core_properties.keywords = "Arduino, Serial, ASCII, 중간고사, 실습"
    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
