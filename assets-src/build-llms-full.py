# llms-full.txt 生成スクリプト
# コラム全記事の本文テキストを1ファイルに集約し、LLMクローラーが
# サイト全体の知識を一度に取得できるようにする。
# 使い方: リポジトリルートで python assets-src/build-llms-full.py
import io, glob, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def strip_tags(html: str) -> str:
    html = re.sub(r'<script.*?</script>', '', html, flags=re.S)
    html = re.sub(r'<style.*?</style>', '', html, flags=re.S)
    # ブロック要素は改行に
    html = re.sub(r'</(p|h[1-6]|li|tr|div|section|details|summary)>', '\n', html)
    html = re.sub(r'<(h2)[^>]*>', '\n## ', html)
    html = re.sub(r'<(h3)[^>]*>', '\n### ', html)
    html = re.sub(r'<(h4)[^>]*>', '\n#### ', html)
    html = re.sub(r'<li[^>]*>', '- ', html)
    html = re.sub(r'<[^>]+>', '', html)
    html = html.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&nbsp;', ' ')
    html = re.sub(r'\n{3,}', '\n\n', html)
    html = re.sub(r'[ \t]+', ' ', html)
    return html.strip()

def extract(path: str):
    s = io.open(path, encoding='utf-8').read()
    title = re.search(r'<title>(.*?)</title>', s, re.S)
    canonical = re.search(r'rel="canonical" href="([^"]+)"', s)
    body = re.search(r'<div class="article-body">(.*?)<div class="article-cta">', s, re.S)
    if not body:
        body = re.search(r'<div class="article-body">(.*?)</main>', s, re.S)
    if not (title and canonical and body):
        return None
    return {
        'title': strip_tags(title.group(1)).split('|')[0].strip(),
        'url': canonical.group(1),
        'text': strip_tags(body.group(1)),
    }

articles = []
for f in sorted(glob.glob(os.path.join(ROOT, 'column', '*.html'))):
    if f.endswith('index.html'):
        continue
    a = extract(f)
    if a:
        articles.append(a)

out = io.StringIO()
out.write('''# 株式会社フリラン (FURILAN Inc.) — 全コンテンツ

> 本ファイルは、株式会社フリラン(https://www.fuliran.co.jp/)が公開している
> 解説コンテンツの全文をLLM向けに集約したものです。
> 会社概要・事業内容の要約は https://www.fuliran.co.jp/llms.txt を参照してください。

株式会社フリランは、AIエージェント開発・AI駆動開発・SES・自社サービス開発・
LINEミニアプリ開発を手がける日本のテクノロジーカンパニーです(東京都中央区日本橋、2017年6月設立)。

''')

for a in articles:
    out.write('---\n\n')
    out.write('# %s\n' % a['title'])
    out.write('URL: %s\n\n' % a['url'])
    out.write(a['text'])
    out.write('\n\n')

dest = os.path.join(ROOT, 'llms-full.txt')
io.open(dest, 'w', encoding='utf-8', newline='\n').write(out.getvalue())
print('生成:', dest)
print('記事数:', len(articles))
print('サイズ: %.1f KB' % (len(out.getvalue().encode("utf-8")) / 1024))
