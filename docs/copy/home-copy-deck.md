# / (home): copy deck for the redesign

28 Oct 2026 · Draft for the Landing task "Redesign /" · Follows `docs/design-language.md` (Landing repo), the `/ai` deck (`claude/dovilo-ai-page-copy.md`) and the information architecture in "Dovilo: ürün ayrıştırma, landing ve SEO/GEO planı" (section "/ (A ve A')"). Facts from `dovilo-product-brief.md` §3, §4, §7, §8, §16. Audience: A (gamified to-do and focus) and A' (plans the day with ChatGPT or Claude). Developers get two lines and a link to /ai.

Visible budget: 350 words of body copy (the /ai rule: 400 there). Headings, step labels, buttons, captions and the 10 FAQ questions count as visible too, as on /ai, and they add about 145 here (the 10 FAQ questions alone are 55, the headings 30, captions and labels about 25, buttons and links about 35), so the cap for this page is 450. This draft counts 299 words of body copy and 443 visible words in all (alt text excluded). Text inside details/summary (the FAQ answers), nav and footer does not count; store badges are images.

Component names in brackets are the design-language components. Text in «» is the exact copy. `[verbatim: ...]` means the agent copies the named source word for word. Capture rule (brief §1.1): a capture shows exactly what the sentence next to it says, or there is no capture; no capture appears twice on the page; step screens carry no visible caption; figure captions describe only what is visible. Em dashes nowhere; sentence case; nothing invented.

## 1. Hero [hero] · id none

- H1: «Dovilo: the to-do list that builds you a city.» (8 words after the brand name; the 9-word cap excludes it) `[confirm: H1 and title tag against keyword research. Today's title "Gamified To-Do List, Focus Timer & City Builder - Dovilo" keeps its keywords]`
- Sub: «Plan it yourself or with ChatGPT and Claude, focus with full-screen ambience, and watch finished work become a city. Free on iOS and Android, no ads.»
- Buttons: App Store badge (`ct=website_hero`) · Google Play badge (`utm_medium=hero`). Text link: «Building with Claude Code or Cursor?» → /ai/
- Figure pair (the /ai hero pair component, two phones): `en-01` and `en-07`. Caption: «Six tasks proposed by Claude, approved into a list.» Alt 1: «Dovilo AI inbox: a plan of six tasks from Claude with an Approve button». Alt 2: «Dovilo list Mia's birthday with the six approved tasks under Today, Tomorrow and This week».

## 2. In short (GEO paragraph, first `<p>` after the hero) · id about

«Dovilo is a free to-do list for iOS and Android with a Pomodoro focus timer and an isometric city builder. Unlimited tasks and focus sessions, no ads, offline-first, 5 languages. Finished work earns bricks, bricks buy buildings, and nothing decays. ChatGPT or Claude can plan your day into it; you approve every plan. Pro is $2.49 a month.»

## 3. How it works [steps-01-04, no screens] · id features

- h2: «How it works»
- 01 «Plan» «Write tasks, or let ChatGPT or Claude propose them.»
- 02 «Approve» «Nothing lands in your list until you tap yes.»
- 03 «Focus» «A session, a Pomodoro cycle, or a timer on one task.»
- 04 «Build» «Bricks from finished work buy a city that stays.»

No step screens: the plan and the list are in the hero; Focus and the city have their own figures below.

## 4. Focus [feature-row with two figures] · id focus

- h2: «Focus that fills the whole screen»
- «A single session, a Pomodoro cycle or a timer on one task, free and unlimited. The Focus Ambience Pack adds 5 scenes and 16 sound layers, 3 at a time: $4.99 once, included with Pro.»
- Figure A: `en-08`. Caption: «Rainy City, 22 minutes left.» Alt: «Dovilo focus session in the Rainy City scene with the timer at 22:40»
- Figure B: `en-09`, cropped so the "The Sound of My City · Soon" card is out. Caption: «Rain and fireplace.» Alt: «Dovilo ambience sound mixer with Rain and Fireplace layers and Follow the session rhythm on»

## 5. City [feature-row with one figure] · id showcase

- h2: «A city that stays»
- «Tasks and focus sessions pay bricks. Spend them on houses, offices, parks and roads, placed where you want. Nothing decays, no streak punishes a quiet week. Large builds come with the Full City Package, $4.99 once, included with Pro.»
- Figure: `en-03`, cropped at the left edge (cut-off card out). Alt: «Dovilo isometric city at level 26 with a stadium, a hospital and a city hall». No caption.

## 6. Developers [two lines] · id agents

- «Building with Claude Code or Cursor? Your agent gets its own task list: 9 tools, no create, no delete, your list invisible.»
- Link: «Read about AI Agents» → /ai/

## 7. Price [pricing-summary] · id pricing

- h2: «What it costs»
- «Free» «The whole personal app: unlimited tasks and focus sessions, the city, no ads.»
- «Pro» «$2.49 a month, $19.99 a year or $49.99 once, 7-day trial. AI planning, AI Agents, Desktop, cloud sync, both packs, advanced statistics.»
- Link: «See pricing» → /pricing/ once that page exists; until then no link, this summary is the pricing anchor. The three-column table and the "7 days free" badge go.

## 8. Recently shipped [dated list, 3 rows, newest first; the agent takes them from /changelog/] · id none

- h2: «Recently shipped»
- «27 Oct 2026» «Mobile 2.0.0: plan with ChatGPT, Claude, Gemini or Grok; AI Agents.»
- «27 Oct 2026» «Desktop 2.0.2: task details open over the list.»
- «9 Sep 2026» «Mobile 1.2.0: the city redrawn, with animations.»
- Link: «All release notes» → /changelog/
- iOS 2.0.0 is not mentioned here; the changelog carries the iOS date when Apple approves.

## 9. FAQ [faq-accordion, 10 questions; FAQPage JSON-LD word for word] · id faq

- h2: «Straight answers»
- `[verbatim: the 10 Q/As on today's /]` with these edits only:
  1. "What is new in the Focus tab?" → «How does Focus work?»; in its answer "every scene brings its own ambience — Rainy City, Midnight, Dusk, Snow or Fog" → "every scene brings its own ambience: Rainy City, Midnight, Dusk, Snow or Fog".
  2. "Yes!" → "Yes." in "Is Dovilo free?" and "Does Dovilo work offline?".
  3. In "Can I plan with ChatGPT, Claude, Gemini or Grok?": "and by default its changes wait for your approval: the setting is called Ask me first" → "and its changes always wait for your approval; the setting is called Ask me first".
  4. In "Do I need the Focus Ambience Pack?": "the Default scene is always available — it is simply silent" → "the Default scene is always available and is simply silent".
  5. Every remaining em dash in the answers → comma, colon or full stop, meaning unchanged.
- The 10 questions count (55 words); the answers do not.

## 10. Blog [one line] · id blog

- «Written while building Dovilo: the blog» → /blog/. The three post cards go; the posts still carry pre-2.0 sentences, so nothing is quoted here.

## 11. Founder and download [closing-cta] · id download

- h2: «One engineer, in Istanbul.»
- «No company, no funding. A public release history you can check.» → /changelog/
- Buttons: App Store badge (`ct=website_download`) · Google Play badge (`utm_medium=download`) · Text link: «Dovilo Desktop for Windows and Mac needs Pro» → /downloads/

## Removed from today's /

The counters strip (5 languages, 6 scenes, 16 layers, ∞), the "To-do, focus and city, in detail" card grid, the "Your productivity, on every screen" showcase with the desktop capture and the 1.x mobile captures, the three-column pricing table, the "7 days free" badge, the three blog cards, the long "One loop, and what it costs" paragraph (its facts are in In short and Price), the "NEW" label on Focus, the Market capture. Every old anchor id keeps its id on a new block (map below). Trust lines about AI stay on /ai and in FAQ 3; the home does not repeat them.

## Anchor map

| id | today | new block |
|---|---|---|
| about | One loop, and what it costs | 2 In short |
| features | To-do, focus and city, in detail | 3 How it works |
| focus | Focus that fills the whole screen | 4 Focus |
| showcase | Your productivity, on every screen | 5 City |
| agents | Building with Claude Code or Cursor? | 6 Developers |
| pricing | Unlock the full experience | 7 Price |
| faq | Common questions | 9 FAQ |
| blog | Written while building Dovilo | 10 Blog line |
| download | Get Dovilo on your device | 11 Closing |

## Captures on the page (each once)

| Capture | Where |
|---|---|
| en-01 | Hero pair, left |
| en-07 | Hero pair, right |
| en-08 | Focus, figure A |
| en-09 (cropped) | Focus, figure B |
| en-03 (cropped) | City |

## SEO and GEO

- Title keeps "Gamified To-Do List, Focus Timer & City Builder - Dovilo" `[confirm]`; meta description = In short's first two sentences.
- JSON-LD: WebSite, SoftwareApplication (#app; offers unchanged), Organization, WebPage, FAQPage = the 10 visible Q/As. The diff is reported in the PR.
- `llms-full.txt`: regenerated from the new page; never shorter than today (7,909 words). Before and after in the report.
- OG card 1200×630 for / from `en-01` + `en-07` on the page background with the H1, the `/og-ai.jpg` component; `og-card.jpg` stays for pages not yet redesigned.
- Search Console: coverage check after merge; query and click comparison 7 days after.

## Trimming order if over 450

Captions (hero pair, Focus A and B) → the third Recently shipped row → the hero text link → the Focus sentence's "free and unlimited" (it is in In short). Never In short, the FAQ questions or the H1.

## Decided (28 Oct 2026, 16:47)

- Cap 450 visible words; body copy stays under 350.
- No AI trust-line block on the home; the trust lines live on /ai and in FAQ 3.
- H1 as written; keyword research is a later check, not a blocker.
- 10 FAQ questions on the home.
- /pricing link appears when that page ships (next task).
