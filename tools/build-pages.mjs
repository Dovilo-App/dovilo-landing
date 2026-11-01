/* Builds the five localised pages: /, /ai, /pricing/, /downloads/ and /faq.

   Sources (src/):
     pages/<id>.html     the page's markup, figures and JSON-LD skeleton
     strings/<lang>.json every string a person or a crawler reads, per page,
                         plus the shared ones (nav, footer, badges, offers)
     partials/*.html     nav, footer and site script, also read by the blog
                         template (tools/template.mjs)

   English is written to the paths the site has always had (index.html,
   ai/index.html, …). Every other language with a strings file is written
   under its prefix (tr/index.html, tr/ai/index.html, …). The FAQPage JSON-LD
   and the HTML read the same key, so the two cannot drift.

   The build also keeps sitemap.xml in step: each page's <lastmod> is the
   `updated` of its strings, and a page in more than one language gets its
   localised <url> entries and xhtml:link alternates. Pages with one language
   (all of them today) change nothing there but the date.

   Never edit the generated pages in place: the next build overwrites them.

   Usage: npm run build:pages [-- --check] [-- --out <dir>]
     --check  writes nothing, exits 1 if any output would change
     --out    writes the pages and the sitemap under <dir> instead (tests) */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { readdirSync } from 'node:fs';
import {
  ROOT, SRC, PAGES, LANGUAGES, render, plain, loadStrings, stringsLanguages,
  pagePath, pageOut, cardName, shellData, KNOWN_ENTITIES,
} from './pages-lib.mjs';

const ORIGIN = 'https://dovilo.app';
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const OUT = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : ROOT;

const langs = stringsLanguages();
if (!langs.some((l) => l.code === 'en')) throw new Error('src/strings/en.json is missing');
const strings = Object.fromEntries(langs.map((l) => [l.code, loadStrings(l.code)]));

/* ─── Checks on the strings ─── */

const problems = [];

/* The markup inside a string (tags, attributes, the {{href}} it links) has to
   survive translation, or a link, an id the page script needs or a <code>
   goes missing. Text may change; the skeleton may not. */
const skeleton = (s) => (String(s).match(/<[^>]+>|\{\{[^}]+\}\}/g) || []).join('');
function compare(en, other, where, code) {
  if (typeof en === 'string' || Array.isArray(en)) {
    if (other === undefined) return problems.push(`${code}: missing ${where}`);
    const a = Array.isArray(en) ? en : [en], b = Array.isArray(other) ? other : [other];
    if (a.length !== b.length) return problems.push(`${code}: ${where} has ${b.length} items, English ${a.length}`);
    a.forEach((x, i) => { if (skeleton(x) !== skeleton(b[i])) problems.push(`${code}: ${where} changes the markup of the English string`); });
    return;
  }
  for (const k of Object.keys(en)) compare(en[k], other?.[k], where ? `${where}.${k}` : k, code);
}
for (const l of langs) if (l.code !== 'en') compare({ common: strings.en.common, pages: strings.en.pages }, strings[l.code], '', l.code);

/* Nothing a person reads carries an em dash (CLAUDE.md §1.1). Outside its
   tags a string carries no straight double quote, which would end the
   attribute it lands in (alt, content), and no named entity the build cannot
   read back for JSON-LD: write the character itself, or a typographic quote. */
(function walk(o, where) {
  for (const [k, v] of Object.entries(o)) {
    const w = where ? `${where}.${k}` : k;
    if (typeof v === 'string') {
      const text = v.replace(/<[^>]*>|{{[^}]*}}/g, '');
      if (/—|&mdash;/.test(v)) problems.push(`em dash in ${w}`);
      if (text.includes('"')) problems.push(`straight double quote in ${w}: write &quot; or “ ”`);
      for (const [, e] of text.matchAll(/&([a-z][a-z0-9]*);/gi)) if (!KNOWN_ENTITIES.has(e.toLowerCase())) problems.push(`entity &${e}; in ${w}: write the character itself`);
    } else if (v && typeof v === 'object') walk(v, w);
  }
})(strings, '');

if (problems.length) {
  console.error(problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exit(1);
}

/* A meta description runs to 150 characters at most (CLAUDE.md §2). A
   translation is never rewritten here, so a long one is reported by its key
   and the build goes on; the fix goes to the strings file's source. */
for (const l of langs) {
  for (const [id, page] of Object.entries(strings[l.code].pages)) {
    const d = plain(page.meta?.description ?? '');
    if (d.length > 150) console.warn(`  ! ${l.code}: pages.${id}.meta.description is ${d.length} characters (150 at most)`);
  }
}

/* ─── Pages ─── */

/* A language ships all five pages or none: compare() requires every English
   key, so every page has the same set, and the nav never links a page that
   was not built. */
const languagesOf = () => langs;
const abs = (p) => ORIGIN + p;

function pageData(page, lang) {
  const s = strings[lang.code];
  const set = languagesOf(page);
  const many = set.length > 1;
  const en = LANGUAGES[0];

  /* hreflang: every language the page has, plus x-default on English. The
     homepage has declared en and x-default since before the build, so it keeps
     them with one language; the others gain theirs with the second language. */
  let hreflang = '';
  if (many || page.id === 'home') {
    hreflang = [...set.map((l) => [l.code, abs(pagePath(page, l))]), ['x-default', abs(pagePath(page, en))]]
      .map(([h, u]) => `\n  <link rel="alternate" hreflang="${h}" href="${u}">`).join('');
  }
  const ogLocaleAlternates = many
    ? set.filter((l) => l !== lang).map((l) => `\n  <meta property="og:locale:alternate" content="${strings[l.code].lang.ogLocale}">`).join('')
    : '';
  /* The language menu and the footer links: the current language first and
     marked, only when there is somewhere else to go. */
  const alternates = many
    ? [lang, ...set.filter((l) => l !== lang)].map((l) => ({
        code: l.code, name: l.name, href: pagePath(page, l),
        current: l === lang ? ' aria-current="page"' : '',
      }))
    : [];

  return {
    ...shellData({ strings: s, lang, current: page.id === 'home' ? null : page.id, alternates }),
    t: s.pages[page.id],
    page: {
      canonical: abs(pagePath(page, lang)),
      homeUrl: abs(pagePath(PAGES[0], lang)),
      ogImage: `${ORIGIN}/${card(page, lang)}`,
      hreflang,
      ogLocaleAlternates,
    },
  };
}

/* og:image declares 1200x630, so the file has to be there: npm run build:og
   writes a new language's cards. */
function card(page, lang) {
  const file = `${cardName(page, lang)}.jpg`;
  if (!existsSync(path.join(ROOT, file))) throw new Error(`${lang.code}/${page.id}: ${file} does not exist; run npm run build:og first`);
  return file;
}

/* A language whose strings file is gone must not leave its pages behind. */
for (const l of LANGUAGES.slice(1)) {
  if (langs.includes(l)) continue;
  const dir = path.join(OUT, l.code);
  if (existsSync(path.join(dir, 'index.html')) || (existsSync(dir) && readdirSync(dir).length)) {
    throw new Error(`${l.code}/ is on disk but src/strings/${l.code}.json is not: remove ${l.code}/ or restore its strings`);
  }
}

const written = [];
const unchanged = [];
function emit(rel, content) {
  const file = path.join(OUT, rel);
  const before = existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  if (before === content) return unchanged.push(rel);
  written.push(rel);
  if (CHECK) return;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

for (const page of PAGES) {
  const tpl = readFileSync(path.join(SRC, 'pages', `${page.id}.html`), 'utf8');
  for (const lang of languagesOf(page)) {
    let html;
    try {
      html = render(tpl, pageData(page, lang));
    } catch (e) {
      throw new Error(`${lang.code}/${page.id}: ${e.message}`);
    }
    if (/—/.test(plain(html.replace(/<script[\s\S]*?<\/script>/g, '')))) throw new Error(`${lang.code}/${page.id}: em dash in the page`);
    emit(pageOut(page, lang), html);
  }
}

/* ─── sitemap.xml ─── */

const sitemapIn = path.join(ROOT, 'sitemap.xml');
let sitemap = readFileSync(sitemapIn, 'utf8').replace(/\r\n/g, '\n');
const anyMany = PAGES.some((p) => languagesOf(p).length > 1);
if (anyMany && !sitemap.includes('xmlns:xhtml=')) {
  sitemap = sitemap.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"');
}
/* Entries of languages without strings go, with every alternate; the loop
   below writes the alternates back for the languages that remain. */
for (const l of LANGUAGES.slice(1)) {
  if (langs.includes(l)) continue;
  const prefix = `${ORIGIN}/${l.code}/`.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  sitemap = sitemap.replace(new RegExp(`  <url>\\n    <loc>${prefix}[^<]*</loc>\\n[\\s\\S]*?  </url>\\n`, 'g'), '');
}
if (langs.length === 1) sitemap = sitemap.replace(/    <xhtml:link [^\n]*\n/g, '').replace('\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"', '');
const entryRe = (url) => new RegExp(`  <url>\\n    <loc>${url.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}</loc>\\n[\\s\\S]*?  </url>\\n`);
for (const page of PAGES) {
  const set = languagesOf(page);
  const links = set.length > 1
    ? [...set.map((l) => [l.code, abs(pagePath(page, l))]), ['x-default', abs(page.path)]]
        .map(([h, u]) => `    <xhtml:link rel="alternate" hreflang="${h}" href="${u}"/>\n`).join('')
    : '';
  const enEntry = entryRe(abs(page.path)).exec(sitemap);
  if (!enEntry) throw new Error(`sitemap.xml has no entry for ${abs(page.path)}`);
  let after = enEntry.index + enEntry[0].length;
  for (const lang of set) {
    const url = abs(pagePath(page, lang));
    const updated = strings[lang.code].pages[page.id].updated;
    if (!/^\d{4}-\d\d-\d\d$/.test(updated || '')) throw new Error(`${lang.code}/${page.id}: "updated" is not a date`);
    let m = entryRe(url).exec(sitemap);
    if (!m) {
      /* A new language copy: the English entry's frequency, the page's
         localised priority. */
      const freq = /<changefreq>(\w+)<\/changefreq>/.exec(enEntry[0])[1];
      const prio = page.langPriority;
      if (!/^[01]\.\d$/.test(prio || '')) throw new Error(`${page.id}: PAGES entry has no langPriority for its language copies`);
      const block = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${updated}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>\n`;
      sitemap = sitemap.slice(0, after) + block + sitemap.slice(after);
      m = entryRe(url).exec(sitemap);
    }
    let entry = m[0]
      .replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${updated}</lastmod>`)
      .replace(/    <xhtml:link [^\n]*\n/g, '');
    if (links) entry = entry.replace(/(    <priority>[^\n]*\n)/, `$1${links}`);
    sitemap = sitemap.slice(0, m.index) + entry + sitemap.slice(m.index + m[0].length);
    after = m.index + entry.length;
  }
}
emit('sitemap.xml', sitemap);

/* ─── Report ─── */

const count = (o) => Object.values(o).reduce((n, v) => n + (v && typeof v === 'object' && !Array.isArray(v) ? count(v) : 1), 0);
for (const l of langs) {
  const s = strings[l.code];
  console.log(`${l.code}: ${Object.keys(s.pages).map((id) => `${id} ${count(s.pages[id])}`).join(', ')}, common ${count(s.common)} keys`);
}
if (CHECK) {
  if (written.length) {
    console.error(`Out of date: ${written.join(', ')}. Run npm run build:pages.`);
    process.exit(1);
  }
  console.log(`Up to date: ${unchanged.length} file(s).`);
} else {
  console.log(written.length ? `Wrote ${written.join(', ')}.` : 'Nothing changed.');
  if (unchanged.length) console.log(`Unchanged: ${unchanged.join(', ')}.`);
}
