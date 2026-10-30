#!/usr/bin/env node
/* Builds the site's icons from the brand sources in docs/brand/.
 *
 * The SVGs there are the Dovilo app icon (decision A126, the flat brick D), the
 * same mark the app and the stores show. Every icon file the site serves is
 * rasterised from them here, by scale alone: no redrawing, recolouring or
 * cropping. Change a source, re-run this, commit what it writes.
 *
 * The glyph (the mark without mortar) is for anything shown under 48px; the
 * field-and-mark square is for the opaque files. The mark and the white glyph
 * have no use on the site yet.
 *
 * Writes, at the site root:
 *   favicon.ico            16, 32 and 48 from the glyph, PNG entries
 *   favicon.svg            the glyph, byte for byte
 *   apple-touch-icon.png   180, opaque, from the square
 *   notify-icon.webp       64, transparent, from the glyph: the nav logo, shown at 32
 *   notify-icon.png        512, opaque, from the square: the JSON-LD logo
 *
 *   npm run build:icons
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = path.join(ROOT, 'docs', 'brand');
const GLYPH = path.join(BRAND, 'dovilo-icon-glyph.svg');
const SQUARE = path.join(BRAND, 'dovilo-icon-1024.svg');

const PNG = { compressionLevel: 9, adaptiveFiltering: true };

const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const log = (...a) => console.log(...a);

/* Draws the SVG straight at `size` px. librsvg renders at the density that maps
   the SVG's width onto `size`, so the edges are antialiased at the target size
   instead of resampled from a larger raster. */
async function render(file, size) {
  const svg = await readFile(file);
  const { width, height } = await sharp(svg).metadata();
  if (width !== height) throw new Error(`${rel(file)} is ${width}x${height}; the sources are square`);
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

async function write(name, buf) {
  await writeFile(path.join(ROOT, name), buf);
  log(`  ${name.padEnd(22)} ${buf.length.toLocaleString('en-US')} bytes`);
}

log(`Icons from ${rel(BRAND)}/`);

const favicon = [];
for (const size of [16, 32, 48]) {
  favicon.push({ size, png: await (await render(GLYPH, size)).png(PNG).toBuffer() });
}
await write('favicon.ico', ico(favicon));
await write('favicon.svg', await readFile(GLYPH));
await write('apple-touch-icon.png', await (await opaque(await render(SQUARE, 180), 'apple-touch-icon.png')).png(PNG).toBuffer());
await write('notify-icon.webp', await (await render(GLYPH, 64)).webp({ lossless: true, effort: 6 }).toBuffer());
await write('notify-icon.png', await (await opaque(await render(SQUARE, 512), 'notify-icon.png')).png(PNG).toBuffer());
