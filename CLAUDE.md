# dovilo.app — working rules

Hand-written static HTML for [dovilo.app](https://dovilo.app). No framework, no build step outside
`/blog`. GitHub Pages serves `main` at the apex domain; pushing publishes. See `README.md` for how
the repo is laid out and how the blog build works — this file is about the rules that are easy to
break and expensive to re-derive.

Two things here have already cost real time and must not be undone by a later change:

1. **The SEO / GEO work.** Every rule below came out of a specific commit that fixed a specific
   audit finding. Re-read the commit if you need the reasoning: the messages carry it.
2. **The design system.** `styles/base.css` is the single source of truth for type, colour, spacing
   and chrome on every page. Before this existed the site had three unrelated type systems under
   one brand.

---

## 1. The design system

`styles/base.css` holds the tokens, the type ramp, the ink scale, the nav, the footer and every
shared component. **Every page links it first**, then adds only what is specific to that page.

```html
<!-- First in <head>, straight after canonical, above Open Graph and far above the JSON-LD:
     the preload scanner must find it in the opening packets. -->
<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles/base.css">
```

Rules:

- **Never redeclare a token.** `:root` is declared in `base.css` and nowhere else. A page that
  re-declares `--bg` or `--accent` re-introduces exactly the drift this system removed. `.keep-dark`
  is the one sanctioned override, for surfaces that stay dark in both themes (terminals, focus
  scenes).
- **Never set a font size in px or a bare rem.** Use the ramp: `--t-7` (home hero only) down to
  `--t--3`. If nothing on the ramp fits, the ramp is wrong — fix it in `base.css` rather than
  working around it in one page.
- **Never invent an ink alpha.** There are four: `--ink` (headings), `--ink-1` (body), `--ink-2`
  (support), `--ink-3` (meta). Hard-coding `rgba(var(--fg-rgb),.45)` is how the old pages ended up
  with six different greys.
- **Light theme is the fragile one.** Any alpha must go through `calc(… * var(--fa))` and any accent
  glow through `calc(… * var(--ga))`. `--fa` is 1 on dark and 1.55 on light because `.35` alpha of
  near-black is unreadable on `#F7F8F8`. A literal `rgba(232,234,235,…)` anywhere is a light-theme
  bug.
- **Page CSS loads after `base.css`,** so a page-local rule always wins at equal specificity. That
  is deliberate — but it also means a page that keeps its own `body{font-family:…}` silently opts
  out of the whole system. When adding `base.css` to a page, delete its local `body`, `:root` and
  chrome rules in the same edit.
- **The nav is sticky, not fixed.** It stays in flow, so no page needs a magic `padding-top`.
  `scroll-padding-top` is set once in `base.css` from `--nav-h`.
- **Class names are a contract with inline JS.** Do not rename `.faq-item.open`, `nav ul.open`,
  `.menu-overlay.open`, `.theme-toggle .icon-sun/.icon-moon`, `.mac-window.in-view`,
  `#card-ios|android|windows|mac`, `.toc a.active`, `.copy-btn.copied`, or the `.rel*` nodes the
  changelog's live GitHub fetch writes into. They are queried by hand-written script in the same
  files.
- **The homepage blog band's class names are a contract with the generator** —  `.blog-band`,
  `.blog-inner`, `.blog-grid`, `.blog-card`, `.blog-card-meta`, `.blog-card-more`, `.blog-all`.
  Rename them in `tools/build-blog.mjs` and the CSS together or not at all.

Page-specific CSS still belongs in the page's own `<style>` block, except the homepage, whose
stylesheet outgrew its markup and lives in `styles/home.css`. If any other page's inline CSS passes
roughly 15 KB, move it out too — markup weight is what a crawler reads.

---

## 2. SEO / GEO non-negotiables

### Titles and headings

- One title pattern, site-wide: **`<Topic, keyword first> - Dovilo`**. A single ASCII hyphen with
  spaces around it. Never an em dash, never brand-first. (`7357794`)
- **No em dash in any heading.** `<h1>`–`<h4>`, `<title>`, `.section-title` and `<summary>` use a
  colon, a comma or a plain hyphen instead. "Mobile: iOS & Android", not "Mobile — iOS & Android".
  Em dashes are fine in body copy; a heading is a label, and the dash reads as a typographic tic and
  breaks the one-pattern rule above. This applies to blog post headings too, which come from the
  Markdown body in Sanity — fix them at the source, since the build regenerates the pages.
- `<title>`, `og:title`, `twitter:title` and the JSON-LD `name`/`headline` are **four copies of one
  string**. Change one, change all four, in the same commit.
- The H1 need not equal the title, but it must cover the same topic, and the paragraph under it must
  carry the brand plus the page's primary keyword without repeating the H1. (`7357794`)
- Meta description **≤ 150 characters**, hook in the first clause, and it may not claim anything the
  page contradicts. (`fd80943`)

### Structured data

- **Visible markup and JSON-LD must mirror each other.** Add, remove or reword a question, a
  release note, a feature or a price in the HTML and you rewrite the matching JSON-LD in the same
  commit — and the reverse. Structured data may never assert something a reader cannot see.
  (`c703fa3`, `c7ab5a8`)
- There is **one** `SoftwareApplication` entity for the whole site: `"@id":
  "https://dovilo.app/#app"`. Any page describing the app reuses that `@id` and carries only what it
  is authoritative for — the homepage owns `offers` and `featureList`, the changelog owns
  `releaseNotes` and `downloadUrl`. Never mint a second node without the `@id`. (`c7ab5a8`)
- Every page carries a page-level type (`WebPage`, `TechArticle` for `/ai` and `/docs/webhooks`,
  `FAQPage` for `/faq`, `Blog`/`BlogPosting` for the blog) and, except the homepage, a
  `BreadcrumbList` with position 1 = Dovilo / position 2 = the page. No page ships with zero JSON-LD.
- Any URL an `ItemList` or anchor points at must resolve — give list cards stable ids before
  referencing them. (`c7ab5a8`)
- **No self-serving review markup.** Do not add `aggregateRating` unless the page visibly shows
  ratings collected from real users. A self-declared rating risks the whole block's eligibility.

### Crawlability and freshness

- `robots.txt` allows every major search and AI crawler — Googlebot, Bingbot, DuckDuckBot, Applebot,
  ClaudeBot, Claude-Web, Claude-User, Claude-SearchBot, anthropic-ai, GPTBot, OAI-SearchBot,
  ChatGPT-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended,
  Meta-ExternalAgent, cohere-ai, CCBot. Only `/notes/` is disallowed. **Never add a Disallow for an
  AI crawler.**
- Change a URL's content → bump its `<lastmod>` in `sitemap.xml` to that day. A retitle counts.
  (`0384c1f`)
- Keep a page's JSON-LD `dateModified` in step with its sitemap `lastmod`. Touch the page, move both.
- New indexable page → add it to `sitemap.xml` in the same commit, with a priority on the existing
  scale: `/` 1.0, `/ai` 0.9, `/faq` and `/docs/webhooks` 0.8, `/blog/` 0.8, posts 0.7, `/downloads/`
  0.7, `/changelog/` 0.6, `/privacy` and `/terms` 0.3. A `noindex` page (only `/licenses`) stays out.
- Every indexable page carries, near the top of `<head>`: title, description, robots,
  `<link rel="canonical">` with the absolute URL, and
  `<link rel="alternate" type="text/markdown" href="https://dovilo.app/llms.txt">` — legal pages
  included.

### GEO — writing for answer engines

- `llms.txt` and `llms-full.txt` are **part of the deliverable, not documentation debt**. Any change
  to a page's facts — a price, a date, a feature, a platform, a page's purpose — is mirrored into
  both in the same commit.
- Keep the "things that are easy to get wrong" section at the end of `llms-full.txt` current. It is
  the correction list a model reads: bricks not coins; ambience has no music; agents read AI tasks
  only and cannot create them; agents run on desktop but AI Tasks is on mobile too; desktop and MCP
  need Pro; the two packs are one-time purchases included with Pro; focus sessions are free and
  unlimited.
- **A page under 300 words of visible prose is a defect.** Give every section an intro saying what
  the thing is and why it works that way, so a cold reader and a quoting answer engine both get a
  complete statement. (`c703fa3`)
- **Every claim must already be documented in the repo** — `llms.txt`, `llms-full.txt`, the FAQ or
  the page itself. Nothing unreleased gets a date. Do not invent capabilities, integrations, prices
  or platforms to make a section read better.
- No `meta keywords`, and no low-contrast "SEO content" block written for crawlers. If a fact is
  worth telling a crawler, write it into the page at readable contrast. (`74a0c8d`)

### Performance

- **No third-party origin in the critical path.** Inter is self-hosted from `/fonts/` as two
  variable woff2 files declared with `@font-face`, `font-display:swap` and `unicode-range`, with
  `/fonts/inter-latin.woff2` preloaded. Never add a Google Fonts link back. (`bdb41bd`)
- **The stylesheets are render-blocking by design. Leave them that way.** A Lighthouse or SEO audit
  will flag `base.css` — and `home.css` on the homepage — under "eliminate render-blocking
  resources". That audit fires on any blocking stylesheet, it is not a defect here, and both of the
  usual remedies are regressions on this site. This call was already made once, in `39565c3` —
  do not spend a third afternoon on it:
  - **Never async-load `base.css`** through the `rel="preload" … onload="this.rel='stylesheet'"`
    pattern. `base.css` opens with `@font-face`, the reset, `:root` and the `body`/heading rules —
    it *is* the critical CSS. Deferring it paints the page unstyled and then reflows it, trading a
    render delay for a flash of unstyled content and a CLS spike.
  - **Never inline the design system as "critical CSS".** Seventeen pages share one cached copy of
    `base.css`. Inlining it re-sends that CSS with every page view, duplicates the single source of
    truth §1 exists to protect, and needs a build step this repo does not have outside `/blog`.
  The measurements behind that decision, so nobody re-derives them: both files are same-origin,
  carry no `@import`, and sit at byte ~1075 of the document, so the preload scanner fetches them in
  parallel over the connection that just delivered the HTML. On the wire they are 7.7 KB and 8.7 KB
  gzipped against a 17.6 KB document. Compression is already at its floor and is not ours to tune:
  Pages sits behind Cloudflare, which answers an `Accept-Encoding: br` request with a low-quality
  7.9 KB body — larger than the gzip it would replace.
- The one permitted third-party runtime dependency is highlight.js on `/docs/webhooks`, loaded at
  the end of `<body>` with a `preconnect` in `<head>`. Its atom-one-dark theme is **inlined at the
  top of that page's `<style>`**, above the page's own overrides, with its BSD-3-Clause attribution.
  Do not re-externalise it and do not move it below the overrides.
- Screenshots ship as **WebP**. Every content `<img>` carries descriptive alt text naming what is on
  screen, plus `width` and `height` so the box is reserved. The LCP image gets `fetchpriority="high"`
  and no `loading` attribute; everything below the fold gets `loading="lazy"`. Images whose CSS width
  varies get `srcset` + `sizes` matching the CSS. (`bdb41bd`, `a96eccd`)
- **Share cards stay PNG/JPG and must be a real 1200×630 file.** Never point `og:image` at a WebP,
  and never declare `og:image:width`/`height` the file does not have.
- Keep the PNG sources next to every WebP and regenerate variants with the ffmpeg recipe in
  `README.md`.
- Keep the theme boot script — the inline IIFE reading `localStorage['dovilo-theme']` and setting
  `data-theme` on `<html>` — inline in `<head>` before any painted content, on every page including
  generated blog pages.
- Before deleting CSS as dead, check it against every `class` attribute **and** every
  `classList`/`querySelector` call in the page, including classes only the blog generator emits.
  (`302b337`)

### The blog is generated

- **Never hand-edit anything between `<!-- BLOG:START -->` and `<!-- BLOG:END -->`.** Those regions
  live in `index.html`, `sitemap.xml`, `llms.txt` and `llms-full.txt` and are overwritten by
  `npm run build:blog`.
- `blog/index.html` and every `blog/<slug>/index.html` are build output. Edit `tools/template.mjs`
  and re-run the build; editing the HTML is silently reverted on the next publish.

---

## 3. Before you commit a page change

- [ ] Title / og:title / twitter:title / JSON-LD name still identical?
- [ ] Did visible text change? Then the JSON-LD mirroring it changed too.
- [ ] `sitemap.xml` lastmod bumped, and JSON-LD `dateModified` with it?
- [ ] Facts changed? `llms.txt` and `llms-full.txt` updated in the same commit.
- [ ] New page? Linked from the shared nav or footer, and in `sitemap.xml`.
- [ ] Every new `<img>`: alt, width, height, WebP, lazy unless above the fold.
- [ ] No new token, font size or ink alpha outside `styles/base.css`.
- [ ] Both themes checked — dark and light — and the page still reads at 320px wide.

## 4. Known issues, not yet fixed

Carried here so they are not rediscovered from scratch:

- Six canonicals (`/ai`, `/faq`, `/privacy`, `/terms`, `/licenses`, `/docs/webhooks`) name the
  slash-less URL, which GitHub Pages 301-redirects to the directory form. Canonical should name the
  URL that returns 200; fixing it means changing internal links, `sitemap.xml` and `llms.txt`
  together.
- `hreflang` is declared only on the homepage.
- Three `FAQPage` blocks compete: `/` (8 questions), `/faq` (25) and `/changelog/` (3). The
  homepage's eight duplicate eight of the FAQ page's, so a wording change has to be made in four
  places plus `llms-full.txt`.
- `/changelog/`, `/docs/webhooks`, `/privacy`, `/terms` and `/licenses` ship no `og:image`.
- `/downloads` is thin: a few hundred words of visible text, no H2s.
- `styles/home.css` still carries legacy hand-written font sizes and ink alphas from before the
  design system existed. They render correctly but do not go through the ramp or the ink scale;
  convert them opportunistically when you touch a rule, not in one sweep.
- `og-card.jpg` is a crop of the original `hero.jpg` artwork, which is still on the old turquoise
  palette rather than the amber accent. The shape is now correct for a share card; the colours are
  not the brand's.
