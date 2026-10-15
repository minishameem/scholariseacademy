"""Builds assets/css/home-compact.css: every homepage section rule from style.css,
re-emitted under `.page-home main` with px sizes multiplied by 0.8.
Header and footer are outside <main>, so they are untouched."""
import re

import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'assets/css/style.css')
OUT = os.path.join(ROOT, 'assets/css/home-compact.css')
F = 0.8

css = re.sub(r'/\*.*?\*/', '', open(SRC, encoding='utf-8').read(), flags=re.S)

HOME = re.compile(r'(^|[\s>+~,(])\.(hero|philosophy|phil-|box-|believe|belief|card-icon|card-bar|deco|c[1-8]\b|'
                  r'course|level-meter|pricing|price-|plan-|faq|instructor|ip-|iq-|impact|section|container|btn|eyebrow|accent)')


def split_blocks(text):
    """Yield (prelude, body) for each top-level block."""
    i, n = 0, len(text)
    while i < n:
        j = text.find('{', i)
        if j < 0:
            break
        prelude = text[i:j].strip()
        depth, k = 1, j + 1
        while depth and k < n:
            if text[k] == '{': depth += 1
            elif text[k] == '}': depth -= 1
            k += 1
        yield prelude, text[j + 1:k - 1]
        i = k


# Scale per section (base F = 0.8). The hero is 20% bigger than the rest,
# What We Believe 5% bigger, and text inside course cards 5% bigger.
GROUPS = [
    ('hero',    re.compile(r'\.hero\b|\.hero-'),                                          1.008, None),
    ('believe', re.compile(r'\.believe|\.belief|\.card-icon|\.card-bar|\.deco\b|\.c[1-8]\b'), 0.84, None),
    ('course',  re.compile(r'\.course-(?!tab)|\.level-meter'),                              F,    0.84),
]


def factors_for(sel):
    for name, rx, f, font_f in GROUPS:
        if rx.search(sel):
            return f, (font_f or f)
    return F, F


def scale_px(decls, f=F, font_f=None):
    font_f = font_f or f
    out = []
    for d in decls.split('; '):
        k = font_f if d.split(':')[0].strip() == 'font-size' else f
        def rep(m, k=k):
            v = float(m.group(1))
            if abs(v) <= 2:          # hairlines and small offsets stay crisp
                return m.group(0)
            return ('%.2f' % (v * k)).rstrip('0').rstrip('.') + 'px'
        out.append(re.sub(r'(-?\d*\.?\d+)px', rep, d))
    return '; '.join(out)


def prefix(sel):
    sel = sel.strip()
    for root in ('.js ', 'html:not(.js) ', '.no-js '):
        if sel.startswith(root):
            return root + '.page-home main ' + sel[len(root):]
    return '.page-home main ' + sel


def convert(text, indent=''):
    out = []
    for prelude, body in split_blocks(text):
        if prelude.startswith('@media'):
            m = re.search(r'max-width:\s*(\d+)px', prelude)
            if m and int(m.group(1)) < 1000:
                continue                    # tablet/phone layouts keep their own sizes
            if 'prefers-reduced-motion' in prelude:
                continue
            inner = convert(body, indent + '  ')
            if inner.strip():
                out.append('%s%s {\n%s%s}\n' % (indent, prelude, inner, indent))
        elif prelude.startswith('@'):
            continue                        # @font-face, @keyframes: unchanged
        else:
            sels = [s for s in prelude.split(',') if HOME.search(' ' + s.strip())]
            if not sels:
                continue
            # copy every declaration, not only px ones, so later overrides keep winning
            decls = [d.strip() for d in body.split(';') if d.strip()]
            if not decls:
                continue
            joined = '; '.join(decls)
            by_f = {}
            for sl in sels:
                by_f.setdefault(factors_for(sl), []).append(sl)
            for (f, ff), group in by_f.items():
                out.append('%s%s { %s; }\n' % (indent, ', '.join(prefix(x) for x in group), scale_px(joined, f, ff)))
    return ''.join(out)


# Content keeps the header/footer width so left edges line up.
# Images that grow with the column width are capped at 80% of their 1440px size instead.
EXTRA = """  .page-home main .container { max-width: 1200px; padding: 0 24px; }
  .page-home main .hero-visual { width: min(58.68%, 681px); bottom: 28px; }
  .page-home main .hero-inner { min-height: 0; }
  .page-home main .hero-copy { padding: 44px 0 46px; }
  .page-home main .philosophy-body { grid-template-columns: minmax(0, 458px) minmax(0, 438px); justify-content: center; column-gap: 88px; }
  .page-home main .instructor-grid { grid-template-columns: minmax(0, 360px) minmax(0, 620px); justify-content: center; column-gap: 88px; }
"""
body = '@media (min-width: 1000px) {\n' + convert(css, '  ') + EXTRA + '}\n'
open(OUT, 'w', encoding='utf-8').write(
    '/* Homepage sections, compact size (hero 100.8%, What We Believe 84%, others 80%). Generated from style.css by make_compact.py.\n'
    '   Edit style.css, then re-run the script, rather than editing this file. */\n' + body)
print(OUT, len(body.splitlines()), 'rules')
