# Dovilo — Landing site

Source for **[dovilo.app](https://dovilo.app)**, the marketing and documentation site for
[Dovilo](https://dovilo.app) — a to-do list, focus timer and city builder for iOS, Android,
Windows and macOS, with two remote MCP servers: one that lets AI coding agents work through tasks
you write for them, and one that lets chat assistants propose plans you approve.

The app itself is closed source; this repository is the public website only.

## Pages

| Path | What it is |
| --- | --- |
| [`/`](https://dovilo.app) | The homepage, on the design system: what Dovilo is, how it works, focus, the city, the price and ten questions in about 420 visible words |
| [`/ai`](https://dovilo.app/ai/) | The developer page, on the design system: the agent layer in about 400 visible words, the depth on `/docs/mcp` |
| [`/docs`](https://dovilo.app/docs/) | The developer docs entry page, on the design system: the two MCP servers and webhooks in short, the two references and five deep links, in under 150 visible words |
| [`/docs/mcp`](https://dovilo.app/docs/mcp/) | MCP reference, on the design system: endpoints, auth, client setup, all 22 tools, statuses, scheduling, approval rules, planning from chat assistants, upgrading from 1.8, developer questions |
| [`/docs/webhooks`](https://dovilo.app/docs/webhooks/) | Signed webhook events, on the design system: delivery modes, payload schema, signature verification, retry policy |
| [`/pricing`](https://dovilo.app/pricing/) | The canonical prices, on the design system: Free and Pro side by side, the one-time purchases, managing the subscription and four questions in about 310 visible words; it owns the `offers` JSON-LD |
| [`/downloads`](https://dovilo.app/downloads/) | App Store, Play Store and desktop installers, on the design system in about 80 visible words, with the depth in collapsibles; accepts `?source=` from the app and the MCP servers |
| [`/changelog`](https://dovilo.app/changelog/) | Release notes per platform, on the design system, plus the roadmap (data export, Apply directly); adds a newer desktop build from the releases repo when the page opens |
| [`/blog`](https://dovilo.app/blog/) | Posts, generated from Sanity onto the design system — see [The blog](#the-blog) |
| [`/faq`](https://dovilo.app/faq/) | 28 questions in six groups, on the design system: tasks, focus, ambience, the city, Pro, MCP and data |
| [`/privacy`](https://dovilo.app/privacy/) · [`/terms`](https://dovilo.app/terms/) · [`/licenses`](https://dovilo.app/licenses/) | Legal and third-party attributions, on the design system; the text changes only word for word |
| `/404.html` | The page GitHub Pages shows, with status 404, at any address that has no file: on the design system, `noindex`, with the shared nav and footer and five links to try |

## Stack

Static HTML, no framework. Most pages are hand-written; the build steps are [`/blog`](#the-blog),
the [five pages built from `src/`](#the-built-pages), their [share cards](#share-cards) and the
[icons](#icons), and all of their output is committed — each page
is a single `index.html` with its structured data in `application/ld+json` blocks, except
[`404.html`](404.html) at the root, which has no structured data. Every page links
the one design-system stylesheet, [`styles/system.css`](styles/system.css), and carries no CSS of
its own. Nothing is fetched from a third party: Inter is self-hosted from [`fonts/`](fonts/) as a
variable `woff2` declared with `@font-face`, so no third-party stylesheet blocks the first paint.
Blog pages are generated to the same shape and committed, so they are served the same way —
nothing about a post is fetched in the browser either.

Light and dark themes are CSS custom properties, with the choice stored in `localStorage` and
applied before first paint so there is no flash.

[`docs/design-language.md`](docs/design-language.md) is the design spec,
[`styles/system.css`](styles/system.css) implements it, and `/styleguide/` (not indexed, not
linked) renders every component in both themes. The redesign moved every page onto it, one at a
time; the stylesheets before it, `styles/base.css` and `styles/home.css`, are gone.

### Screenshots

Pages reference `.webp`. The captures on `/` and `/ai` (the 2.1 set, A131) are written by
`npm run build:captures` ([`tools/build-captures.mjs`](tools/build-captures.mjs)) from the PNG
sources in `screenshots/new/`, which stay full frame for the stores:

- `screenshots/new/mobile/{light,dark}/<lang>-NN.png`, 1206x2622 (09, the ambience mixer, is
  cropped at the source to 1206x1290), and `city.png` in both themes: the city has no text, so one
  capture serves every language.
- `screenshots/new/desktop/<lang>/{light,dark}/desktop-NN-<name>.png`, 2844x1846 in both themes,
  with transparent corners.

The script maps each site name to its screen (`mobile-ai-inbox` 01, `mobile-ai` 02,
`mobile-ai-done` 05, `mobile-list-birthday` 07, `mobile-focus-rain` 08, `mobile-ambience-mixer` 09,
`mobile-ai-new-task` 11, `mobile-ai-proposal` 12, `mobile-ai-running` 13, `desktop-ai` desktop-01,
`mobile-city-26` the city) and writes English to `screenshots/` and every other language with a
strings file to `screenshots/<lang>/` under the same names; the city is written once, to
`screenshots/`, and every language links it there. Phone captures are cropped below the status bar
and above the home indicator (rows 186 to 2582, box 386x767; the mixer keeps its 386x413) and
written at 386w and 772w; the city at 386w, 576w and 772w; desktop at 700w to 2000w with its alpha.
WebP q88 (the city q80). A dark twin is named with `-dark` before any width suffix
(`mobile-ai-inbox-dark-772.webp`), and the page pairs the two in a `<picture>` (the Figure
section of the design doc). Keep each `sizes` equal to the width the CSS renders.

```bash
npm run build:captures                              # every capture, every language
npm run build:captures -- --lang en --screen 11     # one source after a re-take (en-11, both themes)
npm run build:captures -- --tinify                  # then compress with the Tinify API
```

`--tinify` reads `TINIFY_API_KEY` from the environment or the gitignored `.env`, keeps each result
only when it is smaller, and prints the bytes before and after; the free tier is 500 compressions a
month and a full run of English and Turkish is 91. Older captures not in the 2.1 set (the
`styleguide/` samples `mobile-tasks.webp` and `mobile-focus.webp`, among others) keep their PNG
next to the WebP and the ffmpeg recipe:

```bash
ffmpeg -i screenshots/mobile-x.png -vf scale=386:-2:flags=lanczos -c:v libwebp -quality 88 -compression_level 6 screenshots/mobile-x.webp
ffmpeg -i screenshots/mobile-x.png -vf scale=772:-2:flags=lanczos -c:v libwebp -quality 88 -compression_level 6 screenshots/mobile-x-772.webp
```

Share cards (`og:image`, `twitter:image`) stay on PNG/JPG — social crawlers are unreliable with WebP.

### Icons

The icon is the app's own, the flat brick D, kept as four SVGs in [`docs/brand/`](docs/brand/):
the square with its `#161B1D` field, the mark, the glyph (the mark without mortar, for anything
under 48px) and the glyph in white. Jekyll leaves the folder off the site. Every icon file the site
serves is rasterised from those sources, by scale and crop alone, with one command:

```bash
npm run build:icons     # tools/build-icons.mjs, through sharp
```

| File | From | Size | Used by |
| --- | --- | --- | --- |
| `favicon.ico` | tight glyph | 16, 32, 48 | the fallback `rel="icon"` |
| `favicon.svg` | tight glyph, the source with only its viewBox changed | any | `rel="icon"` in browsers that read SVG |
| `apple-touch-icon.png` | square, opaque | 180 | `rel="apple-touch-icon"`, the iOS home screen |
| `dovilo-logo.webp` | tight glyph, transparent | 96 | the nav logo, shown at 32 (3x) on both themes |
| `dovilo-icon.png` | square, opaque | 512 | the app icon as the `Organization` and `publisher` logo in the JSON-LD |

The sources keep the app icon's safe area, where the glyph covers about two thirds of its square.
The "tight glyph" crops that square to the glyph's ink plus a 1/16 margin on each side, so it fills
88% of a favicon or the nav logo's box. The square keeps its safe area, because iOS and search
results show it as a tile. The logo and the icon have different names because they are different
images, not one image in two formats. Change a source, re-run the command and commit what it writes.

## The built pages

`/`, `/ai`, `/pricing/`, `/downloads/` and `/faq` are built from `src/`, so they can ship in
English, Turkish, Spanish, French and German from one template each. Their `index.html` files are
output: edit `src/`, never the page.

```
src/pages/<page>.html       markup, figures and JSON-LD skeleton of home, ai, pricing, downloads, faq
src/strings/<lang>.json     every string a person or a crawler reads on them, per page, plus the
                            shared ones (nav, footer, store badges, the offers / and /pricing/ share)
src/partials/               nav (with the language menu), footer, site script; the blog uses them too
tools/pages-lib.mjs         the renderer, the language list and the page list
tools/build-pages.mjs       renders every page in every language that has a strings file
```

`npm run build:pages` writes English to the paths the site has always had (`index.html`,
`ai/index.html`, …) and any other language with a strings file under its prefix
(`tr/index.html`, `tr/ai/index.html`, …). It also writes each page's `lastmod` into
[`sitemap.xml`](sitemap.xml) from the page's `updated` string, and, for a page in more than one
language, the localised sitemap entries, hreflang, `og:locale:alternate` and the language menu.
`en.json` and `tr.json` exist, so the ten pages carry hreflang (`en`, `tr`, `x-default`) and the
language menu, and `sitemap.xml` lists `/tr/…` a priority step under English. A language copy's
store and installer links carry the language (`ct=…_tr`, `hl=tr&utm_content=tr`,
`source=…_tr`), and its JSON-LD leaves the full `SoftwareApplication`, the `Organization` and the
`WebSite` to English (CLAUDE.md §1.3). A strings file other than English is committed as placed:
the build reports a key that fails its checks, nobody rewrites the translation.
`npm run build:pages -- --check` writes nothing and fails if any page is out of step with `src/`.

Strings are HTML as it appears in the page (`&amp;`, inline `<a>`, `<code>`, `<strong>`); a
translation keeps every tag, attribute and `{{href.*}}`, or the build stops. JSON-LD reads the same
strings with the tags stripped, so the FAQPage answers are the visible ones. Templates use
`{{t.key}}` for the page's strings, `{{c.key}}` for the shared ones, `|json` and `|js` for
JSON-LD and the page scripts, `{{> partial}}`, `{{#if}}` and `{{#each}}`; the syntax is described
at the top of `tools/pages-lib.mjs`.

### Share cards

`npm run build:og` writes the 1200x630 share cards of the built pages and `/docs/`:
`og-home.jpg`, `og-ai.jpg`, `og-pricing.jpg`, `og-downloads.jpg`, `og-docs.jpg`, and
`og-<page>-<lang>.jpg` for every other language. Each is the page's `<h1>` in Inter 700 on the
light background, with the hero capture its template names in its first line
(`{{! card: layout=… captures=… }}`): `text` (the h1 alone), `split` (the h1 beside two phone
screens) or `top` (the h1 over the desktop screen). Long text wraps, then drops one size step, then
is clipped to whole lines with a warning. The font is the site's own: `tools/woff2.mjs` decodes
`fonts/*.woff2` to TrueType in the temp folder for sharp, with latin-ext as the fallback for
Turkish (and later French and German) letters. The line height is set from Pango's measured line
pitch for Inter, which differs between machines (1.27 em on one, 1.01 em on another), so the cards
keep a 1.2 line height wherever they are built. `/faq` keeps `og-card.jpg` in English.
`npm run build:og -- --check` writes nothing and fails if a card is out of date. It compares JPEG bytes, which
depend on the sharp and libvips build: on another OS or after a sharp upgrade every card may differ
without a change, so regenerate and look at them rather than trusting the check across machines.
Run `build:og` before `build:pages` when a language is added: a page will not point `og:image` at a
card that does not exist.

## The blog

Posts live in [Sanity](https://sanity.io) (project `3unyshld`, dataset `production`) and are
rendered to static HTML here, at publish time. Nothing is fetched in the browser: a crawler — search
engine or model — gets the whole post in the first response, with its own meta tags, `BlogPosting`
JSON-LD and share card. That is the entire reason for the build step.

```
tools/config.mjs       project, origin, blog paths and page size
tools/template.mjs     the page shell: system.css, a copy of the hand-written pages' head, and the nav, footer and site script from src/partials/
tools/build-blog.mjs   fetch → render → write
studio/                Sanity Studio: the schema, and the editor at dovilo.sanity.studio
```

`npm run build:blog` writes `blog/index.html`, `blog/<slug>/index.html`, `blog/feed.xml` and
`blog/media/`, then rewrites the block between `<!-- BLOG:START -->` and `<!-- BLOG:END -->` in
[`sitemap.xml`](sitemap.xml), [`llms.txt`](llms.txt) and [`llms-full.txt`](llms-full.txt). The
homepage links the blog in one line and is not touched. Everything it writes is committed. Unpublish a post in Sanity and
the next build deletes its directory.

### Writing a post

A post is a document with a `slug`, a `publishedAt` in the past, and a **Markdown** body in
`markdownBody`. Markdown, not Portable Text, on purpose: Portable Text has no table block, and
exporting to it drops tables and turns most inline links into plain text.

- `## headings` get GitHub-style ids, so a list of `[Section](#section)` links at the top of the
  body renders as a table of contents whose anchors resolve.
- Tables, lists, code fences, `---` rules and bold render as the design system's components (Post in
  [`docs/design-language.md`](docs/design-language.md)): the build wraps a table in `.table-wrap`, a
  code fence in a code block and an image that stands alone in a figure, and the post column is the
  measure.
- A cover image goes in `mainImage`, with alt text. Images on the Sanity CDN are pulled into
  `blog/media/` as WebP at build time (plus a 1200×630 JPEG for share cards, because social
  crawlers are unreliable with WebP); anything hosted elsewhere stays remote and the build says so.
- `publishedAt` in the future holds the post back until a later build — the workflow's daily run
  releases it.

The build refuses to guess: any document with a slug and a publish date but no `markdownBody` is
listed by name at the top of the run, rather than quietly skipped.

### Publishing

Sanity is the trigger; nobody touches the repository:

```
Publish in Sanity → webhook → repository_dispatch → .github/workflows/blog.yml
                  → npm run build:blog → commit to main → GitHub Pages
```

Roughly 40 seconds end to end. The workflow also runs daily at 06:17 UTC as a safety net, and can be
started by hand from the Actions tab.

Setting up the webhook, once: **Sanity Manage → API → Webhooks → Create**

| Field | Value |
| --- | --- |
| URL | `https://api.github.com/repos/Dovilo-App/dovilo-landing/dispatches` |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "post"` |
| HTTP method | `POST` |
| HTTP headers | `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`, `User-Agent: dovilo-sanity-webhook` |
| Projection | `{"event_type": "sanity-publish"}` |

The token is a GitHub fine-grained PAT scoped to this repository with **Contents: read and write**.

The dataset is public, so the build needs no credentials. If it is ever made private, add a Sanity
read token as the `SANITY_READ_TOKEN` repository secret — the workflow already passes it through.

### Studio

```bash
cd studio
npm install
npx sanity login
npx sanity deploy      # → https://dovilo.sanity.studio
```

The schema in [`studio/schemaTypes/post.js`](studio/schemaTypes/post.js) and the query in
[`tools/build-blog.mjs`](tools/build-blog.mjs) share the same field names. Rename a field in one and
the other stops seeing it.

### Previewing locally

```bash
npm run build:blog                              # against the live dataset
BLOG_FIXTURE=posts.json npm run build:blog      # against a local JSON file, no network
```

The fixture takes the same shape the query returns — useful for working on the template without
publishing anything. Remember to run the real build before committing, or the fixture's posts end up
in the repository.

## Local preview

Any static file server works; the pages use extensionless internal links, so serve from the repo
root rather than opening files directly:

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Deploy

GitHub Pages serves `main` at the apex domain in [`CNAME`](CNAME). Pushing to `main` publishes;
there is no build or CI step in between. The blog reaches `main` the same way — the workflow commits
the generated pages, Pages publishes the commit — so a broken build or an unreachable Sanity leaves
the published site exactly as it was.

## For language models

The site is meant to be crawled and quoted. [`robots.txt`](robots.txt) allows every major search
and AI crawler, and two structured summaries are published for models that would rather read prose
than parse markup:

- **[llms.txt](https://dovilo.app/llms.txt)** — one-page overview
- **[llms-full.txt](https://dovilo.app/llms-full.txt)** — full reference: features, pricing, FAQ, MCP tools, webhook payloads

Both carry a `## Blog` section that the blog build keeps current, and every post is in
[`sitemap.xml`](sitemap.xml) and the RSS feed at [`/blog/feed.xml`](https://dovilo.app/blog/feed.xml).

## Related repositories

- **[dovilo-desktop-releases](https://github.com/Dovilo-App/dovilo-desktop-releases)** — installers and the auto-update feed for Dovilo Desktop
- **[dovilo-langgraph-demo](https://github.com/Dovilo-App/dovilo-langgraph-demo)** — working LangGraph receiver that drives a Claude agent through Dovilo webhooks and MCP

---

[Website](https://dovilo.app) · [AI & MCP](https://dovilo.app/ai/) ·
[Changelog](https://dovilo.app/changelog/) · [X](https://x.com/doviloapp)

Built by [Selahaddin Akgün](https://sakgun.com) in Istanbul.
