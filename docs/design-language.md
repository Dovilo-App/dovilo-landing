# Dovilo design language

The one design reference for dovilo.app. A page task that says "follow docs/design-language.md"
means: build the page from the tokens and components below, inside the word budget, with the GEO
layer intact. Nothing else about design needs saying.

- **Stylesheet:** [`styles/system.css`](../styles/system.css) implements this document and nothing
  else.
- **Live reference:** `/styleguide/` (source: `styleguide/index.html`) renders every component in
  both themes with real copy. It is `noindex`, not in the sitemap and linked from nowhere, so this
  document names it without linking it.
- **Rule:** a page may only use components this document has. A page that needs something new adds
  it here first, then to `system.css`, then to `/styleguide/`, in the same commit.

The redesign moved the pages over one task at a time (`/ai`, `/`, a new `/pricing`, then
`/downloads`, `/faq`, `/docs/*` and `/changelog`, and last `/privacy`, `/terms`, `/licenses` and the
blog pages that `tools/template.mjs` renders). Every page is on this system now, and the old
`styles/base.css` is gone with its rules.

---

## 1. Principles

1. **One claim, one proof per section.** A section says one thing in its heading and one sentence,
   then proves it with a real screenshot, a code block or a short list. A paragraph is not a proof.
2. **Visible text is short; machine-read text stays complete.** Depth moves into `<details>` on the
   same page, into `/faq` and `/docs/*`, and into `llms-full.txt`. It is never deleted to hit a
   budget (see section 7).
3. **Same components on every page.** No page-specific CSS, no `<style>` block, no inline styles.
4. **Nothing decorative.** No gradients, glassmorphism, blur, shadows (a modal is the one exception,
   and the site has none today), icon grids, counter strips, illustrations or isometric renders in
   a hero. Lines are 1px borders.
5. **Two themes, equal quality.** Every component is checked in light and dark before it ships.

## 2. Tokens

All tokens live in `styles/system.css`. A page never declares a token, a colour, a size or a
spacing value of its own.

### Colour

Five neutrals per theme and one accent. There are no alphas: every colour on a page is one of these.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--bg` | `#F7F8F8` | `#161B1D` | Page background |
| `--surface` | `#FFFFFF` | `#1E2427` | Code blocks, collapsibles, notes, the backing behind screenshots |
| `--border` | `#D5DADC` | `#2F373A` | Every rule, divider and outline, always 1px |
| `--text-muted` | `#5B656A` | `#9AA3A7` | Support text, captions, dates, the second half of a line list |
| `--text` | `#161B1D` | `#E8EAEB` | Headings, body text, links |
| `--accent` | `#D4880A` | `#D4880A` | Primary button fill and the 01-04 numerals, nothing else |
| `--on-accent` | `#161B1D` | `#161B1D` | Text on the accent |

Contrast (WCAG 2.x): `--text` on `--bg` is 16.3:1 light and 14.4:1 dark; `--text-muted` on `--bg` is
5.6:1 and 6.8:1; `--on-accent` on `--accent` is 6.1:1. The accent itself reads at only 2.7:1 on the
light background, so **the accent is never a text colour**. It is always a fill with `--on-accent`
text on it. That is why links are `--text` with an underline, not amber, and why the numerals are
amber chips rather than amber digits. Hover adds no colour either: a primary button's outline turns
`--text`, a secondary one's `--text-muted`.

`#D4880A` is the amber the site has used from the start, mirroring the app's tokens. `#161B1D` is the app's dark background and the site's `theme-color`.

### Type

One family: **Inter**, self-hosted from `/fonts/` (already in the repo), falling back to the system
stack. Code is the system monospace stack. No other webfont, ever.

| Token | Size | Used for |
| --- | --- | --- |
| `--text-hero` | 36px to 56px: `clamp(2.25rem, 1.5rem + 3vw, 3.5rem)` | The page's `<h1>` |
| `--text-h2` | `clamp(28px, 24px + 1vw, 32px)` | Section headings |
| `--text-h3` | `20px` | Feature and step headings, the hero sub |
| `--text-body` | `17px` | Body text, FAQ questions |
| `--text-small` | `14px` | Captions, dates, nav, buttons, footer, tables |
| `--text-code` | `14px` mono | Code blocks and inline code |

Sizes are declared in `rem` (17px is `1.0625rem`) so a reader's browser font setting still scales
them. That is also why the hero's fluid size carries a `rem` term rather than the plain `5vw` the
brief sketched: a size made of `vw` alone ignores text zoom. Line height is **1.15** for headings and **1.55** for body. A line of text is at most
**64ch** (`--measure`). Headings are **sentence case**: "Connect a coding agent", not "Connect A
Coding Agent". Weights: 700 for the `<h1>`, 600 for other headings, labels and buttons, 400 for body.

### Space, size and shape

An 8px grid with no half steps.

| Token | Value | Token | Value |
| --- | --- | --- | --- |
| `--space-1` | 8px | `--space-5` | 48px |
| `--space-2` | 16px | `--space-6` | 64px |
| `--space-3` | 24px | `--space-7` | 96px |
| `--space-4` | 32px | | |

- **Section padding** (`--section-y`): 96px top and bottom, 64px below 768px.
- **Container** (`--container`): 1080px of content, plus the **gutter** (`--gutter`) on each side:
  24px, 16px below 768px.
- **Radius** (`--radius`): 8px everywhere. Inline code uses half of it.
- **Borders:** 1px `--border`. Never thicker, never coloured.
- **Breakpoints:** 768px (one column below it, nav folds), plus 600px and 960px where a grid needs
  an intermediate step (steps, facts list).

### Motion

Only hover and focus change anything: colour and border colour, over 150ms (`--duration`). No
scroll animation, no smooth scrolling, no entrance effects, no pulsing dots. Opening a `<details>`
is instant. `prefers-reduced-motion: reduce` drops even the hover transitions.

## 3. Page skeleton

Every redesigned page has this head, in this order, and this body frame.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Topic, keyword first - Dovilo</title>
  <meta name="description" content="… 150 characters at most …">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://dovilo.app/…">
  <link rel="alternate" type="text/markdown" href="https://dovilo.app/llms.txt" title="llms.txt: structured summary for language models">

  <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles/system.css">

  <!-- Open Graph and Twitter: four copies of the title, see CLAUDE.md -->

  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#F7F8F8" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#161B1D" media="(prefers-color-scheme: dark)">
  <script>
    /* Runs before paint: an explicit choice wins, otherwise the OS decides. */
    (function(){
      try{
        var t = localStorage.getItem('dovilo-theme');
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
      }catch(e){}
    })();
  </script>
  <link rel="icon" href="/favicon.ico" type="image/x-icon">

  <!-- JSON-LD: page type, BreadcrumbList (not on /), and the shared #app node where relevant -->
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <!-- nav -->
  <main id="main">
    <!-- hero, then sections -->
  </main>
  <!-- footer -->
  <!-- site script -->
</body>
</html>
```

The stylesheet is render-blocking on purpose, for the reasons `CLAUDE.md` gives under
Performance: never async-load it and never inline it.

### Site script

One inline script at the end of `<body>`, identical on every page: the theme toggle, the mobile
menu, the copy buttons (clipboard API, a textarea fallback, a visible "Copy failed"), the email
links and the dark captures of figures (section 5, Figure). Copy it from `styleguide/index.html`
verbatim. It keys on these names, which are therefore a contract: `.theme-toggle`, `.nav-menu`
(with `aria-controls`), `.nav-links.open`, `.copy-btn`, `.copy-btn.copied`, `.code`, `a.mail` with
`data-u`/`data-d`, and `source.src-dark`. A copy button's label is plain
text. The theme choice is stored in `localStorage['dovilo-theme']`, the same key the old pages use,
so a visitor's choice follows them across both systems.

### Page scripts

A page may keep a behaviour it already has, in a second inline script after the site script: the
changelog's live GitHub releases fetch, the platform detection on `/downloads`, the
table-of-contents highlight on `/docs/mcp/` and `/docs/webhooks`. Its class names stay a contract
(`CLAUDE.md` §1.1 lists them). A page script never styles anything and never builds content a
crawler should read. If the behaviour needs a visual part this document does not have, that part
is added here first, like any other component. The release feed's visual part is the release
entry and the platform detection's the highlighted card of the download boxes (both section 5);
the table of contents' is the reference layout (section 4).

## 4. Layout

### Section

The unit of a page. One claim (an `<h2>` and at most one sentence), one proof.

```html
<section class="section" id="focus">
  <div class="container">
    <div class="section-head">
      <h2>Focus that fills the whole screen</h2>
      <p>Single sessions, Pomodoro cycles or a session bound to one task, free and unlimited.</p>
    </div>
    <!-- one proof: a figure, a code block or one of the lists below -->
  </div>
</section>
```

Consecutive sections are separated by a 1px rule, and so are the hero and the section after it.
Components stacked inside one section (a code
block and a collapsible, a table and a note) sit 24px apart without any extra markup. Give a section
an `id` whenever anything links to it, and keep every `id` the old page had (section 7).

**In short:** when the hero sub is one line, the section straight after the hero carries the GEO
paragraph (section 7) under the `<h2>` "In short", with no proof. `/ai` and `/` do this.

```html
<section class="section" id="about">
  <div class="container">
    <h2>In short</h2>
    <p>Dovilo is a free to-do list for iOS and Android with … Pro is $2.49 a month.</p>
  </div>
</section>
```

### Split

Claim beside proof, for a phone screenshot or a short code block. Two equal columns from 768px,
stacked below.

```html
<div class="split">
  <div class="section-head">…</div>
  <figure class="figure figure-phone">…</figure>
</div>
```

**Figure row:** when the claim needs two phone screens, each with its own caption, the proof side
of a split holds a `figure-row`: the two figures side by side at any width, at most 480px together,
so each screen stays at most 228px wide.

```html
<div class="split">
  <div class="section-head">…</div>
  <div class="figure-row">
    <figure class="figure">…</figure>
    <figure class="figure">…</figure>
  </div>
</div>
```

### Flow

Running text on the pages that carry depth (`/faq`, `/docs/*`, `/changelog`, `/privacy`, `/terms`,
`/licenses` and blog posts). Spaces paragraphs, lists and sub-headings on the grid. Plain `<h2>`,
`<h3>`, `<h4>`, `<p>`, `<ul>`, `<ol>`, `<hr>`, `<blockquote>` and `<code>` inside it need no
classes. An `<hr>` is a 1px rule 48px clear of both sides, the heading after it included; an `<h4>`
is set at the body size; a `<blockquote>` is `--text-muted` with a 1px rule on its left. Only blog
posts use those three today, from Markdown in Sanity.

```html
<div class="container flow">
  <h2>Authentication</h2>
  <p>…</p>
  <ul><li>…</li></ul>
</div>
```

### Measure column

A document read top to bottom (the legal pages, a blog post) holds its whole flow to the measure
with `measure`, so the heading, a figure, a table and a rule line up with the text instead of
running out to the container's edge. It sits inside the container, which keeps the gutters and
the left edge every other page has. Its `64ch` resolves at the body size, so a large heading
inside it wraps rather than widening it.

```html
<section class="section">
  <div class="container"><div class="flow measure">
    <h1>Privacy Policy</h1>
    <p class="meta">Last updated: 20 October 2026</p>
    <p>…</p>
  </div></div>
</section>
```

The legal pages are one such section: the `<h1>`, the meta line, then the text as it was written,
in the order and the elements it was written in. On `/licenses` each list is a table (section 5).

### Post

A blog post, written by `tools/build-blog.mjs` from Sanity through `tools/template.mjs`; neither the
markup nor the copy below is edited by hand in `blog/`. The post is one `<article class="section">`
holding a measure column: the title as the `<h1>`, a meta line (date, reading time, author, then
the tags when a post has any), the cover in a figure, the table of contents in a closed
collapsible, then the body. A More posts nav and the closing CTA follow as sections of their own.

The body is the post's Markdown and takes no classes: the flow spaces it, and the build maps what
Markdown makes onto components. A table goes in `.table-wrap` as a `.table`; a code fence becomes
a code block without a head (read, not copied); an image alone in its paragraph and at least as
wide as the column becomes a figure (a narrower one keeps its own size, since a figure fills the
column); a list of in-page links at the very top becomes the table of contents, which the RSS feed
keeps as an open list.

The cover is the post's own image from Sanity, often an illustration: the Figure rule on real
screenshots holds for the site's pages, while a post's images are its content and are fixed in
Sanity. The cover is the LCP image (`fetchpriority="high"`, no `loading`); images in the body are
lazy. The column is 686px, or the screen less its gutters below 718px, so a post image's `sizes`
is `(max-width:718px) calc(100vw - 32px), 686px`. The More posts nav is a link list (section 5):
the older post as Previous, all posts, the newer post as Next, as many of the three as exist. The
closing CTA has the one primary button.

```html
<article class="section">
  <div class="container"><div class="flow measure">
    <h1>Task management for AI coding agents: a Dovilo MCP setup guide</h1>
    <p class="meta"><time datetime="2026-09-21T19:29:13.447Z">21 September 2026</time> · 9 min read · Selahaddin Akgün</p>
    <figure class="figure"><img srcset="…" sizes="…" src="…" width="760" height="…" fetchpriority="high" alt="…"></figure>
    <nav aria-label="On this page">
      <details class="collapsible">
        <summary>On this page</summary>
        <div class="collapsible-body"><ul><li><a href="#the-problem-agents-lose-the-thread-between-sessions">The problem: agents lose the thread between sessions</a></li> …</ul></div>
      </details>
    </nav>
    <p>…</p>
    <h2 id="the-problem-agents-lose-the-thread-between-sessions">The problem: agents lose the thread between sessions</h2>
    …
  </div></div>
</article>
<nav class="section" aria-label="More posts">
  <div class="container">
    <ul class="link-list">
      <li><a href="/blog/…/">Previous: … <span aria-hidden="true">&rarr;</span></a></li>
      <li><a href="/blog/">All posts <span aria-hidden="true">&rarr;</span></a></li>
      <li><a href="/blog/…/">Next: … <span aria-hidden="true">&rarr;</span></a></li>
    </ul>
  </div>
</nav>
<section class="section closing">…</section>
```

The blog index (`/blog/`) opens with a plain section: the `<h1>`, one paragraph whose second
sentence carries the post count the build counts, and a `.link` to the RSS feed. It lists the posts
in a section of its own (Post list, section 5).

### Reference

The layout of `/docs/mcp/` and `/docs/webhooks`: a flow article beside its table of contents. The
page opens with a plain section (the `<h1>`, the first paragraphs and any link cards, section 5),
then one section holds the reference. From 960px the table of contents is a 240px rail beside the
article that stays in view while the article scrolls, with a 1px rule down it and the link of the
section in view marked in `--text`. Below 960px it folds into a closed collapsible above the
article. Inside the article each `<h2>` after the first sits under a 1px rule, like a section.

```html
<div class="section">
  <div class="container doc">
    <aside class="toc" aria-label="On this page">
      <details class="collapsible">
        <summary>On this page</summary>
        <div class="collapsible-body">
          <p class="toc-title">On this page</p>
          <ol id="toc-list">
            <li><a href="#endpoints">Endpoints</a></li>
            <li>
              <a href="#authentication">Authentication</a>
              <ol><li><a href="#agent-keys">Agents MCP keys</a></li></ol>
            </li>
          </ol>
        </div>
      </details>
    </aside>
    <article class="flow doc-body">
      <h2 id="endpoints">Endpoints <a class="h-anchor" href="#endpoints" aria-hidden="true" tabindex="-1"></a></h2>
      <p>…</p>
    </article>
  </div>
</div>
```

The list ships closed, so a phone never sees it fold after the page has painted. The page script
opens it from 960px, where opening it moves nothing else on the page and the summary is hidden so
it cannot be closed, closes it again below 960px, and sets `.active` on the link of the section
being read (the last heading above a line 30% down the viewport, whichever way the reader
scrolls); those are its whole job (section 3). Without script the rail shows the closed
collapsible's summary as a plain label, which still opens it. Nested entries are `<h3>`s, one
level deep. Each heading the contents link to carries a **heading anchor**, `.h-anchor`: a `#`
after the heading text, in `--text-muted`, shown on hover, so a reader can copy a link to that
heading. The `#` is drawn by the stylesheet and the anchor is `aria-hidden` and out of the tab
order, so the heading's text stays its own for crawlers and screen readers; the table of contents
carries the same links for the keyboard. The section holding the reference has no heading of its
own, so it is a `<div>`.

## 5. Components

Every component below is in `/styleguide/` in both themes. The class names are the contract; the
copy in the examples is real and may be reused where it fits.

### Nav

Logo, at most five links, the theme toggle, and a menu button that only shows below 768px. Sticky,
solid `--bg`, a 1px rule underneath. No blur, no store badges, no live dots. Mark the current page
with `aria-current="page"`.

```html
<header class="nav">
  <div class="container nav-inner">
    <a class="nav-logo" href="/"><img src="/notify-icon.webp" width="32" height="32" alt="">Dovilo</a>
    <nav aria-label="Main">
      <ul class="nav-links" id="nav-links">
        <li><a href="/ai">AI</a></li>
        <li><a href="/pricing/">Pricing</a></li>
        <li><a href="/downloads/">Downloads</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>
    </nav>
    <div class="nav-actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch theme">
        <svg class="icon-moon" …></svg><svg class="icon-sun" …></svg>
      </button>
      <button class="icon-btn nav-menu" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">
        <svg …></svg>
      </button>
    </div>
  </div>
</header>
```

The SVG paths are in `/styleguide/index.html`. The Pricing link points at `/pricing/`; the old pages'
nav points there too.

### Hero

The top of a marketing page: an `<h1>` of **one sentence, at most 9 words, that names Dovilo**; a
sub of **at most 20 words**; two buttons (one primary, one secondary) or the two store badges; one
full-width figure. No eyebrow, no pill, no badge other than the store badges, no second figure. The
name Dovilo does not count toward the 9 words. The figure may be a figure pair or a phone pair
(below): still one figure, with one caption.

```html
<section class="hero">
  <div class="container">
    <h1>Dovilo gives your coding agent its own task list</h1>
    <p class="hero-sub">Dovilo is a to-do app with remote MCP for coding agents. Pro includes 15 AI tasks a month.</p>
    <div class="actions">
      <a class="btn btn-primary" href="/downloads/">Download Dovilo</a>
      <a class="btn btn-secondary" href="/docs/mcp/">Read the MCP reference</a>
    </div>
    <figure class="figure">
      <img srcset="… 700w, … 1000w, … 1400w, … 2000w" sizes="(max-width:767px) calc(100vw - 32px), (max-width:1128px) calc(100vw - 48px), 1080px"
           src="…" width="2000" height="1298" fetchpriority="high" alt="Dovilo Desktop: AI Tasks of a project, grouped by what needs attention">
      <figcaption>AI Tasks in Dovilo Desktop, grouped by what needs you.</figcaption>
    </figure>
  </div>
</section>
```

**Figure pair:** the desktop screen with one phone screen standing in front of its top right
corner. The phone shows the same screen as the desktop, so the pair reads "on the desktop, and on
the phone". From 768px the desktop takes 86% of
the width and the phone 24%, rising 96px above the desktop into the hero's empty right side; the
h1, the sub and the buttons keep to the left, so it covers none of them. Below 768px the desktop
takes the full width and the phone overlaps its top right corner at 36%, rising 24px. An 8px ring
of `--bg` separates the phone from the screen behind it: no shadow. Both images are above the fold,
so neither is lazy; the desktop one is the LCP image.

Both screens have a dark capture, so each sits in a `<picture>` (Figure, below); `<picture>` adds
no box, and the classes stay on the `<img>`s.

```html
<figure class="figure figure-pair">
  <picture>
    <source class="src-dark" media="(prefers-color-scheme: dark)" srcset="…-dark-700.webp 700w, …" sizes="…the same…" width="2000" height="1298">
    <img class="pair-desktop" srcset="…" sizes="(max-width:767px) calc(100vw - 32px), (max-width:1128px) calc(86vw - 41px), 929px"
         src="…" width="2000" height="1298" fetchpriority="high" alt="Dovilo Desktop: AI Tasks of a project, grouped by what needs attention">
  </picture>
  <picture>
    <source class="src-dark" media="(prefers-color-scheme: dark)" srcset="…-dark.webp 386w, …-dark-772.webp 772w" sizes="…the same…" width="386" height="840">
    <img class="pair-phone" srcset="… 386w, … 772w" sizes="(max-width:767px) calc(36vw - 12px), (max-width:1128px) calc(24vw - 12px), 259px"
         src="…" width="386" height="840" alt="Dovilo AI Tasks on the phone: the same project with tasks awaiting the user, running, queued and scheduled">
  </picture>
  <figcaption>AI Tasks of one project, grouped by what needs you.</figcaption>
</figure>
```

**Hero with a phone pair:** when the hero's proof is a flow on the phone rather than a desktop
screen (the home page), the figure is a phone pair: two phone screens of one flow side by side, the
second 64px lower (48px below 600px), at most 480px wide together, under one caption. They never
overlap, so there is no ring. The hero then takes `hero-split` on its container: from 960px the
text (`h1`, sub, store badges and at most one `.link`) and the phone pair sit side by side, the
phones at the right edge; below 960px the phones follow the text. Both images are above the fold:
the first is the LCP image (`fetchpriority="high"`), neither is lazy.

```html
<section class="hero">
  <div class="container hero-split">
    <div>
      <h1>Dovilo: the to-do list that builds you a city.</h1>
      <p class="hero-sub">…</p>
      <div class="store-badges">…</div>
      <a class="link" href="/ai/">Building with Claude Code or Cursor? <span aria-hidden="true">&rarr;</span></a>
    </div>
    <figure class="figure figure-phones">
      <img srcset="… 386w, … 772w" sizes="(min-width:1072px) 228px, (min-width:960px) calc(25vw - 40px), (min-width:512px) 228px, calc(50vw - 24px)"
           src="…" width="386" height="840" fetchpriority="high" alt="Dovilo AI inbox: a plan of six tasks from Claude with an Approve button">
      <img srcset="… 386w, … 772w" sizes="…the same…" src="…" width="386" height="840" alt="…">
      <figcaption>Six tasks proposed by Claude, approved into a list.</figcaption>
    </figure>
  </div>
</section>
```

The hero sub is the page's first paragraph, so it carries the GEO rule in section 7 and the
`CLAUDE.md` rule for the paragraph under the H1: declarative sentences, with a number, that name
Dovilo, say what it is and for whom, and carry the page's primary keyword without repeating the
H1. The hero image is the LCP element: `fetchpriority="high"`, no `loading` attribute. When the
sub is a single line that cannot carry all of that, an "In short" section straight after the hero
does (section 4).

**Hero without a proof:** on `/pricing`, `/downloads` and `/docs/` the proof is a section after
the hero (the pricing columns, the download boxes, the link cards), so the hero is the `<h1>` and
the sub alone: no buttons, no figure.

Pages that carry depth (`/faq`, `/docs/mcp/`, `/docs/webhooks`, `/changelog`, `/privacy`, `/terms`,
`/licenses`, `/blog/`) open with a plain section instead of a hero: an `<h1>` and the first
paragraph, no buttons, no figure. A post opens the same way, with its cover as the one figure
(Post, section 4).

```html
<section class="section">
  <div class="container flow">
    <h1>Dovilo MCP reference</h1>
    <p>…</p>
  </div>
</section>
```

### Steps 01-04

A numbered flow of four steps. Each has an amber numeral chip, a **label of at most 8 words**, and
**one line** of detail. Four columns from 960px, two from 600px, one below.

```html
<ol class="steps" role="list">
  <li class="step">
    <span class="step-num" aria-hidden="true">01</span>
    <span class="step-label">Create an agent key in the app</span>
    <span class="step-detail">A name, its projects, its key.</span>
  </li>
  …
</ol>
```

`role="list"` keeps list semantics in Safari once the bullets are gone; the numeral is
`aria-hidden` because the `<ol>` already announces the position.

**Steps with screens:** when every step has a real phone screen of its own, each step carries it
under its detail (`steps-shots` on the list, `step-shot` on the image). The screen is at most 288px
wide, lazy-loaded, with alt text that names what is on it. The step's label and detail are its
caption, so there is no `<figcaption>`. All four steps get a screen or none does, and no screen
repeats one shown elsewhere on the page. From 960px the screens line up along the bottom of the row.

```html
<ol class="steps steps-shots" role="list">
  <li class="step">
    <span class="step-num" aria-hidden="true">02</span>
    <span class="step-label">Approve it on your phone</span>
    <span class="step-detail">Nothing reaches an agent before you say yes.</span>
    <img class="step-shot" srcset="… 386w, … 772w" sizes="(min-width:960px) 246px, 288px"
         src="…" width="386" height="840" loading="lazy"
         alt="Dovilo AI inbox: a six-task plan from Claude with Approve and Reject buttons">
  </li>
  …
</ol>
```

### Feature rows

A heading and **one sentence of at most 18 words**. No icon. **At most five rows** in a section.
Two columns from 768px (heading, then sentence).

```html
<div class="features">
  <div class="feature">
    <h3>Tasks</h3>
    <p>Due dates, repeats, reminders, stars and your own lists, with no limit on tasks.</p>
  </div>
  …
</div>
```

### Line lists

Six components share one look (1px rules between short lines) and differ in what they may say.

**Facts list:** 4 to 6 short lines, no explanation. A grid of three columns from 960px.

```html
<ul class="facts">
  <li>Free on iOS and Android</li>
  <li>No ads on any tier</li>
  <li>5 languages</li>
  …
</ul>
```

**Facts boxes:** a facts-list variant for two things of the same kind compared line for line, such
as the two MCP servers. Two boxes side by side from 768px, stacked below, each with its name in an
`<h3>` and 3 or 4 short lines in one column. Never more than two boxes.

```html
<div class="facts-boxes">
  <div class="facts-box">
    <h3>Agents MCP</h3>
    <ul class="facts">
      <li><code>https://dovilo.app/mcp/agents</code></li>
      <li>For coding agents</li>
      <li>One key per agent, shown once</li>
    </ul>
  </div>
  <div class="facts-box">…</div>
</div>
```

**Integration lines:** one verb sentence per client. The client's name in `<strong>`, then what it
does with Dovilo. Only clients the docs already name.

```html
<ul class="integrations">
  <li><strong>Claude Code</strong> connects with one command and works the AI tasks you write.</li>
  <li><strong>ChatGPT</strong> proposes a plan that waits for your approval on your phone.</li>
</ul>
```

**Trust list:** five short lines on what the AI can and cannot do. Every line is a fact the docs
already state; never a promise they do not.

```html
<ul class="trust">
  <li>Agents see the AI tasks of their projects, never your personal list.</li>
  <li>No delete tool, on either server.</li>
  …
</ul>
```

**Recently shipped:** the newest **dated** entry of each version line on `/changelog/` (today two:
mobile and desktop), newest first, each linking to its anchor there, then a link to the rest. An
entry without a date on the changelog does not appear. A release that reached one store only says
so in its line (as "Mobile 2.0.0 on Android" did until the App Store release on the same evening),
and a platform without a date is not mentioned.

```html
<ul class="shipped">
  <li><time datetime="2026-10-27">27 Oct 2026</time><a href="/changelog/#desktop-2-0-2">Desktop 2.0.2: task details open over the list</a></li>
  …
</ul>
<a class="link" href="/changelog/">All release notes <span aria-hidden="true">&rarr;</span></a>
```

**Pricing summary:** two or three lines, then a link to the pricing page. Prices from `llms.txt`,
never rounded or restated. The home page's summary keeps its `#pricing` anchor, and its link, like
the one on `/ai`, goes to `/pricing/`.

```html
<ul class="pricing-summary">
  <li><strong>Free</strong><span>Unlimited tasks and focus sessions, a basic city, no ads.</span></li>
  <li><strong>Pro</strong><span>$2.49 a month, $19.99 a year or $49.99 once, with a 7-day free trial.</span></li>
  <li><strong>Packs</strong><span>Focus Ambience Pack and Full City Package, $4.99 each, included in Pro.</span></li>
</ul>
<a class="link" href="/pricing/">See pricing <span aria-hidden="true">&rarr;</span></a>
```

**Link list:** 3 to 6 links into sections of other pages, one per line, each a short label with an
arrow; the whole line is the link. Each points at an anchor that exists (section 7). `/docs/` uses
it for its deep links, and a blog post for its More posts nav (Post, section 4), where a label is
"Previous:" or "Next:" and the post's title.

```html
<ul class="link-list">
  <li><a href="/docs/mcp/#connecting">Connect Claude Code, Cursor or any MCP client <span aria-hidden="true">&rarr;</span></a></li>
  <li><a href="/docs/webhooks#signature-verification">Verify a webhook signature <span aria-hidden="true">&rarr;</span></a></li>
</ul>
```

### Pricing columns

The plans side by side, on `/pricing` only: one box per plan, two boxes, side by side from 768px
and stacked below. A box has the plan's name in an `<h2>` (set at the `<h3>` size), its prices one
per line (`plan-prices`), and what it includes as price lines. The second plan may open its list
with one lead line ("Everything in Free, plus"). **No badges**: no "Best value", no "Save 33%", no
highlighted plan; both boxes look the same. Each box carries the plan's id, so `/pricing/#pro`
links to it.

**Price lines** (`price-lines`): the line-list look in one column, for what a plan or a one-time
purchase includes. The copy is the product brief's list verbatim, never paraphrased to fit. A
caveat that applies to the whole block goes in a note under it (Note, below).

```html
<div class="plans">
  <div class="plan" id="free">
    <h2>Free</h2>
    <ul class="plan-prices"><li>$0</li></ul>
    <ul class="price-lines">
      <li>Full to-do management</li>
      <li>Unlimited tasks &amp; categories</li>
      …
    </ul>
  </div>
  <div class="plan" id="pro">
    <h2>Pro</h2>
    <ul class="plan-prices">
      <li>$2.49 a month</li>
      <li>$19.99 a year</li>
      <li>$49.99 once</li>
      <li>7-day trial in the app</li>
    </ul>
    <p class="plan-lead">Everything in Free, plus</p>
    <ul class="price-lines">…</ul>
  </div>
</div>
<p class="note">Sending a plan is free; approving needs Pro.</p>
```

### Download boxes

Where to get each app, on `/downloads` only: two boxes like the pricing columns, one for the phones
and one for the desktop. The phone box holds the two store badges; the desktop box holds the two
installers in the same badge look, with the OS logo and a two-line label that reads "Dovilo for
Windows" and "Dovilo for Mac". Under the badges, one or two short lines. Each box keeps the ids
the old page had: the box takes the new id, its heading the old group id, and each badge its old
card id (`#card-ios|android|windows|mac`).

The page script marks the download for the visitor's platform with `highlighted` on its card: a
1px `--text` ring around the badge, nothing else, and never while the badge has keyboard focus. No
label, no pulsing dot, no colour. The old page's prose sections are collapsibles that keep their
ids, so the page script also opens a collapsible when the URL's fragment names it.

```html
<div class="download-boxes">
  <div class="download-box" id="mobile">
    <h2 id="group-mobile">Phones</h2>
    <div class="store-badges">
      <a class="store-badge" id="card-ios" href="https://apps.apple.com/app/dovilo/id6761195015?ct=website_download&amp;mt=8">…</a>
      <a class="store-badge" id="card-android" href="https://play.google.com/store/apps/details?id=com.dovilo.app&amp;utm_source=website&amp;utm_medium=download">…</a>
    </div>
    <p>Free, with a 7-day Pro trial in the app.</p>
  </div>
  <div class="download-box" id="desktop">
    <h2 id="group-desktop">Desktop</h2>
    <div class="store-badges">
      <a class="store-badge" id="card-windows" href="https://github.com/Dovilo-App/dovilo-desktop-releases/releases/latest/download/Dovilo-Setup.exe?source=download">
        <svg viewBox="0 0 24 24" aria-hidden="true">…</svg>
        <span><small>Dovilo for</small><strong>Windows</strong></span>
      </a>
      …
    </div>
    <p>Latest: 2.0.2, 27 Oct 2026. …</p>
  </div>
</div>
```

### Link cards

Two places to go next, side by side from 768px and stacked below, in the same box as the pricing
columns: each card is one link holding a title with an arrow and **one line** of what is there.
Hover adds no colour; the outline darkens to `--text-muted`. Never more than two; a single card
keeps the width of one column, as on `/docs/webhooks`. On `/docs/` the
cards are the page's two sections, so the title is an `<h2>` (set at the `<h3>` size, like a plan's
name); where they sit inside a section, as in the opening of the two references, it is a
`<span>`, and a card may carry a short kind label above it (`card-kind`, in `--text-muted`).

```html
<div class="cards">
  <a class="card" href="/docs/mcp/">
    <h2 class="card-title">MCP reference <span aria-hidden="true">&rarr;</span></h2>
    <p>Endpoints, tools, statuses, scheduling, connecting a client, upgrading from Desktop 1.8.</p>
  </a>
  <a class="card" href="/docs/webhooks">
    <span class="card-kind">Reference</span>
    <span class="card-title">Webhooks <span aria-hidden="true">&rarr;</span></span>
    <p>Signed task events, delivered by Dovilo's server or by Desktop for local receivers.</p>
  </a>
</div>
```

### Figure

A **real screenshot**, a caption of **one line**, and alt text that names the product and what is on
screen. Never a mock-up, a render or an illustration. Phone captures take `figure-phone`, which
caps them at 288px wide.

```html
<figure class="figure figure-phone">
  <img src="/screenshots/mobile-tasks.webp" width="386" height="840" loading="lazy"
       alt="Dovilo My Day list with tasks grouped under Today and No date">
  <figcaption>My Day, grouped under Today and No date.</figcaption>
</figure>
```

One figure per claim, and **the same image never appears twice on a page**. Images follow the
WebP, `width`/`height`, `srcset`/`sizes` and lazy-loading rules in `CLAUDE.md`.

**Dark capture:** a phone or desktop screen that the app draws differently in its dark theme
carries both captures, and the page shows the one that matches its own theme. The `<img>` keeps the light
capture, its alt text, `loading`, `fetchpriority` and `width`/`height`; a `<source class="src-dark">`
before it in a `<picture>` holds the dark capture, with the same `sizes` and the same
`width`/`height`, so swapping never moves the layout. The dark file has the light file's name plus
`-dark`, before any width suffix (`mobile-ai-inbox-dark-772.webp`, `desktop-ai-dark-2000.webp`),
and the same crop. A dark capture taken in a slightly larger window (the desktop set: 2874x1866
against 2844x1846) is scaled to the light file's size before encoding, never cropped: every width
variant then has its light twin's exact `width`/`height`, so the box never moves, though the
content inside may sit a pixel or two off its light twin.

```html
<picture>
  <source class="src-dark" media="(prefers-color-scheme: dark)"
          srcset="/screenshots/mobile-ai-inbox-dark.webp 386w, /screenshots/mobile-ai-inbox-dark-772.webp 772w"
          sizes="…" width="386" height="840">
  <img srcset="/screenshots/mobile-ai-inbox.webp 386w, /screenshots/mobile-ai-inbox-772.webp 772w"
       sizes="…" src="/screenshots/mobile-ai-inbox.webp" width="386" height="840" loading="lazy"
       alt="Dovilo AI inbox: a plan of six tasks from Claude with an Approve button">
</picture>
```

The markup's `media` follows the OS setting, which is what the browser (and its preload scanner)
sees first. The site script then points every `source.src-dark` at the nearest explicit
`data-theme` (`all` for dark, `not all` for light), on load and on every toggle, and back to the OS
query when there is no choice; the browser swaps the image without a reload. Only the capture for
the current theme is fetched, and a lazy one only when it nears the viewport; the other is fetched
the first time the theme changes. One edge: when a visitor's saved choice differs from the OS, the
preload scanner, which reads the markup before any script runs, fetches every eager hero capture in
the OS theme first (both phones on `/`, the desktop and the phone on `/ai`), and the shown one only starts when the
site script runs, so the LCP image arrives later for that visitor. A parse-time fix in the boot
script was tried and does not help: the scanner fetches before it. `<picture>` adds no box
(`display:contents`) and its `<source>` is `display:none`, so the `figure-pair`, `figure-phones`,
`figure-row` and `step-shot` layouts are unchanged. A `<picture>` sits only inside a `<figure>` or
a step, never directly in `.flow` or a section container, where the spacing rules would miss it. A screen that
looks the same in both themes (the city) keeps one source. Share cards stay light.

### Code block

A title, a copy button and the code, themed like the page. No highlighting library and no fake
window dots.

```html
<div class="code">
  <div class="code-head"><span>Claude Code</span><button class="copy-btn" type="button">Copy</button></div>
  <pre><code>claude mcp add --transport http --scope local dovilo https://dovilo.app/mcp/agents --header "Authorization: Bearer &lt;API_KEY&gt;"</code></pre>
</div>
```

The title names the client or the format (`Claude Code`, `JSON`, `Python`). Code that is read
rather than copied (a transcript of an agent's calls, a status diagram in text) drops the head:
no title and no copy button, just the `<pre>` in the box. A long block written to be pasted into
an agent rather than read, as the integration prompt on `/docs/webhooks`, takes `code-long`: it
scrolls inside 480px and the copy button still copies all of it. Code samples a reader studies
(the verification code, the payloads) stay at full height.

```html
<div class="code code-long">
  <div class="code-head"><span>AI integration prompt</span><button class="copy-btn" type="button">Copy prompt</button></div>
  <pre><code>…</code></pre>
</div>
```

`/docs/webhooks` dropped highlight.js and its inlined theme when it moved to this system: its code
blocks are themed like every other page's, so no redesigned page carries a `<style>` block.

### Collapsible

Where depth goes. A native `<details>`, closed by default, whose content is **real HTML in the
page**: never fetched, injected or built by script. Crawlers read it; the word budget does not
count it.

```html
<details class="collapsible">
  <summary>All nine agent tools</summary>
  <div class="collapsible-body">
    <!-- a table, a list, a code block, paragraphs -->
  </div>
</details>
```

The summary is a plain label, not a heading, and ends without punctuation.

### Table

For reference data. **At most six rows in the open** on a page with a word budget; a longer table
goes inside a collapsible there. The pages that carry the depth (`/docs/mcp/`, `/docs/webhooks`,
`/faq`, `/changelog`) are where those collapsibles send the reader, so their reference tables stay
open at any length. Always inside `.table-wrap`, which scrolls sideways on a phone instead of
squeezing the cells: below 768px a table of three or more columns is at least 48em wide, so its
sentence column keeps room for a phrase rather than shrinking to its longest word, while a
two-column table still fits the screen. A table split into groups puts each group in its own `<tbody>`, opened by a
row whose one cell is `<th colspan="…" scope="rowgroup">`.

```html
<div class="table-wrap">
  <table class="table">
    <thead><tr><th scope="col">Server</th><th scope="col">URL</th><th scope="col">For</th></tr></thead>
    <tbody>
      <tr><td>Agents MCP</td><td><code>https://dovilo.app/mcp/agents</code></td><td>Claude Code, Cursor and other coding agents</td></tr>
    </tbody>
  </table>
</div>
```

### FAQ accordion

Each question is an `<h3>` phrased as a question, inside a `<summary>`. The answer's text matches
the page's `FAQPage` JSON-LD **word for word**, and the JSON-LD lives only on a page whose questions
are in its HTML.

```html
<div class="faq-accordion">
  <details>
    <summary><h3>Does Dovilo have ads?</h3></summary>
    <div class="faq-answer"><p>No. Dovilo is completely ad-free, both in the free tier and in Pro. …</p></div>
  </details>
</div>
```

An answer may run to more than one paragraph; the paragraphs sit 16px apart, and the JSON-LD
joins them with a space. On `/faq` the questions come in groups: each group is a section with an
`<h2>` and an `id` (`#general`, `#pro-pricing`, `#data-privacy` and so on) holding one accordion,
and the page closes with the support address under `#contact`, as `/docs/` closes.

The old pages' `.faq-item.open` accordion and its script are gone with the old `/faq`, and its
rules went with `base.css`.

### Release entries

The builds on `/changelog`, newest first, one version line (mobile, desktop) per section. Each
entry sits under a 1px rule: the version as an `<h3>` (`rel-ver`), its date in a `<time>`
(`rel-date`, in `--text-muted`), and on the newest build of each line the word Latest
(`rel-latest`) in a 1px outline. Latest is a label, not a badge: no fill, no colour, and it states
a fact rather than selling anything. Then what shipped as a bulleted list (`rel-notes`) and, where
the build needs one, a paragraph of context in `--text-muted` (`rel-text`). A line under the list
of entries (`rel-foot`) may say where older builds are. Each entry keeps its `id`
(`#mobile-2-0-0`, `#desktop-2-0-2`): the home page's Recently shipped list and the changelog's
`ItemList` point at them.

```html
<div class="releases" id="releases">
  <div class="rel" id="desktop-2-0-2">
    <div class="rel-head"><h3 class="rel-ver">2.0.2</h3><time class="rel-date" datetime="2026-10-27">27 October 2026</time><span class="rel-latest">Latest</span></div>
    <ul class="rel-notes">
      <li>Task details open over the list instead of squeezing it, for My Tasks and for AI tasks. …</li>
    </ul>
    <p class="rel-text">Nothing changes in the MCP contract, agent keys or webhooks: …</p>
  </div>
  …
</div>
<p class="rel-foot">Every desktop build before these is tagged in the <a href="https://github.com/Dovilo-App/dovilo-desktop-releases/releases" target="_blank" rel="noopener">releases repository</a>.</p>
```

The `.rel*` names and `#releases` are a contract with the changelog's page script, the release
feed: it reads the version of the first entry in `#releases`, asks the GitHub releases API for the
newest desktop tag and, only when that tag is newer, writes an entry of the same markup above it,
with a link to its notes on GitHub, and moves Latest to it. Every other entry is in the HTML, and
the `ItemList` keeps to those.

### Meta line

The date and counts under a title, in `--text-small` and `--text-muted`: a legal page's Last
updated, a post's date, reading time and author. Items are separated by a middle dot in the text.
It belongs to the title above it; it is not a caption and not a sentence of the page.

```html
<p class="meta">Last updated: 20 October 2026</p>
<p class="meta"><time datetime="2026-09-21T19:29:13.447Z">21 September 2026</time> · 9 min read · Selahaddin Akgün</p>
```

### Post list

The posts on `/blog/`, newest first, one entry per post under a 1px rule, in the line-list look:
the title as an `<h2>` set at the `<h3>` size, a meta line with the date and reading time (then the
tags when a post has any), and the post's summary in `--text-muted`. The title is the entry's one link, underlined on hover. The build
writes the list; nothing in it is typed by hand.

```html
<ol class="posts" role="list">
  <li>
    <h2><a href="/blog/task-manager-for-programmers-what-to-look-for-in-2026/">Task manager for programmers: what to look for</a></h2>
    <p class="meta"><time datetime="…">4 October 2026</time> · 7 min read</p>
    <p>Developer task management has three separate layers: your own plan, the team issue tracker, and the agent queue. …</p>
  </li>
  …
</ol>
```

### Note

A one-line callout for a limit or a caveat. Said plainly, never as a warning banner.

```html
<p class="note"><strong>Not yet:</strong> there is no data export today.</p>
```

### Closing CTA

The last section of a marketing page: an `<h2>`, one sentence, two buttons. Centred.

```html
<section class="section closing">
  <div class="container">
    <h2>Start with the free app</h2>
    <p>Dovilo is free on iOS and Android. Pro starts with a 7-day free trial.</p>
    <div class="actions">
      <a class="btn btn-primary" href="/downloads/">Download Dovilo</a>
      <a class="btn btn-secondary" href="/faq">Read the FAQ</a>
    </div>
  </div>
</section>
```

On the home page the closing sends the reader to the stores: the two store badges take the place
of the buttons, and one `.link` under them may point at the desktop downloads.

```html
<section class="section closing" id="download">
  <div class="container">
    <h2>One engineer, in Istanbul.</h2>
    <p>No company, no funding. <a href="/changelog/">A public release history you can check.</a></p>
    <div class="store-badges">…</div>
    <a class="link" href="/downloads/">Dovilo Desktop for Windows and Mac needs Pro <span aria-hidden="true">&rarr;</span></a>
  </div>
</section>
```

On `/pricing` the section before the closing has already made the case, so the closing is the store
badges and the Desktop line alone, with no heading and no sentence. With no heading, it is a `<div>`
rather than a `<section>`.

```html
<div class="section closing">
  <div class="container">
    <div class="store-badges">…</div>
    <a class="link" href="/downloads/">Dovilo Desktop for Windows and Mac needs Pro <span aria-hidden="true">&rarr;</span></a>
  </div>
</div>
```

`/docs/` closes the same way, with the support line and one link in place of the badges.

```html
<div class="section closing">
  <div class="container">
    <p>Questions: <a class="mail" href="/faq#contact" data-u="support" data-d="dovilo.app">support<span aria-hidden="true"> [at] </span>dovilo.app</a></p>
    <a class="link" href="/ai">Read about AI Agents <span aria-hidden="true">&rarr;</span></a>
  </div>
</div>
```

A blog post closes with a heading, its sentence and one primary button, no secondary: the build
writes the same closing under every post.

```html
<section class="section closing">
  <div class="container">
    <h2>Dovilo turns finished work into a city you can see.</h2>
    <p>A to-do list, focus sessions with full-screen ambience, and an isometric city built from what you complete. Free on iOS and Android.</p>
    <div class="actions"><a class="btn btn-primary" href="/downloads/">Get Dovilo</a></div>
  </div>
</section>
```

### Footer

Four columns of text links, then the copyright and the support address. No icons, no newsletter
box. The full markup is in `styleguide/index.html`. The address is split in the markup, as on the
old pages, and the site script assembles the `mailto:`, so scrapers find no parseable address.

```html
<footer class="footer">
  <div class="container">
    <nav class="footer-cols" aria-label="Footer">
      <div>
        <p class="footer-title">Product</p>
        <ul><li><a href="/ai">For developers</a></li> …</ul>
      </div>
      … Docs, Dovilo, Follow …
    </nav>
    <div class="footer-meta">
      <p>&copy; 2026 Dovilo. All rights reserved.</p>
      <p><a class="mail" href="/faq#contact" data-u="support" data-d="dovilo.app">support<span aria-hidden="true"> [at] </span>dovilo.app</a></p>
    </div>
  </div>
</footer>
```

### Buttons

`.btn-primary` is amber with dark text: **at most one per view**, for the main action. `.btn-secondary`
is a 1px outline in `--border`. Both are at least 44px tall. Buttons sit in `.actions`. A button
label is a verb phrase in sentence case ("Download Dovilo"), never "Click here" or "Learn more".

```html
<div class="actions">
  <a class="btn btn-primary" href="/downloads/">Download Dovilo</a>
  <a class="btn btn-secondary" href="/ai">For developers</a>
</div>
```

Store links keep their tracking parameters from the product brief (`?ct=…` for the App Store,
`utm_source`/`utm_medium` for Google Play, `?source=` for desktop installers and `/downloads`).

**Store badges:** where a page sends the reader straight to the stores (the home hero and
closing, the `/pricing` closing, the `/downloads` phone box), the App Store and Google Play badges
take the place of the two buttons. The desktop installers on `/downloads` share the look (Download
boxes, above). A badge is the
store's logo and its two-line label on an inverted fill (`--text` behind `--bg` text), 48px tall.
Hover adds no colour: the outline turns `--text-muted`. Their text counts as an image's, not toward
the word budget.

```html
<div class="store-badges">
  <a class="store-badge" href="https://apps.apple.com/app/dovilo/id6761195015?ct=website_hero&amp;mt=8">
    <svg viewBox="0 0 24 24" aria-hidden="true">…</svg>
    <span><small>Download on the</small><strong>App Store</strong></span>
  </a>
  <a class="store-badge" href="https://play.google.com/store/apps/details?id=com.dovilo.app&amp;utm_source=website&amp;utm_medium=hero">
    <svg viewBox="0 0 24 24" aria-hidden="true">…</svg>
    <span><small>Get it on</small><strong>Google Play</strong></span>
  </a>
</div>
```

The logo paths are in `/styleguide/`.

### Links

Inside running text a link is `--text`, underlined in `--text-muted`, and the underline darkens on
hover. It is never amber. A link that stands on its own line is a `.link`: bold, with an arrow, a
block of its own, 16px below whatever precedes it.

```html
<p>Agents connect to <code>https://dovilo.app/mcp/agents</code>, and the <a href="/docs/mcp/">MCP reference</a> lists all 22 tools.</p>
<a class="link" href="/changelog/">All release notes <span aria-hidden="true">&rarr;</span></a>
```

Internal links use the URL form the target's canonical names, until the canonical known issue in
`CLAUDE.md` is fixed for all six pages at once. External links get `rel="noopener"`.

## 6. Copy

- **Sentence case** for every heading, button and label.
- **No em dash anywhere a person reads**: headings, body, captions, buttons, alt text. Use a colon,
  a comma, a full stop or "and". `llms.txt` and `llms-full.txt` are the only place em dashes are
  allowed.
- **No hype words**: revolutionary, game-changing, supercharge, seamless, unlock, effortless,
  powerful.
- **Numbers over adjectives**, and only numbers the docs already state: $2.49 a month, $19.99 a
  year, $49.99 lifetime, a 7-day free trial, 5 languages, 9 agent tools (22 across both servers),
  15 AI tasks a month on Pro, 16 sound layers (3 at once), 6 scenes in the app (5 in the pack).
  "6 scenes" and "5 scenes" never share a sentence.
- **Nothing invented**: no feature, price, platform, date, quote, testimonial, user count or rating
  that is not already in `llms.txt`, `llms-full.txt`, `/faq` or the page itself.
- Plain about what is missing: "Not yet: there is no data export today."
- A heading never breaks a line at the hyphen of a compound: wrap it in `<span class="nowrap">`,
  as in `the <span class="nowrap">to-do</span> list`.

### Word budgets

Visible words per page: text outside the nav, the footer and the body of every `<details>`. The
hero sub and every section sentence count; code inside a code block does not. A FAQ question in its
`<summary>` counts on `/`; its answer does not.

| Page | Visible words | Also allowed |
| --- | --- | --- |
| `/` | 450 at most, body copy under 350; headings, step labels, captions, links and FAQ questions count, store badges do not | Collapsibles and the FAQ accordion |
| `/ai` | 440 at most (its section headings count) | One code block, plus collapsibles |
| `/pricing` | 320 at most, body copy (paragraphs, list lines and notes) under 250; headings, prices, labels, links and FAQ questions count toward the 320 but are not body copy, store badges count toward neither | Collapsibles and the FAQ accordion |
| `/downloads` | 150 at most | Collapsibles |
| `/docs/` | 150 at most | Link cards and a link list |
| `/faq`, `/docs/mcp/`, `/docs/webhooks`, `/changelog`, `/privacy`, `/terms` | No budget | They carry the depth |
| `/licenses`, `/blog/` and every post | No budget | Generated or legal text, not written to a budget |

A budget is a ceiling, not a target. A page over its budget moves text into a collapsible or onto
the page that carries the depth; it does not drop facts.

The 300-word floor in `CLAUDE.md` still holds for every page: on a budgeted page it is met by the
visible text plus what is in its collapsibles. `/docs/` is the one exception: a hub whose depth is
the two references it links, accepted under the floor.

## 7. GEO and SEO content layer

Visible text shrinks; indexable text does not.

- **The `<h1>` names the entity.** Every marketing page's `<h1>` contains "Dovilo".
- **The first paragraph answers "what is this and for whom"** in two or three declarative
  sentences with at least one number. On a page with a hero, that paragraph is the hero sub, or,
  when the sub is one line, the "In short" paragraph straight after the hero (section 4). It counts
  toward the budget.
- **Depth moves to `<details>` on the same page**: tool tables, payload examples, long answers.
  Crawlable HTML, hidden only by default, excluded from the budget.
- **One `<h1>` per page, an `<h2>` per section**, `<h3>` below that. FAQ `<h3>`s are questions.
- **Keep every existing URL and anchor `id`.** A removed anchor either moves to an element that
  still exists on the page (same `id`) or gets a redirect. `/faq` keeps answering at both `/faq`
  and `/faq/`.
- **Structured data stays and stays true**: the shared `SoftwareApplication` node
  (`https://dovilo.app/#app`), `Organization`, `BreadcrumbList`, and `FAQPage` only where the
  questions and answers are in the page's HTML. Change the page, change the JSON-LD, its
  `dateModified` and the sitemap `lastmod` in the same commit.
- **`llms.txt` and `llms-full.txt` are regenerated from the page source, never shortened.** A
  shorter page does not mean a shorter `llms-full.txt`.
- **Share cards:** each page gets a real-screenshot card, a 1200×630 PNG or JPG: the page's hero
  screenshot on the light `--bg`, under its `<h1>` set in Inter 700. The `/ai` card is
  `/og-ai.jpg`.
- **Crawlers:** `robots.txt` keeps every AI crawler allowed. `/styleguide/` is `noindex` by meta
  tag, not by a `Disallow`.

## 8. Theming

- Light tokens sit on `:root`. Dark tokens apply under `@media (prefers-color-scheme: dark)` guarded
  by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`.
- An explicit choice is stored in `localStorage['dovilo-theme']` and applied by the inline boot
  script in `<head>`, before first paint, so there is no flash. It beats the OS preference.
- `<body>` has an explicit `--bg` background and `--text` colour; `color-scheme` follows the theme
  so form controls and scrollbars match.
- The toggle in the nav shows the current theme, as on the old pages (a moon in dark, a sun in
  light), and its `aria-label` names the theme it switches to.
- The same selectors work on any element: `data-theme="dark"` on a wrapper renders its contents,
  toggle icon included, in the dark theme. `/styleguide/` uses this to show each component twice.
  Pages do not.
- Light is the fallback when a browser reports no preference at all; the old pages fall back to
  dark. Every current browser reports one, so the two only differ in very old browsers.

## 9. Not covered yet

Nothing today: every page on the site, the blog pages that `tools/template.mjs` renders included,
is built from the components above. A surface this document does not cover adds its component
here first, then to `system.css` and `/styleguide/`, in the same commit.

## 10. Checks before a redesigned page ships

- [ ] Only components from this document; no `<style>` block, no inline style, no new token.
- [ ] Visible words within budget, counted as section 6 says.
- [ ] `<h1>` names Dovilo; the first paragraph (hero sub or In short) is 2-3 declarative sentences
      with a number. Not on the legal pages, whose text changes only word for word from a task,
      and not on a post, whose title and text are Sanity's.
- [ ] Every old URL and anchor `id` still resolves.
- [ ] JSON-LD mirrors the visible text; `dateModified` = sitemap `lastmod`.
- [ ] `llms.txt` and `llms-full.txt` updated from the page, not shortened.
- [ ] No em dash, no hype word, no number that is not in the docs.
- [ ] Headless Chrome at 320px and 1280px, light and dark: no horizontal overflow, no console
      errors, no failed requests.
