/* Everything the blog build needs to know about the site and the Sanity project.
   The project id and dataset are not secrets — a public dataset is world-readable
   by design, and the build only ever reads. */

export const SITE = {
  origin: 'https://dovilo.app',
  name: 'Dovilo',
  twitter: '@doviloapp',
  logo: '/dovilo-icon.png',
  defaultOgImage: '/og-card.jpg',
  /* English on every blog index, because the card's text is English. */
  defaultOgImageAlt: 'Dovilo: turn your to-do list into a city you build, beside an isometric city',
  author: { name: 'Selahaddin Akgün', url: 'https://sakgun.com' },
};

export const SANITY = {
  projectId: '3unyshld',
  dataset: 'production',
  /* Pinned: a GROQ result shape is only stable within an API version. */
  apiVersion: '2024-10-01',
};

export const BLOG = {
  dir: 'blog',
  base: '/blog/',
  /* The index's words (h1, intro, the count sentence, the RSS label, the
     "no posts" note, the English note of a language copy) live in
     src/strings/<lang>.json under pages.blog, with the day they last changed
     (`updated`). The index's sitemap lastmod is the later of that day and the
     newest post's, so bump `updated` with any change to the index's words
     (CLAUDE.md: a retitle counts). The intro is also the meta description and
     the Blog JSON-LD and feed description, so it stays a sentence of 150
     characters at most, with no em dash. */
  /* Sitemap priority of a language's blog index, a step under English's 0.8
     (A130 3.7, as langPriority in tools/pages-lib.mjs). */
  langPriority: '0.6',
  /* Newest-first entries per blog index page. One page until there is more than this. */
  perPage: 24,
};
