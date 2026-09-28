#!/usr/bin/env python3
"""Generate simple, valid PDF files from scripts/pdf-manifest.json.

Writes one PDF per manifest entry into public/papers/. No third-party deps —
a minimal PDF 1.4 writer with Helvetica text is enough for demo question
papers and study materials.
"""
import json
import os
import textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'papers')

PAGE_W, PAGE_H = 595, 842  # A4 in points
MARGIN_X = 50
TOP = 780
BOTTOM = 60
LINE_H = 17
LINES_PER_PAGE = int((TOP - BOTTOM) / LINE_H)


def esc(text: str) -> str:
    return (
        text.replace('\\', '\\\\')
        .replace('(', '\\(')
        .replace(')', '\\)')
        .encode('latin-1', 'replace')
        .decode('latin-1')
    )


def wrap_lines(lines):
    out = []
    for ln in lines:
        if not ln:
            out.append('')
            continue
        wrapped = textwrap.wrap(ln, width=88) or ['']
        out.extend(wrapped)
    return out


def content_stream(lines, title=False):
    parts = []
    y = TOP
    for i, ln in enumerate(lines):
        if ln == '':
            y -= LINE_H * 0.5
            continue
        bold = i == 0 or ln.isupper() or ln.startswith('SECTION') or ln.startswith('Unit ')
        font = 'F1' if bold else 'F2'
        size = 13 if i == 0 else 11
        parts.append(f"BT /{font} {size} Tf 1 0 0 1 {MARGIN_X} {y:.1f} Tm ({esc(ln)}) Tj ET")
        y -= LINE_H
    return '\n'.join(parts).encode('latin-1', 'replace')


def build_pdf(lines):
    lines = wrap_lines(lines)
    chunks = [lines[i:i + LINES_PER_PAGE] for i in range(0, len(lines), LINES_PER_PAGE)] or [[]]

    objects = [None]  # 1-based indexing

    def add(body: bytes) -> int:
        objects.append(body)
        return len(objects)

    # Precompute ids: catalog=1, pages=2, fonts 3 & 4, then per page (page, content)
    catalog_id, pages_id, font_b, font_r = 1, 2, 3, 4
    n = len(chunks)
    page_ids = [5 + i * 2 for i in range(n)]
    content_ids = [6 + i * 2 for i in range(n)]

    objects = [None] * (4 + 2 * n)
    objects[0] = b'<< /Type /Catalog /Pages 2 0 R >>'
    objects[1] = (
        f"<< /Type /Pages /Kids [{' '.join(f'{p} 0 R' for p in page_ids)}] /Count {n} >>".encode()
    )
    objects[2] = b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
    objects[3] = b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

    for i, chunk in enumerate(chunks):
        stream = content_stream(chunk)
        objects[content_ids[i] - 1] = (
            f'<< /Length {len(stream)} >>\nstream\n'.encode() + stream + b'\nendstream'
        )
        objects[page_ids[i] - 1] = (
            f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] '
            f'/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> '
            f'/Contents {content_ids[i]} 0 R >>'
        ).encode()

    out = bytearray(b'%PDF-1.4\n')
    offsets = []
    for idx, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f'{idx} 0 obj\n'.encode() + body + b'\nendobj\n'

    xref_pos = len(out)
    out += f'xref\n0 {len(objects) + 1}\n'.encode()
    out += b'0000000000 65535 f \n'
    for off in offsets:
        out += f'{off:010d} 00000 n \n'.encode()
    out += (
        f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n'
        f'startxref\n{xref_pos}\n%%EOF\n'
    ).encode()
    return bytes(out)


def main():
    with open(os.path.join(HERE, 'pdf-manifest.json')) as f:
        manifest = json.load(f)
    os.makedirs(OUT, exist_ok=True)
    count = 0
    for entry in manifest:
        path = os.path.join(OUT, entry['file'])
        with open(path, 'wb') as fh:
            fh.write(build_pdf(entry['lines']))
        count += 1
    print(f'Generated {count} PDFs in public/papers/')


if __name__ == '__main__':
    main()
