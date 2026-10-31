/* The renderer shared by tools/build-pages.mjs (the five localised pages) and
   tools/template.mjs (the blog shell). One copy of the nav, the footer and the
   site script lives in src/partials/; both builds read it from there.

   Template syntax, kept small on purpose:

     {{a.b.c}}            the string at that path, inserted as HTML
     {{a.b|json}}         the same string as plain text, escaped for a JSON
                          string (tags stripped, entities decoded): JSON-LD
     {{a.b|js}}           plain text as a quoted JavaScript literal; an array
                          becomes ['x', 'y']
     {{> name}}           src/partials/name.html, rendered with the same data
     {{#if a.b}}…{{/if}}  kept when the value is non-empty (a non-empty array)
     {{#each a.b}}…{{/each}}
                          once per item; {{this.x}} reads the item
     {{! … }}             a note for the tools, dropped with its line break
                          (the first line of each page names its share card
                          for tools/build-og.mjs)

   A missing path is an error, never an empty string: a strings file that lacks
   a key fails the build instead of shipping a hole. Strings are HTML as it
   appears in the page (`&amp;`, inline <a>, <code>, <strong>) and may carry
   {{href.*}} themselves, which the second pass resolves. */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = path.join(ROOT, 'src');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rarr: '→', larr: '←', copy: '©', mdash: '—', ndash: '–', hellip: '…' };

/* Visible text of an HTML fragment: what a reader sees, and what JSON-LD says. */
export function plain(html) {
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENTITIES[e.toLowerCase()] ?? m;
    });
}

export const jsonText = (html) => JSON.stringify(plain(html)).slice(1, -1);

/* Single quotes, as the page scripts write them, unless the text has one. */
export function jsLiteral(text) {
  const t = String(text);
  if (t.includes("'") && !t.includes('"')) return `"${t.replace(/\\/g, '\\\\')}"`;
  return `'${t.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

export function lookup(data, key) {
  let v = data;
  for (const part of key.split('.')) {
    if (v == null || typeof v !== 'object' || !(part in v)) throw new Error(`missing string "${key}"`);
    v = v[part];
  }
  return v;
}

const partialCache = new Map();
export function partial(name) {
  if (!partialCache.has(name)) {
    const file = path.join(SRC, 'partials', `${name}.html`);
    partialCache.set(name, readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, ''));
  }
  return partialCache.get(name);
}

function vars(tpl, data) {
  return tpl.replace(/\{\{\s*([\w.-]+)(?:\|(\w+))?\s*\}\}/g, (_, key, filter) => {
    const v = lookup(data, key);
    if (filter === 'json') return jsonText(v);
    if (filter === 'js') return Array.isArray(v) ? `[${v.map((x) => jsLiteral(plain(x))).join(', ')}]` : jsLiteral(plain(v));
    if (filter === 'text') return plain(v);
    if (filter) throw new Error(`unknown filter "${filter}" on "${key}"`);
    if (typeof v !== 'string' && typeof v !== 'number') throw new Error(`"${key}" is not a string`);
    return String(v);
  });
}

function blocks(tpl, data) {
  let out = tpl.replace(/\{\{#each ([\w.-]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, body) => {
    const list = lookup(data, key);
    if (!Array.isArray(list)) throw new Error(`"${key}" is not a list`);
    return list.map((item) => vars(body, { ...data, this: item })).join('');
  });
  out = out.replace(/\{\{#if ([\w.-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => {
    const v = lookup(data, key);
    return (Array.isArray(v) ? v.length : v) ? body : '';
  });
  return out;
}

export function render(tpl, data) {
  /* {{! … }} is a note for the tools (the share card a page uses), never output. */
  let out = tpl.replace(/\r\n/g, '\n').replace(/\{\{![\s\S]*?\}\}\n?/g, '');
  for (let i = 0; i < 5 && /\{\{>/.test(out); i++) out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partial(n));
  out = blocks(out, data);
  /* Strings may carry {{href.*}}: a second pass resolves what the first inserted. */
  for (let i = 0; i < 3 && /\{\{/.test(out); i++) out = vars(out, data);
  if (/\{\{/.test(out)) throw new Error('unresolved {{ after rendering');
  return out;
}

/* ─── Languages and the five pages ─── */

/* Every language the site will ship, in the menu's order. A language is built
   only when src/strings/<code>.json exists; English is at the root. */
export const LANGUAGES = [
  { code: 'en', name: 'English', prefix: '' },
  { code: 'tr', name: 'Türkçe', prefix: '/tr' },
  { code: 'es', name: 'Español', prefix: '/es' },
  { code: 'fr', name: 'Français', prefix: '/fr' },
  { code: 'de', name: 'Deutsch', prefix: '/de' },
];

/* `path` is the English URL as it is linked today. Four keep the forms the
   site has always used (CLAUDE.md §4: /ai and /faq stay slash-less); the
   localised copies are directories under the language prefix. */
export const PAGES = [
  { id: 'home', path: '/', out: 'index.html', card: 'og-home' },
  { id: 'ai', path: '/ai', out: 'ai/index.html', card: 'og-ai' },
  { id: 'pricing', path: '/pricing/', out: 'pricing/index.html', card: 'og-pricing' },
  { id: 'downloads', path: '/downloads/', out: 'downloads/index.html', card: 'og-downloads' },
  /* The FAQ has shared og-card.jpg since before the build; its English head
     keeps it. Its localised copies get a card of their own. */
  { id: 'faq', path: '/faq', out: 'faq/index.html', card: 'og-faq', enCard: 'og-card' },
];

export function pagePath(page, lang) {
  if (lang.code === 'en') return page.path;
  return page.id === 'home' ? `${lang.prefix}/` : `${lang.prefix}/${page.id}/`;
}

export function pageOut(page, lang) {
  if (lang.code === 'en') return page.out;
  return page.id === 'home' ? `${lang.code}/index.html` : `${lang.code}/${page.id}/index.html`;
}

export function cardName(page, lang) {
  if (lang.code === 'en') return page.enCard || page.card;
  return `${page.card}-${lang.code}`;
}

/* Hrefs of the five pages in one language: templates and strings link through
   these, so a Turkish page links Turkish pages. */
export function hrefs(lang) {
  return Object.fromEntries(PAGES.map((p) => [p.id, pagePath(p, lang)]));
}

export function stringsLanguages() {
  const dir = path.join(SRC, 'strings');
  const have = new Set(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : []);
  return LANGUAGES.filter((l) => have.has(l.code));
}

export function loadStrings(code) {
  return JSON.parse(readFileSync(path.join(SRC, 'strings', `${code}.json`), 'utf8'));
}

/* What the nav, footer and site script read: the common strings, the current
   page marks, the hrefs and the language menu. `current` names the nav entry
   to mark (`ai`, `pricing`, `downloads`, `faq`, `blog`) or nothing. */
export function shellData({ strings, lang, current = null, alternates = [] }) {
  const mark = (id) => (id === current ? ' aria-current="page"' : '');
  return {
    c: strings.common,
    lang: { ...strings.lang, code: lang.code },
    href: hrefs(lang),
    current: Object.fromEntries(['ai', 'pricing', 'downloads', 'faq', 'blog'].map((id) => [id, mark(id)])),
    alternates,
  };
}
