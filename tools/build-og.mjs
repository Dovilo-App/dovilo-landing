/* Share cards: a 1200x630 JPG per built page and language, from the strings.

   Each card is the page's <h1> in Inter 700 on the light --bg, with the hero
   capture where the page's template names one. Four layouts, the first three
   the ones the hand-made cards had:

     text   the h1 alone, left, vertically centred          (/pricing/, /downloads/, /faq/, /docs/)
     split  the h1 left, two phone captures to the right    (/)
     top    the h1 on top, the desktop capture under it     (/ai)
     phone  the h1 left, one phone capture to the right     (og-card.jpg)

   A template names its card in a comment the page build drops:
     {{! card: layout=split captures=mobile-ai-inbox-772.webp,mobile-list-birthday-772.webp }}
   Captures are read from the language's capture folder (`lang.captures` in its
   strings file), so a localised card shows the localised screen.

   The text never overflows: it wraps at the layout's measure and, when it
   still does not fit, drops one size step; past that it is clipped to whole
   lines and the build says so. The headline is drawn from Inter's outlines
   (tools/og-type.mjs), not set by a system font lookup, so it is Inter on any
   machine, and the build stops if it is not (assertInter).

   English writes og-<page>.jpg (og-home.jpg, og-faq.jpg, …); another language
   writes og-<page>-<lang>.jpg. /docs/ is not localised: its card is built from
   the <h1> of docs/index.html. og-card.jpg is the site's generic card (the
   blog indexes, /docs/mcp/ and old shares): a fixed headline, below, and the
   city capture.

   Usage: npm run build:og [-- --check] */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, SRC, PAGES, plain, loadStrings, stringsLanguages, cardName } from './pages-lib.mjs';
import { loadInter, assertInter, wrap, blockSize, renderLines } from './og-type.mjs';

const CHECK = process.argv.includes('--check');
const W = 1200, H = 630;
const BG = '#FAF8F4', TEXT = '#1C1B19', SURFACE = '#FFFFFF', BORDER = '#DED9D1'; /* system.css, light */
const MARGIN = 64;

/* size: the h1 in px, then the one step down. lh: line height. measure: the
   wrap width. box: where the text may sit, [top, bottom]; `align` places it. */
const LAYOUTS = {
  text: { size: [72, 60], lh: 1.2, measure: 940, box: [MARGIN, H - MARGIN], align: 'middle' },
  split: { size: [56, 48], lh: 1.15, measure: 456, box: [MARGIN, H - MARGIN], align: 'middle' },
  top: { size: [50, 42], lh: 1.15, measure: 960, box: [MARGIN, 216 - 40], align: 'top' },
  phone: { size: [64, 56], lh: 1.15, measure: 620, box: [MARGIN, H - MARGIN], align: 'middle' },
};
/* Capture frames, as the Figure component draws them: --surface, a 1px
   --border, radius 8. They run off the bottom edge like the hand-made cards. */
const FRAMES = {
  split: [{ left: 552, top: 64, width: 280 }, { left: 856, top: 128, width: 280 }],
  top: [{ left: MARGIN, top: 216, width: W - 2 * MARGIN }],
  phone: [{ left: 816, top: 64, width: 320 }],
};

/* ─── Headline ─── */

/* Sets the text at one size: wrapped at the measure, drawn from Inter's
   outlines. `lines` is kept so a clipped card can drop the last ones. */
async function setText(text, size, layout, mode = 'word', maxLines = Infinity) {
  const lines = wrap(text, size, layout.measure, mode).slice(0, maxLines);
  const { width, height } = blockSize(lines, size, layout.lh);
  const img = await renderLines(lines, size, layout.lh, layout.measure, TEXT);
  return { data: img.data, width, height, pad: img.pad, size, lines };
}

async function fitText(text, layout, where) {
  const room = layout.box[1] - layout.box[0];
  for (const size of layout.size) {
    const t = await setText(text, size, layout);
    if (t.width <= layout.measure && t.height <= room) return t;
  }
  /* Still too long at the smaller size: break inside words if one is wider
     than the measure, keep the whole lines that fit and say so. */
  const size = layout.size[layout.size.length - 1];
  const t = await setText(text, size, layout, 'word-char');
  if (t.height <= room) return t;
  const keep = Math.floor(room / (size * layout.lh));
  if (keep < 1) throw new Error(`${where}: the h1 does not fit even one line; shorten it`);
  console.warn(`  ! ${where}: the h1 does not fit at ${size}px; clipped to ${keep} line(s). Shorten it.`);
  return setText(text, size, layout, 'word-char', keep);
}

async function frame(file, f) {
  const meta = await sharp(file).metadata();
  const inner = f.width - 2;
  const fullH = Math.round((meta.height * inner) / meta.width) + 2;
  const visible = Math.min(fullH, H - f.top);
  /* Inside the 1px border: the whole capture, or the part above the card's edge. */
  const shotH = Math.min(fullH - 2, visible - 1);
  const shot = await sharp(file).resize({ width: inner }).extract({ left: 0, top: 0, width: inner, height: shotH }).png().toBuffer();
  const r = 8;
  const mask = Buffer.from(`<svg width="${inner}" height="${shotH}"><rect x="0" y="0" width="${inner}" height="${fullH}" rx="${r - 1}" fill="#fff"/></svg>`);
  const clipped = await sharp(shot).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const box = Buffer.from(`<svg width="${f.width}" height="${visible}"><rect x="0.5" y="0.5" width="${f.width - 1}" height="${fullH - 1}" rx="${r}" fill="${SURFACE}" stroke="${BORDER}"/></svg>`);
  const data = await sharp(box).composite([{ input: clipped, left: 1, top: 1 }]).png().toBuffer();
  return { input: data, left: f.left, top: f.top };
}

async function card({ h1, layout: name, captures = [], capturesDir, where }) {
  const layout = LAYOUTS[name];
  if (!layout) throw new Error(`${where}: unknown card layout "${name}"`);
  const frames = FRAMES[name] || [];
  if (captures.length !== frames.length) throw new Error(`${where}: layout ${name} takes ${frames.length} capture(s), the template names ${captures.length}`);
  const t = await fitText(h1, layout, where);
  const top = layout.align === 'top' ? layout.box[0] : Math.round(layout.box[0] + (layout.box[1] - layout.box[0] - t.height) / 2);
  const layers = [{ input: t.data, left: MARGIN + 2, top: top - t.pad }];
  for (let i = 0; i < frames.length; i++) {
    const file = path.join(ROOT, capturesDir.replace(/^\//, ''), captures[i]);
    if (!existsSync(file)) throw new Error(`${where}: capture ${path.relative(ROOT, file)} is missing`);
    layers.push(await frame(file, frames[i]));
  }
  return sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite(layers)
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
}

/* ─── Cards ─── */

const jobs = [];
const langs = stringsLanguages();
for (const page of PAGES) {
  const tpl = readFileSync(path.join(SRC, 'pages', `${page.id}.html`), 'utf8');
  const m = /\{\{!\s*card:([^}]*)\}\}/.exec(tpl);
  if (!m) throw new Error(`src/pages/${page.id}.html names no card`);
  const opts = Object.fromEntries([...m[1].matchAll(/(\w+)=(\S+)/g)].map((x) => [x[1], x[2]]));
  for (const lang of langs) {
    const s = loadStrings(lang.code);
    if (opts.captures && !s.lang?.captures) throw new Error(`src/strings/${lang.code}.json has no lang.captures`);
    jobs.push({
      out: `${cardName(page, lang)}.jpg`,
      h1: plain(s.pages[page.id].hero.h1),
      layout: opts.layout,
      captures: opts.captures ? opts.captures.split(',') : [],
      capturesDir: s.lang.captures,
      where: `${lang.code}/${page.id}`,
    });
  }
}
const docsH1 = /<h1>([\s\S]*?)<\/h1>/.exec(readFileSync(path.join(ROOT, 'docs', 'index.html'), 'utf8'));
if (!docsH1) throw new Error('docs/index.html has no <h1>');
jobs.push({ out: 'og-docs.jpg', h1: plain(docsH1[1]), layout: 'text', captures: [], capturesDir: '', where: 'en/docs' });
/* The generic card: the blog indexes, /docs/mcp/ and every share of the old
   name point at it. Its headline is the only card text that is not a page's
   <h1>; it is the home page's story in the brief's words. Its alt text is
   SITE.defaultOgImageAlt (tools/config.mjs) with a copy in docs/mcp/index.html:
   change the three together. */
jobs.push({
  out: 'og-card.jpg', h1: 'Dovilo: turn your to-do list into a city you build.', layout: 'phone',
  captures: ['mobile-city-26-772.webp'], capturesDir: '/screenshots', where: 'en/generic',
});

const changed = [];
loadInter(ROOT);
await assertInter();
for (const job of jobs) {
  const buf = await card(job);
  const file = path.join(ROOT, job.out);
  if (existsSync(file) && readFileSync(file).equals(buf)) continue;
  changed.push(job.out);
  if (!CHECK) writeFileSync(file, buf);
}

if (CHECK && changed.length) {
  console.error(`Out of date: ${changed.join(', ')}. Run npm run build:og.`);
  process.exit(1);
}
console.log(changed.length ? `${CHECK ? 'Would write' : 'Wrote'} ${changed.join(', ')}.` : `Up to date: ${jobs.length} card(s).`);
