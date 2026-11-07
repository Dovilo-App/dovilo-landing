/* Card headlines in Inter 700, drawn from the font's own outlines.

   The first version of build-og handed Inter to sharp's text renderer (Pango).
   Pango found the file but fontconfig did not pick it for "Inter Bold", so on
   some machines every headline came out in a Helvetica-like fallback while the
   rest of the card was right. A font name resolved by the system can always
   fall back; outlines cannot. So the headline is laid out here and drawn as
   SVG paths: fontkit reads the variable Inter from /fonts/ (WOFF2 decoded by
   tools/woff2.mjs, no second copy of the font), instances it at wght 700,
   shapes the text with Inter's own kerning, and sharp rasterises the paths.
   Nothing on the machine can change the letter shapes.

   Latin-ext is the second file: each character takes the first of the two
   fonts that has a glyph for it, and a character neither has stops the build
   (a .notdef box on a share card is not acceptable).

   assertInter() is the guard: it fails the build when the font is not Inter
   at the weight asked, or when what is drawn is not what the metrics say. */

import * as fontkit from 'fontkit';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { woff2ToTtf } from './woff2.mjs';

export const WEIGHT = 700;
/* The site's h1 tracking (system.css: h1{letter-spacing:-.025em}). */
export const TRACKING = -0.025;

/* The advance of the guard's test string at 1000 px in Inter 700 as /fonts/
   ships it, kerning and the tracking above included, measured once. Inter at
   400 comes out about 4% narrower, so 0.5% tells the weights apart, and a
   fallback face is not Inter's width at all. Change the font files or
   TRACKING and this number moves with them. */
const GUARD_TEXT = 'Hamburgefonstiv 1ğşİçñéèßü';
const GUARD_WIDTH = 13710.81;
const GUARD_TOLERANCE = 0.005;

let fonts = null; /* [{ font, base }] latin first, then latin-ext */

export function loadInter(root) {
  if (fonts) return fonts;
  fonts = ['inter-latin', 'inter-latin-ext'].map((name) => {
    const base = fontkit.create(woff2ToTtf(readFileSync(path.join(root, 'fonts', `${name}.woff2`))));
    const axis = base.variationAxes?.wght;
    if (base.familyName !== 'Inter') throw new Error(`fonts/${name}.woff2 is "${base.familyName}", not Inter`);
    if (!axis || WEIGHT < axis.min || WEIGHT > axis.max) throw new Error(`fonts/${name}.woff2 has no wght axis covering ${WEIGHT}`);
    return { font: base.getVariation({ wght: WEIGHT }), base };
  });
  return fonts;
}

/* Splits a string into runs, each in the first font that has every character
   in it. */
function runsOf(text) {
  const runs = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const f = fonts.find(({ font }) => font.hasGlyphForCodePoint(cp));
    if (!f) throw new Error(`Inter has no glyph for U+${cp.toString(16).toUpperCase().padStart(4, '0')} (${ch}) in "${text}"`);
    const last = runs[runs.length - 1];
    if (last && last.f === f) last.text += ch; else runs.push({ f, text: ch });
  }
  return runs;
}

/* A line, shaped: glyphs with their x origin in px, and the line's advance. */
function shape(text, size) {
  const glyphs = [];
  let x = 0;
  for (const { f, text: str } of runsOf(text)) {
    const s = size / f.base.unitsPerEm;
    const run = f.font.layout(str);
    run.glyphs.forEach((glyph, i) => {
      if (glyph.id === 0) throw new Error(`Inter has no glyph for a character in "${text}"`);
      const pos = run.positions[i];
      glyphs.push({ glyph, s, x: x + pos.xOffset * s, y: -pos.yOffset * s });
      x += pos.xAdvance * s + TRACKING * size;
    });
  }
  /* CSS letter-spacing trails the last character too; a wrapped line does not
     measure it. */
  return { glyphs, width: glyphs.length ? x - TRACKING * size : 0 };
}

export const lineWidth = (text, size) => shape(text, size).width;

/* Greedy word wrap at `measure` px. A word wider than the measure stays whole
   ('word') or breaks between characters ('word-char'). */
export function wrap(text, size, measure, mode = 'word') {
  const lines = [];
  let line = '';
  const put = (piece) => {
    const next = line ? `${line} ${piece}` : piece;
    if (!line || lineWidth(next, size) <= measure) { line = next; return; }
    lines.push(line);
    line = piece;
  };
  for (const word of text.split(/ +/).filter(Boolean)) {
    if (mode === 'word-char' && lineWidth(word, size) > measure) {
      if (line) { lines.push(line); line = ''; }
      for (const ch of word) {
        if (line && lineWidth(line + ch, size) > measure) { lines.push(line); line = ''; }
        line += ch;
      }
    } else put(word);
  }
  if (line) lines.push(line);
  return lines;
}

/* The metrics of a block: its widest line and its height at line height `lh`. */
export function blockSize(lines, size, lh) {
  return { width: Math.max(0, ...lines.map((l) => lineWidth(l, size))), height: Math.round(lines.length * size * lh) };
}

const glyphPaths = new WeakMap();
const pathOf = (glyph) => {
  if (!glyphPaths.has(glyph)) glyphPaths.set(glyph, glyph.path.toSVG());
  return glyphPaths.get(glyph);
};

/* The lines as a transparent PNG, `width` px wide. Each line sits in a box of
   size x lh with the font's ascent and descent centred in it, as CSS does. */
export async function renderLines(lines, size, lh, width, fill) {
  const { base } = fonts[0];
  const asc = (base.ascent * size) / base.unitsPerEm, desc = (-base.descent * size) / base.unitsPerEm;
  const pitch = size * lh;
  const height = Math.round(lines.length * pitch);
  let body = '';
  lines.forEach((line, i) => {
    const baseline = i * pitch + (pitch - (asc + desc)) / 2 + asc;
    for (const { glyph, s, x, y } of shape(line, size).glyphs) {
      const d = pathOf(glyph);
      if (d) body += `<path transform="translate(${x.toFixed(2)} ${(baseline + y).toFixed(2)}) scale(${s.toFixed(6)} ${(-s).toFixed(6)})" d="${d}"/>`;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width)}" height="${height}" fill="${fill}">${body}</svg>`;
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 }).png().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/* The guard. Two checks, so a fallback font and a broken drawing both fail:
   1. the test string's advance at 1000 px matches Inter Bold's;
   2. drawn through the production path, its ink is as wide as the metrics of
      its first and last glyph say, to a pixel and a half. */
export async function assertInter() {
  const size = 1000;
  const shaped = shape(GUARD_TEXT, size);
  const off = Math.abs(shaped.width / GUARD_WIDTH - 1);
  if (off > GUARD_TOLERANCE) {
    throw new Error(`Inter guard: "${GUARD_TEXT}" is ${shaped.width.toFixed(1)} px wide at 1000 px, Inter ${WEIGHT} is ${GUARD_WIDTH}; the font is not Inter ${WEIGHT}`);
  }
  const probe = 160;
  const g = shape(GUARD_TEXT, probe);
  const first = g.glyphs[0], last = g.glyphs[g.glyphs.length - 1];
  const inkLeft = first.x + first.glyph.bbox.minX * first.s;
  const inkRight = last.x + last.glyph.bbox.maxX * last.s;
  const pad = 20;
  const img = await renderLines([GUARD_TEXT], probe, 1.4, Math.ceil(g.width) + 2 * pad, '#000');
  /* Draw at x=0; measure the ink columns of the alpha channel. */
  const { data, info } = await sharp(img.data).raw().toBuffer({ resolveWithObject: true });
  let min = info.width, max = -1;
  for (let x = 0; x < info.width; x++) {
    for (let y = 0; y < info.height; y++) {
      if (data[(y * info.width + x) * info.channels + 3] > 127) { min = Math.min(min, x); max = Math.max(max, x + 1); break; }
    }
  }
  if (max < 0) throw new Error('Inter guard: the test string drew no ink');
  const drawn = max - min, expected = inkRight - inkLeft;
  if (Math.abs(drawn - expected) > 1.5) {
    throw new Error(`Inter guard: the test string's ink is ${drawn}px wide, Inter's metrics say ${expected.toFixed(1)}px`);
  }
}
