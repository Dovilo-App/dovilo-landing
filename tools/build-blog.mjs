#!/usr/bin/env node
/* Builds /blog from Sanity, as plain static HTML.
 *
 * Nothing about the blog is fetched in the browser: posts are pulled here, at
 * publish time, rendered to files, and committed. A crawler — search engine or
 * model — sees the whole post in the first response, with its own meta tags and
 * JSON-LD, exactly like the hand-written pages.
 *
 * Post bodies are Markdown (the `markdownBody` field), which is what the
 * authoring pipeline writes. Headings get GitHub-style ids, so a table of
 * contents written as anchor links in the Markdown resolves.
 *
 * Writes:
 *   blog/index.html            the post list
 *   <lang>/blog/index.html     the same list in that language's chrome and
 *                              intro, one per language with a strings file
 *   blog/<slug>/index.html     one page per post
 *   blog/feed.xml              RSS 2.0, full text
 *   blog/media/*               post images, pulled off the Sanity CDN
 * Rewrites, between BLOG:START / BLOG:END markers:
 *   sitemap.xml  llms.txt  llms-full.txt
 * (The homepage links the blog in one line and has no markers since its
 * redesign; nothing here writes into index.html.)
 *
 *   node tools/build-blog.mjs
 *   BLOG_FIXTURE=posts.json node tools/build-blog.mjs   # render without Sanity
 */

import { readFile, writeFile, mkdir, readdir, rm, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import { SITE, SANITY, BLOG } from './config.mjs';
import { page, esc } from './template.mjs';
import { LANGUAGES, stringsLanguages, loadStrings, plain, blogPath, menuAlternates } from './pages-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, BLOG.dir);
const MEDIA = path.join(OUT, 'media');
const BLOG_URL = SITE.origin + BLOG.base;

/* The blog index's words, per language: src/strings/<lang>.json, pages.blog.
   English is the root; the posts are English whatever the language. */
const LANGS = stringsLanguages();
const STRINGS = Object.fromEntries(LANGS.map((l) => [l.code, loadStrings(l.code)]));
const EN = LANGUAGES[0];
const INTRO = plain(STRINGS.en.pages.blog.intro);
const abs = (p) => SITE.origin + p;

const exists = (p) => access(p).then(() => true, () => false);
const log = (...a) => console.log(...a);

/* ─────────────────────────── Sanity ─────────────────────────── */

/* Selected by shape, not by document type: anything with a slug, a publish date
   and a Markdown body is a post, whatever the authoring pipeline decided to call
   it. Documents that look like posts but carry no Markdown are reported rather
   than silently dropped — that is what a mis-set export format looks like.
   coalesce() covers both generations of field names (description/excerpt,
   mainImage/coverImage). */
const QUERY = `*[
  !(_id in path("drafts.**"))
  && defined(slug.current)
  && defined(publishedAt)
  && publishedAt <= now()
] | order(publishedAt desc) {
  _id, _type, _updatedAt, title, "slug": slug.current, publishedAt, updatedAt, seoTitle, tags,
  "excerpt": coalesce(excerpt, description),
  "metaDescription": coalesce(metaDescription, description),
  "cover": coalesce(coverImage, mainImage),
  markdownBody,
  "authorName": coalesce(author, "${SITE.author.name}")
}`;

async function fetchPosts() {
  /* Local preview and tests: BLOG_FIXTURE=file.json feeds the same shape the
     query returns, so the renderer can be exercised without touching Sanity. */
  if (process.env.BLOG_FIXTURE) {
    log(`  (fixture: ${process.env.BLOG_FIXTURE})`);
    return JSON.parse(await readFile(path.resolve(process.env.BLOG_FIXTURE), 'utf8'));
  }

  /* api, not apicdn: a webhook-triggered build wants the write that just landed,
     not whatever the edge cached a minute ago. */
  const url =
    `https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}` +
    `/data/query/${SANITY.dataset}?query=${encodeURIComponent(QUERY)}`;

  const headers = { Accept: 'application/json' };
  if (process.env.SANITY_READ_TOKEN) headers.Authorization = `Bearer ${process.env.SANITY_READ_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Sanity refused the query (${res.status}). The dataset is private — either make ` +
          `"${SANITY.dataset}" public in Sanity Manage, or set SANITY_READ_TOKEN.\n${body}`
      );
    }
    throw new Error(`Sanity query failed (${res.status}): ${body}`);
  }
  const { result } = await res.json();
  return Array.isArray(result) ? result : [];
}

/* ─────────────────────────── images ─────────────────────────── */

/* A post's column is the measure, 64ch at body size (Post in
   docs/design-language.md): 686 CSS px, or the screen less its 16px gutters
   below 718px. 760 covers it at 1x, 1520 on retina. */
const WIDTHS = [760, 1520];
const COLUMN_PX = 686;
const COLUMN_SIZES = `(max-width:${COLUMN_PX + 32}px) calc(100vw - 32px), ${COLUMN_PX}px`;
const usedMedia = new Set();
let downloaded = 0;

/** image-<id>-<w>x<h>-<ext>, the reference Sanity stores on a document. */
function assetFromRef(ref) {
  const m = /^image-([a-f0-9]+)-(\d+)x(\d+)-(\w+)$/.exec(ref || '');
  return m ? { id: m[1], width: +m[2], height: +m[3], ext: m[4] } : null;
}

/** The same asset as it appears in a Markdown image URL. */
function assetFromUrl(url) {
  const m = /^https?:\/\/cdn\.sanity\.io\/images\/[^/]+\/[^/]+\/([a-f0-9]+)-(\d+)x(\d+)\.(\w+)/.exec(url || '');
  return m ? { id: m[1], width: +m[2], height: +m[3], ext: m[4] } : null;
}

function cdnUrl(a, params) {
  const qs = new URLSearchParams(params).toString();
  return `https://cdn.sanity.io/images/${SANITY.projectId}/${SANITY.dataset}/${a.id}-${a.width}x${a.height}.${a.ext}?${qs}`;
}

/* Sanity's image pipeline does the resize and the WebP/JPEG encode; we only keep
   the result, so the published page serves it from our own origin. */
async function pull(a, { w, h, fm, q }) {
  const name = `${a.id}-${w}${h ? `x${h}` : ''}.${fm}`;
  usedMedia.add(name);
  const dest = path.join(MEDIA, name);
  if (!(await exists(dest))) {
    const params = { w: String(w), fm, q: String(q) };
    if (h) Object.assign(params, { h: String(h), fit: 'crop' });
    const res = await fetch(cdnUrl(a, params));
    if (!res.ok) throw new Error(`image ${a.id} (${res.status}) — ${cdnUrl(a, params)}`);
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    downloaded++;
  }
  return `${BLOG.base}media/${name}`;
}

/** Local, responsive copies of one Sanity image. `og` adds the 1200×630 share card. */
async function localise(a, { alt = '', caption = '', og = false } = {}) {
  const widths = WIDTHS.filter((w) => w <= a.width);
  if (!widths.length) widths.push(a.width);

  const srcs = [];
  for (const w of widths) srcs.push({ w, url: await pull(a, { w, fm: 'webp', q: 82 }) });

  const displayW = widths[0];
  return {
    src: srcs[0].url,
    srcset: srcs.map((s) => `${s.url} ${s.w}w`).join(', '),
    width: displayW,
    height: Math.round((displayW * a.height) / a.width),
    alt,
    caption,
    /* Social crawlers are unreliable with WebP, so share cards get a JPEG. */
    og: og ? await pull(a, { w: 1200, h: 630, fm: 'jpg', q: 80 }) : null,
  };
}

/* `lcp` is the cover: above the fold, so it is fetched first and never lazy
   (CLAUDE.md, Performance). Every other image waits until it nears the view. */
function imgTag(img, { lcp = false } = {}) {
  const responsive = img.srcset?.includes(',')
    ? ` srcset="${esc(img.srcset)}" sizes="${COLUMN_SIZES}"`
    : '';
  return (
    `<img src="${esc(img.src)}"${responsive} width="${img.width}" height="${img.height}"` +
    ` alt="${esc(img.alt)}"${lcp ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`
  );
}

/** Every Sanity image the Markdown links to, pulled local before rendering. */
async function markdownImages(md) {
  const map = new Map();
  for (const m of String(md || '').matchAll(/!\[[^\]]*\]\(\s*(\S+?)[\s)]/g)) {
    const url = m[1];
    if (map.has(url)) continue;
    const a = assetFromUrl(url);
    if (a) map.set(url, await localise(a));
  }
  return map;
}

/* ─────────────────────────── markdown ─────────────────────────── */

/* GitHub's heading-anchor rules, because that is what a table of contents
   written as [Section](#section) in the Markdown assumes — with one departure:
   runs of hyphens are collapsed. GitHub would turn "1. Dovilo — Best Overall"
   into "1-dovilo--best-overall", keeping the gap the em dash left behind, and
   the tables of contents in practice write a single hyphen there. Collapsing
   here and in resolveAnchors() below makes both spellings land. */
function githubSlug(text, seen) {
  const base = String(text)
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\- ]+/g, '')
    .replace(/ /g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n ? `${base}-${n}` : base;
}

/** Points in-page links at the heading they meant, and reports the ones that
    match nothing at all — a table of contents whose links quietly do nothing is
    worse than no table of contents. */
function resolveAnchors(html, slug) {
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const missing = new Set();

  const out = html.replace(/href="#([^"]+)"/g, (whole, anchor) => {
    if (ids.has(anchor)) return whole;
    const collapsed = anchor.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
    if (ids.has(collapsed)) return `href="#${collapsed}"`;
    missing.add(anchor);
    return whole;
  });

  for (const a of missing) console.warn(`  ! ${slug}: #${a} matches no heading on the page`);
  return out;
}

/* House style: headings use a colon or a comma, never an em dash (CLAUDE.md,
   "Titles and headings"). The body is authored in Sanity, so the build can only
   report this — the fix belongs in the Markdown, or the next publish undoes it. */
function checkHeadingDashes(html, slug) {
  const offenders = [...html.matchAll(/<h[1-4][^>]*>([^<]*[—–][^<]*)<\/h[1-4]>/g)].map((m) => m[1].trim());
  for (const h of offenders) {
    console.warn(`  ! ${slug}: heading uses an em dash — "${h}"`);
  }
  if (offenders.length) {
    console.warn(`      fix these in the Sanity Markdown: a colon reads the same and matches the rest of the site`);
  }
  return html;
}

/* The summary shows as body copy on /blog/, where no em dash belongs either
   (CLAUDE.md §1.1). It is the post's excerpt in Sanity, so again: report it. */
function checkCardDashes(cardText, slug) {
  if (/[—–]/.test(cardText)) {
    console.warn(`  ! ${slug}: the blog index summary (excerpt) uses an em dash; fix it in Sanity`);
  }
}

function renderMarkdown(md, images, slug) {
  const seen = new Map();
  const marked = new Marked({ gfm: true });

  marked.use({
    renderer: {
      heading(token) {
        /* h1 would compete with the post title, which is already an h1. */
        const depth = Math.max(2, Math.min(token.depth, 4));
        const inner = this.parser.parseInline(token.tokens);
        return `<h${depth} id="${githubSlug(inner, seen)}">${inner}</h${depth}>\n`;
      },
      link(token) {
        const href = token.href ?? '';
        const text = this.parser.parseInline(token.tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE.origin);
        return `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
      },
      image(token) {
        const local = images.get(token.href);
        if (local) return imgTag({ ...local, alt: token.text || local.alt });
        /* Anything not in Sanity stays where it is — but it is worth knowing about,
           because the rest of the site serves every byte from its own origin. */
        console.warn(`  ! ${slug}: image left on a third-party origin — ${token.href}`);
        return `<img src="${esc(token.href)}" alt="${esc(token.text || '')}" loading="lazy" decoding="async">`;
      },
    },
  });

  return components(marked.parse(String(md || ''), { async: false }));
}

/* What Markdown makes, mapped onto the design system's components (Post in
   docs/design-language.md): a table into .table-wrap/.table, a code fence into a
   code block without a head, an image alone in its paragraph into a figure.
   Each open tag is matched with its own close, so raw HTML in a post (a
   <table class="…">) is left whole rather than half-wrapped. Code inside a fence
   is escaped, so none of these can match inside one. A figure draws its image at
   the column's full width, so only an image at least that wide is lifted into
   one; a smaller one keeps its own size in its paragraph. */
function components(html) {
  return html
    .replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-wrap"><table class="table">$1</table></div>')
    .replace(/<pre>([\s\S]*?)<\/pre>/g, '<div class="code"><pre>$1</pre></div>')
    .replace(/<p>(<img [^>]*\bwidth="(\d+)"[^>]*>)<\/p>/g, (whole, img, w) =>
      +w >= COLUMN_PX ? `<figure class="figure">${img}</figure>` : whole
    );
}

/* A leading list of nothing but in-page links is a table of contents. On the
   page it goes in a closed collapsible, the docs' table of contents on a phone;
   in the feed it stays an open list, since feed readers handle <details>
   unevenly. */
function liftTableOfContents(html, { collapsible = true } = {}) {
  const start = html.search(/\S/);
  if (start === -1 || !html.startsWith('<ul>', start)) return html;

  /* A table of contents nests, so the first </ul> is rarely the closing one. */
  const tag = /<\/?ul>/g;
  tag.lastIndex = start;
  let depth = 0;
  let end = -1;
  for (let m; (m = tag.exec(html)); ) {
    depth += m[0] === '<ul>' ? 1 : -1;
    if (depth === 0) {
      end = tag.lastIndex;
      break;
    }
  }
  if (end === -1) return html;

  const list = html.slice(start, end);
  const links = [...list.matchAll(/<a href="([^"]+)"/g)].map((x) => x[1]);
  if (!links.length || !links.every((h) => h.startsWith('#'))) return html;

  const toc = collapsible
    ? `<nav aria-label="On this page">\n<details class="collapsible">\n<summary>On this page</summary>\n` +
      `<div class="collapsible-body">\n${list}\n</div>\n</details>\n</nav>`
    : `<nav aria-label="On this page">\n<p>On this page</p>\n${list}\n</nav>`;
  return toc + html.slice(end);
}

/** Markdown stripped back to prose, for word counts and description fallbacks. */
function plainText(md) {
  return String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*\|.*\|\s*$/gm, ' ')
    .replace(/^\s*-{3,}\s*$/gm, ' ')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ───────────────────────── formatting ───────────────────────── */

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtDate = (iso) => DATE.format(new Date(iso));
const isoDay = (iso) => new Date(iso).toISOString().slice(0, 10);
const rfc822 = (iso) => new Date(iso).toUTCString();

/** Cuts on a word boundary rather than mid-word. */
function clip(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.—-]$/, '') + '…';
}

function describe(post, text) {
  const written = post.metaDescription || post.excerpt;
  const d = written ? written.replace(/\s+/g, ' ').trim() : clip(text, 155);
  /* Google shows about 155 characters of a snippet and drops the rest. */
  if (d.length > 160) {
    console.warn(`  ! ${post.slug}: meta description is ${d.length} chars — Google will cut it near 155`);
  }
  return d;
}

/* Generated HTML is committed, so it is worth breaking between blocks: a diff
   then shows the paragraph that changed rather than one enormous line. */
const prettify = (html) =>
  html.replace(/(<\/(?:p|h2|h3|h4|ul|ol|blockquote|pre|figure|table|nav)>)(?=\s*<)/g, '$1\n').replace(/\n{2,}/g, '\n');

/* ───────────────────────── page bodies ───────────────────────── */

/* The meta line (design-language §5): date and reading time, then whatever
   else the caller adds (the author, the tags), separated by middle dots. */
const metaLine = (p, ...more) =>
  `<p class="meta">` +
  [`<time datetime="${p.publishedAt}">${fmtDate(p.publishedAt)}</time>`, `${p.readingTime} min read`, ...more]
    .filter(Boolean)
    .join(' · ') +
  `</p>`;

const tagText = (tags) => (tags?.length ? tags.map(esc).join(', ') : '');

/* One entry of the post list: the title is the link. */
function postEntry(p) {
  return `          <li>
            <h2><a href="${BLOG.base}${p.slug}/">${esc(p.title)}</a></h2>
            ${metaLine(p, tagText(p.tags))}
            <p>${esc(p.cardText)}</p>
          </li>`;
}

/* When a language's index last changed: the later of its own words'
   `updated` and its newest post. The sitemap entry and a language copy's
   dateModified both read it. */
function indexLastmod(posts, lang) {
  const newest = posts.length ? isoDay(posts[0].dateModified) : isoDay(new Date().toISOString());
  const own = STRINGS[lang.code].pages.blog.updated;
  return own > newest ? own : newest;
}

function indexPage(posts, lang) {
  const t = STRINGS[lang.code].pages.blog;
  const isEn = lang.code === 'en';
  const url = abs(blogPath(lang));
  const many = LANGS.length > 1;
  const description = plain(t.intro);
  if (description.length > 150) console.warn(`  ! ${lang.code}: pages.blog.intro is ${description.length} characters (150 at most)`);

  /* The count is the build's, never a literal: it is right after every publish.
     English has a singular form, a language with one form leaves count_one out. */
  const n = posts.length;
  const sentence = n === 1 && t.count_one ? t.count_one : t.count;
  const count = n ? ` ${sentence.replace('{{n}}', n)}` : '';
  /* A language copy lists the English posts: the list says so in its own
     language (the note), and marks itself English for screen readers. */
  const body = `    <section class="section">
      <div class="container flow">
        <h1>${t.h1}</h1>
        <p>${t.intro}${count}</p>
        <a class="link" href="${BLOG.base}feed.xml">${t.rss} <span aria-hidden="true">&rarr;</span></a>
      </div>
    </section>

    <div class="section">
      <div class="container">
${
  posts.length
    ? `${isEn ? '' : `        <p class="note">${t.english}</p>\n`}        <ol class="posts" role="list"${isEn ? '' : ' lang="en"'}>\n${posts.map(postEntry).join('\n')}\n        </ol>`
    : `        <p class="note">${t.empty}</p>`
}
      </div>
    </div>`;

  const publisher = {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.origin,
    logo: { '@type': 'ImageObject', url: SITE.origin + SITE.logo },
  };
  const homeUrl = abs(isEn ? '/' : `${lang.prefix}/`);
  const jsonLd = isEn
    ? {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${BLOG_URL}#blog`,
        name: `${SITE.name} blog`,
        description: INTRO,
        url: BLOG_URL,
        inLanguage: 'en',
        publisher,
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `${BLOG_URL}${p.slug}/`,
          datePublished: p.publishedAt,
          dateModified: p.dateModified,
          description: p.description,
        })),
      }
    : {
        /* The Blog node stays on /blog/: the posts are English and live
           there, so a language copy is a page about them, not a second blog. */
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: plain(t.meta.title),
        description,
        url,
        inLanguage: lang.code,
        dateModified: indexLastmod(posts, lang),
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin + '/' },
      };

  const hreflang = many
    ? [...LANGS.map((l) => [l.code, abs(blogPath(l))]), ['x-default', abs(blogPath(EN))]]
        .map(([h, u]) => `\n  <link rel="alternate" hreflang="${h}" href="${u}">`).join('')
    : '';
  const ogLocale =
    `\n  <meta property="og:locale" content="${STRINGS[lang.code].lang.ogLocale}">` +
    (many ? LANGS.filter((l) => l !== lang).map((l) => `\n  <meta property="og:locale:alternate" content="${STRINGS[l.code].lang.ogLocale}">`).join('') : '');

  return page({
    title: plain(t.meta.title),
    description,
    canonical: url,
    ogImageAlt: SITE.defaultOgImageAlt,
    twitterImageAlt: SITE.defaultOgImageAlt,
    body,
    lang,
    current: 'blog',
    alternates: menuAlternates(LANGS, lang, blogPath),
    hreflang,
    ogLocale,
    jsonLd: [
      jsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Dovilo', item: homeUrl },
          { '@type': 'ListItem', position: 2, name: plain(t.meta.crumb), item: url },
        ],
      },
    ],
  });
}

function postPage(p, prev, next) {
  const url = `${BLOG_URL}${p.slug}/`;
  /* Post in docs/design-language.md: the article in a measure column, then
     More posts (a link list) and the closing CTA as sections of their own. */
  const more = [
    prev && [`${BLOG.base}${prev.slug}/`, `Previous: ${esc(prev.title)}`],
    [BLOG.base, 'All posts'],
    next && [`${BLOG.base}${next.slug}/`, `Next: ${esc(next.title)}`],
  ]
    .filter(Boolean)
    .map(([href, label]) => `          <li><a href="${href}">${label} <span aria-hidden="true">&rarr;</span></a></li>`)
    .join('\n');

  const body = `    <article class="section">
      <div class="container"><div class="flow measure">
        <h1>${esc(p.title)}</h1>
        ${metaLine(p, esc(p.authorName), tagText(p.tags))}
${
  p.cover
    ? `        <figure class="figure">${imgTag({ ...p.cover, alt: p.cover.alt || p.title }, { lcp: true })}${
        p.cover.caption ? `<figcaption>${esc(p.cover.caption)}</figcaption>` : ''
      }</figure>\n`
    : ''
}${p.html}
      </div></div>
    </article>

    <nav class="section" aria-label="More posts">
      <div class="container">
        <ul class="link-list">
${more}
        </ul>
      </div>
    </nav>

    <section class="section closing">
      <div class="container">
        <h2>Dovilo turns finished work into a city you can see.</h2>
        <p>A to-do list, focus sessions with full-screen ambience, and an isometric city built from
          what you complete. Free on iOS and Android.</p>
        <div class="actions"><a class="btn btn-primary" href="/downloads/">Get Dovilo</a></div>
      </div>
    </section>`;

  return page({
    title: `${p.seoTitle || p.title} - ${SITE.name}`,
    description: p.description,
    canonical: url,
    ogType: 'article',
    ogImage: p.cover?.og,
    ogImageAlt: p.cover ? p.cover.alt || p.title : '',
    head:
      `  <meta property="article:published_time" content="${p.publishedAt}">\n` +
      `  <meta property="article:modified_time" content="${p.dateModified}">\n` +
      `  <meta property="article:author" content="${esc(p.authorName)}">\n` +
      (p.tags ?? []).map((t) => `  <meta property="article:tag" content="${esc(t)}">\n`).join(''),
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title.slice(0, 110),
        name: p.title,
        description: p.description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished: p.publishedAt,
        dateModified: p.dateModified,
        inLanguage: 'en',
        wordCount: p.wordCount,
        ...(p.tags?.length ? { keywords: p.tags.join(', ') } : {}),
        ...(p.cover ? { image: [SITE.origin + p.cover.og] } : {}),
        author: { '@type': 'Person', name: p.authorName, url: SITE.author.url },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          url: SITE.origin,
          logo: { '@type': 'ImageObject', url: SITE.origin + SITE.logo },
        },
        isPartOf: { '@type': 'Blog', '@id': `${BLOG_URL}#blog`, name: `${SITE.name} blog`, url: BLOG_URL },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Dovilo', item: SITE.origin + '/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: BLOG_URL },
          { '@type': 'ListItem', position: 3, name: p.title, item: url },
        ],
      },
    ],
  });
}

function feed(posts) {
  const items = posts
    .map(
      (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${BLOG_URL}${p.slug}/</link>
    <guid isPermaLink="true">${BLOG_URL}${p.slug}/</guid>
    <pubDate>${rfc822(p.publishedAt)}</pubDate>
    <description>${esc(p.description)}</description>
${(p.tags ?? []).map((t) => `    <category>${esc(t)}</category>\n`).join('')}    <content:encoded><![CDATA[${p.feedHtml.replace(/]]>/g, ']]&gt;')}]]></content:encoded>
  </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${SITE.name} blog</title>
  <link>${BLOG_URL}</link>
  <atom:link href="${BLOG_URL}feed.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(INTRO)}</description>
  <language>en</language>
${posts.length ? `  <lastBuildDate>${rfc822(posts[0].publishedAt)}</lastBuildDate>\n` : ''}${items}
</channel>
</rss>
`;
}

/* ───────────── the blocks stitched into hand-written files ───────────── */

const START = '<!-- BLOG:START -->';
const END = '<!-- BLOG:END -->';

/** Replaces whatever sits between the markers, keeping their indentation. */
async function patch(file, block) {
  const full = path.join(ROOT, file);
  const src = await readFile(full, 'utf8');
  const a = src.indexOf(START);
  const b = src.indexOf(END);
  if (a === -1 || b === -1) {
    console.warn(`  ! ${file}: no ${START} / ${END} markers — left untouched`);
    return false;
  }
  const indent = src.slice(src.lastIndexOf('\n', b) + 1, b);
  const next = src.slice(0, a + START.length) + '\n' + block + '\n' + indent + src.slice(b);
  if (next === src) return false;
  await writeFile(full, next);
  log(`  ~ ${file}`);
  return true;
}

function sitemapBlock(posts) {
  /* The index and its language copies list each other (hreflang) once there is
     more than one language, as the five pages do. */
  const alternates = LANGS.length > 1
    ? [...LANGS.map((l) => [l.code, abs(blogPath(l))]), ['x-default', abs(blogPath(EN))]]
        .map(([h, u]) => `\n    <xhtml:link rel="alternate" hreflang="${h}" href="${u}"/>`).join('')
    : '';
  const entry = (loc, lastmod, changefreq, priority, extra = '') =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${extra}\n  </url>`;

  /* An index moves when a post does, or when its own copy changes (pages.blog.updated). */
  return [
    ...LANGS.map((l) => entry(abs(blogPath(l)), indexLastmod(posts, l), 'weekly', l === EN ? '0.8' : BLOG.langPriority, alternates)),
    ...posts.map((p) => entry(`${BLOG_URL}${p.slug}/`, isoDay(p.dateModified), 'monthly', '0.7')),
  ].join('\n\n');
}

/* xhtml:link needs its namespace on <urlset>; tools/build-pages.mjs declares it
   when a page has a second language, and this covers the order the two ran in. */
async function declareXhtml(file) {
  const full = path.join(ROOT, file);
  const src = await readFile(full, 'utf8');
  if (!src.includes('<xhtml:link') || src.includes('xmlns:xhtml=')) return;
  await writeFile(full, src.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
}

function llmsBlock(posts) {
  if (!posts.length) {
    return `## Blog\n\n- [Blog](${BLOG_URL}): posts about focus, productivity and agent workflows. No posts published yet.`;
  }
  return (
    `## Blog\n\nLong-form posts, newest first — full text at each link, and an RSS feed at ${BLOG_URL}feed.xml.\n\n` +
    posts.map((p) => `- [${p.title}](${BLOG_URL}${p.slug}/) — ${isoDay(p.publishedAt)}. ${p.description}`).join('\n')
  );
}

/* ───────────────────────────── build ───────────────────────────── */

/** Removes post directories and images that no longer belong to a published post. */
async function prune(slugs) {
  for (const e of await readdir(OUT, { withFileTypes: true })) {
    if (e.isDirectory() && e.name !== 'media' && !slugs.has(e.name)) {
      await rm(path.join(OUT, e.name), { recursive: true, force: true });
      log(`  - blog/${e.name}/ (unpublished)`);
    }
  }
  if (await exists(MEDIA)) {
    for (const f of await readdir(MEDIA)) {
      if (!usedMedia.has(f)) {
        await rm(path.join(MEDIA, f), { force: true });
        log(`  - blog/media/${f} (unused)`);
      }
    }
  }
}

/** Loud about anything that looked like a post but cannot be rendered. */
function report(raw) {
  const renderable = raw.filter((d) => typeof d.markdownBody === 'string' && d.markdownBody.trim());
  const skipped = raw.filter((d) => !renderable.includes(d));

  log(`  ${renderable.length} publishable post${renderable.length === 1 ? '' : 's'}`);
  if (skipped.length) {
    console.warn(
      `  ! ${skipped.length} document(s) have a slug and a publish date but no markdownBody, so they cannot be\n` +
        `    rendered. Set the content pipeline to export Markdown, or delete them:`
    );
    for (const d of skipped) console.warn(`      ${d._type}/${d.slug} — ${d._id}`);
  }

  const byTitle = new Map();
  for (const d of renderable) byTitle.set(d.title, (byTitle.get(d.title) ?? 0) + 1);
  for (const [title, n] of byTitle) {
    if (n > 1) console.warn(`  ! ${n} published posts share the title "${title}" — search engines treat that as duplicate content`);
  }

  return renderable;
}

async function main() {
  log(`Reading ${SANITY.projectId}/${SANITY.dataset} …`);
  const raw = report(await fetchPosts());

  await mkdir(MEDIA, { recursive: true });

  const posts = [];
  for (const post of raw) {
    const images = await markdownImages(post.markdownBody);
    const text = plainText(post.markdownBody);
    const words = text.split(/\s+/).filter(Boolean).length;
    const coverAsset = assetFromRef(post.cover?.asset?._ref);
    const body = checkHeadingDashes(resolveAnchors(renderMarkdown(post.markdownBody, images, post.slug), post.slug), post.slug);
    const cardText = post.excerpt ? post.excerpt.replace(/\s+/g, ' ').trim() : clip(text, 200);
    checkCardDashes(cardText, post.slug);

    posts.push({
      ...post,
      html: prettify(liftTableOfContents(body)),
      feedHtml: prettify(liftTableOfContents(body, { collapsible: false })),
      cover: coverAsset
        ? await localise(coverAsset, { alt: post.cover.alt || '', caption: post.cover.caption || '', og: true })
        : null,
      description: describe(post, text),
      cardText,
      wordCount: words,
      readingTime: Math.max(1, Math.round(words / 220)),
      dateModified: post.updatedAt || post._updatedAt || post.publishedAt,
    });
  }

  for (const [i, p] of posts.entries()) {
    const dir = path.join(OUT, p.slug);
    await mkdir(dir, { recursive: true });
    /* The list is newest first, so the next entry in the array is the older post. */
    await writeFile(path.join(dir, 'index.html'), postPage(p, posts[i + 1], posts[i - 1]));
    log(`  + blog/${p.slug}/ (${p.wordCount} words)`);
  }

  await writeFile(path.join(OUT, 'index.html'), indexPage(posts, EN));
  await writeFile(path.join(OUT, 'feed.xml'), feed(posts));
  log('  + blog/index.html, blog/feed.xml');

  /* A language copy of the index, for every language that has strings. The
     posts stay English at /blog/<slug>/; build-pages refuses a language
     directory whose strings are gone, so nothing is left behind here. */
  for (const l of LANGS.filter((x) => x !== EN)) {
    const dir = path.join(ROOT, l.code, 'blog');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), indexPage(posts, l));
    log(`  + ${l.code}/blog/index.html`);
  }

  await prune(new Set(posts.map((p) => p.slug)));

  await patch('sitemap.xml', sitemapBlock(posts));
  await declareXhtml('sitemap.xml');
  await patch('llms.txt', llmsBlock(posts));
  await patch('llms-full.txt', llmsBlock(posts));

  log(`Done — ${posts.length} post(s), ${downloaded} image(s) pulled.`);
}

main().catch((err) => {
  console.error('\nBlog build failed:\n' + (err?.stack || err));
  process.exit(1);
});
