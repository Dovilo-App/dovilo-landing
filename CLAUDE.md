# dovilo.app — working rules

Static HTML for [dovilo.app](https://dovilo.app). No framework. Most pages are hand-written; the
build steps are `/blog` (the index's language copies, `/tr/blog/`, included), the seven pages built from `src/` in five languages
(`npm run build:pages`, §1.3), their share cards (`npm run build:og`), the captures
(`npm run build:captures`) and the icons (`npm run build:icons`, §2 Performance). GitHub Pages serves `main` at the
apex domain; pushing publishes. See `README.md` for how the repo is laid out and how the blog build
works — this file is about the rules that are easy to break and expensive to re-derive.

Decisions, contract and guides are Dovilo project documents; read them with read_context. The repo keeps no decision documents. Old paths in code comments and page sources mean these documents: `docs/design-language.md` = "Landing design language", `docs/dovilo-landing-l10n-analysis.md` = "Site l10n (A130, A131)".

Two things here have already cost real time and must not be undone by a later change:

1. **The SEO / GEO work.** Every rule below came out of a specific commit that fixed a specific
   audit finding. Re-read the commit if you need the reasoning: the messages carry it.
2. **The design system.** "Landing design language" (Dovilo project document) is the single design
   reference, and `styles/system.css` implements it. Every page is on it, the generated blog pages
   included; the old `styles/base.css` and `styles/home.css` were deleted once the last pages moved
   (29 Oct 2026). The site once had three unrelated type systems under one brand; a second
   stylesheet next to `system.css` would bring that back.

---

## Release timing

Dovilo 2.0 shipped on 27 Oct 2026, the release day the product docs call R: mobile 2.0.0 reached
Google Play (Android) that day and the App Store (iOS) the same evening (18:45 UTC), and Desktop
2.0.x has been out since 19 Oct. **2.0.0 is on both stores**: a line that says "on Android" alone or
gives iOS no date is out of date. Remote MCP
(Agents MCP at `/mcp/agents`, Personal MCP at `/mcp`), planning from chat assistants, scheduling and
repeat for AI tasks, and server delivery of webhooks are public: never write "local" about MCP, and
never put any of them "on the roadmap". **Not yet:** directory listings (ChatGPT, Claude, the MCP
Registry), data export and Apply directly, the direct-apply write mode (until it ships, every write
from an assistant waits for approval; the changelog's roadmap lists it and data export since 29 Oct
2026). Say so plainly where it matters, and give none of them a date. Blog posts come from Sanity and still carry pre-2.0
sentences: do not edit them here and do not quote them on the site. They are fixed at the source.

---

## 1. The design system

### 1.1 The design language (every page)

"Landing design language" (Dovilo project document) is the one design reference: principles,
tokens, components with their HTML, copy rules, word budgets, the GEO layer and theming. A page task
that says "follow the design language" (or the old "follow docs/design-language.md") needs nothing else about design. `styles/system.css`
implements the doc and nothing else, and `/styleguide/` (source `styleguide/index.html`, named here
without a link on purpose) renders every component in light and dark with real copy.

Rules:

- **No page may introduce a component the doc does not have.** If a page needs one, add it to the
  doc, to `system.css` and to `/styleguide/` in the same commit, then use it.
- **Every page links `system.css` and nothing else.** No second stylesheet, no `<style>` block, no
  inline style; the blog's template (`tools/template.mjs`) carries no CSS either. There is no
  exception: `/docs/webhooks` dropped highlight.js and its inlined theme when it moved (§2
  Performance). `/styleguide/` keeps its own frame rules (`.sg-*`), which are not components.
- **Tokens live in `system.css` only**: five neutrals per theme and one accent, `#D4880A`. The
  accent is a fill (primary buttons, the 01-04 numerals) and never a text colour: on the light
  background it reads at 2.7:1.
- **Word budgets**, counted as visible words outside the nav, the footer and the body of every
  `<details>`: `/` at most 550, body copy under 370 (headings, labels, captions, links and the FAQ
  questions in their `<summary>` count; FAQ answers, store badges and alt text do not); `/ai` at most 670 (its section headings
  count) plus one code block (both raised for 2.2 on 5 Nov 2026, from 450/350 and 440: the planning
  section on `/`, the connect steps on `/ai`, measured at 549, 360 and 667 words; each connect app
  is a closed `<details>`, so only its name counts);
  `/pricing` at most 320, body copy (paragraphs, list lines and notes) under 250 (headings,
  prices, labels, links and the FAQ questions count toward the 320 but are not body copy; FAQ
  answers and store badges count toward neither);
  `/downloads` at most 150; `/docs/` at most 150; a language copy of a built page (`/tr/…`) the
English budget times 1.3, which is room for the language and never a reason to drop a fact; `/faq`, `/docs/mcp/`, `/docs/webhooks`,
  `/changelog`, `/privacy`, `/terms`, `/licenses`, `/blog/`, the posts and `/404.html` have none. A
  budget is a ceiling. Text over it moves into a collapsible or onto the page that carries the
  depth; the fact is never deleted. **The Landing document "Landing design language" (§6, Word
  budgets) holds the current budgets**, which the numbers above trail (it has `/` at 620 since 2.3 and
  sets `/plan/` and `/focus/` when wave 1 ships): where they differ, the document wins.
- **The GEO layer stays whole while visible text shrinks.** The `<h1>` names Dovilo; the first
  paragraph (the hero sub, or the "In short" paragraph straight after a one-line sub, as on `/ai`,
  `/` and `/pricing`) is two or three declarative sentences with a number and counts toward the budget; depth
  goes into `<details>` on the same page as real HTML, never injected; one `<h1>`, an `<h2>` per
  section, FAQ `<h3>`s phrased as questions; every existing URL and anchor `id` keeps resolving;
  JSON-LD stays and mirrors the page; `llms.txt` and `llms-full.txt` are regenerated from the page,
  never shortened. The legal pages (`/privacy`, `/terms`, `/licenses`) are the exception to the
  `<h1>` and first-paragraph rules: their text, headings included, changes only word for word from
  text a task gives. A post's title and text are Sanity's. `/404.html` is outside the GEO layer
  altogether (below).
- **The 300-word floor in §2 still applies.** On a budgeted page it is met by the visible text plus
  what its collapsibles hold. The one exception is `/docs/`, a hub page of 139 visible words with
  no collapsibles: its depth is the two references it links, and Selahaddin accepted it under the
  floor on 29 Oct 2026. Any other page under 300 words is still a defect, `/404.html` aside (below).
- **No em dash anywhere a person reads**: body copy, captions, buttons and alt text as well as
  headings. `llms.txt` and `llms-full.txt` are the only exception in what we write. Legal text keeps
  what it has until a task gives new text (`/privacy` §8 has one), and post bodies are fixed in
  Sanity; the blog build lists post headings that carry one.
- **Class names are a contract with the site script** at the end of every page:
  `.theme-toggle`, `.nav-menu` (with `aria-controls`), `.nav-links.open`, `.copy-btn`,
  `.copy-btn.copied`, `.code`, `a.mail` with `data-u`/`data-d`, and `source.src-dark` (the dark
  capture of a figure, swapped with the theme; design-language §5). The theme stays in
  `localStorage['dovilo-theme']`, the key the old pages used, so a visitor's earlier choice still
  holds. The site script, nav and footer live in `src/partials/`, which the seven built pages and
  the blog's `tools/template.mjs` render (§1.3); the other hand-written pages carry copies: change
  the partial and every copy in the same commit, then run `npm run build:pages` and rebuild the
  blog. A page's own behaviours (the changelog fetch, platform detection, the docs' table of
  contents) go in a page script after the site script; the doc's §3 says how. `/downloads`' page
  script keys on `#card-ios|android|windows|mac` and adds `.highlighted`. It reads `?source=`
  against a fixed map of the five values product brief §12 reserves, on `/tr/downloads/` too (`mcp_401`, `mcp_browser`,
  `mcp_pro_required`, `desktop_update`, `mcp_new_user`) and, for one of them, inserts a
  `div.note` before `.download-boxes` (design-language §5, Note); any other value, or none, shows
  nothing. The five lines are final copy from their task; they live in `src/strings/<lang>.json`
  (`pages.downloads.notes`), which the build writes into that map, never in the page's text,
  `llms.txt` or `llms-full.txt`; the canonical stays `/downloads/`. The Note samples
  in `/styleguide/` and design-language §5 repeat the `mcp_browser` line: change them with it. The
  page script also makes one request, GitHub's `releases/latest` for the desktop releases repo
  (the release the installer links download), and writes the tag without its `v` into
  `#desktop-ver` and the publish date, as "27 Oct 2026" in UTC (the month names from the strings, the
  order from the language's `date` format in `LANGUAGES`, `tools/pages-lib.mjs`), into
  `time#desktop-date` and its `datetime`, in the desktop box's Latest line. On any failure the static line stays. The page source, `llms.txt` and `llms-full.txt`
  carry only that static text, so it is still updated by hand at a release; Googlebot runs the
  script and may index the fetched version instead. The page
  script of `/docs/mcp/` and `/docs/webhooks` opens `.toc details` from 960px and sets `.active` on
  the `.toc a` of the heading in view (`.doc-body h2[id]`, `h3[id]`). `/changelog/`'s page script,
  the release feed, reads the first `.rel .rel-ver` in `#releases` and, for a newer desktop tag on
  GitHub, writes a `.rel` entry of the same markup above it and moves `.rel-latest` to it
  (design-language §5, Release entries). `/faq` has no page script: its accordion is native
  `<details>`.
- **`/styleguide/` stays `noindex`, out of `sitemap.xml` and unlinked.** It shows every sample
  twice, once per theme: edit both copies together.
- **`/404.html` is the `noindex` exception.** GitHub Pages serves it, with status 404, at every
  address that has no file, so it has no URL of its own: no description, canonical, `llms.txt` link,
  Open Graph tags or JSON-LD, and it stays out of `sitemap.xml`, `llms.txt` and `llms-full.txt`.
  Its `<h1>` does not name Dovilo, the paragraph under it carries neither the brand nor a keyword
  (§2, Titles), and it sits far under the 300-word floor; its copy is fixed by its task and
  Selahaddin approved the exceptions on 29 Oct 2026. Like every page it keeps the boot script, the
  site script, the nav and the footer, with no page script, and every path in it starts at the site
  root, since it renders at any depth. It is the one hand-written page that is not an
  `index.html`: a nav, footer or site script change that globs `*/index.html` misses it, and one
  that only edits `src/partials/` misses it too.

The redesign moved one page per task: `/ai`, `/`, a new `/pricing`, `/downloads`, `/faq`,
`/docs/*`, `/changelog`, then the legal pages and the blog template together. With no page left on
it, `styles/base.css` was deleted with `styles/home.css` and the old system's rules (this file's
former §1.2); git history has them. The blog pages follow the doc's Post and Post list
(design-language §4 and §5); a blog change goes in `tools/template.mjs` or `tools/build-blog.mjs`
and reaches `blog/` through the build, never by hand.

### 1.2 The legal pages

`/privacy`, `/terms` and `/licenses` change only word for word from text a task gives. A style task
moves the stylesheet, the nav, the footer and the wrappers around the text, and nothing inside: same
words, same order, same headings and ids, the same elements around each sentence. Prove it with a
text diff of each page's `<main>` before and after (the `textContent` with whitespace collapsed,
and the rendered `innerText`); both must be empty, or the report says exactly why not. A fault in
legal text (a typo, an em dash, Title Case headings) goes in the report and stays on the page.

### 1.3 The seven built pages

`/`, `/focus/`, `/plan/` (both A138, 9 Nov 2026), `/ai/`, `/pricing/`, `/downloads/` and `/faq/` are built by `npm run build:pages`
(`tools/build-pages.mjs`) from `src/` since A130 (31 Oct 2026), so the site can ship them in five
languages. English, Turkish, Spanish, French and German ship (A130 part 2, 1 Nov 2026; es, fr and de on 5 Nov 2026). Their `index.html` files are build output: **never edit them in place**; the next build
overwrites them. `npm run build:pages -- --check` fails when they are out of step with `src/`.

- `src/pages/<page>.html` is the page's markup, figures and JSON-LD skeleton. Its first line names
  the page's share card for `npm run build:og` (`{{! card: … }}`, dropped from the output).
- `src/strings/<lang>.json` holds every string a person or a crawler reads on those pages: meta,
  headings, body copy, alt text, captions, FAQ questions and answers, the five `?source=` lines and
  the month names of `/downloads`, and each page's `updated`, which the build writes as its sitemap
  `lastmod` and JSON-LD `dateModified`. A string is HTML as it appears in the page, inline links,
  `<code>` and `<strong>` included. JSON-LD reads the same keys with the tags stripped, so a FAQPage
  answer cannot drift from the visible one, and `/` and `/pricing/` read the same
  `common.offers`, so their offers stay word for word.
- `src/partials/` holds the nav (with the language menu), the footer and the site script (§1.1).
- English is written to the paths the site has always had. A language gets its copies under
  `/tr/`, `/es/`, `/fr/` or `/de/` when `src/strings/<lang>.json` exists, and only then does the
  build write hreflang, `og:locale:alternate`, the language menu, the footer's language links and
  the localised sitemap entries with their alternates. All five languages have strings, so all
  seven pages carry hreflang for `en`, `tr`, `es`, `fr`, `de` and `x-default` (English), the menu and the footer links.
  A language copy is `/<lang>/` or `/<lang>/<page>/`, slash form only (`/tr/faq/`), with its own
  canonical; its links to the other six built pages stay in its language and every other link goes to
  the English page.
- **Translations are never written or changed here.** A strings file other than English comes from
  a task or from Selahaddin, and is committed as placed. A string that fails a check or does not
  fit is reported with its key, not fixed.
- Links on a language copy carry the language (A130 3.10): App Store `ct=<campaign>_<lang>`,
  Google Play `&hl=<lang>&utm_content=<lang>`, the installers `?source=<placement>_<lang>`. The
  templates write them through `{{lang.suffix}}` and `{{lang.play}}`; English keeps its links.
- JSON-LD on a language copy (A130 3.6): its page-level type with `inLanguage`, its
  `BreadcrumbList` (Dovilo is `/<lang>/`) and its `FAQPage` from its own strings; the app is
  referenced by `"@id": "https://dovilo.app/#app"` only. The full `SoftwareApplication`
  (`offers`, `featureList`, `releaseNotes`), the `Organization` and the `WebSite` stay on the
  English pages (`{{#if lang.en}}` in the templates).
- **The hreflang set grows with the languages.** A language's alternates (hreflang, `og:locale:alternate`,
  menu entry, footer link, sitemap `xhtml:link`) are written only when its `src/strings/<lang>.json`
  exists, so `es`, `fr` and `de` appear as they land, never a link to a page that does not exist.
- **The language lists in `llms.txt` ("Languages") and `llms-full.txt` (first "easy to get wrong"
  line) sit between `<!-- LANGS:START -->` and `<!-- LANGS:END -->`**, written by `npm run build:pages`
  from the languages that have strings: do not edit them by hand, and keep the markers.
- The build fails on a missing key, on a translation whose markup (tags, attributes, `{{href.*}}`)
  differs from English, and on an em dash.
- **The blog index has a copy per language** (A130 part 2b): `/tr/blog/` now, the others as their
  strings land. `npm run build:blog` writes it, not `build:pages`: the index's words are
  `pages.blog` in `src/strings/<lang>.json` (`h1`, `intro`, `count` with `{{n}}` and the English
  `count_one`, `english`, `rss`, `empty`, `meta.title`, `meta.crumb`, `updated`), and the post list
  is the same English list on every copy, with one `p.note` above it saying so and `lang="en"` on
  the `<ol>`. The posts stay English at `/blog/<slug>/`, with no Language menu and no hreflang. The
  nav's, the footer's and the home page's Blog links read `{{href.blog}}`, so a language page links
  its own index; run `build:blog` after `build:pages` when a language lands (the pages build warns
  when `<lang>/blog/` is missing). Its JSON-LD is `WebPage` and `BreadcrumbList`; the `Blog` node
  stays on `/blog/` only. Priority 0.6 in the sitemap (`BLOG.langPriority`).
- The other pages (`/docs/*`, `/changelog/`, the legal pages, the blog posts, `/404.html`) stay
  hand-written or generated as before, and English only: they carry no hreflang and no language
  menu.

---

## 2. SEO / GEO non-negotiables

### Titles and headings

- One title pattern, site-wide: **`<Topic, keyword first> - Dovilo`**. A single ASCII hyphen with
  spaces around it. Never an em dash, never brand-first. (`7357794`)
- **No em dash in any heading.** `<h1>`–`<h4>`, `<title>`, `.section-title` and `<summary>` use a
  colon, a comma or a plain hyphen instead. "Mobile: iOS & Android", not "Mobile — iOS & Android".
  Since every page moved to the design system the rule covers body copy too (§1.1). A heading is a
  label, and the dash reads as a typographic tic and breaks the one-pattern rule above. This applies
  to blog post headings too, which come from the Markdown body in Sanity — fix them at the source,
  since the build regenerates the pages.
- `<title>`, `og:title`, `twitter:title` and the JSON-LD `name`/`headline` are **four copies of one
  string**. Change one, change all four, in the same commit.
- The H1 need not equal the title, but it must cover the same topic, and the paragraph under it must
  carry the brand plus the page's primary keyword without repeating the H1. (`7357794`) On a
  redesigned page whose hero sub is one line, the "In short" paragraph straight after the hero
  carries this (`/ai`, `/`).
- Meta description **≤ 150 characters**, hook in the first clause, and it may not claim anything the
  page contradicts. (`fd80943`)

### Structured data

- **Visible markup and JSON-LD must mirror each other.** Add, remove or reword a question, a
  release note, a feature or a price in the HTML and you rewrite the matching JSON-LD in the same
  commit — and the reverse. Structured data may never assert something a reader cannot see.
  (`c703fa3`, `c7ab5a8`)
- There is **one** `SoftwareApplication` entity for the whole site: `"@id":
  "https://dovilo.app/#app"`. Any page describing the app reuses that `@id` and carries only what it
  is authoritative for — `/pricing/` owns `offers` (one per price line on the page, no "best
  value", no "save 33%"), the homepage keeps the same offers minus the AI task top-ups, word for
  word, and owns `featureList`, the changelog owns `releaseNotes` and `downloadUrl` and carries
  `/pricing/`'s Free offer word for word (since 29 Oct 2026). Change a price on `/pricing/`, change
  both `offers` lists, and the changelog's Free offer too when Free changes; the Pro prices also
  sit in the `mcp_pro_required` line of `/downloads`' page script, seen only with that `?source=`.
  Never mint a second node without the `@id`.
  (`c7ab5a8`)
- Every page carries a page-level type (`WebPage`, `CollectionPage` for `/docs/`, `TechArticle` for `/ai`, `/docs/mcp/` and `/docs/webhooks`,
  `FAQPage` for `/faq`, `Blog`/`BlogPosting` for the blog) and, except the homepage, a
  `BreadcrumbList` with position 1 = Dovilo and the page last, its parent between them where it
  has one (Dovilo / Docs / the page on `/docs/mcp/` and `/docs/webhooks`). No page ships with zero
  JSON-LD, except `/404.html`, which has no URL of its own (§1.1).
- Any URL an `ItemList` or anchor points at must resolve — give list cards stable ids before
  referencing them. (`c7ab5a8`)
- **No self-serving review markup.** Do not add `aggregateRating` unless the page visibly shows
  ratings collected from real users. A self-declared rating risks the whole block's eligibility.

### Crawlability and freshness

- **Every page URL ends with a slash** (A137, decision of 5 Nov 2026): `/ai/`, `/faq/`, `/privacy/`,
  `/terms/`, `/licenses/`, `/docs/webhooks/` like the rest. Canonical, `og:url`, hreflang (`en` and
  `x-default` included), the sitemap, JSON-LD and every internal link name the slashed form, so none
  points at a GitHub Pages 301. Fragments follow the slash (`/ai/#connect-your-ai`). Post bodies from Sanity and
  `blog/feed.xml` still carry bare links (`dovilo.app/ai`): fixed at the source, not here. The edge Worker's
  paths (`/mcp*`, `/oauth/*`, `/.well-known/*`, `/__/auth/*`) are not pages and are left alone. The
  English paths of the built pages are `PAGES[].path` in `tools/pages-lib.mjs`.
- `robots.txt` allows every major search and AI crawler — Googlebot, Bingbot, DuckDuckBot, Applebot,
  ClaudeBot, Claude-Web, Claude-User, Claude-SearchBot, anthropic-ai, GPTBot, OAI-SearchBot,
  ChatGPT-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended,
  Meta-ExternalAgent, cohere-ai, CCBot. Nothing is disallowed. **Never add a Disallow for an
  AI crawler.**
- Change a URL's content → bump its `<lastmod>` in `sitemap.xml` to that day. A retitle counts.
  (`0384c1f`) A link added to the shared nav or footer alone is not a content change and moves
  neither date: the nav's link to `/pricing/` (PR #11) and the footer's to `/docs/` (29 Oct 2026)
  went in on every page without one, since lastmod tells crawlers the content moved.
- Keep a page's JSON-LD `dateModified` in step with its sitemap `lastmod`. Touch the page, move both.
  On the seven built pages both come from `updated` in `src/strings/<lang>.json`: move that one date
  and run `npm run build:pages`.
- New indexable page → add it to `sitemap.xml` in the same commit, with a priority on the existing
  scale: `/` 1.0, `/ai` 0.9, `/pricing/`, `/faq`, `/docs/`, `/docs/mcp/` and `/docs/webhooks` 0.8, `/blog/` 0.8, posts 0.7, `/downloads/`
  0.7, `/changelog/` 0.6, `/privacy` and `/terms` 0.3. A language copy of a built page sits a step
  under English, and the page build writes its entry: `/<lang>/` and `/<lang>/ai/` 0.8,
  `/<lang>/pricing/` and `/<lang>/faq/` 0.7, `/<lang>/downloads/` 0.6 (`langPriority` in
  `tools/pages-lib.mjs`). A `noindex` page (`/licenses`, `/styleguide/`,
  `/404.html`) stays out. The scale above is a copy: the sitemap priorities live in the Landing document
  "Landing design language", and `langPriority` in `tools/pages-lib.mjs` carries those of the language copies.
- Every indexable page carries, near the top of `<head>`: title, description, robots,
  `<link rel="canonical">` with the absolute URL, and
  `<link rel="alternate" type="text/markdown" href="https://dovilo.app/llms.txt">` — legal pages
  included.
- **Working Markdown is not published.** Pages runs Jekyll, which turns any `.md` file into a public
  page. `_config.yml` excludes `CLAUDE.md`, `README.md`, the icon sources
  in `docs/brand/`, and `src/`, the page templates and strings,
  so Pages never serves a template; a new internal Markdown file goes on that list in the same
  commit.
- **Images no page references are not deployed.** `_config.yml` also excludes `screenshots/new/`
  (the full-frame sources) and every retired capture, which took the Pages artifact from 81 MB to
  14 MB (7 Nov 2026). They stay in the repository: exclude, do not delete. When a capture falls out
  of use, add it to the list, and name a file with its extension, since Jekyll excludes any path
  that starts with an entry: `screenshots/mobile-city` would also take
  `screenshots/mobile-city-26-772.webp`, which `/` uses. When a page starts using a listed image,
  take it off the list in the same commit, or it 404s in production while it works in a local
  preview.

### GEO — writing for answer engines

- `llms.txt` and `llms-full.txt` are **part of the deliverable, not documentation debt**. Any change
  to a page's facts — a price, a date, a feature, a platform, a page's purpose — is mirrored into
  both in the same commit.
- Keep the "things that are easy to get wrong" section at the end of `llms-full.txt` current. It is
  the correction list a model reads: bricks not coins; ambience has no music; agents read AI tasks
  only and cannot create or delete them, only cancel; since 2.0 agents use remote MCP from any
  machine and Desktop need not run; chat assistants propose and the user approves; desktop and
  Agents MCP need Pro; the two packs are one-time purchases included with Pro; focus sessions are
  free and unlimited; mobile 2.0.0 is on Google Play and the App Store since 27 Oct 2026; data
  export and Apply directly are on the roadmap, not shipped, with no date.
- **A page under 300 words of visible prose is a defect.** Give every section an intro saying what
  the thing is and why it works that way, so a cold reader and a quoting answer engine both get a
  complete statement. (`c703fa3`) `/docs/`, the hub of the two references, is the one accepted
  exception among indexable pages, and the `noindex` `/404.html` is outside the rule (§1.1).
- **Every claim must already be documented in the repo** — `llms.txt`, `llms-full.txt`, the FAQ or
  the page itself. Nothing unreleased gets a date. Do not invent capabilities, integrations, prices
  or platforms to make a section read better.
- No `meta keywords`, and no low-contrast "SEO content" block written for crawlers. If a fact is
  worth telling a crawler, write it into the page at readable contrast. (`74a0c8d`)

### Performance

- **No third-party origin in the critical path.** Inter is self-hosted from `/fonts/` as two
  variable woff2 files declared with `@font-face`, `font-display:swap` and `unicode-range`, with
  `/fonts/inter-latin.woff2` preloaded. Never add a Google Fonts link back. (`bdb41bd`)
- **The stylesheet is render-blocking by design. Leave it that way.** A Lighthouse or SEO audit
  will flag `system.css` under "eliminate render-blocking resources". That audit fires on any
  blocking stylesheet, it is not a defect here, and both of the usual remedies are regressions on
  this site. This call was already made once, in `39565c3` (for `base.css`, the stylesheet before
  `system.css`), and holds for `system.css` for the same reasons — do not spend a third afternoon
  on it:
  - **Never async-load `system.css`** through the `rel="preload" … onload="this.rel='stylesheet'"`
    pattern. It opens with `@font-face`, the reset, the tokens and the `body`/heading rules — it
    *is* the critical CSS. Deferring it paints the page unstyled and then reflows it, trading a
    render delay for a flash of unstyled content and a CLS spike.
  - **Never inline the design system as "critical CSS".** Every page, the blog's included, shares
    one cached copy of `system.css`. Inlining it re-sends that CSS with every page view, duplicates
    the single source of truth §1 exists to protect, and needs a build step the hand-written pages
    do not have.
  The measurements behind that decision, taken on `base.css` in `39565c3`, so nobody re-derives
  them: the stylesheet is same-origin, carries no `@import`, and sits around byte ~1075 of the
  document, so the preload scanner fetches it in parallel over the connection that just delivered
  the HTML. Compression is already at its floor and is not ours to tune: Pages sits behind
  Cloudflare, which answered an `Accept-Encoding: br` request for `base.css` with a low-quality
  7.9 KB body, larger than the 7.7 KB gzip it would replace.
- **No third-party runtime dependency.** `/docs/webhooks` loaded highlight.js from cdnjs until
  its move to `system.css` (29 Oct 2026). Its dark-only theme could not sit on the light
  `--surface`, and the design language's code block is themed like the page with no highlighting
  library, so it went. Do not add a highlighting library back. The two GitHub releases requests,
  `/changelog/`'s feed and `/downloads/`' Latest line, are not dependencies: each page reads in
  full on its static text when the request fails.
- Screenshots ship as **WebP**. Every content `<img>` carries descriptive alt text naming what is on
  screen, plus `width` and `height` so the box is reserved. The LCP image gets `fetchpriority="high"`
  and no `loading` attribute; everything below the fold gets `loading="lazy"`. Images whose CSS width
  varies get `srcset` + `sizes` matching the CSS. (`bdb41bd`, `a96eccd`)
- **Share cards stay PNG/JPG and must be a real 1200×630 file.** Never point `og:image` at a WebP,
  and never declare `og:image:width`/`height` the file does not have. The cards of the seven built
  pages and `/docs/` (`og-home.jpg`, `og-focus.jpg`, `og-plan.jpg`, `og-ai.jpg`, `og-pricing.jpg`,
  `og-downloads.jpg`, `og-docs.jpg`, and `og-<page>-<lang>.jpg` per language) are written by `npm run build:og`
  (`tools/build-og.mjs`) from the `<h1>` in the strings, in Inter from `/fonts/` (latin-ext as the
  fallback for ş, ğ, İ and the rest), with the cropped hero capture the template names; never edit
  them by hand. Run it when an `<h1>` or a named capture changes. The headline is drawn from
  Inter's outlines by `tools/og-type.mjs` (fontkit, wght 700, the h1's -0.025em tracking), never
  set through a system font lookup: Pango and fontconfig once resolved "Inter Bold" to a
  Helvetica-like fallback on some machines (7 Nov 2026), and `assertInter()` now fails the build if
  the type is not Inter. `/faq`'s English card is `og-faq.jpg`, like its languages'. `og-card.jpg`
  is the generic card (the blog indexes, `/docs/mcp/`, old shares): same file name, built by
  `build-og` with a fixed headline in the `phone` layout and the city capture.
- **The 2.1 captures come from `npm run build:captures`** (`tools/build-captures.mjs`, A131) and
  are never encoded by hand: the PNG sources stay full frame in `screenshots/new/`, the script
  crops the phones (rows 186 to 2582, box 386x767; the mixer 386x413), writes English to
  `screenshots/` and a language to `screenshots/<lang>/`, and with `--tinify` compresses them
  (`TINIFY_API_KEY` in `.env`, never in a note or a commit). `--lang en --screen 11` rebuilds one
  source after a re-take. The city is one file for every language. Older captures keep their PNG
  next to the WebP and the ffmpeg recipe in `README.md`. The icons are the exception (next rule).
- **Icons come from `docs/brand/` only.** `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`,
  `dovilo-logo.webp` (the nav logo) and `dovilo-icon.png` (the app icon square, the JSON-LD logo)
  are written by `npm run build:icons` from the brick D SVGs (A126), by scale and crop alone; never
  edit or redraw them by hand. They replaced `notify-icon.webp|png` on 31 Oct 2026, and those two
  URLs no longer resolve. The three glyph files use the glyph cropped to its ink plus a 1/16
  margin: the sources keep the app icon's safe area, and uncropped the glyph filled 69% of the
  favicon against 88% for the old icon and Gmail's (31 Oct 2026). Every page, `tools/template.mjs`
  and the design doc's head carry the same three tags after the theme boot script: the ICO with
  `sizes="32x32"`, then `favicon.svg`, then `apple-touch-icon.png`. Keep the `sizes`: without it
  Chrome (156, tested 31 Oct 2026) takes the ICO and never loads the SVG, whatever the tag order.
- Keep the theme boot script — the inline IIFE reading `localStorage['dovilo-theme']` and setting
  `data-theme` on `<html>` — inline in `<head>` before any painted content, on every page including
  generated blog pages.
- Before deleting CSS as dead, check it against every `class` attribute **and** every
  `classList`/`querySelector` call in the page, including classes only the blog generator emits.
  (`302b337`)

### The blog is generated

- **Never hand-edit anything between `<!-- BLOG:START -->` and `<!-- BLOG:END -->`.** Those regions
  live in `sitemap.xml`, `llms.txt` and `llms-full.txt` and are overwritten by
  `npm run build:blog`. The homepage has no such region since its redesign: it links the blog in
  one line, and the build no longer writes into `index.html`.
- `blog/index.html` and every `blog/<slug>/index.html` are build output. Edit `tools/template.mjs`
  (the shell) or the page bodies in `tools/build-blog.mjs`, and re-run the build; editing the HTML
  is silently reverted on the next publish.
- An index's sitemap `lastmod` (and a language copy's JSON-LD `dateModified`) is the later of its
  newest post's date and `pages.blog.updated` in that language's strings file. Change the index's
  own words (`h1`, `intro`, `count`, `rss`, `english`, `empty`) and bump that date in the same
  commit. The post count in its first paragraph comes from the build; never write it as a literal.
  `tools/config.mjs` no longer holds the index's copy.
- The blog workflow publishes from `main`. A template change merged from another branch reaches
  `blog/` only through a build: run `npm run build:blog` on the branch and commit its output, and
  expect `blog/` to conflict with any publish the workflow made on `main` in between. Resolve by
  taking either side and re-running the build.

---

## 3. Before you commit a page change

- [ ] Title / og:title / twitter:title / JSON-LD name still identical?
- [ ] Did visible text change? Then the JSON-LD mirroring it changed too.
- [ ] `sitemap.xml` lastmod bumped, and JSON-LD `dateModified` with it? (On a built page: `updated`.)
- [ ] One of the seven built pages? Edited in `src/`, `npm run build:pages` run (and
      `npm run build:og` if its `<h1>` changed), the output committed with the source.
- [ ] Facts changed? `llms.txt` and `llms-full.txt` updated in the same commit.
- [ ] New indexable page? Linked from the shared nav or footer, and in `sitemap.xml`.
- [ ] Every new `<img>`: alt, width, height, WebP, lazy unless above the fold.
- [ ] No new token, colour, font size or spacing outside `styles/system.css`.
- [ ] Only components from "Landing design language", visible words within the page's budget, and
      the doc's own checklist (its section 10) run.
- [ ] Both themes checked — dark and light — and the page still reads at 320px wide.

## 4. Known issues, not yet fixed

Carried here so they are not rediscovered from scratch:

- Seven `FAQPage` blocks compete: `/` (10 questions), `/faq` (28), `/ai` (5), `/plan/` (5), `/focus/` (4),
  `/pricing/` (4) and `/downloads/` (5). `/changelog/` dropped its three on 29 Oct 2026: they were not on the page as
  questions, and its `<h2>`s stay statements. Nine of the homepage's ten duplicate the FAQ page's ("How
  does Focus work?" is the exception), so a wording change there has to be made in four places plus
  `llms-full.txt`. On the built pages each place is a key in `src/strings/en.json`
  (`pages.home.faq`, `pages.faq.faq`, `pages.pricing.faq`); its JSON-LD follows by itself. `/pricing/`'s four are copied word for word from `/faq`, which made it the one
  exception to the rule below, approved in its task: "Is Dovilo free?", "How many AI tasks does Pro
  include?", "Do I need the Focus Ambience Pack?" and "How do I cancel my subscription?". All four
  are on `/` too, so a wording change to any of them is made on `/faq`, `/pricing/` and `/` (HTML
  and JSON-LD on each) plus `llms-full.txt`. Two more overlaps: `/ai`'s "Does my agent need Dovilo Desktop running?" covers
  the same ground as "Does my coding agent need Dovilo Desktop running?" on `/` and `/faq`, and its
  "Can an agent delete a task?" the ground of `/faq`'s "Can agents create or modify tasks I didn't
  authorize?", so keep those answers in agreement. Otherwise `/ai`, `/plan/`, `/focus/` and
  `/downloads/` ask questions worded nowhere else (checked 10 Nov 2026), which is the condition for adding an eighth. The eight questions `/ai` dropped
  in its redesign live on `/docs/mcp/#questions` as plain `<h3>`s with no `FAQPage`; keep it that
  way. One of them, "Can I get my data out?", covers the ground of `/faq`'s "Can I export my
  data?" (added 29 Oct 2026): both say not yet, on the roadmap, no date; keep them in agreement.
- `/changelog/`, `/docs/webhooks`, `/privacy`, `/terms` and `/licenses` ship no `og:image`.
- `/` has `og-home.jpg` and `/ai` has `og-ai.jpg`, the `<h1>` beside or over the hero capture; `/focus/` has
  `og-focus.jpg` and `/plan/` has `og-plan.jpg`, the `<h1>` beside the phone capture the template names.
  `/pricing/` has `og-pricing.jpg`, `/downloads/` has `og-downloads.jpg` and `/docs/` has
  `og-docs.jpg`: the page background and the `<h1>` in Inter 700, with no capture. All five are
  written by `npm run build:og`, and so are the Turkish cards (`og-<page>-tr.jpg`, `/tr/faq/`'s
  `og-faq-tr.jpg` included). The English `/faq` has `og-faq.jpg`. `/docs/mcp/` and `/blog/` keep
  `og-card.jpg` (the blog's through `SITE.defaultOgImage`, and a post's when it has no cover), and
  `/docs/webhooks`, `/changelog/` and the legal pages have none: their move to `system.css` was a
  style move.
- `twitter:image:alt` is on `/faq` (five languages), `/docs/mcp/` and the five blog indexes only;
  the other pages with an `og:image` carry `og:image:alt` alone. `/faq`'s alt is its `<h1>`, the
  string its card is drawn from, so it has no `ogAlt` key. `og-card.jpg`'s alt is
  `SITE.defaultOgImageAlt` (`tools/config.mjs`) with a copy in `docs/mcp/index.html`: change both
  with the headline in `tools/build-og.mjs`. A post with no cover would fall back to `og-card.jpg`
  with no alt; all 21 have covers today (7 Nov 2026). `/docs/mcp/` keeps `twitter:card` `summary`
  and no `twitter:image`.
- `hero.jpg`, the 2.0 dark 3D illustration, is referenced by no page, template or tool since
  `og-card.jpg` moved to the light palette (7 Nov 2026). It stays as a file in the repository and
  is not deployed (§2, Crawlability).
- `/licenses` is 154 words, under the 300-word floor; it is `noindex`, and its text changes only
  word for word (§1.2).
- `/changelog/` and `/downloads/` call `api.github.com` on page view (§1.1), which hands the
  visitor's IP and user agent to GitHub before any click. `/privacy` §5 lists the services Dovilo
  shares data with and GitHub is not among them; the text changes only from wording a task gives
  (§1.2).
- Post bodies in Sanity still carry pre-2.0 sentences, Title Case headings, headings with an em
  dash and in-page links that match no heading. The blog build warns about the em-dash headings and
  the dead links on every run. All of it is fixed in Sanity, not here.

## Dovilo task protocol

Work comes in as Dovilo AI Tasks in the Dovilo Landing project, through the `dovilo` MCP server (https://dovilo.app/mcp/agents, configured in `.mcp.json`).

- When Selahaddin says "check Dovilo", fetch the queued tasks in your project and take the approved task with the oldest creation time, regardless of the order the server returns. Use the agent tools as their descriptions say, and claim the task before you start.
- The task context is Selahaddin's instruction. Claude wrote it in the project chat and he approved it in the app. If it conflicts with CLAUDE.md or the analysis doc, or looks wrong, stop and ask in the terminal. Don't guess.
- One task at a time. Write your report in the terminal and in the task's notes (Markdown), then set the final status. If you need a decision, say so in the notes and stop.
- Go rule: an approved task is Selahaddin's go for the pushes and merges it names explicitly. Prod deploys, prod writes and anything irreversible still need "go" typed by him in the terminal. Never force-push to main/master.
- Never put secrets, keys or tokens in a task note.
