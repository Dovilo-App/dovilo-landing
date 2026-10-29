/* Everything the blog build needs to know about the site and the Sanity project.
   The project id and dataset are not secrets — a public dataset is world-readable
   by design, and the build only ever reads. */

export const SITE = {
  origin: 'https://dovilo.app',
  name: 'Dovilo',
  twitter: '@doviloapp',
  logo: '/notify-icon.png',
  defaultOgImage: '/og-card.jpg',
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
  /* The blog index's <h1>: it names Dovilo, as every page's does (design-language §7). */
  title: 'Dovilo blog',
  /* The blog index's first paragraph is `intro`, then the post count the build
     counts, then `topics`. `intro` alone is also the index's meta description,
     its Blog JSON-LD description and the feed's, so it stays a sentence of 150
     characters at most. No em dash in either: a person reads them. */
  intro: 'Notes written while building Dovilo, a free to-do list with a focus timer and a city builder, by one engineer in Istanbul.',
  topics: 'so far on focus, gamification and task management for coding agents.',
  /* The day the index's own copy last changed (its h1, the intro). Its sitemap
     lastmod is the later of this and the newest post's, so bump it with any
     change to the index's words (CLAUDE.md: a retitle counts). */
  indexUpdated: '2026-10-29',
  /* Newest-first entries per blog index page. One page until there is more than this. */
  perPage: 24,
};
