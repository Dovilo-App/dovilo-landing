/* The page shell for generated blog pages.

   The shell links /styles/base.css like every other page on the site, so the
   palette, the type ramp, the ink scale and the nav/footer chrome all live
   there instead of being copy-pasted per page. Only what is genuinely
   blog-specific stays below — the post list, the post head, the cover figure,
   the table-of-contents card and the end-of-post CTA. If the palette changes,
   it changes in styles/base.css; never re-declare a token here. */

import { SITE, BLOG } from './config.mjs';

export const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* First in <head>, straight after canonical and the llms.txt alternate: the
   preload scanner has to find these in the opening packets. */
const STYLES = `<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles/base.css">`;

const THEME_BOOT = `<script>
    (function(){
      try{
        var t = localStorage.getItem('dovilo-theme');
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
      }catch(e){}
    })();
  </script>`;

const THEME_JS = `<script>
    /* ─── THEME ─── */
    const THEME_COLORS = { dark: '#161B1D', light: '#F7F8F8' };

    function effectiveTheme() {
      const forced = document.documentElement.getAttribute('data-theme');
      if (forced === 'light' || forced === 'dark') return forced;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function paintThemeChrome() {
      const theme = effectiveTheme();
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
      const btn = document.querySelector('.theme-toggle');
      if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }

    function toggleTheme() {
      const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('dovilo-theme', next); } catch (e) {}
      paintThemeChrome();
    }

    /* ─── MOBILE MENU ─── */
    function toggleMenu() {
      const menu = document.getElementById('nav-menu');
      const overlay = document.getElementById('menu-overlay');
      const burger = document.querySelector('.hamburger');
      const open = menu.classList.toggle('open');
      overlay.classList.toggle('open', open);
      if (burger) burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    function closeMenu() {
      const menu = document.getElementById('nav-menu');
      const overlay = document.getElementById('menu-overlay');
      const burger = document.querySelector('.hamburger');
      if (menu) menu.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    paintThemeChrome();
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', paintThemeChrome);
  </script>`;

/* Only what base.css does not already own. Everything here is either a blog
   component (post list, post head, cover, CTA, prev/next) or an opt-out from a
   base.css rule that targets the bare <nav> element — the table of contents and
   the prev/next row are both <nav>, and neither is site chrome. */
const CSS = `<style>
    .page{padding-block:var(--s-7) var(--s-8)}
    .lede{margin-top:var(--s-3)}

    /* ── index ── */
    .post-list{margin-top:var(--s-7);display:flex;flex-direction:column;gap:14px}
    .card h2{font-size:var(--t-3);line-height:1.4;margin:var(--s-2) 0}
    .card p{font-size:var(--t-1);color:var(--ink-2)}
    .card .tags{margin-top:var(--s-3)}
    .empty{
      border:1px solid var(--line);border-radius:var(--radius-lg);
      padding:28px var(--s-5);margin-top:var(--s-7);
      font-size:var(--t-1);color:var(--ink-2);
    }

    /* ── article ── */
    .post-head{margin-bottom:var(--s-6)}
    .post-head .tags{margin-bottom:14px}
    .post-head h1{margin-bottom:14px}
    .tags{display:flex;gap:var(--s-2);flex-wrap:wrap}
    .cover{margin:0 0 var(--s-6)}
    .cover img{
      width:100%;height:auto;display:block;
      border-radius:var(--radius-lg);border:1px solid var(--line);background:var(--card);
    }
    figcaption{font-size:var(--t--1);color:var(--ink-3);margin-top:10px;text-align:center}

    /* Table of contents. A boxed card, not the sticky rail /docs/webhooks uses,
       so it stays local. The site header is .site-nav, so this <nav> inherits
       nothing from it. */
    .toc{
      border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--bg-2);
      padding:20px var(--s-5);font-size:var(--t-1);
    }
    .toc-title{
      font-size:var(--t--3);font-weight:700;letter-spacing:.08em;text-transform:uppercase;
      color:var(--ink-3);margin-bottom:10px;
    }
    .toc ul{margin-left:18px}
    .toc li{margin-bottom:var(--s-1)}
    .toc ul ul{margin-top:var(--s-1)}
    .toc a{color:var(--accent);font-size:inherit;font-weight:400}

    /* ── end of post ── */
    .cta{
      margin-top:56px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--bg-2);
      padding:var(--s-5);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
    }
    .cta div{font-size:var(--t-1);color:var(--ink-2);max-width:46ch}
    .cta strong{display:block;font-size:var(--t-2);margin-bottom:var(--s-1)}
    .cta a{
      background:var(--accent);color:var(--on-accent);text-decoration:none;
      font-weight:600;font-size:var(--t-0);
      padding:10px 20px;border-radius:var(--radius-pill);white-space:nowrap;
    }
    .cta a:hover{background:var(--muted);color:var(--on-accent)}
    /* The prev/next row. A <nav>, but the site header is .site-nav, so there is
       nothing here to undo. */
    .more{
      display:flex;
      margin-top:var(--s-7);padding:var(--s-5) 0 0;
      border-top:1px solid var(--line);
      gap:var(--s-5);align-items:flex-start;justify-content:space-between;flex-wrap:wrap;font-size:var(--t-0);
    }
    .more a{color:var(--accent);text-decoration:none}
    .more a:hover{text-decoration:underline}
    .more span{display:block;font-size:var(--t--2);color:var(--ink-3);margin-bottom:2px}
  </style>`;

/* The canonical site chrome. Identical markup on every page — styles/base.css
   and the script above both depend on these class names and ids. */
const NAV = (current) => `<a class="skip-link" href="#main">Skip to content</a>

  <nav class="site-nav" aria-label="Main navigation">
    <a href="/" class="logo"><img src="/notify-icon.webp" width="32" height="32" alt="Dovilo icon">Dovilo</a>
    <ul id="nav-menu">
      <li><a href="/#features" onclick="closeMenu()">Features</a></li>
      <li><a href="/#focus" onclick="closeMenu()">Focus</a></li>
      <li><a href="/ai" class="nav-ai" onclick="closeMenu()">AI<span class="nav-dot" aria-hidden="true"></span></a></li>
      <li><a href="/blog/"${current === 'blog' ? ' aria-current="page"' : ''} onclick="closeMenu()">Blog</a></li>
      <li><a href="/#pricing" onclick="closeMenu()">Pricing</a></li>
      <li><a href="/downloads/" onclick="closeMenu()">Download</a></li>
    </ul>
    <div class="nav-actions">
      <a href="https://apps.apple.com/app/dovilo/id6761195015?ct=website_nav&mt=8" class="nav-store-link" aria-label="App Store" title="App Store">
        <svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.dovilo.app&utm_source=website&utm_medium=nav" class="nav-store-link" aria-label="Google Play" title="Google Play">
        <svg viewBox="0 0 24 24"><path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .61-.92zM14.5 12.707l2.55 2.55-8.27 4.698 5.72-7.248zm4.89-2.29l1.81 1.028a.998.998 0 0 1 0 1.73L19.4 14.2l-2.83-2.2 2.82-2.283zM8.78 2.045l8.27 4.698-2.55 2.55-5.72-7.248z"/></svg>
      </a>
      <button class="nav-store-link theme-toggle" onclick="toggleTheme()" aria-label="Switch theme" title="Switch theme">
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
      <button class="hamburger" onclick="toggleMenu()" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
        <svg viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
    </div>
  </nav>
  <div class="menu-overlay" id="menu-overlay" onclick="closeMenu()"></div>`;

/* The footer links are how link equity reaches the pages that are not in the
   nav — do not trim the list. */
const FOOTER = `<footer>
    <div class="footer-left">&copy; 2026 Dovilo. All rights reserved.</div>
    <ul class="footer-socials">
      <li><a href="https://x.com/doviloapp" target="_blank" rel="noopener" aria-label="X (Twitter)">
        <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a></li>
      <li><a href="https://instagram.com/doviloapp" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </a></li>
      <li><a href="https://linkedin.com/company/doviloapp" target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a></li>
    </ul>
    <ul class="footer-links">
      <li><a href="/ai">For developers</a></li>
      <li><a href="/docs/webhooks">Webhooks</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/changelog/">Changelog</a></li>
      <li><a href="/downloads/">Downloads</a></li>
      <li><a href="/faq">FAQ</a></li>
      <li><a href="/terms">Terms</a></li>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/licenses">Licenses</a></li>
    </ul>
  </footer>`;

/**
 * Renders one full page. `jsonLd` is an array of objects, each written into its
 * own application/ld+json block the way the hand-written pages do it.
 *
 * `back` is still accepted because build-blog.mjs passes it, but the shared nav
 * replaced the standalone back-link it used to render.
 */
export function page({ title, description, canonical, ogType = 'website', ogImage, ogImageAlt, head = '', jsonLd = [], back, body }) {
  const abs = (u) => (String(u || '').startsWith('http') ? u : SITE.origin + (u || SITE.defaultOgImage));
  const img = abs(ogImage);
  /* Only the blog index is the page the Blog nav entry points at; a post is not
     in the nav, so it marks nothing. */
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
  <link rel="alternate" type="text/markdown" href="${SITE.origin}/llms.txt" title="llms.txt — structured summary for language models">
  ${STYLES}
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
  <meta name="theme-color" content="#161B1D">
${head}  ${THEME_BOOT}
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  ${CSS}
${ld ? ld + '\n' : ''}</head>
<body>
  ${NAV(current)}

  <main id="main">
    <div class="page wrap-prose">

${body}

    </div>
  </main>

  ${FOOTER}

  ${THEME_JS}
</body>
</html>
`;
}
