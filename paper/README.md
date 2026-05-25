# Context Provenance Protocol — Навигационный индекс

> **Версия:** 0.1 (2026-05-21) · **Репозиторий:** github.com/agisota/cpp-core · **Контакт:** founder@cpp.dev

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗██████╗ ██████╗                                                     ║
║  ██╔════╝██╔══██╗██╔══██╗                                                    ║
║  ██║     ██████╔╝██████╔╝   Context Provenance Protocol                      ║
║  ██║     ██╔═══╝ ██╔═══╝    ─────────────────────────────────────────────    ║
║  ╚██████╗██║     ██║        Canonical Infrastructure for AI-Economy           ║
║   ╚═════╝╚═╝     ╚═╝                                                         ║
║                                                                              ║
║   github.com/agisota/cpp-core  ·  v1.0.0-rc.1  ·  MIT License              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Что здесь находится

CPP — двухуровневая игра: **сегодня** это экономия 30-70% на LLM input-токенах и
криптографически верифицируемый audit trail; **завтра** — это canonical training-signal
infrastructure для следующего поколения AI-моделей. Этот репозиторий содержит
полный корпус документов: от executive summary до cryptographic security model,
финансовой модели и 12-недельного communications plan.

---

## Карта документов

```
╭──────────────────────────────────────────────────────────────────────────────╮
│                                                                              │
│   paper/                                                                     │
│   ├── README.md                   ◄── ВЫ ЗДЕСЬ: навигация                   │
│   │                                                                          │
│   ├── 00-EXECUTIVE-SUMMARY.md     ◄── 1 страница для CEO/investor           │
│   ├── 01-PAPER.md                 ◄── Главный документ (15K слов)            │
│   ├── 02-DEEP-HYPOTHESIS.md       ◄── Философское ядро: хэши как игра        │
│   ├── 03-COMMUNICATIONS-PLAN.md   ◄── 12-недельный боевой календарь          │
│   ├── 04-SECURITY-AND-VALIDATOR-ARCHITECTURE.md   ◄── Крипто-архитектура    │
│   ├── 05-FINANCIAL-MODEL.md       ◄── 3-летняя финансовая модель             │
│   │                                                                          │
│   ├── appendices/                                                            │
│   │   ├── 01-math.md              ◄── Математические основы                  │
│   │   ├── 02-pilots-pipeline.md   ◄── Pipeline целевых клиентов              │
│   │   └── 03-fund-targets.md      ◄── Целевые инвестфонды                   │
│   │                                                                          │
│   ├── strategy/                                                              │
│   │   ├── one-pager.md            ◄── Cold outreach one-pager               │
│   │   ├── deck-outline.md         ◄── Pitch deck структура                   │
│   │   └── pilot-contract-template.md  ◄── Шаблон pilot-соглашения           │
│   │                                                                          │
│   └── experiments/                                                           │
│       └── exp1-cache-alignment.py ◄── Anthropic cache alignment test         │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
```

---

## Быстрый старт: три режима чтения

### ▶ Режим «30 минут»
*Для кого: investor на первом касании, партнёр из enterprise*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1.  00-EXECUTIVE-SUMMARY.md        (~5 мин)  Числа и тезис                │
│  2.  strategy/one-pager.md          (~3 мин)  Pitch в одном экране         │
│  3.  01-PAPER.md  §§ I, II, VI      (~15 мин) Проблема + теория + big play │
│  4.  05-FINANCIAL-MODEL.md  §§ 1-3  (~7 мин)  Revenue + unit economics     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ▶ Режим «2 часа»
*Для кого: lead engineer, potential co-founder, серьёзный VC*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1.  00-EXECUTIVE-SUMMARY.md          (5 мин)                               │
│  2.  01-PAPER.md  §§ I — IX          (50 мин) Полная техническая часть     │
│  3.  02-DEEP-HYPOTHESIS.md            (20 мин) Философская основа           │
│  4.  04-SECURITY-AND-VALIDATOR-ARCHITECTURE.md  §§ 1-4  (20 мин)           │
│  5.  05-FINANCIAL-MODEL.md            (15 мин) Полная финмодель             │
│  6.  appendices/01-math.md            (10 мин) Формальная база              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### ▶ Режим «всё»
*Для кого: due diligence team, research collaborator, regulatory reviewer*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Читать все файлы в порядке нумерации.                                      │
│  Начать с README (этот файл) → 00 → 01 → 02 → 03 → 04 → 05                │
│  Затем appendices/ → strategy/ → experiments/                               │
│  Примерное время: 4-6 часов для глубокого прочтения.                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Секции и их функция

### 00-EXECUTIVE-SUMMARY.md
**★★★★★** · Обязателен к прочтению

Одна страница для инвестора или CEO: числовая гипотеза, TAM/SAM/SOM,
инвестиционная стратегия, команда, ключевые риски. Не требует технического
бэкграунда. Содержит абзац «для инвестора» и таблицу метрик.

---

### 01-PAPER.md
**★★★★★** · Главный документ (~15K слов)

Полный research paper: проблема → теория → prior art → реальная валидация →
экономическая модель → deep hypothesis → архитектура → GTM → инвестиции.
Пятнадцать разделов (§§ I—XV). Содержит реальные данные с продакшен-машины.
Может быть подан как supporting material к research grant или VC deck.

---

### 02-DEEP-HYPOTHESIS.md
**★★★★☆** · Для стратегических читателей (~3K слов)

Standalone-документ о философском и стратегическом ядре CPP: почему
канонические хэши становятся game-theoretic substrate для AI feedback loops.
Включает формальную модель `(state_CID, action_CID, outcome_CID, reward)`,
анализ static validator design, polarity consensus протокол, параллель с
ZK-rollup, и road to industry consortium. Это наиболее дальновидная часть
всего корпуса.

---

### 03-COMMUNICATIONS-PLAN.md
**★★★★★** · Операционный документ (~5K слов)

Гранулярный 12-недельный план с ежедневными задачами (первые 2 недели),
конкретными именами компаний и контактов, шаблонами для cold outreach и
demo invite, метриками conversion funnel, реальными дедлайнами
конференций (NeurIPS, ICLR, USENIX, IEEE S&P) и fundraising. Выполним
немедленно.

---

### 04-SECURITY-AND-VALIDATOR-ARCHITECTURE.md
**★★★☆☆** · Для technical due diligence (~3K слов)

Deep technical dive: hash security model (SHA-256 collision resistance,
length extension), threat model, атаки через model drift, static validator
architecture, zkML stack (EZKL, Modulus, Giza), polarity-zone consensus,
multi-party validation, key management для did:key Ed25519, rotation
protocol, encryption layer (post-MVP).

---

### 05-FINANCIAL-MODEL.md
**★★★★★** · Для investor и board (~4K слов)

3-летняя финансовая модель с реальными формулами и таблицами:
Y1/Y2/Y3 revenue по пилотам, unit economics (ARPU, CAC, LTV, gross margin),
OpEx breakdown, quarterly cash runway, sensitivity analysis (bear/base/bull),
сравнение с Datadog / Snowflake / HashiCorp как exit comparables,
KPI dashboard для board reporting.

---

### appendices/01-math.md
**★★★☆☆** · Математические основы

Формальные определения канонизации, теорема о cache hit probability,
модель экономики дедупликации, полярная валидация (Cohen κ), Bayesian
consensus, cost model для validator infrastructure, hash chain integrity,
полярная инвариантность под model drift. Требует математического бэкграунда.

---

### appendices/02-pilots-pipeline.md
**★★★★☆** · GTM execution

Детализированный pipeline целевых pilot-клиентов с компаниями по географии
(Russia/CIS, UAE/MENA, KZ), контактными методами и оценками потенциальной
экономии. Actionable для sales execution.

---

### appendices/03-fund-targets.md
**★★★★☆** · Fundraising execution

Structured список целевых фондов с checkpoint-size, fit-score, контактными
методами, application deadlines. Разбит по фазам (pre-seed, seed, research
grants).

---

### strategy/one-pager.md
**★★★★★** · Cold outreach

One-pager в формате для отправки в первом email: problem, solution, metrics,
market, team, ask. Визуально оформлен, умещается в одну прокрутку.

---

### strategy/deck-outline.md
**★★★☆☆** · Pitch preparation

Поел-по-слайдно outline питч-дека из 14 слайдов с key messages и visual
direction для каждого.

---

### strategy/pilot-contract-template.md
**★★★★☆** · Legal template

Шаблон pilot agreement: terms, pricing, data access, exit conditions,
conversion clauses. Готов к адаптации под конкретного клиента.

---

### experiments/exp1-cache-alignment.py
**★★★☆☆** · Technical validation

Python script для Эксперимента 1: проверка совпадения CPP canonical bytes
с Anthropic's internal cache hashing. Запускается за $50, 4 часа. Выдаёт
`cache_read_input_tokens` ratio как первичный валидационный сигнал.

---

## Статус работы

```
▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱  45% → Reference implementation + full paper
▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱  15% → Empirical validation (Q3 2026)
▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   0% → First pilots (Q3 2026)
▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   0% → Pre-seed funding (Q4 2026)
▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱   0% → zkML validator (2027+)
```

| Артефакт | Статус | Версия |
|---|---|---|
| Reference implementation (cpp-core) | ✅ Production-ready | v1.0.0-rc.1 |
| Paper + appendices | ✅ Draft complete | 0.1 |
| Pilot contract template | ✅ Ready | 0.1 |
| Retroactive analysis CLI | 🔘 In progress | — |
| MCP server integration | 🔘 Planned | Sprint 3 |
| Polarity validator MVP | 🔘 Planned | Sprint 6 |
| zkML proof prototype | 🔘 Planned | 2027 |

---

## Технологический стек

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Protocol Layer:  DAG-CBOR (RFC 8949) + CIDv1 (multiformats)             │
│  Identity:        did:key + Ed25519 (W3C DID Core)                       │
│  Semantics:       W3C PROV-O inspired (Fact/Rule/Calc/Effect)             │
│  Reference impl:  TypeScript + Bun (83 tests, 175 assertions)             │
│  Storage:         Memory + Filesystem + S3 (federation roadmap)           │
│  Transport:       MCP JSON-RPC (Sprint 3+)                               │
│  Verification:    Tier 1 (CID) / Tier 2 (N-of-M) / Tier 3 (zkML)        │
│  zkML roadmap:    EZKL / Modulus Labs / Giza (Cairo)                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Контакты и ресурсы

```
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│  GitHub:          github.com/agisota/cpp-core                            │
│  Email:           founder@cpp.dev                                        │
│  Paper version:   0.1 (working paper, 2026-05-21)                       │
│                                                                          │
│  Citation (provisional):                                                 │
│    agisota (2026). "Context Provenance Protocol: Canonical Infrastructure │
│    for AI-Economy". Working paper v0.1. github.com/agisota/cpp-core       │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

---

> Этот корпус — рабочий документ.
> Если вы читаете его по приглашению — ваши комментарии приветствуются.
> Отправьте на founder@cpp.dev с темой "CPP Review".
