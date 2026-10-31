/* WOFF2 to TrueType, for tools/build-og.mjs.

   The share cards are set in the Inter the site serves from /fonts/, and
   sharp's text renderer (Pango, FreeType) does not read WOFF2. Node has
   Brotli built in, so this decodes the files here instead of keeping a second
   copy of the font: the decompressed tables, with the glyf and loca tables
   rebuilt from their WOFF2 transform (W3C WOFF2 §5.1). hmtx with a transform
   and font collections are not supported; Inter uses neither. */

import { brotliDecompressSync } from 'node:zlib';

export function woff2ToTtf(buf) {
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error('not a WOFF2 file');
  const flavor = buf.readUInt32BE(4);
  if (flavor === 0x74746366) throw new Error('WOFF2 collections are not supported');
  const numTables = buf.readUInt16BE(12);

  let p = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const c = buf[p++];
      v = v * 128 + (c & 0x7f);
      if (!(c & 0x80)) return v;
    }
    throw new Error('bad UIntBase128');
  };
  const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];
  const dir = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[p++];
    let tag;
    if ((flags & 63) === 63) { tag = buf.toString('latin1', p, p + 4); p += 4; } else tag = KNOWN[flags & 63];
    const version = flags >> 6;
    const origLength = base128();
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    if (transformed && tag === 'hmtx') throw new Error('transformed hmtx is not supported');
    const length = transformed ? base128() : origLength;
    dir.push({ tag, origLength, length, transformed });
  }
  const stream = brotliDecompressSync(buf.subarray(p, p + buf.readUInt32BE(20)));
  let off = 0;
  const tables = new Map();
  for (const t of dir) { tables.set(t.tag, stream.subarray(off, off + t.length)); off += t.length; }

  const glyfEntry = dir.find((t) => t.tag === 'glyf');
  if (glyfEntry?.transformed) {
    const { glyf, loca, long } = rebuildGlyf(tables.get('glyf'));
    tables.set('glyf', glyf);
    tables.set('loca', loca);
    const head = Buffer.from(tables.get('head'));
    head.writeInt16BE(long ? 1 : 0, 50);
    tables.set('head', head);
  }
  return sfnt(flavor, tables);
}

function rebuildGlyf(data) {
  const numGlyphs = data.readUInt16BE(4);
  const indexFormat = data.readUInt16BE(6);
  const sizes = [];
  for (let i = 0; i < 7; i++) sizes.push(data.readUInt32BE(8 + i * 4));
  let o = 36;
  const streams = sizes.map((n) => { const s = { b: data.subarray(o, o + n), p: 0 }; o += n; return s; });
  const [nContour, nPoints, flagS, glyphS, compS, bboxS, instrS] = streams;
  const bitmapLen = 4 * Math.floor((numGlyphs + 31) / 32);
  const bboxBitmap = bboxS.b.subarray(0, bitmapLen);
  bboxS.p = bitmapLen;

  const u8 = (s) => s.b[s.p++];
  const u16 = (s) => { const v = s.b.readUInt16BE(s.p); s.p += 2; return v; };
  const i16 = (s) => { const v = s.b.readInt16BE(s.p); s.p += 2; return v; };
  const u255 = (s) => {
    const c = u8(s);
    if (c === 253) return u16(s);
    if (c === 255) return u8(s) + 253;
    if (c === 254) return u8(s) + 506;
    return c;
  };
  const sign = (f, v) => (f & 1 ? v : -v);

  const glyphs = [];
  for (let g = 0; g < numGlyphs; g++) {
    const nc = i16(nContour);
    const hasBox = bboxBitmap[g >> 3] & (0x80 >> (g & 7));
    if (nc === 0) { glyphs.push(Buffer.alloc(0)); continue; }
    if (nc > 0) {
      const ends = [];
      let total = 0;
      for (let c = 0; c < nc; c++) { total += u255(nPoints); ends.push(total - 1); }
      const pts = [];
      let x = 0, y = 0;
      for (let i = 0; i < total; i++) {
        const raw = u8(flagS);
        const on = !(raw >> 7);
        const f = raw & 0x7f;
        let dx, dy;
        const b = (n) => glyphS.b[glyphS.p + n];
        if (f < 10) { dx = 0; dy = sign(f, ((f & 14) << 7) + b(0)); glyphS.p += 1; }
        else if (f < 20) { dx = sign(f, (((f - 10) & 14) << 7) + b(0)); dy = 0; glyphS.p += 1; }
        else if (f < 84) { const b0 = f - 20, b1 = b(0); dx = sign(f, 1 + (b0 & 0x30) + (b1 >> 4)); dy = sign(f >> 1, 1 + ((b0 & 0x0c) << 2) + (b1 & 0x0f)); glyphS.p += 1; }
        else if (f < 120) { const b0 = f - 84; dx = sign(f, 1 + (Math.floor(b0 / 12) << 8) + b(0)); dy = sign(f >> 1, 1 + (((b0 % 12) >> 2) << 8) + b(1)); glyphS.p += 2; }
        else if (f < 124) { const b2 = b(1); dx = sign(f, (b(0) << 4) + (b2 >> 4)); dy = sign(f >> 1, ((b2 & 0x0f) << 8) + b(2)); glyphS.p += 3; }
        else { dx = sign(f, (b(0) << 8) + b(1)); dy = sign(f >> 1, (b(2) << 8) + b(3)); glyphS.p += 4; }
        x += dx; y += dy;
        pts.push({ x, y, dx, dy, on });
      }
      const instrLen = u255(glyphS);
      const instr = instrS.b.subarray(instrS.p, instrS.p + instrLen); instrS.p += instrLen;
      let box;
      if (hasBox) box = [i16(bboxS), i16(bboxS), i16(bboxS), i16(bboxS)];
      else {
        const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
        box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      }
      /* Every point written with an on-curve bit and two 16-bit deltas: no
         short forms, no repeats. Larger than the original, equally valid. */
      const out = Buffer.alloc(10 + nc * 2 + 2 + instrLen + total * 5);
      let q = 0;
      q = out.writeInt16BE(nc, q);
      for (const v of box) q = out.writeInt16BE(v, q);
      for (const e of ends) q = out.writeUInt16BE(e, q);
      q = out.writeUInt16BE(instrLen, q);
      instr.copy(out, q); q += instrLen;
      for (const pt of pts) out[q++] = pt.on ? 1 : 0;
      for (const pt of pts) q = out.writeInt16BE(pt.dx, q);
      for (const pt of pts) q = out.writeInt16BE(pt.dy, q);
      glyphs.push(out);
      continue;
    }
    /* Composite: the component records verbatim, then any instructions. */
    if (!hasBox) throw new Error(`composite glyph ${g} without a bbox`);
    const box = [i16(bboxS), i16(bboxS), i16(bboxS), i16(bboxS)];
    const start = compS.p;
    let more = true, instructions = false;
    while (more) {
      const flags = u16(compS);
      compS.p += 2;
      compS.p += flags & 0x0001 ? 4 : 2;
      if (flags & 0x0008) compS.p += 2;
      else if (flags & 0x0040) compS.p += 4;
      else if (flags & 0x0080) compS.p += 8;
      if (flags & 0x0100) instructions = true;
      more = !!(flags & 0x0020);
    }
    const comp = compS.b.subarray(start, compS.p);
    let tail = Buffer.alloc(0);
    if (instructions) {
      const n = u255(glyphS);
      tail = Buffer.concat([Buffer.from([n >> 8, n & 0xff]), instrS.b.subarray(instrS.p, instrS.p + n)]);
      instrS.p += n;
    }
    const head = Buffer.alloc(10);
    head.writeInt16BE(-1, 0);
    box.forEach((v, i) => head.writeInt16BE(v, 2 + i * 2));
    glyphs.push(Buffer.concat([head, comp, tail]));
  }

  const parts = [];
  const offsets = [0];
  let total = 0;
  for (const gl of glyphs) {
    const pad = (4 - (gl.length % 4)) % 4;
    parts.push(gl, Buffer.alloc(pad));
    total += gl.length + pad;
    offsets.push(total);
  }
  /* The rebuilt glyf is larger than the original; short offsets stop at
     128 KB, so past that the loca goes long and head says so. */
  const long = indexFormat === 1 || total / 2 > 0xffff;
  const loca = Buffer.alloc(offsets.length * (long ? 4 : 2));
  offsets.forEach((v, i) => (long ? loca.writeUInt32BE(v, i * 4) : loca.writeUInt16BE(v / 2, i * 2)));
  return { glyf: Buffer.concat(parts), loca, long };
}

function sfnt(flavor, tables) {
  const tags = [...tables.keys()].sort();
  const n = tags.length;
  const header = Buffer.alloc(12 + 16 * n);
  const pow = 2 ** Math.floor(Math.log2(n));
  header.writeUInt32BE(flavor, 0);
  header.writeUInt16BE(n, 4);
  header.writeUInt16BE(pow * 16, 6);
  header.writeUInt16BE(Math.log2(pow), 8);
  header.writeUInt16BE(n * 16 - pow * 16, 10);
  const body = [];
  let offset = header.length;
  tags.forEach((tag, i) => {
    const data = tables.get(tag);
    const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)]);
    let sum = 0;
    for (let k = 0; k < padded.length; k += 4) sum = (sum + padded.readUInt32BE(k)) >>> 0;
    header.write(tag, 12 + i * 16, 'latin1');
    header.writeUInt32BE(sum, 16 + i * 16);
    header.writeUInt32BE(offset, 20 + i * 16);
    header.writeUInt32BE(data.length, 24 + i * 16);
    body.push(padded);
    offset += padded.length;
  });
  return Buffer.concat([header, ...body]);
}
