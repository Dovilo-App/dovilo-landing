# Dovilo site: 5 dil, onboarding kapsamı ve 2.1 çekimleri (A130, A131)

v1.2 · 1 Kasım 2026 · Sahibi: Selahaddin · Kararlar: A130 (site 5 dilde), A130'un çekim ve veri kuralları, **A131 (çekimlerin sunumu: kırpma ve stage)**. Kaynaklar: `dovilo-landing-design-language.md` (repoda `docs/design-language.md`), Landing `CLAUDE.md`, plan dokümanı ("Dovilo ürün ayrıştırma, landing ve SEO GEO planı.md"), mobile 2.1 analizi (A125), brief §1.1, §1.2, §12. Public repo `Dovilo-App/dovilo-landing` main `de26d2c` (PR #22 merge, 1 Kasım) Claude tarafından okundu; keşif task'ı açılmadı. **Bu doküman Landing reposunda yaşar: `docs/dovilo-landing-l10n-analysis.md` (iş başına analiz ilgili repoya; 1 Kasım kuralı).**

### Sürüm geçmişi

| Sürüm | Tarih | Değişiklik |
|---|---|---|
| v1 | 31 Ekim 2026 | A130 kararları; onboarding kapsamı; çekim planı (iOS Simulator + macOS, 5 dil); çekim verisi (bölüm 6); task sırası |
| v1.1 | 1 Kasım 2026 | A131 (bölüm 9): mobil çekim status bar ve home indicator'dan kırpılır, kutu ≈386×747; yeni Figure varyantı "stage"; feature crop figür başına. Şehir (03) tek çekim. Desktop çekimlerinde ad ve e-posta dummy, 06'da prod URL. EN çekim swap'i TR task'ına taşındı. Yayın kapısı: TR go = Mobile 2.1.0 iki store'da. PR #22 merge; `tr.json` klonda untracked. |
| v1.2 | 1 Kasım 2026 | Mobile ve Desktop çekimleri teslim (120 + 60), Landing `screenshots/new/`'de (mobil düz, desktop dil klasörlü). 09 kaynakta kırpık (1206×1290), kutu 386×413, A131 kırpması uygulanmaz. Şehir light + dark `en-03`. Dokümanın yeri Landing `docs/`. Çekimlerden çıkan app bulguları (bölüm 8). EN 11'de "Langgraph Demo" görünüyor, yeniden çekim açık. |

---

## 1. Keşif (repo, 31 Ekim; 1 Kasım eki)

| Konu | Bulgu |
|---|---|
| Build | Sayfalar elle yazılmış statik HTML; build yalnızca blog (`tools/build-blog.mjs`, `tools/template.mjs`, Sanity) ve ikonlar (`tools/build-icons.mjs`, `sharp`). `package.json`: `marked`, `sharp`; Node ≥ 20.9. **1 Kasım (PR #22 merge):** beş sayfa `src/pages` + `src/strings/en.json` + `src/partials`'tan `build:pages` ile; `build:og` kartları string'lerden üretir; `src/strings/`'te yalnızca `en.json`; `tr.json` Selahaddin'in klonunda untracked (bölüm 3.3) |
| String'ler | HTML içinde; i18n dosyası yok. Nav, footer ve site script'i 12 sayfada ve `template.mjs`'de kopya. **1 Kasım:** beş sayfa ve partial'lar tek kaynaktan |
| Dil sinyalleri | `hreflang` yalnızca `/`'de (`en`, `x-default`); `inLanguage` yalnızca `/ai`, `/downloads/`, blog; `og:locale` `en_US`; `lang="en"` |
| Görünür kelime (yaklaşık, details hariç) | `/` 393 · `/ai` 408 · `/pricing/` 293 · `/downloads/` 73 (+1.140 collapsible) · `/faq` 72 (+2.150 cevap) · `/docs/` 141 · `/docs/mcp/` 3.540 · `/docs/webhooks` 2.490 · `/changelog/` 1.560 · `/privacy` 1.220 · `/terms` 760 · `/licenses` 198 |
| Dark capture | `<picture>` + `source.src-dark`, site script `media`'yı `data-theme`'e göre çevirir; dosya adı `-dark` genişlik ekinden önce; dark desktop seti light boyutuna ölçeklenirdi (2874×1866 → 2844×1846 kusuru; 2.1 setinde iki tema 2844×1846, kusur bitti) |
| Figure kutuları (1 Kasım) | `src/pages`'de `width`/`height` şablonda, string'de değil: `/` 386×840 ×6, 386×350 (ambience mixer, kırpık), 386×884 (şehir); `/ai` 2000×1298 ×2, 386×840 ×10. `.figure img`: `--surface` zemin, 1px `--border`, radius 8. Kırpık figür emsali var (mixer) |
| WebP | ffmpeg libwebp q88 (şehir q80); PNG kaynaklar `screenshots/` ve `screenshots/new/`; tinypng eşdeğeri adım yok. **1 Kasım: `screenshots/new/` 2.1 setleri:** `mobile/{light,dark}/<lang>-NN.png` (düz, 120 + şehir `en-03` light ve dark; 09 1206×1290, diğerleri 1206×2622), `desktop/<lang>/{light,dark}/desktop-NN-<name>.png` (60, 2844×1846, köşeler saydam). İki hiyerarşi farklı; ajan kendisi çözer |
| OG kartları | **1 Kasım:** `tools/build-og.mjs`; `frame()` çekimi 1px `--border`, radius 8, `--surface` kutuda çizer (A131'in stage'iyle aynı dil) |
| Sitemap, llms | Elle; blog bölümü build ile (`BLOG:START/END`). `_config.yml` exclude listesi var |
| Font | `inter-latin.woff2` + `inter-latin-ext.woff2` (TR karakterleri hazır) |
| Landing AI brief | "English only for now. No language switcher unless a task asks." (değişir, bölüm 3.12) |

## 2. Kapsam

**Giren:** `/`, `/ai`, `/pricing/`, `/downloads/`, `/faq` beş dilde (EN, TR, ES, FR, DE); dil seçici; dil başına OG kartı; sitemap ve hreflang; 2.1 onboarding'in Landing karşılığı (bölüm 4); 2.1 çekimleri beş dil × light/dark, mobil ve desktop (bölüm 5, 6); site görsellerinin tinypng eşdeğeri sıkıştırması; **çekimlerin sunumu (bölüm 9)**.

**Girmeyen:** `/docs/*`, `/changelog/`, `/privacy`, `/terms`, `/licenses`, blog ve `/404.html` (EN kalır; hreflang kümesine girmez); `/focus` sayfası (ayrı plan); store metinleri (zaten 5 dilde); legal çeviri (native okur ve hukuk gerekir); `llms*.txt` dil kopyaları; cihaz illüstrasyonu (bölüm 9).

## 3. Kararlar (A130, 31 Ekim, Selahaddin "task'ları oluşturabilirsin"; 1 Kasım güncellemeleri)

1. **URL.** Dil başına alt yol: `/tr/`, `/es/`, `/fr/`, `/de/` (`/tr/ai/`, `/tr/pricing/`, `/tr/downloads/`, `/tr/faq/`). `/` ve EN sayfalar olduğu yerde, `/en/` yok. Otomatik yönlendirme yok. Her sayfa kendi canonical'ı (dil sayfalarında slash'lı biçim; EN'de bugünkü biçim, CLAUDE.md known issue'daki altı slash'sız canonical bu işte değişmez). Kümedeki her sayfada altı `hreflang`: `en`, `tr`, `es`, `fr`, `de`, `x-default` → EN. `og:locale` dile göre (`tr_TR`, `es_ES`, `fr_FR`, `de_DE`), `og:locale:alternate` ile diğerleri. `<html lang>` dile göre.
2. **Mekanizma: beş sayfa build'den çıkar.** `src/pages/{home,ai,pricing,downloads,faq}.html` şablon (layout, figure'lar, JSON-LD iskeleti) + `src/strings/{en,tr,es,fr,de}.json` (her görünür metin, meta, alt, caption, FAQ Q&A, JSON-LD'ye giren her cümle, `/downloads` page script'inin beş `source` satırı) + `src/partials/{nav,footer,site-script}.html` (tek kopya; `tools/template.mjs` de bunları okur). `tools/build-pages.mjs` EN için `index.html`, `ai/index.html`, … ve dil için `<lang>/<page>/index.html` yazar. EN çıktısı bugünkü sayfayla birebir (PR #22: sha256 birebir). Diğer yedi sayfa elle kalır. CLAUDE.md: "beş yerelleştirilmiş sayfa `src/`'den çıkar; `index.html`'leri elle düzenleme". `src/` `_config.yml` exclude'unda. **Yapıldı (PR #22, main `de26d2c`).**
3. **Çeviri.** Claude yazar, task context'i ile değil, string dosyası olarak repoya girer. **TR:** `claude/landing-strings/tr.json` projede; Selahaddin'in klonunda `src/strings/tr.json` untracked (main'e tek başına konmaz: henüz olmayan çekimlere referans verir); TR task'ı dosyayı branch'inde commit eder, yeniden yazmaz. Sözlük: app string'leri (`claude/dovilo-app-strings-site-glossary-5-languages.md`, `claude/dovilo-app-strings-pro-5-languages.md`). Değişmeyen adlar: Dovilo, Dovilo Pro, Dovilo Desktop, My Day, My Tasks, AI Tasks, AI Agents, Agents MCP, Personal MCP, Focus Ambience Pack, Full City Package, Rainy City ve sahne adları, "Ask me first" app'teki çevirisiyle. TR'de agent = ajan; TR "sen", DE "du", FR app'in kaydı. Sentence case, em dash yok, hype yok; rakamlar brief'ten, para birimi `$` ("store'da yerel fiyat" notu `/pricing`'e bir satır). ES, FR, DE için native okur yok; Claude çevirisiyle yayın, geri bildirimle düzeltme.
4. **Word budget.** Dil sayfasında EN bütçesi × 1,3; hero h1 ≤ 12 kelime, step label ≤ 10, feature cümlesi ≤ 24. Bütçe cümle atma gerekçesi değil; EN'deki her olgu dil sayfasında da var.
5. **`llms.txt` / `llms-full.txt`.** Tek dosya, EN. Her dil sayfası aynı dosyaya `rel="alternate" type="text/markdown"` verir. `llms.txt`'e "Languages" bölümü: beş dil ve yerelleştirilmiş URL listesi; `llms-full.txt`'teki "easy to get wrong" listesine "the site is in five languages; prices on every language page are in USD" satırı.
6. **JSON-LD.** Dil sayfasında `WebPage` (`inLanguage`, kendi `url`, `dateModified`), `BreadcrumbList` (Dovilo / sayfa; dil sayfasında Dovilo düğümü `/<lang>/`), `FAQPage` yalnızca o sayfanın HTML'indeki çevrili Q&A ile. `SoftwareApplication` `#app` düğümüne `@id` ile referans; `offers`, `featureList`, `releaseNotes` yalnızca EN sayfalarda. `/tr/` ana sayfasında `Organization` tekrarlanmaz.
7. **Sitemap.** Tek `sitemap.xml`; kümedeki her URL kendi `<url>` girdisi ve altı `<xhtml:link rel="alternate" hreflang>`; dil sayfalarının `priority` EN'in bir kademe altı (`/tr/` 0.8, `/tr/ai/` 0.8, `/tr/pricing/` 0.7, `/tr/faq/` 0.7, `/tr/downloads/` 0.6). `lastmod` string dosyasındaki `updated` alanından. Search Console: domain property alt yolları kapsar; Bing ve IndexNow listesine dil URL'leri.
8. **OG kartları.** Dil başına `og-<page>-<lang>.jpg`, `tools/build-og.mjs` ile (yapıldı, PR #22; `/faq` EN'de `og-card.jpg`, dillerde `og-faq-<lang>.jpg`). 1200×630 JPG, `og:image:alt` dil string'inden. **A131:** kart, hero çekiminin kırpık halinden üretilir. Latin-ext fallback ilk TR kartlarında kontrol edilir.
9. **Dil seçici: "Language menu".** Yapıldı (PR #22): `details.lang-menu`, script'siz; 2+ dilde görünür, mevcut dil önce ve `aria-current`; footer'da beş dil linki; `/styleguide/`'da iki tema. Menü yalnızca butondan ya da linkten kapanır (kabul).
10. **Linkler.** Google Play: `&hl=<lang>` ve `utm_content=<lang>`; `/ai` ve `/<lang>/ai/`: `&referrer=utm_content%3Dai` (A125). App Store: `ct=<kampanya>_<lang>`. Desktop installer: `?source=<placement>_<lang>`. `/<lang>/downloads/?source=` beş değerle çalışır; satırlar string dosyasında. İç linkler: küme içi kendi dilinde, küme dışına EN. `/<lang>/faq/` slash'lı tek biçim. `/downloads` Latest satırının tarih sırası EN sabit; dil için format key.
11. **404.** GitHub Pages tek `404.html`: EN kalır.
12. **Landing AI brief.** "English only…" satırı silinir; yerine: "The site is in five languages (EN, TR, ES, FR, DE). The five localised pages (home, /ai, /pricing, /downloads, /faq) are built from `src/` by `npm run build:pages`; never edit their `index.html` by hand. Translations come only from a task or a strings file Selahaddin places; never write or 'fix' a translation yourself." (Selahaddin, project brief'te.)
13. **Sıra (1 Kasım).** Task 1 (build) ✔ → **task 2 (TR string'leri + 2.1 çekimler EN ve TR + A131 bileşeni + OG, sitemap, hreflang; yayın go kapılı, madde 14)** → task 3 (ES, FR, DE string'leri ve çekimleri) → 2.1 swap task'ı (changelog 2.1.0 kayıtları, `/ai` Play referrer, "Planning with AI" bölümü, modül satırı; içerik değişiklikleri, bölüm 4). **EN çekim swap'i TR task'ında:** kutu boyutları şablonda olduğundan EN ve TR aynı boyutta çekim ister; A131 kırpması boyutu değiştirir.
14. **Yayın kapısı (1 Kasım).** 2.1 çekimleri store'daki 2.0'dan görünür biçimde farklı (Inter, ikon, A126/A128). TR PR'ı hazırlanır ve review edilir; **merge go'su Mobile 2.1.0 iki store'da canlı olunca.** Desktop 2.1 çekimleri Desktop 2.1.0'dan önce kabul `[confirm: Selahaddin]`. EN 11 "Demo"lu çekimi go'dan önce değişir (bölüm 8.8).

## 4. Onboarding'in Landing karşılığı (A125 → site)

Ürün 2.1'de dört modül: **Tasks** (her zaman açık), **Focus sessions**, **City**, **Planning with AI**; Focus, City ve AI Settings > Modules'tan kapatılabilir. Siteye yansıması:

1. **`/` yapısı modülle aynı.** Hero ve "In short" değişmez (jargonsuz). "How it works" Plan → Approve → Focus → Build kalır. Bölümler: Focus, City, ve `<h2>` "Planning with AI" (tek bölüm, bir cümle, bir figure: `01` karşılığı). Developer bölümü (`/ai` linki) kalır.
2. **Yeni fact satırı (2.1'den itibaren):** "Focus, the city and planning with AI can each be turned off". Mobile 2.1.0 yayına girmeden siteye girmez.
3. **Kapı parametresi:** `/ai` Play linkine `&referrer=utm_content%3Dai` (A125). `/`'de parametre yok.
4. **İlk temas copy ilkesi** `/`'ye de uygulanır: hero, In short, step label'ları ve Planning with AI bölümünde MCP, agent, URL, approve/revoke kelimeleri yok.
5. **2.1 çekim swap'i:** `/` phone pair (`01`, `07`), step ekranları, Focus, Ambience, City; `/ai` hero çifti (`desktop-01` + `02`) ve step ekranları (`11`, `12`, `13`, `05`). **Kutular (A131):** mobil 386×840 → ≈386×747 `[confirm: ölçüm]`; mixer (09) kaynakta 1206×1290 → **386×413**; şehir aynı kırpma kuralıyla; desktop 2000×1298 aynı. Çekim kısmı TR task'ında (3.13); içerik kısmı swap task'ında.

## 5. Çekim planı ve teslim (31 Ekim kararı; 1 Kasım sonucu)

- **Cihaz:** Mobile iOS Simulator (iPhone 17 Pro), 1206×2622, prod JS modu (`--no-dev --minify`), 9:41, dil app'ten, bölge dile göre. Desktop macOS dev run, 1422×923 (2844×1846), CDP ile sürüldü. Android ve Windows çekimi yok.
- **Teslim (1 Kasım):** Mobile 120 PNG, `pr-assets/l10n-shots` `b4a5cfa`, zip `Screenshots/Mobile/l10n-shots.zip`; Desktop 60 PNG, `captures/l10n` `7f95e99`, zip `Screenshots/Desktop/desktop-l10n-shots.zip`; şehir (03) Selahaddin, light ve dark `en-03` (ekranda metin yok, beş dilde aynı dosya). **Landing `screenshots/new/`:** `mobile/{light,dark}/<lang>-NN.png` (düz) ve `desktop/<lang>/{light,dark}/desktop-NN-<name>.png`; projede aynı dosyalar `Screenshots/`. Site WebP'leri `screenshots/<lang>/…` (EN düz kalır), adlar EN'in aynısı. PNG kaynaklar tam kare kalır; A131 kırpması WebP adımında.
- **Mobile kurallar ve sonuç:** inbox kartı yalnızca 01 ve 12'de; planlar onaylandı (listeler plandan, "Show in AI Tasks" kapalı), proposal'lar reddedildi, EN planı reddedildi (liste vardı); avatar capture-only hardcode ile default (hesapta foto duruyor); e-posta hiçbir ekranda yok; 06 key prefix blur; 09 kaynakta kırpık (1206×1290, "Layers (2/3)" 18pt üstünden). Simülatör çıkış yapmış.
- **Desktop kurallar ve sonuç:** ad ve e-posta "Sam Parker" / `sam.parker@example.com`, avatar "S", 06'da `https://dovilo.app/mcp/agents`, hepsi capture-only; renderer'da dil başına veri filtresi (sidebar yalnızca o dilin project ve listesi); 06 blur kutusu 280×56 px @ (982, 1214), FR'de y 1196 (meta satırı sarıyor); kota satırı "0 of 15 used, +58 extra"; EN Website'ta 7 AI task (2 completed, 2.0'dan), diğer dillerde 5 ve Completed grubu yok; 05'te yalnızca EN task'ının notu var; "Langgraph Demo" → **LangGraph** (kalıcı); Claude Code ve LangGraph Website'ta.
- **Sıkıştırma:** Landing ajanı WebP'yi `sharp` ile üretir (q88, şehir q80, sayfadaki genişlikler; desktop'ta alpha korunur), sonra **Tinify API** (`TINIFY_API_KEY` env var, Landing `.env`; ayda 500). Env var yoksa ajan WebP'leri zip'ler ve durur.

## 6. Çekim verisi (5 dil)

Dev hesabında, ilgili dilde; listeler planların onayıyla oluştu. EN running task'ı yeniden oluşturuldu. Açıklama satırları 1 Kasım cevabıyla eklendi.

| | EN | TR | ES | FR | DE |
|---|---|---|---|---|---|
| Plan (inbox, 01) | Mia's birthday party | Taşınma: haftalık plan | Cumpleaños de Lucía | Déménagement de décembre | Lenas Geburtstagsparty |
| Proposal (inbox, 12) | Add a sitemap.xml and link it from robots.txt | sitemap.xml ekle ve robots.txt'ten bağlantı ver | Añadir un sitemap.xml y enlazarlo desde robots.txt | Ajouter un sitemap.xml et le lier depuis robots.txt | Eine sitemap.xml hinzufügen und in robots.txt verlinken |
| Project | Website | Web sitesi | Sitio web | Site web | Webseite |
| Brief | mevcut | Dovilo'nun sitesi: statik HTML, GitHub Pages. Her değişiklik PR ile; yayın branch'ine merge Selahaddin'den. | Sitio de Dovilo: HTML estático en GitHub Pages. Cada cambio en un PR; Selahaddin hace el merge a la rama de publicación. | Site de Dovilo : HTML statique sur GitHub Pages. Chaque changement passe par une PR ; Selahaddin fusionne dans la branche de publication. | Dovilos Website: statisches HTML auf GitHub Pages. Jede Änderung als PR; den Merge in den Publishing-Branch macht Selahaddin. |
| Awaiting (02, 05) | Pick a color palette for the landing page | Açılış sayfası için renk paleti seç | Elegir una paleta de colores para la página de inicio | Choisir une palette de couleurs pour la page d'accueil | Eine Farbpalette für die Startseite auswählen |
| Awaiting açıklama | (eski: "Propose a palette… styles.css", kilitli) | Tasarım sistemine uyan iki palet öner, uygulamadan önce sor. | Propón dos paletas que encajen con el sistema de diseño y pregunta antes de aplicar una. | Propose deux palettes compatibles avec le design system et demande avant d'en appliquer une. | Schlage zwei Paletten vor, die zum Designsystem passen, und frage vor dem Anwenden nach. |
| Awaiting sorusu (05) | mevcut | İki seçenek var: nötr gri zemin ve tek amber vurgu, ya da koyu zemin ve amber. Hangisiyle devam edeyim? | Hay dos opciones: fondo gris neutro con un solo acento ámbar, o fondo oscuro con ámbar. ¿Con cuál sigo? | Deux options : fond gris neutre avec un seul accent ambre, ou fond sombre avec ambre. Je continue avec laquelle ? | Zwei Optionen: neutraler grauer Hintergrund mit einem Amber-Akzent oder dunkler Hintergrund mit Amber. Mit welcher soll ich weitermachen? |
| Running (02, 13) | Add an RSS feed for the changelog | Changelog için RSS beslemesi ekle | Añadir un feed RSS para el changelog | Ajouter un flux RSS pour le changelog | Einen RSS-Feed für das Changelog hinzufügen |
| Running açıklama | A feed.xml with the latest release notes, linked from every page. | Son sürüm notlarını taşıyan bir feed.xml, her sayfadan bağlantılı. | Un feed.xml con las últimas notas de versión, enlazado desde todas las páginas. | Un feed.xml avec les dernières notes de version, lié depuis chaque page. | Eine feed.xml mit den neuesten Release Notes, von jeder Seite verlinkt. |
| Running adımlar (13) | 1 (done): Generate feed.xml · 2: Link the feed in `<head>` | 1 (bitti): feed.xml'i oluştur · 2: `<head>`'e feed linkini ekle | 1 (hecho): Generar feed.xml · 2: Enlazar el feed en `<head>` | 1 (fait) : Générer feed.xml · 2 : Lier le flux dans `<head>` | 1 (erledigt): feed.xml erzeugen · 2: Feed im `<head>` verlinken |
| Running notu (13, adım notu) | feed.xml carries the last 20 entries, dates in UTC. The link comes in the next step. | feed.xml son 20 kaydı taşıyor, tarihler UTC. Link bir sonraki adımda. | feed.xml incluye las 20 últimas entradas con fechas en UTC. El enlace va en el siguiente paso. | feed.xml contient les 20 dernières entrées, dates en UTC. Le lien vient à l'étape suivante. | feed.xml enthält die letzten 20 Einträge, Daten in UTC. Der Link kommt im nächsten Schritt. |
| Queued 1 (02) | Compress the hero images | Hero görsellerini sıkıştır | Comprimir las imágenes del hero | Compresser les images du hero | Die Hero-Bilder komprimieren |
| Queued 2 (02) | Add Open Graph tags to every page | Her sayfaya Open Graph etiketleri ekle | Añadir etiquetas Open Graph a todas las páginas | Ajouter les balises Open Graph sur chaque page | Open-Graph-Tags auf jeder Seite ergänzen |
| Scheduled, weekly (02) | Check the site for broken links | Sitedeki kırık linkleri kontrol et | Revisar los enlaces rotos del sitio | Vérifier les liens cassés du site | Die Website auf defekte Links prüfen |
| New task (11) başlık | Add a custom 404 page | Özel 404 sayfası ekle | Añadir una página 404 personalizada | Ajouter une page 404 personnalisée | Eine eigene 404-Seite hinzufügen |
| New task (11) açıklama | Custom 404 page for the website | Site için özel 404 sayfası | Página 404 personalizada para el sitio | Page 404 personnalisée pour le site | Eigene 404-Seite für die Website |
| New task (11) Context for AI | Create 404.html on the design system: a one-line message, links to home, downloads and the FAQ. | 404.html tasarım sistemiyle: nav, footer ve tema script'i aynı; kısa metin, ana sayfaya link; sitemap'e girmez. | 404.html con el sistema de diseño: misma nav, footer y script de tema; texto breve, enlace a la portada; fuera del sitemap. | 404.html avec le design system : même nav, footer et script de thème ; texte court, lien vers l'accueil ; hors sitemap. | 404.html mit dem Designsystem: gleiche Nav, Footer und Theme-Script; kurzer Text, Link zur Startseite; nicht in der Sitemap. |
| Agent (06) | Claude Code | Claude Code | Claude Code | Claude Code | Claude Code |
| Focus (08) | Rainy City, 25 dk, ~2 dk sonra | aynı | aynı | aynı | aynı |
| Ambience (09) | Rain + Fireplace, Follow the session rhythm on | aynı | aynı | aynı | aynı |
| Market (10) | Pro kartı, çıkış yapılmış | aynı | aynı | aynı | aynı |
| Connected AI apps (04) | Claude; All lists açık; kesim Disconnect üstü | aynı | aynı | aynı | aynı |
| Liste (07, Desktop 05) | Mia's birthday | Taşınma | Cumpleaños de Lucía | Déménagement | Lenas Geburtstag |
| Desktop 05'te açık task | Book the back room at Café Lune | Üç nakliye firmasından teklif al | Reservar la sala del fondo del Café Luna | Demander trois devis à des déménageurs | Den Nebenraum im Café Luna reservieren |

Scheduled task'ın tarihi 2 Kasım 09:00, weekly. UI kesimleri (ajan kısaltmadı, kabul): mobil 02 project başlığı ES/DE, 02 kota satırı TR/ES/FR/DE, 11 context 3 satır; desktop 02 brief satırı her dilde elips, EN 04 brief alanı kayar, ES/FR 02 reply hint iki satır.

## 7. Platform etkisi

Mobile ve Desktop: çekim task'larında kod değişikliği yok (override'lar commit edilmedi). Backend, rules, MCP tool surface, webhook payload: yok. Landing: bölüm 3 ve 9. Brief: §12'ye Play `hl`/`utm_content`, App Store `ct=_<lang>`, installer `source=_<lang>`; §1.1'e 2.1 ve dil setleri, şehir tek çekim, dummy kimlik, kırpma notu; §4 "Languages" satırına site 5 dilde. Eski client: yok. Brick: yok.

## 8. Açık konular

1. Native okur ES/FR/DE: yok; geri bildirim kanalı support@.
2. `/focus` sayfası ve `utm_content=focus`: Mobile referrer'ı yalnızca `ai`'ı okuyor.
3. Tinify aylık kotası (500): EN + TR ilk turda ~90 dosya; ES/FR/DE ~135; yeter.
4. CLAUDE.md known issue: altı slash'sız canonical; dil sayfaları slash'lı. EN tarafı ayrı iş.
5. Desktop 2.1 çekimlerinin Desktop 2.1.0'dan önce yayını `[confirm]` (3.14).
6. Kırpma piksel değerleri ve kutu boyutları ölçümden sonra design-language'a yazılır.
7. **App bulguları (çekimlerden), düzeltme task'larına:** Mobile: 06 key tarihinde ay adı yerelleşmiyor (TR "Oct 31, 2026", DE "31. Oct 2026"); FR 05 "votre réponse" / "Ta réponse" karışık. Desktop: 06 key tarihleri her dilde EN; scheduled saatleri TR/ES/FR/DE'de 12 saat "AM"; `aiPromptHintDismissed` yazılıyor, `SyncService._parseSettings` okumuyor (hint her açılışta döner). "Send test" webhook butonu gerçek UI string'i, kabul.
8. **EN 11:** "Runs on: Langgraph Demo, Claude Code" görünüyor (agent adı sonra LangGraph oldu). `/ai` step ekranlarında kullanılıyor; TR go'sundan önce en-11 light/dark simülatörde yeniden çekilir (iki dosya; Mobile task'ı ya da Selahaddin).
9. Eski EN running task (`chg_a88f3da8cbda00dd3779`) dev Inbox'ta project'siz; dev app'ten iptal (Selahaddin).

## 9. A131: çekimlerin sunumu (1 Kasım, Selahaddin: "çıplak çekim çirkin; illüstrasyon olmayacaksa görsellere başka bir şey yapmak gerekiyor")

**Karar: cihaz illüstrasyonu yok (ilke 4 değişmez); üç araç: kırpma, stage, feature crop.**

1. **Kırpma (mobil, zorunlu).** Her tam kare telefon çekimi (1206×2622) WebP adımında status bar'ın altından ve home indicator'ın üstünden kırpılır; PNG kaynak tam kare kalır (store ve Claude Design için). Ajan `en-01` light üzerinde satırları ölçer, aynı değerleri bütün tam kare dosyalara uygular; beklenen ≈1206×2334 (üst 186, alt 102 `[confirm]`), site kutusu 386×840 → **≈386×747** `[confirm]`. Şehir (`en-03`) aynı kural. **09 kaynakta zaten kırpık (1206×1290, status bar yok): kırpılmaz, kutusu 386×413.** Desktop kırpılmaz; macOS köşeleri saydam kalır (WebP alpha), kutunun `--surface` zemini köşeleri temaya göre doldurur.
2. **Stage (yeni Figure varyantı, `figure-stage`).** Çekim `--surface` zeminli bir panelin içinde oturur: 1px `--border`, radius 8, padding `--space-3` (24px; 600px altında `--space-2`). İçindeki çekim bugünkü 1px `--border` ve radius 8'ini korur. Gölge, gradient, cihaz çizgisi yok; iki temada aynı. Token tablosundaki "`--surface`: the backing behind screenshots" tanımının bileşeni budur. Uygulanır: `figure-phone`, `figure-row` (her figür kendi panelinde), `figure-phones` (phone pair tek panelde, 64px/48px kaydırma panel içinde). Uygulanmaz: `figure-pair` (/ai hero), `step-shot`. Design-language Figure bölümüne, `system.css`'e ve `/styleguide/`'a aynı commit'te (TR task'ı). `build-og.mjs`'in kutusu zaten aynı dil; değişmez.
3. **Feature crop (figür başına, isteğe bağlı).** Kanıt ekranın bir parçasıysa tam telefon yerine o parça (09 emsali). Hangi figürün parça olacağı 2.1 swap task'ında figür figür yazılır.

**Reddedilen (b):** gerçek cihaz illüstrasyonu. İlke 4'ü değiştirir, her dosyaya çerçeve biner, iki yılda eskir. Selahaddin isterse A132 ile açılır.

**Doküman etkisi:** design-language ilke 4 aynı; Figure bölümüne "Phone captures are cropped below the status bar and above the home indicator at the WebP step; the PNG source stays full frame. Desktop captures keep their transparent corners." ve kutu boyutları; yeni alt başlık "Stage". Brief §1.1'e kırpma notu.
