#!/usr/bin/env python3
"""Generate sample demo question-paper PDFs for Backlog Buddy.

Reads data/papers.json and writes one minimal (hand-built) PDF per entry
into public/papers/. The PDFs are clearly marked as sample/demo papers.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "papers")


def clean(t: str) -> str:
    t = str(t)
    for a, b in [
        ("\u2013", "-"), ("\u2014", "-"), ("\u2018", "'"), ("\u2019", "'"),
        ("\u201c", '"'), ("\u201d", '"'), ("\u2026", "..."), ("\u2260", "!="),
        ("\u2264", "<="), ("\u2265", ">="), ("\u00d7", "x"), ("\u2192", "->"),
        ("\u03b1", "a"), ("\u03b2", "b"), ("\u2022", "-"),
    ]:
        t = t.replace(a, b)
    return t.encode("latin-1", "replace").decode("latin-1")


def esc(t: str) -> str:
    t = clean(t)
    return t.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Page:
    def __init__(self):
        self.ops = []

    def text(self, x, y, font, size, leading, lines):
        ops = ["BT", f"{x} {y} Td", f"{leading} TL", f"/{font} {size} Tf"]
        for ln in lines:
            ops.append(f"({esc(ln)}) Tj")
            ops.append("T*")
        ops.append("ET")
        self.ops.append(" ".join(ops))


def build_pdf(title_lines, part_a, part_b):
    """title_lines: list of (font, size, text). Returns pdf bytes."""
    pages = []
    cur = Page()
    y = 800

    def add_block(font, size, leading, lines):
        nonlocal cur, y
        need = leading * (len(lines) + 1) + 10
        if y - need < 60:
            pages.append(cur)
            cur = Page()
            y = 800
        cur.text(50, y, font, size, leading, lines)
        y -= need

    add_block("F2", 15, 20, title_lines)
    add_block("F1", 9.5, 14, [
        "This is a SAMPLE question paper generated for Backlog Buddy (demo/testing data).",
        "It is not an official university paper and is provided to demonstrate the platform.",
    ])
    add_block("F2", 12, 16, [f"PART A \u2014 Short questions  ({len(part_a)} x 1 = {len(part_a)} Marks)"])
    add_block("F1", 10.5, 15, [f"{i+1}. {q}" for i, q in enumerate(part_a)])
    k_each = max(1, (90 - len(part_a)) // max(len(part_b), 1))
    add_block("F2", 12, 16, [f"PART B \u2014 Long questions  ({len(part_b)} x {k_each} = {len(part_b) * k_each} Marks)"])
    add_block("F1", 10.5, 15, [f"{i+1}. {q}" for i, q in enumerate(part_b)])
    add_block("F1", 8.5, 12, ["Backlog Buddy - backlogbuddy demo | Prepare Smart. Clear Your Backlogs."])
    pages.append(cur)

    objects = []  # (num, bytes)

    def obj(num, body: bytes):
        objects.append((num, body))

    page_nums = [5 + 2 * i for i in range(len(pages))]  # pages 5,7,9..; content 6,8,10..; fonts 3,4
    kids = " ".join(f"{n} 0 R" for n in page_nums)
    obj(1, b"<< /Type /Catalog /Pages 2 0 R >>")
    obj(2, f"<< /Type /Pages /Kids [{kids}] /Count {len(pages)} >>".encode())
    obj(3, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    obj(4, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    for i, page in enumerate(pages):
        pnum = page_nums[i]
        cnum = pnum + 1
        stream = "\n".join(page.ops).encode("latin-1")
        obj(pnum, (f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
                   f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                   f"/Contents {cnum} 0 R >>").encode())
        obj(cnum, f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")

    objects.sort(key=lambda t: t[0])
    out = bytearray(b"%PDF-1.4\n")
    offsets = {}
    for num, body in objects:
        offsets[num] = len(out)
        out += f"{num} 0 obj\n".encode() + body + b"\nendobj\n"
    xref_pos = len(out)
    n = len(objects) + 1
    out += f"xref\n0 {n}\n".encode()
    out += b"0000000000 65535 f \n"
    for num, _ in objects:
        out += f"{offsets[num]:010d} 00000 n \n".encode()
    out += (f"trailer\n<< /Size {n} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n").encode()
    return bytes(out)


def rotate(seq, offset):
    seq = list(seq)
    offset = offset % max(len(seq), 1)
    return seq[offset:] + seq[:offset]


BRANCH_LABEL = {
    "b-cse": "CSE", "b-aiml": "AI & ML", "b-ds": "Data Science", "b-ece": "ECE",
    "b-eee": "EEE", "b-me": "Mechanical", "b-ce": "Civil", "b-it": "IT", "b-oth": "Other",
}


def main():
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(ROOT, "data", "papers.json"), "r", encoding="utf-8") as f:
        spec = json.load(f)
    count = 0
    for entry in spec["papers"]:
        subj = spec["subjects"][entry["subject"]]
        off_a = entry["year"] % max(len(subj["partA"]), 1)
        off_b = (entry["year"] + 3) % max(len(subj["partB"]), 1)
        part_a = rotate(subj["partA"], off_a)
        part_b = rotate(subj["partB"], off_b)
        head = f"Sample {entry['examType']} Question Paper \u2014 {entry['year']}"
        lines = [
            head,
            f"Subject: {subj['name']}   |   Code: {subj['code']}   |   Semester: {subj['sem']}",
            f"Branch: {BRANCH_LABEL.get(subj['branch'], subj['branch'])}   |   Regulation: R20 (sample)   |   Time: 3 Hours   |   Max Marks: {len(part_a) + len(part_b) * max(1, (90 - len(part_a)) // max(len(part_b), 1))}",
        ]
        pdf = build_pdf(lines, part_a, part_b)
        path = os.path.join(OUT, entry["file"] + ".pdf")
        with open(path, "wb") as f:
            f.write(pdf)
        count += 1
    print(f"Wrote {count} demo PDFs to {OUT}")


if __name__ == "__main__":
    main()
