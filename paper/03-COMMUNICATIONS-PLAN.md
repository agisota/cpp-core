# Communications Plan: 12 недель, посуточно

> *Операционный план GTM для CPP v1.0.0-rc.1. Версия 0.1 (2026-05-21).*
> *Рассчитан на исполнение одним founder'ом с частичным delegation на Q3 2026.*

---

## Обзор воронки

```
╭────────────────────────────────────────────────────────────────────────────╮
│                                                                            │
│   ВЕРХ ВОРОНКИ             СЕРЕДИНА               ДНО ВОРОНКИ             │
│                                                                            │
│  Cold outreach (60)     Demo call (15)         Pilot signed (5)          │
│  ───────────────        ──────────────         ──────────────             │
│  LinkedIn DM            30-min video call      LOI / contract             │
│  Email cold             Live retro analysis    Shadow deploy              │
│  Warm intro             follow-up deck         Daily reports              │
│  Conference talk        Pilot proposal         Conversion conv.           │
│                                                                            │
│  Target: 60 touches  →  15 demos  →  8 LOIs  →  5 pilots signed          │
│          Week 1-4         Week 2-8              Week 3-12                 │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯
```

**Conversion funnel KPIs:**

| Этап | Target rate | Absolute target | Timeline |
|---|---|---|---|
| Outreach → Response | 25% | 15 responses | Week 1-3 |
| Response → Demo | 100% (of responses) | 15 demos | Week 2-6 |
| Demo → Retro analysis | 60% | 9 analyses | Week 3-7 |
| Retro analysis → LOI | 90% (if ROI > $10K/мес) | 8 LOIs | Week 4-9 |
| LOI → Signed contract | 60% | 5 signed | Week 6-12 |

---

## Недели 1-2: посуточный план

### Неделя 1 (1-7 июня 2026): Validation + первый outreach

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ПОНЕДЕЛЬНИК 1 ИЮНЯ                                                       │
│                                                                           │
│  09:00  Запустить Эксперимент 1 (experiments/exp1-cache-alignment.py)    │
│         Настроить автозапись результатов в файл                           │
│         Стоимость прогона: $50 на API calls                               │
│                                                                           │
│  11:00  Написать cold outreach batch #1 (5 компаний):                    │
│          - Sber AI (AI R&D Director: Andrei Grachev, LinkedIn)            │
│          - Tinkoff ML Platform (VP Engineering: Kirill Makharinsky)       │
│          - MTS AI (CTO: Denis Afanasyev, AI division)                     │
│          - Yandex Search (AI Infra: Ilya Segalovich / team)               │
│          - G42 Inception AI (CEO: Peng Xiao, warm via Hub71 intro)        │
│                                                                           │
│  15:00  LinkedIn profile update: добавить CPP reference implementation    │
│         GitHub README обновить: Experiments section                       │
│                                                                           │
│  17:00  Собрать результаты Exp.1 (первый batch завершится ~4h)           │
│         Документировать: cache_read_input_tokens / total ratio             │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  ВТОРНИК 2 ИЮНЯ                                                           │
│                                                                           │
│  09:00  Публикация результатов Exp.1:                                     │
│          - Gist на GitHub (raw data + analysis)                           │
│          - Tweet thread: "We tested whether CPP canonical bytes align     │
│            with Anthropic's internal prompt cache. Results: thread 🧵"    │
│          - LinkedIn post (профессиональный тон, без хайпа)                │
│          - HackerNews "Ask HN: We measured cache alignment in Claude API" │
│                                                                           │
│  11:00  Cold outreach batch #2:                                           │
│          - TII Falcon Team (Dr. Ebtesam Almazrouei, research director)   │
│          - ADNOC Digital (Chief Digital Officer: Mansoor Al Hamed)        │
│          - Kaspi.kz AI Team (CTO: Mikhail Lomtadze)                       │
│          - Sourcegraph (CEO: Quinn Slack, via cold email)                 │
│          - Cursor (CEO: Michael Truell, via Twitter DM)                   │
│                                                                           │
│  14:00  Начать разработку cpp-cli analyze tool:                          │
│          - Input: anonymized API usage log (JSONL)                        │
│          - Output: retroactive savings report (Markdown + JSON)           │
│          - ETA: 2 дня                                                     │
│                                                                           │
│  16:00  Application: Astana Hub (astanahub.com/apply)                    │
│         Заполнить форму: company profile + tech product                  │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  СРЕДА 3 ИЮНЯ                                                             │
│                                                                           │
│  09:00  Cold outreach batch #3:                                           │
│          - Anthropic Customer Success (cs@anthropic.com + warm intro     │
│            через Anthropic Startup Fund form)                             │
│          - OpenAI Developer Relations (devrel@openai.com)                 │
│          - Notion AI Team (Akshay Kothari, CPO)                           │
│          - Replit (Amjad Masad, CEO, Twitter DM)                          │
│          - Glean Technologies (CEO Arvind Jain)                           │
│                                                                           │
│  11:00  Продолжить cpp-cli analyze (50% готово)                          │
│                                                                           │
│  14:00  First follow-up к batch #1 (если нет ответа через 2 дня)        │
│         Шаблон follow-up: см. §«Шаблоны» ниже                            │
│                                                                           │
│  16:00  Подготовить deck для первых demo calls                            │
│         Базировать на strategy/deck-outline.md                           │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  ЧЕТВЕРГ 4 ИЮНЯ                                                           │
│                                                                           │
│  09:00  Cold outreach batch #4:                                           │
│          - Halyk Bank (CTO Bakhytzhan Zhaksybekov)                        │
│          - Sber500 program (sber500.com/apply — заполнить форму)          │
│          - Phystech Ventures (Ilya Osipov, MD)                            │
│          - 500 Global MENA (Sharif El-Badawi, Founding MD)               │
│          - Y Combinator (ycombinator.com — early expression of interest)  │
│                                                                           │
│  11:00  Завершить cpp-cli analyze v0.1:                                  │
│          docker build agisota/cpp-cli:v0.1                               │
│          Тест на собственных логах сессий                                 │
│                                                                           │
│  14:00  Настроить email автоматизацию:                                   │
│          - daily shadow report template                                   │
│          - weekly savings summary template                                │
│                                                                           │
│  16:00  Подготовить shado-mode docker-compose.yml                        │
│          (для пилотных клиентов)                                          │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  ПЯТНИЦА 5 ИЮНЯ                                                           │
│                                                                           │
│  09:00  Cold outreach batch #5:                                           │
│          - Pinecone (CEO Edo Liberty)                                     │
│          - Cohere (CEO Aidan Gomez, warm via AI community)                │
│          - AI21 Labs (CEO Ori Goshen)                                     │
│          - Scale AI (CEO Alexandr Wang)                                   │
│          - Weights & Biases (CEO Lukas Biewald)                           │
│                                                                           │
│  11:00  Недельный review: подсчёт ответов, ранжирование                  │
│          Кто ответил / кто нет / кто требует follow-up                   │
│                                                                           │
│  13:00  Назначить demo calls на следующую неделю                         │
│         (из ответивших)                                                   │
│                                                                           │
│  15:00  Опубликовать публичный benchmark suite v0.1:                     │
│          github.com/agisota/cpp-benchmarks                               │
│          Содержит: synthetic multi-agent scenarios + expected savings     │
│                                                                           │
│  17:00  Неделя 1 retrospective: что сработало, что нет                   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Неделя 2 (8-14 июня 2026): Первые demo calls + LOI conversations

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ПОНЕДЕЛЬНИК 8 ИЮНЯ                                                       │
│                                                                           │
│  09:00  Follow-up batch: все кто не ответил на batches #1-2               │
│                                                                           │
│  11:00  DEMO CALL #1 (первый ответивший)                                  │
│         Структура: 30 мин                                                 │
│           5 мин: pain validation ("сколько тратите на LLM API?")         │
│           10 мин: live demo cpp-cli analyze на их публичных данных        │
│           10 мин: architecture overview (deck slides 3-7)                │
│           5 мин: pilot proposal + Q&A                                     │
│                                                                           │
│  14:00  Cold outreach batch #6:                                           │
│          - Deloitte AI Practice (Partner: Beena Ammanath)                │
│          - McKinsey QuantumBlack (MD: Jacomo Corbo)                       │
│          - PwC AI & Data (Partner: Anand Rao)                             │
│          - Accenture AI (CTO: Paul Daugherty)                             │
│          - BCG X (MD: Hamid Maher)                                        │
│                                                                           │
│  16:00  Post-call: отправить follow-up deck + pilot proposal             │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  ВТОРНИК 9 ИЮНЯ                                                           │
│                                                                           │
│  09:00  DEMO CALL #2                                                      │
│                                                                           │
│  11:00  Запрос на retroactive analysis #1:                                │
│         Email к клиенту #1: "Для начала retro — нужны API logs"          │
│         Объяснить: anonymization, что мы не смотрим на content           │
│                                                                           │
│  14:00  Cold outreach batch #7 (developer communities):                  │
│          - HackerNews "Show HN: CPP - content-addressed LLM context"     │
│          - Reddit r/MachineLearning                                       │
│          - Dev.to article: "We saved 70% on Claude API tokens"            │
│                                                                           │
│  16:00  Начать arXiv preprint draft:                                      │
│          "Cross-provider canonical encoding for LLM context caching"    │
│          Sections: abstract, intro, method, experiment 1 results         │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  СРЕДА 10 ИЮНЯ                                                            │
│                                                                           │
│  09:00  DEMO CALL #3                                                      │
│                                                                           │
│  11:00  Astana Hub Tech Visa follow-up (если не получен ответ)           │
│                                                                           │
│  13:00  Retroactive analysis #1: получить логи, запустить cpp-cli analyze │
│                                                                           │
│  15:00  Написать KAUST research group:                                    │
│          Prof. Bernard Ghanem (Visual Computing Center)                   │
│          Email: propose collaborative research on verified AI training    │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  ЧЕТВЕРГ 11 ИЮНЯ                                                          │
│                                                                           │
│  09:00  DEMO CALL #4                                                      │
│                                                                           │
│  11:00  Retroactive analysis #1: доделать, подготовить отчёт             │
│                                                                           │
│  14:00  Anthropic Startup Fund application:                               │
│          URL: anthropic.com/startup-fund (или через partnership email)   │
│          Attaches: one-pager.md + exp.1 results + reference impl link    │
│                                                                           │
│  16:00  Y Combinator W27 application начать:                              │
│          yc.com/apply — Company section, Founders section                │
│          Deadline: ~October 2026 для Jan 2027 batch                      │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  ПЯТНИЦА 12 ИЮНЯ                                                          │
│                                                                           │
│  09:00  Delivery retroactive analysis report #1                           │
│         Презентация клиенту: 45-минутный call с разбором отчёта          │
│                                                                           │
│  11:00  Pilot contract negotiation #1:                                    │
│          Отправить strategy/pilot-contract-template.md (адаптированный)   │
│                                                                           │
│  14:00  DEMO CALL #5 + #6 (если накопились)                              │
│                                                                           │
│  16:00  Неделя 2 retro + planning для недели 3                           │
│         Обновить воронку: сколько в каждом этапе                          │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Недели 3-12: недельный план

### Неделя 3 (15-21 июня): Первый пилот + grant applications

```
Пн: Follow-up на все pending proposals → pressure without pestering
    Retroactive analysis #2 + #3 (параллельно)
Вт: DEMO CALL #7 + #8
    Отправить retro analysis report #2
Ср: Первый пилот contract signing (TARGET)
    Если подписан → начать shadow deployment
Чт: Pilot #1 infrastructure deployment:
      docker run cpp-proxy на их инфра
      Verify connectivity + data flow
Пт: Pilot #1 Day 1 report готов
    NSF SBIR Phase I pre-application research:
      sbir.nsf.gov → Topic area 04 (Cyberinfrastructure)
      Deadline tracking: Sept 2026 window
```

### Неделя 4 (22-28 июня): Scale outreach + funding apps

```
Пн: OpenAI Fund application: openai.fund (заявка)
    Приложить: pilot report (первые 7 дней data)
Вт: DEMO CALLS #9 + #10
    Начать outreach к EU enterprise:
      - SAP (AI Co-Pilot team, Germany)
      - Siemens (Digital Industries, Munich)
      - Deutsche Telekom (MMS Digital, Dresden)
Ср: Anthropic Startup Fund follow-up (если нет ответа за 2 недели)
Чт: Публичный benchmark suite v0.2: добавить real-world scenarios
    Blog post: "What we learned from 2 weeks of shadow deployment"
Пт: Pilot #1: первый 7-дневный report клиенту
    Conversion conversation (предварительная) — что думает клиент
```

### Неделя 5 (29 июня — 5 июля): arXiv preprint push

```
Пн-Вт: Закончить arXiv preprint draft (все секции)
        Reviewer: попросить crypto/ML colleague для review
Ср:    arXiv submission (cs.AI + cs.CR categories)
       Tweet + LinkedIn announcement
Чт:    DEMO CALLS #11 + #12 (из новых ответов)
       Pilot #2 negotiation
Пт:    Conference submission research:
        NeurIPS 2026 Workshop proposals (deadline: ~June 2026)
        ICLR 2027 paper (deadline: ~October 2026)
```

### Неделя 6 (6-12 июля): Pilot momentum + press

```
Пн:  Pilot #1: 30-day full report клиенту
     Conversion conversation: propose production deployment
Вт:  DEMO CALLS #13 + #14
     Retro analysis #4 + #5
Ср:  Pilot #2 contract signing (TARGET: второй пилот)
     Shadow deployment для Pilot #2
Чт:  Tech media outreach:
       The Verge, TechCrunch AI reporter (Kyle Wiggers)
       VentureBeat AI (Carl Franzen)
       Import AI newsletter (Jack Clark — Anthropic alumni, warm intro potential)
Пт:  HuggingFace validator checkpoint publication:
       Upload cpp-validator-v1.0 draft model to HuggingFace Hub
       Open RFC для community review
```

### Неделя 7 (13-19 июля): Academic channel activation

```
Пн:  Outreach academic collaborators:
       - Carnegie Mellon University (LTI: Graham Neubig — AI infra research)
       - MIT CSAIL (Computer Science: David Karger — web infrastructure)
       - ETH Zurich (Systems Group: Ana Klimovic — cloud infra)
       - MILA (Montreal: Joëlle Pineau — RL + AI systems)
Вт:  DEMO CALLS #15 + #16
     Pre-seed fundraising kickoff:
       Contact: a16z Scout Program (если qualified)
       Contact: Lightspeed emerging (Gaurav Gupta — AI infra focus)
Ср:  KAUST research grant application:
       research.kaust.edu.sa → "AI Infrastructure" program
       Budget: $250K for 12-month research collab
Чт:  NeurIPS 2026 Workshop proposal submit (если deadline не прошёл)
     Название: "Canonical Representations for Verifiable AI Systems"
Пт:  Pilot #2: Day 7 report; conversion temperature check
```

### Неделя 8 (20-26 июля): Pre-seed conversations

```
Пн:  Pre-seed investor calls begin:
       a16z AI team (Martin Casado partner focus)
       Lightspeed (Gaurav Gupta)
       Index Ventures (London: Jan Hammer)
Вт:  Retro analysis #6 + #7 (pipeline building)
     Pilot #3 negotiation (G42 или Sber-tier)
Ср:  VC deck finalize: вставить реальные данные pilot #1 (30 дней)
Чт:  Term sheet conversations (если есть interest)
     Pilot #1 Production go-live (if conversion agreed)
Пт:  Review: 8 недель later — что изменилось vs plan
     Update financial model с реальными данными
```

### Неделя 9 (27 июля — 2 августа): Series of term sheets

```
Пн:  Follow-up всех VC contacts из недели 8
     Pilot #3 contract signing (TARGET)
Вт:  Anthropic Startup Fund → second conversation (если первый был)
Ср:  NSF SBIR Phase I application submission:
       sbir.nsf.gov portal
       Budget request: $275,000 (12 months)
       Principal Investigator: Founder
       Topic: AI Cyberinfrastructure
Чт:  EU Horizon Europe pre-check:
       cordis.europa.eu → Cluster 4 Digital open calls
       Find consortium partner в EU (academic institution)
Пт:  arXiv preprint citations check; если есть academic feedback — respond
```

### Неделя 10 (3-9 августа): Pilot scale + Series A prep

```
Пн:  Pilot #1: 60-day report; discuss full production + pricing conversion
     Conversion target: $2,000-5,000/мес (revenue share или flat fee)
Вт:  DEMO CALLS: focus now on MENA Tier 1:
       Aramco Digital, Saudi Telecom (STC), Careem
Ср:  Pilot #4 negotiation
     Series A early conversations (if pre-seed closing):
       Sequoia AI infra thesis check (Sonya Huang — AI focus)
Чт:  Conference speaking proposal:
       USENIX Security 2027 CFP (opens ~October 2026)
       CCS 2026 Workshop (track: AI Security)
Пт:  Press release draft: "CPP reaches 5 pilots, $X in documented savings"
```

### Неделя 11 (10-16 августа): Pre-seed close target

```
Пн:  Pre-seed term sheet finalization (TARGET CLOSE DATE)
Вт:  Legal: Delaware C-Corp incorporation (if not done)
     Stripe Atlas process initiation
Ср:  Pilot #1 conversion confirmed → first revenue
Чт:  ADGM entity initiation for MENA (if UAE pilot signed)
Пт:  Press: "CPP raises pre-seed $X" (if closed)
     arXiv preprint v2 update с full experiment results
```

### Неделя 12 (17-23 августа): Scale setup

```
Пн:  Post-close: onboard first employee (GTM Lead или Research Lead)
Вт:  Pilot #5 signing (TARGET: 5 signed by end of week 12)
Ср:  Seed round planning: target close Q1 2027
     Deck v2: incorporate pilot results + ARR trajectory
Чт:  NeurIPS 2026 main conference paper submission:
       "Context Provenance Protocol: Canonical Infrastructure for AI Systems"
       Deadline: ~end of May 2026 (may need to target NeurIPS 2027 main)
       Alternative: NeurIPS 2026 Workshop (более реалистично)
Пт:  12-week retrospective и planning для следующего квартала
     All metrics tracked and published internally
```

---

## Шаблоны сообщений

### Cold outreach: Tech company (CTO / VPE)

```
Subject: CPP — 30-70% экономия на LLM input tokens для команд с shared context

[Name],

Смотрел как [Company] использует [Claude Code / AI-agents / LLM API] и вижу
классический паттерн: если у вас несколько разработчиков или агентов на одном
codebase — они скорее всего загружают идентичный контекст независимо.

На реальной dev-machine с 13 параллельными worktree'ами на одном репозитории
мы видим 70% дублирующего контекста, который уходит как "fresh" токены.

Мы делаем content-addressed canonical encoding для LLM context — это
open-source, cross-provider, совместим с Anthropic prompt caching API.

Конкретно предлагаю: retroactive savings analysis.
Нам нужен read-only доступ к anonymized API usage logs за последние 30 дней.
За 3 дня — отчёт с конкретными числами.

Если savings <20% — отчёт бесплатный.
Если savings >20% — обсудим shadow pilot (0% pricing, 90 дней).

Reference implementation: github.com/agisota/cpp-core

Есть 30 минут на следующей неделе?

С уважением,
[Founder]
cpp.dev | founder@cpp.dev
```

---

### Cold outreach: Enterprise / Regulated industry (CTO / CISO)

```
Subject: AI audit trail для EU AI Act / UAE PDPL compliance

[Name],

С августа 2026 EU AI Act требует от high-risk AI систем полного audit trail:
что модель видела, когда, какую версию модели использовали.

Мы строим CPP — infrastructure layer, который делает каждое AI-решение
криптографически верифицируемым и воспроизводимым.

Для [Company]:
  - EU AI Act / GDPR Art. 22 compliance — из коробки
  - "Что AI решил в X день по Y данным" — 1 SQL query, не 30+ минут grep
  - 30-70% экономия на LLM API (side benefit)

Текущий статус: v1.0.0-rc.1, MIT, готов к enterprise pilot.

Готовы провести 30-минутный технический call + compliance assessment?

[Founder]
```

---

### Follow-up (через 4 рабочих дня без ответа)

```
Subject: Re: CPP — [original subject]

[Name],

Дублирую письмо от [дата] — может потерялось.

Суть в одном: retroactive analysis вашего LLM API usage покажет,
сколько реально тратится на дублирующий контекст.

3 дня, read-only, без изменений в инфраструктуре, без риска.

Если неинтересно — просто дайте знать, больше не буду писать.

[Founder]
```

---

### Demo invite

```
Subject: Demo + live analysis — [Company] LLM savings potential

[Name],

После вашего ответа — готов провести 30-минутный demo с live analysis.

Что покажу:
  1. cpp-cli analyze на вашем API usage sample (анонимизированном)
  2. Архитектурный overview (10 мин)
  3. Shadow pilot proposal

Удобно в [дата 1] в [время] или [дата 2] в [время]?

Zoom / Google Meet — как удобно.

[Founder]
```

---

### Pilot contract send (сопроводительное письмо)

```
Subject: Pilot Agreement — CPP shadow deployment [Company]

[Name],

Как договорились на call'е — прикладываю pilot agreement.

Основные условия:
  - Duration: 90 дней (с правом досрочного выхода)
  - Pricing: $0 на период пилота
  - Deployment: shadow mode (не влияет на production traffic)
  - Data: хранится только в вашей инфраструктуре
  - Exit: можете остановить в любой момент без объяснений
  - Conversion: обсуждаем в конце пилота, если результат устроит

Договор прикладываю. Нет пункта, который мешает начать на этой неделе?

[Founder]
```

---

### Retro analysis offer

```
Subject: CPP Retroactive Savings Analysis — [Company] (3 дня, бесплатно)

[Name],

Прежде чем предлагать пилот — хочу показать реальные числа для [Company].

Нужно:
  - Export ваших LLM API usage logs за последние 30 дней
  - Анонимизация: только metadata (timestamps, token counts, model, context sizes)
  - Формат: JSONL или CSV
  - Способ передачи: secure upload link / encrypted email

За 3 дня выдаю отчёт:
  - Сколько % контекста дублируется
  - Сколько токенов потенциально кэшируемо с CPP
  - Lower / likely / upper bound savings в $ в месяц
  - Рекомендация: стоит ли пилот

Нет финансовых обязательств. Если savings < $5K/мес — рекомендую не делать пилот.

Интересно?

[Founder]
```

---

## Конференции и публикации: календарь дедлайнов

### Академические конференции (2026-2027)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  КОНФЕРЕНЦИЯ         │  ДЕДЛАЙН SUBMISSION  │  МЕСТО     │  ЦЕЛЕВОЙ ТРЕК  │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  NeurIPS 2026        │  ~May 2026 (прошло)  │  Vancouver │  Main paper    │
│  (основная)          │  Workshop: July 2026 │            │  Workshop      │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  ICLR 2027           │  ~October 2026       │  Vienna    │  Infrastructure│
│                      │                      │            │  for AI track  │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  USENIX Security '27 │  ~October 2026       │  Seattle   │  AI Security   │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  IEEE S&P 2027       │  ~September 2026     │  San Fran. │  AI audit/     │
│                      │                      │            │  provenance    │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  CCS 2026            │  ~January 2026       │  Salt Lake │  AI Security   │
│                      │  (прошло для main)   │  City      │  Workshop      │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  arXiv preprint      │  Июль 2026           │  online    │  cs.AI, cs.CR  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Индустриальные конференции

```
┌────────────────────────────────────────────────────────────────────────────┐
│  КОНФЕРЕНЦИЯ         │  ДЕДЛАЙН TALK/CFP    │  МЕСТО     │  АУДИТОРИЯ     │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  AI Engineer Summit  │  Rolling (meetup.com)│  SF / NYC  │  AI engineers  │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  QCon AI             │  ~March 2027         │  London    │  Enterprise eng│
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  GITEX 2026          │  ~June 2026 CFP      │  Dubai     │  MENA tech     │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  LEAP 2027           │  ~October 2026 CFP   │  Riyadh    │  Saudi tech    │
├──────────────────────┼──────────────────────┼────────────┼────────────────┤
│  Web3 Summit / Devcon│  ~September 2026     │  TBD       │  Crypto/infra  │
│  (ZK + infrastructure│                      │            │  developers    │
│   angle)             │                      │            │                │
└────────────────────────────────────────────────────────────────────────────┘
```

### PR стратегия (месяц по месяцу)

```
Июнь:   "We tested Anthropic cache alignment" → technical community (HN, Twitter)
        Goal: credibility + developer awareness

Июль:   "CPP shadow pilot results: X% savings at [anonymous company]"
        Target: TechCrunch, VentureBeat
        Requirement: пилот с измеримыми результатами + клиент готов к упоминанию

Август: "CPP pre-seed close announcement" (если закрылся раунд)
        Target: TechCrunch Exclusive, Import AI newsletter
        Requirement: term sheet signed

Сентябрь: arXiv preprint publicized
        Target: academic Twitter/X community, ML safety community
        Goal: academic citations + credibility for NeurIPS/ICLR submission

Q4 2026: Conference speaking proposal push
        Target: GITEX (November Dubai), AI Engineer meetups
        Goal: MENA presence + enterprise awareness
```

---

## Grant applications: реальные дедлайны и ссылки

### NSF SBIR Phase I (США)

```
URL:         sbir.nsf.gov
Amount:      $275,000 (12 months)
Deadline:    Rolling, два окна в год:
               - June 2026 window (возможно прошло)
               - September 2026 window (TARGET)
               - December 2026 window (backup)
Requirements:
  - US-based small business (Delaware C-Corp needed)
  - Principal Investigator: US citizen or permanent resident
  - Topic area: OAC (Office of Advanced Cyberinfrastructure) или
                IIS (Intelligent Information Systems)
Key doc:     Executive Summary (1 page) + Technical Narrative (15 pages)
```

### EU Horizon Europe (если EU entity)

```
URL:         ec.europa.eu/info/funding-tenders/opportunities
Amount:      €500K — €2.5M (cascade funding: до €200K без consortium)
Programme:   Horizon Europe Cluster 4: Digital, Industry and Space
             Destination 4: Excellent European digital technologies
Rolling deadlines:
  - EIC Accelerator: rolling, check ec.europa.eu/eic
  - Open calls: cordis.europa.eu/search (filter: AI + open call)
Requirements:
  - EU-based legal entity (или consortium с EU partner)
  - Альтернатива: партнёрство с EU университетом как coordinator
```

### KAUST Research Grant (KSA)

```
URL:         research.kaust.edu.sa/funding
Amount:      $50K — $1M
Type:        KAUST-IBM Collaborative Research Program (или прямой grant)
Contact:     research-office@kaust.edu.sa
Requirements:
  - Academic affiliation (visiting researcher возможно)
  - Или partnership с KAUST faculty member
Approach:
  - Cold email Prof. Bernard Ghanem (AI Systems) с preprint
  - Предложить: "we validate our protocol on your AI systems lab"
```

### TII Research Grants (UAE)

```
URL:         tii.ae/contact / research collaborations page
Amount:      $100K — $500K (indirect via partnership)
Type:        Research collaboration agreement
Contact:     partnerships@tii.ae
Key AI team: Dr. Ebtesam Almazrouei (Falcon LLM)
Approach:
  - "CPP as canonical audit infrastructure for Falcon model deployments"
  - Предложить: co-authorship на paper + TII acknowledgment
```

### Astana Hub / AIFC (Казахстан)

```
URL:         astanahub.com/support
Amount:      $20K — $150K
Type:        Startup grant + infrastructure support
Requirements:
  - KZ legal entity (ТОО)
  - Registration in Astana Hub ecosystem
Benefits:
  - Co-working + visa support (Tech Visa)
  - Investor introduction program
  - Regional pilot customer introductions
```

---

## Метрики для tracking воронки

Еженедельно обновлять эту таблицу:

```
╭─────────────────────────────────────────────────────────────────────────╮
│  ВОРОНКА СОСТОЯНИЕ — Обновить каждую пятницу                           │
│                                                                         │
│  Этап                    │ Target │ Week 2 │ Week 4 │ Week 8 │ Week 12 │
│  ─────────────────────── │ ────── │ ─────  │ ─────  │ ─────  │ ─────── │
│  Outreach отправлено      │   60   │        │        │        │         │
│  Ответы получено          │   15   │        │        │        │         │
│  Demo calls проведено     │   15   │        │        │        │         │
│  Retro analysis заказано  │    9   │        │        │        │         │
│  LOI подписано            │    8   │        │        │        │         │
│  Pilot contracts          │    5   │        │        │        │         │
│  Revenue (MRR, $)         │  5K+   │        │        │        │         │
│                                                                         │
│  FUNDRAISING:                                                           │
│  Grant apps отправлено    │    3   │        │        │        │         │
│  VC conversations         │   10   │        │        │        │         │
│  Term sheets received     │    1+  │        │        │        │         │
│  Pre-seed close           │   1    │ —      │ —      │ —      │ TARGET  │
╰─────────────────────────────────────────────────────────────────────────╯
```

---

## Speaking engagements: конкретные возможности

### Быстрый вход (немедленно применить)

```
1. AI Engineer World's Fair (aiengineers.world)
   - Meetup format в SF, NYC, London
   - CFP постоянно открыт для lightning talks (15 min)
   - Тема: "Content-addressed context for multi-agent LLM systems"
   - Action: отправить 200-word proposal на их Discord сегодня

2. Latent Space Podcast (latentspace.substack.com)
   - Aidan Gomez, swyx, Alessio — covers AI infra deeply
   - Pitch email: pitch@latentspace.substack.com
   - Angle: "We tested whether canonical encoding aligns with Anthropic cache"

3. Gradient Descent Podcast (gradient-descent.com)
   - AI infra focus, technical audience
   - Contact: Lucas Biewald (@lbiewald) or podcast team

4. TWIML AI Podcast (twimlai.com)
   - Sam Charrington hosts, ML practitioners audience
   - speaker submission: twimlai.com/talk/submit

5. Weights & Biases "Fully Connected" Blog
   - Community blog, engineers contribute
   - Pitch: "How we measured 70% token redundancy in multi-agent workflows"
   - contact: community@wandb.com
```

### GITEX GLOBAL 2026 (October, Dubai)

```
Event: GITEX Global, October 2026, Dubai World Trade Centre
CFP/speaking: usually opens May-June, closes August
  URL: gitex.com/speak
Tracks:
  - AI & Emerging Technologies
  - Digital Enterprise
Format: 30-min keynote или 45-min technical session
Angle: "Building canonical AI infrastructure for the Arab World's AI economy"
Target audience: MENA enterprise + sovereign AI + government tech
Action: Submit proposal в June 2026
```

### LEAP 2027 (February, Riyadh)

```
Event: LEAP Technology Conference, Feb 2027, Riyadh
One of world's largest tech conferences (~170K attendees)
CFP: Opens ~September 2026
  URL: leap.sa/apply-to-speak
Track: AI & Generative Intelligence
Angle: "Verifiable AI for sovereign compute: the CPP protocol"
Action: Submit в October 2026; Saudi partner intro helps с placement
```

---

*Исполнение этого плана даёт: 5 пилотных клиентов → первый MRR →
pre-seed close за 12 недель при conditions of favorable market reception.
Ревизировать еженедельно по пятницам.*
