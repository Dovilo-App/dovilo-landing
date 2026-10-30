/* The page shell for generated blog pages.

   The shell links /styles/system.css like every other page on the site and
   carries no CSS of its own: the post list, the post column, the meta line and
   the closing are components of docs/design-language.md (Post, Post list, Meta
   line, Closing CTA). The head, the nav, the footer and the site script below
   are copies of the hand-written pages'; change them there and here together.
   If the blog needs something the design doc does not have, the doc gets the
   component first. */

import { SITE, BLOG } from './config.mjs';

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

/* The site script, verbatim from styleguide/index.html (design-language §3). */
const SITE_SCRIPT = `<script>
    /* Site script: theme toggle, mobile menu, copy buttons, email links and
       the dark captures of figures. The same on every page. */
    (function(){
      var root = document.documentElement;
      var dark = window.matchMedia('(prefers-color-scheme: dark)');
      var BG = { light: '#F7F8F8', dark: '#161B1D' };

      function theme(){
        var t = root.getAttribute('data-theme');
        return t === 'light' || t === 'dark' ? t : (dark.matches ? 'dark' : 'light');
      }
      function paint(){
        var t = theme();
        document.querySelectorAll('.theme-toggle').forEach(function(b){
          b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        });
        if (root.hasAttribute('data-theme')) {
          document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){ m.setAttribute('content', BG[t]); });
        }
        /* Dark captures: each source.src-dark follows the nearest explicit
           data-theme, or the OS when there is none, so a toggle swaps the
           image without a reload and only the shown capture is fetched. */
        document.querySelectorAll('source.src-dark').forEach(function(s){
          var host = s.closest('[data-theme]'), h = host && host.getAttribute('data-theme');
          var m = h === 'dark' ? 'all' : h === 'light' ? 'not all' : '(prefers-color-scheme: dark)';
          if (s.getAttribute('media') !== m) s.setAttribute('media', m);
        });
      }
      document.querySelectorAll('.theme-toggle').forEach(function(b){
        b.addEventListener('click', function(){
          var next = theme() === 'dark' ? 'light' : 'dark';
          root.setAttribute('data-theme', next);
          try { localStorage.setItem('dovilo-theme', next); } catch (e) {}
          paint();
        });
      });
      if (dark.addEventListener) dark.addEventListener('change', paint);
      paint();

      document.querySelectorAll('.nav-menu').forEach(function(b){
        var menu = document.getElementById(b.getAttribute('aria-controls'));
        if (!menu) return;
        function set(open){
          menu.classList.toggle('open', open);
          b.setAttribute('aria-expanded', String(open));
        }
        b.addEventListener('click', function(){ set(!menu.classList.contains('open')); });
        menu.addEventListener('click', function(e){ if (e.target.closest('a')) set(false); });
        document.addEventListener('keydown', function(e){
          if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); b.focus(); }
        });
      });

      /* Copy: the clipboard API where the page is a secure context, a hidden
         textarea everywhere else, and a visible "Copy failed" if both refuse. */
      document.querySelectorAll('.copy-btn').forEach(function(b){
        var label = b.textContent, timer;
        function show(ok){
          b.classList.toggle('copied', ok);
          b.textContent = ok ? 'Copied' : 'Copy failed';
          clearTimeout(timer);
          timer = setTimeout(function(){ b.classList.remove('copied'); b.textContent = label; }, 1500);
        }
        function fallback(text){
          var ta = document.createElement('textarea'), ok = false;
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.top = '-1000px';
          document.body.appendChild(ta);
          ta.select();
          try { ok = document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          show(ok);
        }
        b.addEventListener('click', function(){
          var block = b.closest('.code'), pre = block && block.querySelector('pre');
          if (!pre) return;
          var text = pre.innerText;
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function(){ show(true); }, function(){ fallback(text); });
          } else {
            fallback(text);
          }
        });
      });

      /* Addresses are split in the markup so scrapers do not find a parseable
         address; the real mailto is assembled here, in the browser. */
      var at = String.fromCharCode(64);
      document.querySelectorAll('a.mail').forEach(function(a){
        var addr = a.getAttribute('data-u') + at + a.getAttribute('data-d');
        a.setAttribute('href', 'mailto:' + addr);
        a.textContent = addr;
      });
    })();
  </script>`;

/* The site nav (design-language §5, Nav). Only the blog index is the page the
   Blog entry points at; a post is not in the nav, so it marks nothing. */
const NAV = (current) => `<a class="skip-link" href="#main">Skip to content</a>

  <header class="nav">
    <div class="container nav-inner">
      <a class="nav-logo" href="/"><img src="/dovilo-logo.webp" width="32" height="32" alt="">Dovilo</a>
      <nav aria-label="Main">
        <ul class="nav-links" id="nav-links">
          <li><a href="/ai">AI</a></li>
          <li><a href="/pricing/">Pricing</a></li>
          <li><a href="/downloads/">Downloads</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/blog/"${current === 'blog' ? ' aria-current="page"' : ''}>Blog</a></li>
        </ul>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn theme-toggle" type="button" aria-label="Switch theme">
          <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>
        <button class="icon-btn nav-menu" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  </header>`;

/* The footer links are how link equity reaches the pages that are not in the
   nav: do not trim the list. */
const FOOTER = `<footer class="footer">
    <div class="container">
      <nav class="footer-cols" aria-label="Footer">
        <div>
          <p class="footer-title">Product</p>
          <ul>
            <li><a href="/ai">For developers</a></li>
            <li><a href="/downloads/">Downloads</a></li>
            <li><a href="/pricing/">Pricing</a></li>
            <li><a href="/changelog/">Changelog</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Docs</p>
          <ul>
            <li><a href="/docs/">Docs</a></li>
            <li><a href="/docs/mcp/">MCP reference</a></li>
            <li><a href="/docs/webhooks">Webhooks</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Dovilo</p>
          <ul>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/licenses">Licenses</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Follow</p>
          <ul>
            <li><a href="https://x.com/doviloapp" rel="noopener">X</a></li>
            <li><a href="https://instagram.com/doviloapp" rel="noopener">Instagram</a></li>
            <li><a href="https://linkedin.com/company/doviloapp" rel="noopener">LinkedIn</a></li>
            <li><a href="https://github.com/Dovilo-App" rel="noopener">GitHub</a></li>
          </ul>
        </div>
      </nav>
      <div class="footer-meta">
        <p>&copy; 2026 Dovilo. All rights reserved.</p>
        <p><a class="mail" href="/faq#contact" data-u="support" data-d="dovilo.app">support<span aria-hidden="true"> [at] </span>dovilo.app</a></p>
      </div>
    </div>
  </footer>`;

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
