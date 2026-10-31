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

Pages reference `.webp`; the `.png` files next to them are the lossless sources, kept so the
variants can be regenerated. The screenshots on `/` and `/ai`
carry `srcset`/`sizes`, whose candidate widths are named in the filename (`-193`, `-700`,
`-772` … ); keep each `sizes` equal to the width the CSS actually renders, or a 1x screen picks a
smaller file and stretches it. A phone shot drawn wider than 193px (288px on `/ai`) adds a `-772`
variant for 2x screens. A phone screen that the app draws differently in its dark theme also has a dark
twin with the same crop, named with `-dark` before any width suffix (`mobile-ai-inbox-dark.webp`,
`mobile-ai-inbox-dark-772.webp`); the page pairs the two in a `<picture>` and shows the one that
matches its theme (see the Figure section of the design doc). The sources of both sets are in
`screenshots/new/mobile/light/` and `screenshots/new/mobile/dark/`. Desktop captures work the same
way (`desktop-ai-dark-2000.webp`), with their sources in `screenshots/new/desktop/light/` and
`screenshots/new/desktop/dark/`. The dark desktop set was captured at 2874x1866 against the light
set's 2844x1846, so it is scaled to the light file's size first, never cropped, and every width
variant then has its light twin's exact `width`/`height`.
To add or replace a screenshot, drop the PNG in [`screenshots/`](screenshots/) and re-encode it
with ffmpeg:

```bash
# Quality 80 for the busy city render, 88 elsewhere.

# A phone capture at full size (1206px PNG): the 386w and 772w pair the
# redesigned pages use. A dark twin takes the same commands with -dark before
# the width suffix (mobile-x-dark.webp, mobile-x-dark-772.webp).
ffmpeg -i screenshots/mobile-x.png -vf scale=386:-2:flags=lanczos -c:v libwebp -quality 88 -compression_level 6 screenshots/mobile-x.webp
ffmpeg -i screenshots/mobile-x.png -vf scale=772:-2:flags=lanczos -c:v libwebp -quality 88 -compression_level 6 screenshots/mobile-x-772.webp

# A desktop capture: scale the source to the light file's size (desktop-ai.png
# is 2764x1794, the others 2844x1846), then the four widths at the light
# variants' exact heights. Shown for the dark twin of desktop-ai. The dark
# captures have no alpha: the corners outside the rounded window are pure black,
# which occurs nowhere else in them, so colorkey makes exactly those transparent,
# as the light captures are.
ffmpeg -i screenshots/new/desktop/dark/desktop-01-ai-tasks.png -vf "format=rgba,colorkey=0x000000:0.0001:0,scale=2764:1794:flags=lanczos,format=rgba" -pred mixed -compression_level 9 screenshots/desktop-ai-dark.png
for wh in 700x454 1000x650 1400x908 2000x1298; do ffmpeg -i screenshots/desktop-ai-dark.png -vf scale=${wh%x*}:${wh#*x}:flags=lanczos -c:v libwebp -quality 88 -compression_level 6 screenshots/desktop-ai-dark-${wh%x*}.webp; done

# An older 386px PNG: encode it at its own size, plus the 1x variant for the
# old pages' phone slots (~193 CSS px wide)
ffmpeg -i screenshots/mobile-x.png -c:v libwebp -quality 88 -compression_level 6 screenshots/mobile-x.webp
ffmpeg -i screenshots/mobile-x.png -vf scale=193:-2:flags=lanczos -c:v libwebp -quality 88 -compression_level 6 screenshots/mobile-x-193.webp
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
Only `en.json` exists today, so none of that shows yet. `npm run build:pages -- --check` writes
nothing and fails if any page is out of step with `src/`.

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
`fonts/*.woff2` to TrueType in the temp folder for sharp. `/faq` keeps `og-card.jpg` in English.
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
