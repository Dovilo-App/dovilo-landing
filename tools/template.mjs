/* The page shell for generated blog pages.

   The shell links /styles/system.css like every other page on the site and
   carries no CSS of its own: the post list, the post column, the meta line and
   the closing are components of docs/design-language.md (Post, Post list, Meta
   line, Closing CTA). The head below is a copy of the hand-written pages';
   change it there and here together. The nav, the footer and the site script
   are not copies: they come from src/partials/ (below).
   If the blog needs something the design doc does not have, the doc gets the
   component first. */

import { SITE, BLOG } from './config.mjs';
import { render, loadStrings, shellData, LANGUAGES } from './pages-lib.mjs';

export const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* First in <head>, straight after canonical and the llms.txt alternate: the
   preload scanner has to find these in the opening packets. */
const STYLES = `<!-- Render-blocking by design: this file is the whole design system. -->
  <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles/system.css">`;

const THEME_BOOT = `<meta name="color-scheme" content="light dark">
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
  </script>`;

/* The nav, the footer and the site script are the partials in src/partials/,
   the same files tools/build-pages.mjs renders into the five localised pages:
   one copy for the whole site. The blog is English, so it reads the English
   strings and has no language menu. Only the blog index is the page the Blog
   entry points at; a post is not in the nav, so it marks nothing. The footer
   links are how link equity reaches the pages that are not in the nav: do not
   trim the list (in src/partials/footer.html). */
const EN = loadStrings('en');
const shell = (current) => shellData({ strings: EN, lang: LANGUAGES[0], current });
const NAV = (current) => render('{{> nav}}', shell(current));
const FOOTER = render('{{> footer}}', shell(null));
const SITE_SCRIPT = render('{{> site-script}}', shell(null));

/**
 * Renders one full page. `jsonLd` is an array of objects, each written into its
 * own application/ld+json block the way the hand-written pages do it. `body` is
 * the page's sections, written straight into <main>.
 */
export function page({ title, description, canonical, ogType = 'website', ogImage, ogImageAlt, head = '', jsonLd = [], body }) {
  const abs = (u) => (String(u || '').startsWith('http') ? u : SITE.origin + (u || SITE.defaultOgImage));
  const img = abs(ogImage);
  const current = canonical === SITE.origin + BLOG.base ? 'blog' : null;
  const ld = jsonLd
    .map((o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n  </script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="alternate" type="application/rss+xml" title="Dovilo blog" href="${SITE.origin}${BLOG.base}feed.xml">
  <link rel="alternate" type="text/markdown" href="${SITE.origin}/llms.txt" title="llms.txt: structured summary for language models">

  ${STYLES}

  <!-- Open Graph and Twitter: four copies of the title, see CLAUDE.md -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(img)}">
${ogImageAlt ? `  <meta property="og:image:alt" content="${esc(ogImageAlt)}">\n` : ''}  <meta property="og:site_name" content="Dovilo">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="${SITE.twitter}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(img)}">
${head}
  ${THEME_BOOT}
  <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

${ld ? ld + '\n' : ''}</head>
<body>
  ${NAV(current)}

  <main id="main">

${body}

  </main>

  ${FOOTER}

  ${SITE_SCRIPT}
</body>
</html>
`;
}
