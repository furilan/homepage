# デザイン刷新(白ベース)に伴う全HTMLの機械編集
# 使い方: リポジトリルートで
#   python assets-src/redesign-migrate.py --dry-run   … 変更件数だけ表示
#   python assets-src/redesign-migrate.py             … 実際に書き換え
import io, glob, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY = '--dry-run' in sys.argv

FONTS_NEW = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap'

# (名前, 正規表現, 置換) の順で適用
RULES = [
    ('theme-color', re.compile(r'<meta name="theme-color" content="#06070d">'),
     '<meta name="theme-color" content="#ffffff">'),
    ('fonts', re.compile(r'https://fonts\.googleapis\.com/css2\?family=[^"]+'), FONTS_NEW),
    ('loader', re.compile(r'\n(?:<!-- ローディング画面 -->\n)?<div class="loader" id="loader">\s*<div class="loader-inner">.*?<div class="loader-bar"><span></span></div>\s*</div>\s*</div>\n', re.S), '\n'),
    # 初回実行で閉じタグが1つ残ったページ(index/works)の後始末
    ('loader-orphan', re.compile(r'(<body>\n)\n?</div>\n'), r'\1'),
    ('cursor-glow-comment', re.compile(r'\n<!-- カーソル追従グロー -->'), ''),
    ('cursor-glow', re.compile(r'\n<div class="cursor-glow" id="cursorGlow"></div>\n'), '\n'),
    ('particle-canvas', re.compile(r'\n\s*<canvas id="particleCanvas"></canvas>'), ''),
    ('grid-overlay', re.compile(r'\n\s*<div class="hero-grid-overlay"></div>'), ''),
    ('marquee', re.compile(r'\n\s*<div class="hero-marquee">\s*<div class="marquee-track">.*?</div>\s*</div>', re.S), ''),
    ('pulse-dot', re.compile(r'<span class="pulse-dot"></span>'), ''),
    ('hero-content', re.compile(r'<div class="hero-content">'), '<div class="container hero-content">'),
    ('card-glow', re.compile(r'\n\s*<div class="service-card-glow"></div>'), ''),
    ('tilt', re.compile(r'class="service-card tilt reveal'), 'class="service-card reveal'),
    ('stats-bg-text', re.compile(r'\n\s*<div class="stats-bg-text" aria-hidden="true">[^<]*</div>'), ''),
    ('decor-bg', re.compile(r'\n\s*<div class="(?:recruit-hero-bg|column-hero-bg|lp-about-bg)"></div>'), ''),
]

files = sorted(glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, 'column', '*.html')))
totals = {name: 0 for name, _, _ in RULES}
changed_files = 0

for f in files:
    s = io.open(f, encoding='utf-8').read()
    orig = s
    hits = {}
    for name, pat, repl in RULES:
        s, n = pat.subn(repl, s)
        if n:
            hits[name] = n
            totals[name] += n
    if s != orig:
        changed_files += 1
        rel = os.path.relpath(f, ROOT)
        print('%-45s %s' % (rel, ', '.join('%s×%d' % kv for kv in hits.items())))
        if not DRY:
            io.open(f, 'w', encoding='utf-8', newline='').write(s)

print('---')
print('対象ファイル:', len(files), '/ 変更:', changed_files, '(dry-run)' if DRY else '')
for name, n in totals.items():
    print('  %-22s %d' % (name, n))
