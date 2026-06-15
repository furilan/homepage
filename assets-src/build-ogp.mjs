import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, 'ogp.svg'), 'utf8');

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: {
    loadSystemFonts: true,
    defaultFontFamily: 'Yu Gothic UI',
  },
  background: '#0b0d17',
});

const png = resvg.render().asPng();
const out = join(__dirname, '..', 'ogp.png');
writeFileSync(out, png);
console.log('OK ->', out, png.length, 'bytes');
