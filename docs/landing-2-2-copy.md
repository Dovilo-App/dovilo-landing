# Landing 2.2 copy deck (EN + TR)

v1 · 5 Kasım 2026 · Sahibi: Selahaddin · Kaynaklar: brief (5 Kasım), A132 ve A133 (`claude/dovilo-mobile-2-2-analysis.md`), store'a giden metinler (`claude/dovilo-2-2-store-text-5-languages.md`), Mobile 2.2 `src/constants/aiConnectGuide.ts` ve locale'leri (master `83f0d54`, köprüyle okundu). Repoda: `docs/landing-2-2-copy.md`.

Bu dosya Landing task'ının tek metin kaynağı ve gerekçesi. **Uygulanmış hali hazır:** `docs/l10n-2-2/en.json` ve `docs/l10n-2-2/tr.json` (bugünkü `src/strings/{en,tr}.json` + bu deck; Claude script'le üretti, markup kontrolü temiz). Ajan bu iki dosyayı `src/strings/`'e kopyalar; diff'in bu deck'le birebir olduğunu kontrol eder, metin yazmaz, cümle düzeltmez, çevirmez. ES, FR, DE aynı EN'den çevrildi: `docs/l10n-2-2/{es,fr,de}.json` (ikinci task).

## 0. Kurallar

1. **Adlandırma (A132) sitede:** tüketici yüzeylerinde (`/`, `/pricing/`, `/downloads/`, `/faq`, offers ve JSON-LD) özellik **"AI Tasks"** (TR "AI Görevleri"), aktör **"coding assistant"** (TR "kodlama asistanı"). `/ai`, `/docs/*`, MCP terimleri (Agents MCP, agent key) ve FAQ'nun MCP grubu içindeki teknik cevaplar "agent" kullanmaya devam eder. Bu deck'in dışında "agent" geçen bir tüketici cümlesi kalırsa ajan raporlar, kendisi yazmaz.
2. `#connect-your-ai` anchor'ı her dil sayfasında aynı. 2.2 app'i `https://dovilo.app/ai/#connect-your-ai` açıyor; bu bölüm olmadan link sayfanın başına düşer.
3. Ana sayfanın yeni bölümünde MCP, agent, URL, approve, revoke kelimeleri yok (ilk temas ilkesi).
4. Sentence case, em dash yok, rakamlar brief'ten. `{{href.ai}}` her dilde o dilin `/ai` sayfası.
5. Değişen her sayfanın `updated` alanı değişikliğin günü; sitemap `lastmod` ondan.

## 1. Değişen key'ler

### `common.offers.month.description`, `common.offers.year.description`, `common.offers.once.description`
Üç key'de aynı parça değişir, gerisi aynı kalır.
- EN: "AI Agents like Claude Code and Cursor work through 15 AI tasks a month for you" → "AI Tasks: coding assistants like Claude Code and Cursor work through 15 AI tasks a month for you"
- TR: "Claude Code ve Cursor gibi AI ajanları senin için ayda 15 AI görevi üzerinde çalışır" → "AI Görevleri: Claude Code ve Cursor gibi kodlama asistanları senin için ayda 15 AI görevi üzerinde çalışır"

### `pages.home.jsonld.features.agents`
- EN: AI Tasks: coding assistants such as Claude Code and Cursor get their own task list over remote MCP, 9 tools, no create, no delete, 15 AI tasks a month (Pro)
- TR: AI Görevleri: Claude Code ve Cursor gibi kodlama asistanları remote MCP üzerinden kendi görev listesini alır, 9 araç, oluşturma yok, silme yok, ayda 15 AI görevi (Pro)

### `pages.home.about.p`
- EN: Dovilo is a free to-do list for iOS and Android with a Pomodoro focus timer and an isometric city builder. Unlimited tasks and focus sessions, no ads, offline-first, 5 languages. Finished work earns bricks, bricks buy buildings, and nothing decays. ChatGPT, Claude, Gemini or Grok can plan your day into it; you approve every plan. Focus, the city and planning with AI can each be turned off. Pro is $2.49 a month.
- TR: Dovilo, iOS ve Android için ücretsiz bir yapılacaklar listesi: Pomodoro odak zamanlayıcısı ve izometrik şehir kurma oyunuyla. Sınırsız görev ve odak seansı, reklam yok, önce çevrimdışı, 5 dil. Biten iş tuğla kazandırır, tuğlalar bina alır ve hiçbir şey eksilmez. ChatGPT, Claude, Gemini ya da Grok gününü buraya planlayabilir; her planı sen onaylarsın. Odak seansları, şehir ve yapay zeka ile planlama ayrı ayrı kapatılabilir. Pro ayda $2.49.

### `pages.home.agents.p`
- EN: Give your coding assistant its own task list, AI Tasks, separate from yours: 9 tools, no create, no delete, your list invisible.
- TR: Kodlama asistanına seninkinden ayrı, kendi görev listesini ver, AI Görevleri: 9 araç, oluşturma yok, silme yok, senin listen görünmez.

### `pages.home.agents.link`
- EN: Read about AI Tasks
- TR: AI Görevleri'ni incele

### `pages.home.pricing.pro.text`
- EN: $2.49 a month, $19.99 a year or $49.99 once, 7-day trial. AI planning, AI Tasks, Desktop, cloud sync, both packs, advanced statistics.
- TR: Ayda $2.49, yılda $19.99 ya da tek seferlik $49.99, 7 günlük deneme. AI ile planlama, AI Görevleri, Desktop, bulut senkronizasyonu, iki paket, gelişmiş istatistikler.

### `pages.home.shipped.mobile.date`, `pages.home.shipped.mobile.text` (link `/changelog/#mobile-2-2-0`)
- Tarih: bu task bugünün tarihini yazar (EN "5 Nov 2026" biçimi, TR "5 Kas 2026"); yayın task'ı merge'den önce Mobile 2.2.0'ın iki store'da canlı olduğu güne çeker. Branch merge'e kadar public değil.
- EN: Mobile 2.2.0: plan with your AI in three steps; AI Tasks for coding assistants; a warmer look.
- TR: Mobil 2.2.0: AI'ınla üç adımda planla; kodlama asistanları için AI Görevleri; daha sıcak bir görünüm.

### `pages.home.shipped.desktop.date`, `pages.home.shipped.desktop.text` (link `/changelog/#desktop-2-2-0`)
- EN: 4 Nov 2026 · Desktop 2.2.0: the same look as the phone and the site; signed Windows builds.
- TR: 4 Kas 2026 · Desktop 2.2.0: telefon ve siteyle aynı görünüm; imzalı Windows sürümleri.

### `pages.home.faq.free.a`, `pages.pricing.faq.free.a`, `pages.faq.faq.free.a`
Üçünde aynı parça değişir.
- EN: "15 AI tasks a month for coding agents" → "15 AI tasks a month for coding assistants"
- TR: "kodlama ajanları için ayda 15 AI görevini" → "kodlama asistanları için ayda 15 AI görevini"

### `pages.faq.faq.plan.a1`
FAQ sayfasında cevap ikiye bölünmüş; yalnızca `a1` değişir, `a2` aynı kalır.
- EN: Yes. In the app, Settings &gt; AI &gt; Connected AI apps walks you through it in three short steps: pick your AI app, add Dovilo to it with the address <code>https://dovilo.app/mcp</code> and sign in with your Dovilo account, then try a first plan. The steps for each app are under <a href="{{href.ai}}#connect-your-ai">Connect your AI app</a>. The assistant proposes a plan, the plan lands in the AI inbox on your phone, and it goes into your lists with one tap once you approve it.
- TR: Evet. Uygulamada Ayarlar &gt; AI &gt; Bağlı AI uygulamaları seni üç kısa adımda yönlendirir: AI uygulamanı seç, Dovilo'yu <code>https://dovilo.app/mcp</code> adresiyle ona ekleyip Dovilo hesabınla giriş yap, sonra ilk planı dene. Her uygulamanın adımları <a href="{{href.ai}}#connect-your-ai">AI uygulamanı bağla</a> bölümünde. Asistan bir plan önerir, plan telefonundaki AI gelen kutusuna düşer ve onayladığında tek dokunuşla listelerine girer.

### `pages.downloads.pro.p2`
Bir parça değişir.
- EN: "10, 30 or 75 extra agent tasks" → "10, 30 or 75 extra AI tasks"
- TR: "10, 30 ya da 75 ek ajan görevi" → "10, 30 ya da 75 ek AI görevi"

### `pages.home.faq.plan.a`
- EN: Yes. In the app, Settings &gt; AI &gt; Connected AI apps walks you through it in three short steps: pick your AI app, add Dovilo to it with the address <code>https://dovilo.app/mcp</code> and sign in with your Dovilo account, then try a first plan. The steps for each app are under <a href="{{href.ai}}#connect-your-ai">Connect your AI app</a>. The assistant proposes a plan, the plan lands in the AI inbox on your phone, and it goes into your lists with one tap once you approve it. For each connection you choose what the assistant can read and which lists and projects it sees, and its changes always wait for your approval; the setting is called <strong>Ask me first</strong>. There is no delete tool, and you can revoke a connection from your phone at any time. Sending a plan works on Free; approving it, and everything else, needs Pro.
- TR: Evet. Uygulamada Ayarlar &gt; AI &gt; Bağlı AI uygulamaları seni üç kısa adımda yönlendirir: AI uygulamanı seç, Dovilo'yu <code>https://dovilo.app/mcp</code> adresiyle ona ekleyip Dovilo hesabınla giriş yap, sonra ilk planı dene. Her uygulamanın adımları <a href="{{href.ai}}#connect-your-ai">AI uygulamanı bağla</a> bölümünde. Asistan bir plan önerir, plan telefonundaki AI gelen kutusuna düşer ve onayladığında tek dokunuşla listelerine girer. Her bağlantı için asistanın neyi okuyabileceğini, hangi listeleri ve projeleri göreceğini sen seçersin; yaptığı değişiklikler her zaman onayını bekler, ayarın adı <strong>Önce bana sor</strong>. Silme aracı yoktur ve bir bağlantıyı telefonundan istediğin an kesebilirsin. Plan göndermek Ücretsiz'de çalışır; onaylamak ve geri kalan her şey Pro ister.

### `pages.home.faq.desktop.q`, `pages.faq.faq.desktop.q`
- EN: Does my coding assistant need Dovilo Desktop running?
- TR: Kodlama asistanımın çalışması için Dovilo Desktop açık olmalı mı?

### `pages.home.faq.desktop.a`, `pages.faq.faq.desktop.a`
- EN: No. Since Dovilo 2.0, coding assistants such as Claude Code and Cursor connect to Dovilo's remote MCP server at <code>https://dovilo.app/mcp/agents</code> with a key you create in the app, from your laptop, a server or a CI runner. Desktop does not need to be open; it is the desktop client for your lists and AI tasks. The assistant sees only the AI tasks of the projects you assign to it, and it cannot create or delete tasks. AI Tasks are part of Pro. Coming from Desktop 1.8? Its built-in MCP server stops working with 2.0, so reconnect your assistant with the new URL and a new key. Setup is on the <a href="{{href.ai}}">developer page</a>.
- TR: Hayır. Dovilo 2.0'dan beri Claude Code ve Cursor gibi kodlama asistanları, uygulamada oluşturduğun bir anahtarla Dovilo'nun remote MCP sunucusuna (<code>https://dovilo.app/mcp/agents</code>) dizüstünden, bir sunucudan ya da bir CI koşucusundan bağlanır. Desktop'un açık olması gerekmez; o, listelerin ve AI görevlerin için masaüstü istemcisidir. Asistan yalnızca ona atadığın projelerin AI görevlerini görür; görev oluşturamaz ve silemez. AI Görevleri Pro'nun parçasıdır. Desktop 1.8'den mi geliyorsun? Onun içindeki MCP sunucusu 2.0 ile çalışmayı bırakır; asistanını yeni URL ve yeni bir anahtarla yeniden bağla. Kurulum <a href="{{href.ai}}">geliştirici sayfasında</a>.

### `pages.home.faq.aiTasks.a`, `pages.pricing.faq.aiTasks.a`, `pages.faq.faq.aiTasks.a`
Üçünde aynı parça değişir.
- EN: "A task counts when it opens to your agent" → "A task counts when it opens to your coding assistant"
- TR: "sen oluşturduğunda değil ajana açıldığında sayılır" → "sen oluşturduğunda değil kodlama asistanına açıldığında sayılır"

### `pages.pricing.plans.pro.lines.agents`
- EN: AI Tasks: coding assistants like Claude Code and Cursor work through 15 AI tasks a month for you.
- TR: AI Görevleri: Claude Code ve Cursor gibi kodlama asistanları senin için ayda 15 AI görevi üzerinde çalışır.

### `pages.downloads.pro.p1`
Bir parça değişir.
- EN: "AI Agents like Claude Code and Cursor working through 15 AI tasks a month over remote MCP" → "AI Tasks, where coding assistants like Claude Code and Cursor work through 15 AI tasks a month over remote MCP"
- TR: "Claude Code ve Cursor gibi AI ajanlarının remote MCP üzerinden ayda 15 AI görevi çalıştırması" → "AI Görevleri: Claude Code ve Cursor gibi kodlama asistanlarının remote MCP üzerinden ayda 15 AI görevi çalıştırması"

### `pages.downloads.what.p2`
Son cümle değişir.
- EN: "<strong>AI tasks</strong> are a separate list you keep for coding agents, which work through it over <a href="{{href.ai}}">remote MCP</a> from any machine." → "<strong>AI Tasks</strong> is a separate list you keep for coding assistants, which work through it over <a href="{{href.ai}}">remote MCP</a> from any machine; on the phone it is a module you turn on in Settings &gt; Modules."
- TR: "<strong>AI görevleri</strong> kodlama ajanları için tuttuğun ayrı bir listedir; ajanlar onu <a href="{{href.ai}}">remote MCP</a> ile herhangi bir makineden çalışır." → "<strong>AI Görevleri</strong> kodlama asistanları için tuttuğun ayrı bir listedir; asistanlar onu <a href="{{href.ai}}">remote MCP</a> ile herhangi bir makineden çalışır. Telefonda Ayarlar &gt; Modüller'den açtığın bir modüldür."

### `pages.downloads.which.p1`
İki parça değişir.
- EN: "AI task management for your agents" → "AI task management for your coding assistants"; "Coding agents do not need it" → "Coding assistants do not need it"
- TR: "ajanların için AI görevi yönetimi" → "kodlama asistanların için AI görevi yönetimi"; "Kodlama ajanlarının ona ihtiyacı yoktur" → "Kodlama asistanlarının ona ihtiyacı yoktur"

### `pages.downloads.faq.agent.q`
- EN: Which download do I need to connect a coding assistant?
- TR: Bir kodlama asistanı bağlamak için hangi indirmeye ihtiyacım var?

### `pages.downloads.faq.agent.a`
- EN: None beyond the phone app. Since Dovilo 2.0, a coding assistant such as Claude Code, Cursor, Windsurf, Codex CLI or Gemini CLI connects to Dovilo's server at <code>https://dovilo.app/mcp/agents</code> with a key you create in the iOS or Android app, or in Dovilo Desktop, so it can run on any machine and Desktop does not need to be running. It reaches AI tasks only, the jobs you write for it in AI Tasks, never your personal to-do list, and it cannot create or delete tasks. You need Pro and Dovilo 2.0 or later; on the phone, turn on AI Tasks in Settings &gt; Modules first.
- TR: Telefon uygulamasından başka hiçbiri. Dovilo 2.0'dan beri Claude Code, Cursor, Windsurf, Codex CLI ya da Gemini CLI gibi bir kodlama asistanı, iOS ya da Android uygulamasında veya Dovilo Desktop'ta oluşturduğun bir anahtarla Dovilo'nun sunucusuna (<code>https://dovilo.app/mcp/agents</code>) bağlanır; böylece herhangi bir makinede çalışabilir ve Desktop'un açık olması gerekmez. Yalnızca AI görevlerine, AI Görevleri'nde onun için yazdığın işlere ulaşır, kişisel yapılacaklar listene asla; görev oluşturamaz ve silemez. Pro ve Dovilo 2.0 ya da sonrası gerekir; telefonda önce Ayarlar &gt; Modüller'den AI Görevleri'ni aç.

### `pages.faq.hero.intro`
Bir parça değişir.
- EN: "from what is free to what an AI agent can see" → "from what is free to what a coding assistant can see"
- TR: "neyin ücretsiz olduğundan bir AI ajanının neyi görebildiğine" → "neyin ücretsiz olduğundan bir kodlama asistanının neyi görebildiğine"

### `pages.faq.groups.agents`
- EN: AI Tasks &amp; MCP
- TR: AI Görevleri ve MCP

### `pages.faq.faq.platforms.a`
İki parça değişir.
- EN: "AI task management for your agents, plus agent keys and each project's webhook settings" → "AI task management for your coding assistants, plus their keys and each project's webhook settings"; "Coding agents connect to Dovilo directly" → "Coding assistants connect to Dovilo directly"
- TR: "ajanların için AI görevi yönetimi; ayrıca ajan anahtarları ve her projenin webhook ayarları" → "kodlama asistanların için AI görevi yönetimi; ayrıca onların anahtarları ve her projenin webhook ayarları"; "Kodlama ajanları doğrudan Dovilo'ya bağlanır" → "Kodlama asistanları doğrudan Dovilo'ya bağlanır"

### `pages.faq.faq.pro.a`
Bir parça değişir.
- EN: "AI Agents like Claude Code and Cursor working through 15 AI tasks a month" → "AI Tasks, where coding assistants like Claude Code and Cursor work through 15 AI tasks a month"
- TR: "Claude Code ve Cursor gibi AI ajanlarının ayda 15 AI görevi çalıştırması" → "AI Görevleri: Claude Code ve Cursor gibi kodlama asistanlarının ayda 15 AI görevi çalıştırması"

### `pages.faq.faq.connect.a`
İlk iki cümle değişir (MCP grubunda, "agent" kalır; mobil yol 2.2'de değişti).
- EN: "Create the agent in the app first. In the mobile app, open <strong>AI Agents</strong> and tap <strong>New agent</strong>; in Dovilo Desktop, use <strong>Connect a new AI</strong>." → "Create the agent in the app first. In the mobile app, turn on <strong>AI Tasks</strong> in Settings &gt; Modules, then open Settings &gt; AI &gt; <strong>AI Tasks</strong> and tap <strong>New agent</strong>; in Dovilo Desktop, use <strong>Connect a new AI</strong>."
- TR: "Önce uygulamada ajanı oluştur. Mobil uygulamada <strong>AI Ajanları</strong>'nı aç ve <strong>Yeni ajan</strong>'a dokun; Dovilo Desktop'ta <strong>AI ekle</strong>'yi kullan." → "Önce uygulamada ajanı oluştur. Mobil uygulamada Ayarlar &gt; Modüller'den <strong>AI Görevleri</strong>'ni aç, sonra Ayarlar &gt; AI &gt; <strong>AI Görevleri</strong>'ne gir ve <strong>Yeni ajan</strong>'a dokun; Dovilo Desktop'ta <strong>AI ekle</strong>'yi kullan."

### İkinci tur (5 Kasım, çevirilerden gelen bulgular; string dosyalarında uygulandı)
- `pages.downloads.boxes.desktop.latest`: `2.0.2` → `2.2.0`, `datetime="2026-10-27"` → `"2026-11-04"`, görünen tarih EN "4 Nov 2026", TR "4 Kas 2026".
- `pages.downloads.which.p2`: güncel mobil sürüm `2.0.0` → `2.2.0`; güncel desktop `2.0.2`, 27 Ekim → `2.2.0`, 4 Kasım 2026 (EN "from 4 November 2026", TR "4 Kasım 2026 tarihli").
- `pages.faq.faq.build.a` (EN): "in the Dovilo tab" → "in the City tab" (app'te sekme City; TR zaten "Şehir sekmesi").
- `pages.faq.faq.connect.a` (TR): Desktop etiketi "AI ekle" → Desktop'un kendi TR etiketi "Yeni AI bağla" ("'yı kullan").
- ES/FR/DE dosyalarında aynı düzeltmeler; ayrıca `hero.listAlt` her dilin kendi listesiyle (Cumpleaños de Lucía, Déménagement, Lenas Geburtstag), başlıklardaki `&amp;` "y / et / und".

Değişmeyenler: `/ai`'ın mevcut key'leri, FAQ'nun MCP grubundaki diğer cevaplar (`mcp.a1`, `authorize`, `notified`, `example`, `connect.q`), `downloads.notes.*`, blog sayımı.

## 2. Yeni bölümler ve key'ler

Şablona yeni bölüm eklenir; bileşenler `docs/design-language.md`'den (yeni bileşen yok). Key adları kesin (string dosyalarındaki gibi): `pages.home.plan.{title,p,pro,link}`, `pages.ai.built.{title,p}`, `pages.ai.connectAi.{title,p,try,source}` ve `pages.ai.connectAi.apps.{chatgpt,claude,gemini,grok}.{name,s1,s2,s3,s4,note}` (Grok'ta `note` yok).

### 2.1 `/` · `#plan-with-ai` (yeni bölüm, "How it works"tan sonra, Focus'tan önce, figür yok: hero zaten 01 ve 07'yi gösteriyor)

`pages.home.plan.title`
- EN: Plan with your AI
- TR: AI'ınla planla

`pages.home.plan.p`
- EN: Ask ChatGPT, Claude, Gemini or Grok to plan your day, an event or a project. The plan arrives in your AI inbox in Dovilo: change what you like and add it to your lists with one tap. Nothing lands before you say yes, and you choose which lists each AI can see. Connecting takes three short steps in the app.
- TR: ChatGPT, Claude, Gemini ya da Grok'tan gününü, bir etkinliği ya da bir projeyi planlamasını iste. Plan Dovilo'daki AI gelen kutuna düşer: istediğini değiştir ve tek dokunuşla listelerine ekle. Sen evet demeden hiçbir şey listene girmez; her AI'ın hangi listeleri göreceğini de sen seçersin. Bağlamak uygulamada üç kısa adım sürer.

`pages.home.plan.pro`
- EN: Connecting and sending plans is free; adding a plan to your lists is part of Pro.
- TR: Bağlamak ve plan göndermek ücretsiz; planı listelerine eklemek Pro'nun parçası.

`pages.home.plan.link` (`{{href.ai}}#connect-your-ai`)
- EN: How to connect your AI app
- TR: AI uygulamanı nasıl bağlarsın

### 2.2 `/ai` · `#built-with-dovilo` (yeni bölüm, "How it works"tan sonra, "Plain MCP, no lock-in"den önce, figür yok)

`pages.ai.built.title`
- EN: How Dovilo itself is built
- TR: Dovilo nasıl geliştiriliyor

`pages.ai.built.p`
- EN: Dovilo is built this way. It has five projects, Backend, Mobile, Desktop, Edge and Landing, and one Claude Code agent for each. I plan a change in Claude, which proposes AI tasks under the right project. I approve them on my phone; the agent at the desk works them, writes its steps and notes on the task, and stops to ask when a decision is mine. This page went through the Landing project the same way.
- TR: Dovilo da böyle geliştiriliyor. Beş projesi var, Backend, Mobile, Desktop, Edge ve Landing, ve her biri için bir Claude Code ajanı. Bir değişikliği Claude'da planlıyorum, o da doğru projenin altına AI görevleri öneriyor. Görevleri telefonumdan onaylıyorum; masadaki ajan onları çalışıyor, adımlarını ve notlarını göreve yazıyor, karar bana düştüğünde durup soruyor. Bu sayfa da aynı yoldan, Landing projesinden geçti.

### 2.3 `/ai` · `#connect-your-ai` (yeni bölüm, "Two servers"tan sonra, "Setup is a URL and a key"den önce)

Yapı: başlık, giriş paragrafı, dört app (her biri `h3` + sıralı adım listesi + varsa not), deneme paragrafı, kaynak satırı. Dört app'in sırası ChatGPT, Claude, Gemini, Grok. Menü ve buton adları (tırnak içindekiler ve yol) **her dilde İngilizce kalır**: app'te de öyle, çünkü yalnızca İngilizce arayüz doğrulandı. Adımlar app'teki `aiConnectGuide.ts` ile birebir; biri değişirse ikisi birlikte değişir.

`pages.ai.connectAi.title`
- EN: Connect your AI app
- TR: AI uygulamanı bağla

`pages.ai.connectAi.p`
- EN: ChatGPT, Claude, Gemini and Grok connect to Dovilo's Personal MCP at <code>https://dovilo.app/mcp</code>. Sign in to Dovilo first; when your AI app asks you to sign in, use the same Google or Apple account. In the app, Settings &gt; AI &gt; Connected AI apps walks you through the same steps.
- TR: ChatGPT, Claude, Gemini ve Grok, Dovilo'nun <code>https://dovilo.app/mcp</code> adresindeki Personal MCP'sine bağlanır. Önce Dovilo'ya giriş yap; AI uygulaman senden giriş yapmanı istediğinde aynı Google veya Apple hesabını kullan. Uygulamada Ayarlar &gt; AI &gt; Bağlı AI uygulamaları seni aynı adımlardan geçirir.

**ChatGPT** (`h3`: ChatGPT, her dilde)
1. EN: Open chatgpt.com/plugins. · TR: chatgpt.com/plugins sayfasını aç.
2. EN: Choose "+", then "Add custom MCP server". · TR: "+" ve ardından "Add custom MCP server" seçeneğini seç.
3. EN: Name it Dovilo and paste the address. · TR: Adını Dovilo koy ve adresi yapıştır.
4. EN: Sign in with your Dovilo account and approve the consent screen. · TR: Dovilo hesabınla giriş yap ve izin ekranını onayla.
- Not EN: On the web. Whether you can add a custom MCP server depends on your ChatGPT plan.
- Not TR: Web'de. Özel MCP sunucusu ekleyip ekleyemeyeceğin ChatGPT planına bağlı.

**Claude**
1. EN: Open Customize &gt; Connectors. · TR: Customize &gt; Connectors sayfasını aç.
2. EN: Choose "Add custom connector". · TR: "Add custom connector" seçeneğini seç.
3. EN: Name it Dovilo and paste the address. · TR: Adını Dovilo koy ve adresi yapıştır.
4. EN: Choose "Connect", sign in with your Dovilo account and approve the consent screen. · TR: "Connect" seçeneğini seç, Dovilo hesabınla giriş yap ve izin ekranını onayla.
- Not EN: On claude.ai or Claude Desktop; it then works in the mobile app too. The free plan allows one custom connector.
- Not TR: claude.ai veya Claude Desktop üzerinde; sonra mobil uygulamada da çalışır. Ücretsiz plan tek bir özel bağlayıcıya izin verir.

**Gemini**
1. EN: Open gemini.google.com &gt; Settings &gt; Connected Apps. · TR: gemini.google.com &gt; Settings &gt; Connected Apps sayfasını aç.
2. EN: Choose "Add a custom app". · TR: "Add a custom app" seçeneğini seç.
3. EN: Paste the address, then choose "Next". · TR: Adresi yapıştır ve "Next" seçeneğini seç.
4. EN: Sign in with your Dovilo account and approve the consent screen. · TR: Dovilo hesabınla giriş yap ve izin ekranını onayla.
- Not EN: On the Gemini web app. Google offers this for personal accounts in the US, age 18 or over, with "Keep Activity" on.
- Not TR: Gemini web uygulamasında. Google bunu ABD'deki, 18 yaş ve üstü, "Keep Activity" açık kişisel hesaplara sunuyor.

**Grok**
1. EN: Open grok.com/connectors. · TR: grok.com/connectors sayfasını aç.
2. EN: Choose "New Connector", then "Custom". · TR: "New Connector" ve ardından "Custom" seçeneğini seç.
3. EN: Paste the address. · TR: Adresi yapıştır.
4. EN: Sign in with your Dovilo account and approve the consent screen. · TR: Dovilo hesabınla giriş yap ve izin ekranını onayla.

`pages.ai.connectAi.try`
- EN: Then ask it for a plan in a new chat, for example: "Plan my tomorrow in Dovilo with 3 small tasks." The plan appears in your AI inbox; review it and approve it. Connecting and sending plans is free; adding a plan to your lists needs Pro.
- TR: Sonra yeni bir sohbette ondan bir plan iste, örneğin: "Dovilo'da yarınımı 3 küçük görevle planla." Plan AI gelen kutuna düşer; incele ve onayla. Bağlamak ve plan göndermek ücretsiz; planı listelerine eklemek Pro ister.

`pages.ai.connectAi.source` (dört link, yeni sekmede, `rel="noopener"`)
- EN: Menu names are each app's own English labels, taken from its help page on 20 October 2026: <a>ChatGPT</a>, <a>Claude</a>, <a>Gemini</a>, <a>Grok</a>. If a menu has moved, the help page has the current one.
- TR: Menü adları her uygulamanın kendi İngilizce etiketleri; 20 Ekim 2026'da yardım sayfalarından alındı: <a>ChatGPT</a>, <a>Claude</a>, <a>Gemini</a>, <a>Grok</a>. Bir menü yer değiştirdiyse güncel hali yardım sayfasında.
- Linkler: ChatGPT https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt · Claude https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp · Gemini https://support.google.com/gemini/answer/17209137 · Grok https://docs.x.ai/grok/connectors

`/ai` JSON-LD: yeni bölüm `HowTo` olarak eklenmez (mevcut şemaya dokunulmaz); FAQ'ya soru eklenmez.

## 3. `/changelog/` (yalnızca EN, elle yazılan sayfa)

Mevcut düzen ve sınıflarla (`rel`, `rel-head`, `rel-notes`, `rel-text`). "Latest" etiketi yeni girdilere geçer.

### Mobile 2.2.0 (`id="mobile-2-2-0"`, Mobile bölümünün en üstü)
Tarih: bu task bugünün tarihini yazar; yayın task'ı merge'den önce iki store'da canlı olduğu güne çeker (changelog'da bir `datetime` ve görünen tarih, string'lerde `shipped.mobile.date`, `llms` satırı). Rapor bu yerlerin listesini verir.
- Plan with your AI: connect ChatGPT, Claude, Gemini or Grok in three short steps from Settings &gt; AI &gt; Connected AI apps. Ask it to plan your day, an event or a project; the plan arrives in your AI inbox to review, edit and approve. You choose which lists each AI can see, and nothing changes without your approval.
- AI Tasks: a separate task list for coding assistants like Claude Code and Cursor, turned on or off in Settings &gt; Modules. Give each assistant its own key and pick its projects; it never sees your personal tasks, and Dovilo Desktop doesn't have to be open. Schedule AI tasks or repeat them daily, weekly or monthly, and answer an assistant's question from your phone, or let your chat AI draft the answer for you to approve.
- Also new: a warmer look in light and dark, and Settings as a short list with a page for each section.
- Approving AI plans and AI Tasks are part of Dovilo Pro.
- Bug fixes and optimizations.

`rel-text`: 2.2 splits the AI layer in two. Planning with AI is for everyone and on from the start; AI Tasks, the list a coding assistant works from, is its own switch and stays off on new installs until you turn it on. 2.1.0 went to beta testers only, so its changes ship here.

### Desktop 2.2.0 (`id="desktop-2-2-0"`, Desktop bölümünün en üstü, `datetime="2026-11-04"` `[confirm: yayın günü]`)
- A new look that matches the mobile app and dovilo.app: new type, a warmer palette in light and dark, and the new app icon.
- Windows builds are now code-signed, so Windows shows the publisher's name when you install or update.
- Bug fixes and optimizations.

`rel-text`: Nothing changes in the MCP contract, agent keys or webhooks, and existing installs update on their own. 2.1.0 was skipped so desktop and mobile carry the same number for this release; the two version lines still move separately.

Sayfanın `dateModified`'ı, `ItemList` şeması ve `llms` satırı yeni girdilere göre. Sayfadaki "if a newer one is published there…" script'i aynı kalır.

## 4. `llms.txt` ve `llms-full.txt` (EN, gerçekler; ajan mevcut cümle yapısını korur)

1. Mobilde agent key yolu: "(AI Agents, then New agent: …)" → "(with the AI Tasks module on, Settings > AI > AI Tasks, then New agent: …)".
2. Pro satırı: "AI Agents like Claude Code and Cursor working through 15 AI tasks a month over remote MCP" → "AI Tasks, where coding assistants like Claude Code and Cursor work through 15 AI tasks a month over remote MCP".
3. Downloads satırı: en son desktop build'i 2.2.0, 4 Nov 2026; Windows build'leri 2.2.0'dan beri imzalı.
4. Release notes satırı: Mobile 2.2.0 (tarih changelog'daki gibi, yayın task'ı günceller) ve Desktop 2.2.0 (4 Nov 2026) eklenir; 2.1.0 yalnızca beta'ya gitti.
5. "Easy to get wrong" listesine (llms-full): "In the app and on the consumer pages the feature is AI Tasks and the actor a coding assistant; agent is the developer term (Agents MCP, agent key)." · "Connecting ChatGPT, Claude, Gemini or Grok is a three-step flow in the app (Settings > AI > Connected AI apps); each app's steps are at https://dovilo.app/ai/#connect-your-ai." · "Focus sessions, the city, planning with AI and AI Tasks can each be turned off in Settings > Modules; AI Tasks is off by default on new installs since 2.2.0."
6. llms'te em dash serbest (makine dosyası); yeni cümlelerde de kullanılmaz.

## 5. Kapsam dışı

`/docs/*`, `/privacy`, `/terms`, blog (Sanity ayrı iş), OG kartlarının metni (değişen meta yok), ES/FR/DE (ayrı task, ayrı dosyalar).
