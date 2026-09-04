"""Reproduce the student DOCX as a standalone, accessible web textbook.

No prose is rewritten: paragraph/table order and code whitespace come from OOXML.
Run again when the source textbook changes; the original DOCX is never modified.
"""
from pathlib import Path
from zipfile import ZipFile
from html import escape
from html.parser import HTMLParser
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/downloads/arduino-foundations.docx"
OUTPUT = ROOT / "public/arduino-textbook.html"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def plain(element):
    parts = []
    for node in element.iter():
        if node.tag == W + "t":
            parts.append(node.text or "")
        elif node.tag == W + "br" and node.get(W + "type") != "page":
            parts.append("\n")
        elif node.tag == W + "tab":
            parts.append("\t")
    return "".join(parts)


def rich(p):
    parts = []
    for run in p.findall(W + "r"):
        value = escape(plain(run)).replace("\n", "<br>")
        if run.find(W + "rPr/" + W + "b") is not None:
            value = "<strong>" + value + "</strong>"
        parts.append(value)
    return "".join(parts)


STYLE = r"""
:root{color-scheme:light;--ink:#0f172a;--navy:#020617;--amber:#fbbf24;--cyan:#0891b2;--line:#dce3ea}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:7rem}
body{margin:0;background:#f1f5f9;color:var(--ink);font:1.125rem/1.85 'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',Arial,sans-serif;word-break:keep-all;overflow-wrap:anywhere}
a{color:#075985;text-underline-offset:.2em}button,a{touch-action:manipulation}button{font:inherit;cursor:pointer}
:focus-visible{outline:3px solid #0891b2;outline-offset:4px}.skip{position:absolute;top:-100px;left:1rem;background:white;padding:1rem;z-index:10}.skip:focus{top:1rem}
.bar{position:sticky;top:0;z-index:5;background:var(--navy);color:white;padding:1rem max(1rem,calc((100vw - 1440px)/2));display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.brand{font-weight:800;color:white;text-decoration:none;letter-spacing:.01em}.actions{display:flex;gap:.65rem;flex-wrap:wrap}.action{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:1px solid #475569;background:transparent;color:white;border-radius:.7rem;padding:.45rem .9rem;text-decoration:none;font-size:1rem;font-weight:700}.action.primary{background:var(--amber);border-color:var(--amber);color:var(--navy)}
.layout{max-width:1440px;margin:auto;padding:2rem 1.5rem 4rem;display:grid;grid-template-columns:260px minmax(0,1fr);gap:2rem;align-items:start}
.toc{position:sticky;top:7rem;max-height:calc(100vh - 8rem);overflow:auto;background:white;border:1px solid var(--line);border-radius:1rem;padding:1rem}
.toc summary{font-weight:800;cursor:pointer;font-size:1.125rem}.toc ol{list-style:none;padding:0;margin:1rem 0 0}.toc li+li{margin-top:.35rem}.toc a{display:block;padding:.65rem .7rem;border-radius:.5rem;text-decoration:none;color:#334155;font-size:1rem;line-height:1.55}.toc a:hover,.toc a[aria-current]{background:#fef3c7;color:#92400e}
main{min-width:0}.chapter{background:white;border:1px solid var(--line);border-radius:1rem;padding:2.25rem;margin-bottom:1.5rem;scroll-margin-top:7rem}.chapter.cover{border-top:6px solid var(--amber)}h1{font-size:clamp(1.9rem,3.5vw,2.8rem);line-height:1.35;letter-spacing:-.035em;margin:.7rem 0 1rem}h2{font-size:clamp(1.5rem,2.4vw,2rem);line-height:1.45;margin:0 0 1.5rem;letter-spacing:-.025em;border-bottom:3px solid var(--amber);padding-bottom:1rem}h3{font-size:1.3rem;line-height:1.55;color:#92400e;margin:2rem 0 .8rem}h4{font-size:1.15rem;margin:1.5rem 0 .7rem}p{margin:.8rem 0 1.1rem}.eyebrow{color:#92400e;font-weight:800;font-size:1rem}.subtitle{color:#087d96;font-weight:700}.meta{color:#475569;font-size:1rem}
.table-wrap{max-width:100%;overflow:auto;border:1px solid var(--line);border-radius:.7rem;margin:1.2rem 0}table{width:100%;border-collapse:collapse;font-size:1.0625rem;line-height:1.75;min-width:520px}td,th{padding:.85rem 1rem;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);border-right:1px solid var(--line)}th{background:var(--navy);color:white;font-weight:700}tr:nth-child(even) td{background:#f8fafc}td p,th p{margin:0}td:last-child,th:last-child{border-right:0}tr:last-child td{border-bottom:0}
.note{padding:1.1rem 1.3rem;background:#fffbeb;border-left:4px solid var(--amber);border-radius:0 .7rem .7rem 0;margin:1.2rem 0}.note p{margin:0}.note.cyan{background:#ecfeff;border-color:#06b6d4}.note.green{background:#ecfdf5;border-color:#10b981}.note.warning{background:#fef2f2;border-color:#ef4444}
.codebox{margin:1.2rem 0;border-radius:.85rem;overflow:hidden;background:#0f172a;color:#cffafe}.codebar{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.7rem 1rem;border-bottom:1px solid #334155;font-size:1rem}.copy{border:1px solid #64748b;border-radius:.5rem;background:transparent;color:white;padding:.35rem .8rem;font-size:1rem;min-height:44px}pre{margin:0;padding:1.3rem;overflow:auto;white-space:pre;font:1rem/1.8 Consolas,'Cascadia Code',monospace;tab-size:2}code{font-family:inherit}.end{display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;font-size:1rem;padding:1rem}.status{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#0f172a;color:white;border-radius:.6rem;padding:.7rem 1rem;z-index:10}.status:empty{display:none}
@media(max-width:1000px){.layout{grid-template-columns:1fr;gap:1rem}.toc{position:static;max-height:none}.toc ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.25rem}.chapter{padding:1.5rem}}
@media(max-width:600px){.bar{position:static;padding:1rem}.layout{padding:1rem .6rem 2rem}.chapter{padding:1.1rem;border-radius:.7rem}.toc ol{grid-template-columns:1fr}body{font-size:1.0625rem}html{scroll-padding-top:1rem}.chapter{scroll-margin-top:1rem}h2{font-size:1.45rem}.actions{width:100%}.action{flex:1}pre{padding:1rem;font-size:1rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media print{.bar,.toc,.skip,.codebar,.end,.status{display:none!important}.layout{display:block;padding:0;max-width:none}body{font-size:11pt;background:white;line-height:1.55}.chapter{border:0;border-radius:0;margin:0;padding:0;break-before:page}.chapter.cover{break-before:auto;border-top:0}h1{font-size:25pt}h2{font-size:19pt}h3{font-size:14pt}table{font-size:10pt;min-width:0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:9pt}.codebox{color:black;background:#f8fafc;border:1px solid #cbd5e1}.table-wrap{overflow:visible}tr{break-inside:avoid}h2,h3{break-after:avoid}th{color:black;background:#eee}}
"""

SCRIPT = r"""
const status = document.getElementById('status');
let timer;
document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
  const code = button.closest('.codebox').querySelector('code');
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = '코드를 복사했습니다.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents(code);
    selection.removeAllRanges(); selection.addRange(range);
    status.textContent = '코드를 선택했습니다. 복사 메뉴 또는 Ctrl+C를 사용하세요.';
  }
  clearTimeout(timer); timer = setTimeout(() => status.textContent = '', 3500);
}));
document.getElementById('print').addEventListener('click', () => window.print());
document.querySelectorAll('.toc a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.toc a').forEach(item => item.removeAttribute('aria-current'));
  link.setAttribute('aria-current', 'location');
}));
"""


def ascii_reference():
    controls = ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'HT', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US']
    meanings = ['널', '헤더 시작', '본문 시작', '본문 끝', '전송 끝', '응답 요청', '긍정 응답', '벨', '백스페이스', '수평 탭', '줄바꿈', '수직 탭', '폼 피드', '캐리지 리턴', '시프트 아웃', '시프트 인', '데이터 링크 이스케이프', '장치 제어 1', '장치 제어 2', '장치 제어 3', '장치 제어 4', '부정 응답', '동기 유휴', '전송 블록 끝', '취소', '매체 끝', '대체', '이스케이프', '파일 구분', '그룹 구분', '레코드 구분', '단위 구분']
    escapes = {0:r'\0',7:r'\a',8:r'\b',9:r'\t',10:r'\n',11:r'\v',12:r'\f',13:r'\r'}
    out = ['<section id="ascii-reference" aria-labelledby="ascii-title"><h3 id="ascii-title">ASCII 전체 코드표 · 0~127</h3><p>Dec는 10진수, Hex는 16진수, Char는 문자 또는 제어 문자 이름입니다. ASCII는 7비트로 128개의 코드를 표현합니다.</p><p><a href="https://blog.naver.com/englishmathe" target="_blank" rel="noopener noreferrer">선생님 블로그 열기 (새 탭)</a></p><p class="meta">참고: 선생님이 제공한 블로그 코드표. 링크는 블로그 홈으로 연결됩니다.</p><div class="ascii-legend"><span class="ascii-control">회색 · 제어 문자: 0~31, 127</span><span class="ascii-special">초록 · 공백·기호</span><span class="ascii-letter">노랑 · 숫자·영문자</span></div><div class="ascii-grid">']
    for start in range(0,128,32):
        out.append(f'<div class="table-wrap" tabindex="0" role="region" aria-label="ASCII {start}부터 {start+31}까지"><table class="ascii-table"><caption>{start}~{start+31}</caption><thead><tr><th scope="col">Dec</th><th scope="col">Hex</th><th scope="col">Char</th><th scope="col">설명</th></tr></thead><tbody>')
        for n in range(start,start+32):
            if n < 32:
                char, desc, kind = controls[n], meanings[n], 'control'
                if n in escapes: desc += ' · ' + escapes[n]
            elif n == 127:
                char, desc, kind = 'DEL', '삭제 · 제어 문자', 'control'
            elif n == 32:
                char, desc, kind = 'SP', '공백 (스페이스)', 'special'
            else:
                char = chr(n)
                kind = 'letter' if char.isalnum() else 'special'
                desc = '숫자' if char.isdigit() else '영문 대문자' if char.isupper() else '영문 소문자' if char.islower() else '기호'
                if n == 92: desc = r'역슬래시 · C/C++ 표기 \\'
            out.append(f'<tr class="ascii-{kind}" data-ascii="{n}"><td>{n}</td><td>{n:02X}</td><td class="ascii-char">{escape(char)}</td><td>{escape(desc)}</td></tr>')
        out.append('</tbody></table></div>')
    out.append('</div><aside class="note cyan"><p><strong>Arduino 연결:</strong> Serial.println(\'B\', DEC)는 66, HEX는 42, BIN은 1000010을 출력합니다. 숫자 0과 문자 \'0\'는 다르며, 문자 \'0\'의 ASCII 값은 48입니다.</p></aside><aside class="note"><p><strong>제어 문자:</strong> LF(10)는 줄바꿈, CR(13)은 줄의 처음으로 이동을 뜻합니다. Serial.println()은 값 뒤에 CR과 LF를 붙입니다. 제어 문자는 일반 글자처럼 표시되지 않지만 장치나 터미널의 동작에 영향을 줄 수 있습니다. 공백(32)은 화면에 빈자리로 표시되는 인쇄 가능 문자입니다.</p></aside></section>')
    return ''.join(out)


STYLE += '''
#ascii-reference{scroll-margin-top:7rem}.ascii-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.ascii-table{min-width:340px;font-size:1rem}.ascii-table caption{text-align:left;padding:.7rem 1rem;font-weight:800;background:#f1f5f9}.ascii-table th,.ascii-table td{padding:.55rem .6rem}.ascii-char{font-family:Consolas,monospace;font-weight:800;font-size:1.125rem}.ascii-table tr.ascii-control td,.ascii-legend .ascii-control{background:#e2e8f0;color:#0f172a}.ascii-table tr.ascii-special td,.ascii-legend .ascii-special{background:#dcfce7;color:#14532d}.ascii-table tr.ascii-letter td,.ascii-legend .ascii-letter{background:#fef08a;color:#422006}.ascii-legend{display:flex;flex-wrap:wrap;gap:.6rem;font-size:1rem}.ascii-legend span{padding:.4rem .65rem;border-radius:.4rem}@media(max-width:1100px){.ascii-grid{grid-template-columns:1fr}}@media print{.ascii-grid{display:block}.ascii-table{min-width:0}.ascii-table thead{display:table-header-group}}
'''


def build():
    with ZipFile(SOURCE) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    body = root.find(W + "body")
    parts = ['<section class="chapter cover" id="cover" aria-label="교재 소개">']
    headings = [("cover", "교재 소개")]
    source_texts = []
    table_count = 0
    code_count = 0
    paragraph_count = 0
    for node in body:
        if node.tag == W + "p":
            value = plain(node)
            if not value.strip():
                continue
            paragraph_count += 1
            source_texts.append(value)
            style = node.find(W + "pPr/" + W + "pStyle")
            style_id = style.get(W + "val", "") if style is not None else ""
            if style_id == "Heading1":
                ident = f"chapter-{len(headings)}"
                headings.append((ident, value))
                parts.append(f'</section><section class="chapter" id="{ident}"><h2>{rich(node)}</h2>')
            elif style_id in ("Heading2", "Heading3"):
                tag = "h3" if style_id == "Heading2" else "h4"
                parts.append(f"<{tag}>{rich(node)}</{tag}>")
            elif value == "아두이노 Uno 기초 완성 교재":
                parts.append(f"<h1>{rich(node)}</h1>")
            else:
                cls = ""
                if len(headings) == 1:
                    cls = ' class="' + ("eyebrow" if "ARDUINO" in value else "meta" if value.startswith(("대상", "자료 범위", "평가 준비")) else "subtitle" if "보드 구조 ·" in value else "intro") + '"'
                parts.append(f"<p{cls}>{rich(node)}</p>")
        elif node.tag == W + "tbl":
            table_count += 1
            rows = node.findall(W + "tr")
            cells = [r.findall(W + "tc") for r in rows]
            for row in cells:
                for cell in row:
                    source_texts.extend(plain(p) for p in cell.findall(W + "p") if plain(p).strip())
            if len(rows) == 1 and len(cells[0]) == 1:
                cell = cells[0][0]
                shading = cell.find(W + "tcPr/" + W + "shd")
                fill = shading.get(W + "fill", "") if shading is not None else ""
                if fill == "0F172A":
                    code_count += 1
                    code = "\n".join(plain(p) for p in cell.findall(W + "p"))
                    parts.append('<div class="codebox"><div class="codebar"><span>Arduino C/C++</span><button class="copy" type="button" aria-label="예제 코드 복사">코드 복사</button></div><pre tabindex="0" aria-label="예제 코드"><code>' + escape(code) + '</code></pre></div>')
                else:
                    cls = {"ECFEFF": " cyan", "ECFDF5": " green", "FEE2E2": " warning"}.get(fill, "")
                    parts.append(f'<aside class="note{cls}">' + ''.join('<p>' + rich(p) + '</p>' for p in cell.findall(W + 'p')) + '</aside>')
            else:
                parts.append('<div class="table-wrap" tabindex="0" role="region" aria-label="교재 표 — 작은 화면에서 좌우로 이동"><table>')
                for i, row in enumerate(cells):
                    first_shading = row[0].find(W + "tcPr/" + W + "shd")
                    fill = first_shading.get(W + "fill", "") if first_shading is not None else ""
                    header = i == 0 and fill in ("0F172A", "B45309")
                    parts.append('<tr>')
                    for cell in row:
                        tag = "th" if header else "td"
                        attr = ' scope="col"' if header else ""
                        parts.append(f'<{tag}{attr}>' + ''.join('<p>' + rich(p) + '</p>' for p in cell.findall(W + 'p')) + f'</{tag}>')
                    parts.append('</tr>')
                parts.append('</table></div>')
    parts.append('</section>')
    content = ''.join(parts)
    marker = '</section><section class="chapter" id="chapter-2">'
    assert marker in content
    content = content.replace(marker, ascii_reference() + marker, 1)
    headings.insert(2, ('ascii-reference', 'ASCII 전체 코드표 · 0~127'))
    # Every original nonempty paragraph must survive, in order, including table cells.
    class TextReader(HTMLParser):
        def __init__(self):
            super().__init__(); self.parts = []
        def handle_data(self, data):
            self.parts.append(data)
    reader = TextReader(); reader.feed(content)
    compact = lambda s: re.sub(r"\s+", "", s)
    rendered = compact(''.join(reader.parts))
    cursor = 0
    for value in source_texts:
        found = rendered.find(compact(value), cursor)
        if found < 0:
            raise AssertionError("Missing or reordered document text: " + value[:100])
        cursor = found + len(compact(value))
    toc = ''.join(f'<li><a href="#{ident}">{escape(title)}</a></li>' for ident, title in headings)
    html = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>아두이노 Uno 기초 완성 교재 | ARDUINO → PICO LAB</title><meta name="description" content="Uno 구조·핀·ADC·PWM·시리얼 통신·실습 코드·중간고사 예상문제를 담은 학생용 웹 교재"><style>' + STYLE + '</style></head><body><a class="skip" href="#textbook">본문 바로가기</a><header class="bar"><a class="brand" href="./?view=arduino">← 아두이노 실습교실</a><div class="actions"><a class="action primary" href="downloads/arduino-foundations.docx" download>교재 다운로드</a><button class="action" type="button" id="print">인쇄</button></div></header><div class="layout"><nav class="toc" aria-label="교재 목차"><details open><summary>교재 목차</summary><ol>' + toc + '</ol></details></nav><main id="textbook">' + content + '<footer class="end"><a href="./?view=arduino">실습교실로 돌아가기</a><a href="#cover">맨 위로 ↑</a></footer></main></div><div id="status" class="status" role="status" aria-live="polite"></div><script>' + SCRIPT + '</script></body></html>'
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Verified {paragraph_count} body paragraphs, {table_count} source tables, {code_count} code examples, {len(headings)-1} chapters; all source text preserved in order.")
    print(OUTPUT)


if __name__ == "__main__":
    build()
