/* ==========================================================================
   Backlog Buddy — tiny dependency-free PDF writer (UMD: browser + Node)
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BBPdf = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PAGE_W = 595.28, PAGE_H = 841.89, MARGIN = 56;

  function sanitize(s) {
    var map = {
      '\u2013': '-', '\u2014': '-', '\u2018': "'", '\u2019': "'",
      '\u201c': '"', '\u201d': '"', '\u00d7': 'x', '\u2192': '->',
      '\u2022': '-', '\u2265': '>=', '\u2264': '<=', '\u2248': '~', '\u00b0': ' deg '
    };
    return String(s == null ? '' : s).replace(/[\u2013\u2014\u2018\u2019\u201c\u201d\u00d7\u2192\u2022\u2265\u2264\u2248\u00b0]/g, function (c) { return map[c]; });
  }

  function esc(s) { return sanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }

  // wrap text into lines of at most `max` characters
  function wrap(text, max) {
    var words = sanitize(text).split(/\s+/).filter(Boolean);
    var lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (test.length > max && cur) { lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }

  function Builder(meta) {
    this.meta = meta || {};
    this.pages = [];
    this.ops = [];
    this.y = PAGE_H - MARGIN;
    this.startPage();
  }

  Builder.prototype.startPage = function () {
    this.pages.push(this.ops);
    this.ops = [];
    this.y = PAGE_H - MARGIN;
    return this;
  };

  Builder.prototype.need = function (h) {
    if (this.y - h < MARGIN) this.startPage();
    return this;
  };

  Builder.prototype.text = function (str, opt) {
    opt = opt || {};
    var size = opt.size || 10.5, bold = !!opt.bold, align = opt.align || 'left';
    var color = opt.color || [0.1, 0.13, 0.2];
    var max = Math.floor((PAGE_W - 2 * MARGIN) / (size * 0.5));
    var lines = wrap(str, max);
    for (var i = 0; i < lines.length; i++) {
      this.need(size * 1.5);
      var x = MARGIN;
      if (align === 'center') {
        var w = lines[i].length * size * 0.5;
        x = (PAGE_W - w) / 2;
      }
      this.ops.push('BT /' + (bold ? 'F2 ' : 'F1 ') + size + ' Tf ' +
        color[0] + ' ' + color[1] + ' ' + color[2] + ' rg ' +
        x.toFixed(2) + ' ' + this.y.toFixed(2) + ' Td (' + esc(lines[i]) + ') Tj ET');
      this.y -= size * 1.42;
    }
    if (opt.gap) this.y -= opt.gap;
    return this;
  };

  Builder.prototype.h1 = function (s) { return this.need(30).text(s, { size: 15, bold: true, align: 'center', gap: 6 }); };
  Builder.prototype.h2 = function (s) { return this.need(24).text(s, { size: 12.5, bold: true, gap: 5 }); };
  Builder.prototype.p = function (s) { return this.text(s, { size: 10.5, gap: 3 }); };
  Builder.prototype.small = function (s) { return this.text(s, { size: 9, color: [0.35, 0.4, 0.48] }); };
  Builder.prototype.space = function (h) { this.y -= h || 8; return this; };
  Builder.prototype.rule = function () {
    this.need(8);
    this.ops.push('0.78 0.81 0.87 RG 1 w ' + MARGIN + ' ' + this.y.toFixed(2) + ' m ' + (PAGE_W - MARGIN) + ' ' + this.y.toFixed(2) + ' l S');
    this.y -= 14;
    return this;
  };

  Builder.prototype.toBytes = function () {
    var self = this;
    if (this.pages[this.pages.length - 1] !== this.ops) this.pages.push(this.ops);

    var objects = [];
    function add(body) { objects.push(body); return objects.length; }

    var font1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    var font2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

    var pageRefs = [];
    var contentRefs = [];
    this.pages.forEach(function (ops) {
      var stream = ops.join('\n');
      var ref = add('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
      contentRefs.push(ref);
    });
    this.pages.forEach(function (_, i) {
      pageRefs.push(add('<< /Type /Page /Parent PARENTREF /MediaBox [0 0 ' + PAGE_W.toFixed(2) + ' ' + PAGE_H.toFixed(2) + '] ' +
        '/Resources << /Font << /F1 ' + font1 + ' 0 R /F2 ' + font2 + ' 0 R >> >> /Contents ' + contentRefs[i] + ' 0 R >>'));
    });
    var pagesRef = add('<< /Type /Pages /Kids [' + pageRefs.map(function (r) { return r + ' 0 R'; }).join(' ') + '] /Count ' + pageRefs.length + ' >>');
    var infoRef = add('<< /Title (' + esc(self.meta.title || 'Backlog Buddy') + ') /Author (Backlog Buddy) /Producer (Backlog Buddy PDF Engine) >>');
    var catalogRef = add('<< /Type /Catalog /Pages ' + pagesRef + ' 0 R >>');

    var parts = ['%PDF-1.4\n'];
    var offsets = [0];
    objects.forEach(function (body, i) {
      var num = i + 1;
      var resolved = body.replace('PARENTREF', pagesRef + ' 0 R');
      var chunk = num + ' 0 obj\n' + resolved + '\nendobj\n';
      offsets.push(parts.join('').length);
      parts.push(chunk);
    });
    var xrefPos = parts.join('').length;
    var xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    for (var k = 1; k <= objects.length; k++) {
      xref += ('0000000000' + offsets[k]).slice(-10) + ' 00000 n \n';
    }
    var trailer = 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root ' + catalogRef + ' 0 R /Info ' + infoRef + ' 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF';
    var full = parts.join('') + xref + trailer;

    var bytes = new Uint8Array(full.length);
    for (var b = 0; b < full.length; b++) bytes[b] = full.charCodeAt(b) & 0xff;
    return bytes;
  };

  return { Builder: Builder, sanitize: sanitize };
});
