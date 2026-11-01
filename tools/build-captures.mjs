#!/usr/bin/env node
/* The site's captures, from the PNG sources in screenshots/new/ (A131).

     npm run build:captures                       every capture, every language with strings
     npm run build:captures -- --lang en --screen 11   one source, e.g. after a re-take
     npm run build:captures -- --tinify          then compress what was written with Tinify

   Sources (full frame, never edited here):
     screenshots/new/mobile/{light,dark}/<lang>-NN.png    1206x2622 (09: 1206x1290)
     screenshots/new/mobile/{light,dark}/city.png         the city, one capture for every language
     screenshots/new/desktop/<lang>/{light,dark}/desktop-NN-<name>.png   2844x1846, alpha corners

   Output: English to screenshots/ (flat, as the site always had it), another
   language to screenshots/<lang>/, under the names the page templates use
   (src/pages, `lang.captures` in the strings). The city is written once, to
   screenshots/, and every language links it there.

   Phone captures are cropped below the status bar and above the home
   indicator (PHONE_CROP, measured on en-01 light; docs/design-language.md,
   Figure). 09 is cropped at the source and keeps its frame. Desktop captures
   are not cropped and keep their alpha. WebP q88 (the city q80), Lanczos.

   --tinify sends each file written in this run to the Tinify API and keeps the
   result when it is smaller. The key is TINIFY_API_KEY, from the environment
   or from .env (gitignored); it is never printed. The run ends with a table of
   the bytes before and after. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'screenshots/new');

// Rows kept from a full-frame 1206x2622 phone capture: 186 off the top (the
// status bar, 62pt at 3x), 39 off the bottom (from the home indicator's top
// edge). 1206x2397 -> the 386x767 box.
export const PHONE_FRAME = { width: 1206, height: 2622 };
export const PHONE_CROP = { top: 186, bottom: 39 };

// 09 (the ambience mixer) is cropped at the source to this frame; any other
// size is an error, so a re-take at the wrong size never ships stretched.
export const MIXER_FRAME = { width: 1206, height: 1290 };
const PHONE_WIDTHS = [[386, ''], [772, '-772']];
// The site name, the 2.1 screen number and the themes it ships in.
const PHONES = [
  ['mobile-ai-inbox', '01'],
  ['mobile-ai', '02'],
  ['mobile-ai-done', '05'],
  ['mobile-list-birthday', '07'],
  ['mobile-focus-rain', '08'],
  ['mobile-ambience-mixer', '09'],
  ['mobile-ai-new-task', '11'],
  ['mobile-ai-proposal', '12'],
  ['mobile-ai-running', '13'],
];
const CITY = { name: 'mobile-city-26', widths: [[386, ''], [576, '-576'], [772, '-772']], quality: 80 };
const DESKTOPS = [['desktop-ai', '01', 'ai-tasks']];
const DESKTOP_WIDTHS = [700, 1000, 1400, 2000];

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i < 0 ? null : args[i + 1]; };
const onlyLang = opt('lang');
const onlyScreen = opt('screen');
const tinify = args.includes('--tinify');

for (const name of ['lang', 'screen']) {
  if (args.includes(`--${name}`) && (!opt(name) || opt(name).startsWith('--'))) throw new Error(`--${name} needs a value`);
}
const withStrings = fs.readdirSync(path.join(ROOT, 'src/strings'))
  .filter((f) => /^[a-z]{2}\.json$/.test(f)).map((f) => f.slice(0, 2));
if (onlyLang && !withStrings.includes(onlyLang)) throw new Error(`--lang ${onlyLang}: src/strings/${onlyLang}.json does not exist, so the site has no ${onlyLang} pages to write captures for`);
const langs = withStrings
  .filter((l) => !onlyLang || l === onlyLang)
  .sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : a.localeCompare(b)));
const outDir = (lang) => path.join(ROOT, 'screenshots', lang === 'en' ? '' : lang);
const rel = (f) => path.relative(ROOT, f);

const written = [];

async function phone(src, out, { crop, widths, quality }) {
  const meta = await sharp(src).metadata();
  let base = sharp(src);
  if (crop) {
    if (meta.width !== PHONE_FRAME.width || meta.height !== PHONE_FRAME.height) {
      throw new Error(`${rel(src)} is ${meta.width}x${meta.height}, not the full frame ${PHONE_FRAME.width}x${PHONE_FRAME.height}`);
    }
    base = base.extract({ left: 0, top: PHONE_CROP.top, width: meta.width, height: meta.height - PHONE_CROP.top - PHONE_CROP.bottom });
  }
  const buf = await base.png().toBuffer();
  for (const [w, suffix] of widths) {
    const file = `${out}${suffix}.webp`;
    const info = await sharp(buf).resize({ width: w, kernel: 'lanczos3' })
      .webp({ quality, effort: 6, smartSubsample: true }).toFile(file);
    written.push({ file, width: info.width, height: info.height, bytes: info.size });
  }
}

async function desktop(src, out) {
  for (const w of DESKTOP_WIDTHS) {
    const file = `${out}-${w}.webp`;
    const info = await sharp(src).ensureAlpha().resize({ width: w, kernel: 'lanczos3' })
      .webp({ quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true }).toFile(file);
    written.push({ file, width: info.width, height: info.height, bytes: info.size });
  }
}

const exists = (f) => { if (!fs.existsSync(f)) throw new Error(`missing source ${rel(f)}`); return f; };

for (const lang of langs) {
  fs.mkdirSync(outDir(lang), { recursive: true });
  for (const [name, nn] of PHONES) {
    if (onlyScreen && onlyScreen !== nn) continue;
    for (const theme of ['light', 'dark']) {
      const src = exists(path.join(SRC, 'mobile', theme, `${lang}-${nn}.png`));
      const meta = await sharp(src).metadata();
      const full = meta.width === PHONE_FRAME.width && meta.height === PHONE_FRAME.height;
      const mixer = nn === '09' && meta.width === MIXER_FRAME.width && meta.height === MIXER_FRAME.height;
      if (!full && !mixer) {
        throw new Error(`${rel(src)} is ${meta.width}x${meta.height}: a phone source is ${PHONE_FRAME.width}x${PHONE_FRAME.height}${nn === '09' ? ` or, cropped at the source, ${MIXER_FRAME.width}x${MIXER_FRAME.height}` : ''}`);
      }
      await phone(src, path.join(outDir(lang), `${name}${theme === 'dark' ? '-dark' : ''}`),
        { crop: full, widths: PHONE_WIDTHS, quality: 88 });
    }
  }
  for (const [name, nn, label] of DESKTOPS) {
    if (onlyScreen && onlyScreen !== `desktop-${nn}`) continue;
    for (const theme of ['light', 'dark']) {
      const src = exists(path.join(SRC, 'desktop', lang, theme, `desktop-${nn}-${label}.png`));
      await desktop(src, path.join(outDir(lang), `${name}${theme === 'dark' ? '-dark' : ''}`));
    }
  }
}
// The city has no text: one capture, light only on the page, for every language.
if (!onlyScreen || onlyScreen === 'city') {
  if (!onlyLang || onlyLang === 'en') {
    await phone(exists(path.join(SRC, 'mobile/light/city.png')), path.join(outDir('en'), CITY.name),
      { crop: true, widths: CITY.widths, quality: CITY.quality });
  }
}

function tinifyKey() {
  if (process.env.TINIFY_API_KEY) return process.env.TINIFY_API_KEY;
  const env = path.join(ROOT, '.env');
  if (!fs.existsSync(env)) return null;
  const m = fs.readFileSync(env, 'utf8').match(/^\s*TINIFY_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m);
  return m ? m[1].trim() : null;
}

async function shrink(file, auth) {
  const res = await fetch('https://api.tinify.com/shrink', {
    method: 'POST', headers: { Authorization: auth }, body: fs.readFileSync(file),
  });
  if (!res.ok) throw new Error(`Tinify ${res.status} on ${rel(file)}: ${(await res.text()).slice(0, 200)}`);
  const body = await res.json();
  const out = await fetch(body.output.url, { headers: { Authorization: auth } });
  if (!out.ok) throw new Error(`Tinify download ${out.status} on ${rel(file)}`);
  return { buf: Buffer.from(await out.arrayBuffer()), count: res.headers.get('compression-count') };
}

/* Each file on its own: a failure (the monthly limit, a network error, an
   answer of the wrong size) keeps that file's sharp output, the run goes on,
   and the table still says what was compressed. The exit code is 1 if any
   file failed. */
let count = null;
let failures = 0;
if (tinify) {
  const key = tinifyKey();
  if (!key) { console.error('TINIFY_API_KEY is not set (environment or .env): nothing compressed.'); process.exit(2); }
  const auth = 'Basic ' + Buffer.from(`api:${key}`).toString('base64');
  for (const w of written) {
    try {
      const { buf, count: c } = await shrink(w.file, auth);
      count = c;
      const m = await sharp(buf).metadata();
      if (m.format !== 'webp' || m.width !== w.width || m.height !== w.height) {
        throw new Error(`Tinify returned ${m.format} ${m.width}x${m.height} for ${rel(w.file)}`);
      }
      w.after = buf.length < w.bytes ? buf.length : w.bytes;
      w.kept = buf.length < w.bytes ? 'tinify' : 'sharp';
      if (w.kept === 'tinify') fs.writeFileSync(w.file, buf);
    } catch (e) {
      failures++;
      w.after = w.bytes;
      w.kept = 'failed';
      console.error(`  ✗ ${e.message}`);
    }
  }
}

const pad = (s, n) => String(s).padEnd(n);
let before = 0, after = 0;
console.log(pad('file', 48), pad('box', 11), pad('sharp', 9), tinify ? 'tinify' : '');
for (const w of written) {
  before += w.bytes; after += w.after ?? w.bytes;
  console.log(pad(rel(w.file), 48), pad(`${w.width}x${w.height}`, 11), pad(w.bytes, 9), tinify ? `${w.after}${w.kept === 'sharp' ? ' (sharp kept)' : w.kept === 'failed' ? ' (not compressed)' : ''}` : '');
}
console.log(`${written.length} files, ${before} bytes${tinify ? ` -> ${after} bytes (${((1 - after / before) * 100).toFixed(1)}% smaller)` : ''}`);
if (count) console.log(`Tinify compressions this month: ${count}`);
if (failures) { console.error(`${failures} file(s) not compressed: run with --tinify again for them.`); process.exit(1); }
