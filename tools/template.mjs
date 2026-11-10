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

const THEME_BOOT = `<meta name="color-scheme" content="light">
  <meta name="theme-color" content="#FAF8F4">
  <script>
    /* Runs before paint: an explicit choice wins, otherwise light. */
    (function(){
      try{
        var t = localStorage.getItem('dovilo-theme');
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
      }catch(e){}
    })();
  </script>`;

/* The nav, the footer and the site script are the partials in src/partials/,
   the same files tools/build-pages.mjs renders into the five localised pages:
   one copy for the whole site. A post is English with no language menu; the
   blog index has a copy per language (A130 part 2b) and renders them in that
   language's strings, with the menu. Only the blog index is the page the Blog
   entry points at; a post is not in the nav, so it marks nothing. The footer
   links are how link equity reaches the pages that are not in the nav: do not
   trim the list (in src/partials/footer.html). */
const EN_LANG = LANGUAGES[0];
const stringsOf = new Map();
const shell = (lang, current, alternates) => {
  if (!stringsOf.has(lang.code)) stringsOf.set(lang.code, loadStrings(lang.code));
  return shellData({ strings: stringsOf.get(lang.code), lang, current, alternates });
};

/**
 * Renders one full page. `jsonLd` is an array of objects, each written into its
 * own application/ld+json block the way the hand-written pages do it. `body` is
 * the page's sections, written straight into <main>.
 *
 * `lang` is the language entry of pages-lib (English unless the blog index of
 * another language); `current` names the nav entry to mark (none for the
 * blog, which the nav does not list); `alternates` is the Language menu (menuAlternates in pages-lib);
 * `hreflang` and `ogLocale` are ready-made tags for the index pages, empty on
 * a post.
 */
export function page({
  title, description, canonical, ogType = 'website', ogImage, ogImageAlt, twitterImageAlt, head = '', jsonLd = [], body,
  lang = EN_LANG, current = null, alternates = [], hreflang = '', ogLocale = '',
}) {
  const abs = (u) => (String(u || '').startsWith('http') ? u : SITE.origin + (u || SITE.defaultOgImage));
  const img = abs(ogImage);
  const ld = jsonLd
    .map((o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n  </script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="${lang.code}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="alternate" type="application/rss+xml" title="Dovilo blog" href="${SITE.origin}${BLOG.base}feed.xml">
  <link rel="alternate" type="text/markdown" href="${SITE.origin}/llms.txt" title="llms.txt: structured summary for language models">${hreflang}

  ${STYLES}

  <!-- Open Graph and Twitter: four copies of the title, see CLAUDE.md -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(img)}">
${ogImageAlt ? `  <meta property="og:image:alt" content="${esc(ogImageAlt)}">\n` : ''}  <meta property="og:site_name" content="Dovilo">${ogLocale}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="${SITE.twitter}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(img)}">
${twitterImageAlt ? `  <meta name="twitter:image:alt" content="${esc(twitterImageAlt)}">\n` : ''}${head}
  ${THEME_BOOT}
  <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

${ld ? ld + '\n' : ''}</head>
<body>
  ${render('{{> nav}}', shell(lang, current, alternates))}

  <main id="main">

${body}

  </main>

  ${render('{{> footer}}', shell(lang, null, alternates))}

  ${render('{{> site-script}}', shell(lang, null, alternates))}
</body>
</html>
`;
}
