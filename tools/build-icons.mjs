#!/usr/bin/env node
/* Builds the site's icons from the brand sources in docs/brand/.
 *
 * The SVGs there are the Dovilo app icon (decision A126, the flat brick D), the
 * same mark the app and the stores show. Every icon file the site serves is
 * rasterised from them here, by scale and crop alone: no redrawing or
 * recolouring. Change a source, re-run this, commit what it writes.
 *
 * The glyph (the mark without mortar) is for anything shown under 48px; the
 * field-and-mark square is for the opaque files. The mark and the white glyph
 * have no use on the site yet.
 *
 * The sources keep the app icon's safe area, so the glyph covers only about two
 * thirds of its square. A favicon or a 32px logo has no mask to clear, so the
 * files drawn from the glyph use a tight copy: the same paths with the viewBox
 * cropped to the ink plus MARGIN on each side. The square keeps its safe area:
 * iOS and the search results draw it as a tile, as the app's home screen does.
 *
 * Writes, at the site root:
 *   favicon.ico            16, 32 and 48 from the tight glyph, PNG entries
 *   favicon.svg            the tight glyph: the source with only its viewBox changed
 *   apple-touch-icon.png   180, opaque, from the square
 *   dovilo-logo.webp       96, transparent, from the tight glyph: the nav logo, shown at 32,
 *                          so 3x phones get their own pixels and 1x and 2x scale down
 *   dovilo-icon.png        512, opaque, from the square: the app icon as the JSON-LD logo
 *
 * Nothing is written until every file has rendered, so a failing source leaves
 * the committed set as it was rather than half old and half new.
 *
 *   npm run build:icons
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = path.join(ROOT, 'docs', 'brand');

const PNG = { compressionLevel: 9, adaptiveFiltering: true };

/* Space left on each side of the tight glyph, as a share of the cropped
   square's side. 1/16 leaves 1px at 16px, as Gmail's favicon does, and makes
   the glyph fill 88% of its box, as the favicon before the brick D did. */
const MARGIN = 1 / 16;

const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const log = (...a) => console.log(...a);

async function source(name) {
  const file = path.join(BRAND, name);
  const svg = await readFile(file);
  const { width, height } = await sharp(svg).metadata();
  if (width !== height) throw new Error(`${rel(file)} is ${width}x${height}; the sources are square`);
  return { file, svg, width };
}

/* The same SVG with its viewBox cropped to a square around the ink. The ink box
   is read from a render at the source's own size, so it holds for any path
   commands; width and height stay, so render() scales it like the source. */
async function tight(src) {
  const text = src.svg.toString('utf8');
  const [vx, vy, vw, vh] = (text.match(/viewBox="([^"]+)"/)?.[1] ?? '').split(/[\s,]+/).map(Number);
  if (!(vw > 0) || vw !== vh) throw new Error(`${rel(src.file)} needs a square viewBox`);
  const { data } = await sharp(src.svg).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = src.width, y0 = src.width, x1 = -1, y1 = -1;
  for (let p = 0; p < data.length / 4; p++) {
    if (!data[p * 4 + 3]) continue;
    const x = p % src.width, y = Math.floor(p / src.width);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  if (x1 < 0) throw new Error(`${rel(src.file)} draws nothing`);
  const unit = vw / src.width;
  const side = (Math.max(x1 + 1 - x0, y1 + 1 - y0) * unit) / (1 - 2 * MARGIN);
  const cx = vx + ((x0 + x1 + 1) / 2) * unit, cy = vy + ((y0 + y1 + 1) / 2) * unit;
  const box = [cx - side / 2, cy - side / 2, side, side].map((n) => +n.toFixed(2)).join(' ');
  return { ...src, svg: Buffer.from(text.replace(/viewBox="[^"]+"/, `viewBox="${box}"`)) };
}

/* Draws the SVG straight at `size` px. librsvg renders at the density that maps
   the SVG's width onto `size`, so the edges are antialiased at the target size
   instead of resampled from a larger raster. */
async function render({ file, svg, width }, size) {
  const { data, info } = await sharp(svg, { density: (72 * size) / width })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width !== size || info.height !== size) {
    throw new Error(`${rel(file)} rendered at ${info.width}x${info.height}, not ${size}`);
  }
  return sharp(data, { raw: { width: size, height: size, channels: 4 } });
}

/* The square's field covers every pixel, so dropping alpha loses nothing. A
   source that ever leaves a pixel see-through fails here rather than turning
   that pixel black in a file iOS and Google show on a tile of their own. */
async function opaque(img, name) {
  const { isOpaque } = await img.stats();
  if (!isOpaque) throw new Error(`${name}: the source leaves pixels transparent, and this file must be opaque`);
  return img.removeAlpha();
}

/* An ICO is a directory of images. Each entry here holds a PNG, which every
   current browser and Windows since Vista read; the favicon.ico before this one
   was built the same way. */
function ico(entries) {
  const head = Buffer.alloc(6 + 16 * entries.length);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(entries.length, 4);
  let offset = head.length;
  entries.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size % 256, e); // width, 0 meaning 256
    head.writeUInt8(size % 256, e + 1); // height
    head.writeUInt16LE(1, e + 4); // colour planes
    head.writeUInt16LE(32, e + 6); // bits per pixel
    head.writeUInt32LE(png.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...entries.map((e) => e.png)]);
}

const glyph = await tight(await source('dovilo-icon-glyph.svg'));
const square = await source('dovilo-icon-1024.svg');

const favicon = [];
for (const size of [16, 32, 48]) {
  favicon.push({ size, png: await (await render(glyph, size)).png(PNG).toBuffer() });
}

const files = {
  'favicon.ico': ico(favicon),
  'favicon.svg': glyph.svg,
  'apple-touch-icon.png': await (await opaque(await render(square, 180), 'apple-touch-icon.png')).png(PNG).toBuffer(),
  'dovilo-logo.webp': await (await render(glyph, 96)).webp({ lossless: true, effort: 6 }).toBuffer(),
  'dovilo-icon.png': await (await opaque(await render(square, 512), 'dovilo-icon.png')).png(PNG).toBuffer(),
};

log(`Icons from ${rel(BRAND)}/`);
for (const [name, buf] of Object.entries(files)) {
  await writeFile(path.join(ROOT, name), buf);
  log(`  ${name.padEnd(22)} ${buf.length.toLocaleString('en-US')} bytes`);
}
