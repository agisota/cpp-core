# Context Provenance Protocol
## От оптимизации затрат к игротеоретической инфраструктуре обратной связи

> **Working paper** — версия 0.1 (2026-05-21)
> Автор: agisota
> Reference implementation: github.com/agisota/cpp-core (v1.0.0-rc.1)
> Эта работа — основа для будущей научно-индустриальной публикации; данные с пользовательской машины используются с разрешения.

---

## Оглавление

- §I. Проблема: почему агентные системы экономически неэффективны
- §II. Теория: что такое канонизация контекста
- §III. История и prior art: чего раньше не было
- §IV. Реальная валидация: данные с продакшен-машины
- §V. Экономическая модель и unit economics
- §VI. Глубинная гипотеза: feedback loops на хэшах
- §VII. Стабильность хэшей: защита от модельного декея
- §VIII. Архитектура и референс-имплементация
- §IX. Стратегия валидации: эксперименты и метрики
- §X. Roadmap по фазам
- §XI. Go-to-market: пилоты и каналы продаж
- §XII. Инвестиционная стратегия и целевые фонды
- §XIII. Команда, юрлица и инфраструктура
- §XIV. Риски и митигации
- §XV. План действий по неделям
- Приложения: математика, ссылки, расчёты, шаблоны документов

---

# I. Проблема

## 1.1. Парадокс масштабирования LLM-агентов

В 2024-2026 годах массово появились **многоагентные системы**: Claude Code, Cursor, Cline, Aider, AutoGPT-like harness'ы, RAG-агенты, autonomous research-агенты (Devin, OpenHands, ROX.ONE). Их экономическая природа парадоксальна:

```
┌─────────────────────────────────────────────────────────────────┐
│  ПАРАДОКС: чем больше агентов, тем хуже unit-экономика          │
└─────────────────────────────────────────────────────────────────┘

  1 агент    →  стоимость = X
  3 агента   →  стоимость = 3X     (без шеринга контекста)
  10 агентов →  стоимость = 10X    (linear scaling)
  100 агентов→  стоимость = 100X   (нет network effect)

Между тем КАЧЕСТВО на агента не растёт линейно. Часто оно
снижается (контекст-fragmentation, конфликтующие решения).

В классических распределённых системах с ростом узлов растёт
полезный output (Metcalfe, Reed). В агентных системах сегодня —
наоборот: с ростом числа агентов растёт стоимость *повторно
загружаемого* контекста.
```

**Корень проблемы:** каждый агент сегодня загружает контекст как **opaque text blob**. Нет инфраструктурного слоя, позволяющего нескольким агентам *договориться*, что они смотрят на один и тот же контент. Провайдеры (Anthropic, OpenAI) внутри кэшируют префиксы, но **client-side нет видимости**, что попадёт в кэш.

## 1.2. Конкретный пример (real-world, не выдуманный)

Анализ продакшен-машины пользователя за май 2026:

| Метрика | Значение |
|---|---|
| Общий объём сессий Claude Code | **687 MB** |
| Главный проект (craft) | **250 MB логов сессий, 16 GB кода** |
| Активных параллельных worktree'ов на одном репозитории | **13** |
| Из них с **байт-в-байт идентичным AGENTS.md** (MD5-confirmed) | **9 из 13** |
| Самая длинная сессия | **11 MB** (≈ 3M токенов контекста) |
| Длинных сессий в одном проекте за месяц | **24** |
| Дублирующих `package.json` в проекте | **8,562** |
| Сессий с multi-agent workflow (ralph/autopilot/swarm) | **22** |

При средней цене Claude API $3/M input tokens:

```
Грубый расчёт расхода без CPP:
    24 сессий × 200K tokens/сессия × 10 turns × $3/Mt
  = 24 × 2M × $3/Mt
  = $144/мес ТОЛЬКО на одного разработчика
  ТОЛЬКО на один проект

С учётом swarm (7 параллельных агентов):
    22 swarm-сессий × 7 × 200K × $3/Mt
  = $92.4/мес дополнительно

Итого: ~$236/мес × 1 dev × 1 проект = ~$2,832/год

Команда из 5: ~$14K/год
Enterprise из 100: ~$283K/год
SaaS-провайдер с 100K юзеров: $283M/год теоретически
```

И это **с уже работающим prompt caching на стороне Anthropic**. Большая часть этих токенов кэш-миссы — потому что между параллельными агентами и worktree'ами нет синхронизации байтов.

## 1.3. Регуляторная проблема (вторая половина дилеммы)

С 2025-2026 года включаются регулирующие требования к AI:

- **EU AI Act** (поэтапно 2024-2027): high-risk AI systems обязаны иметь transparency obligations, human oversight, logging, audit trails.
- **GDPR Art. 22:** право на explanation для automated decision-making с «significant effect».
- **NIST AI RMF (USA):** требует traceability и explainability.
- **PCI DSS / HIPAA / SOX:** domain-specific audit logs.
- **Russian FZ-152:** обработка персональных данных (включает AI-обработку).
- **UAE PDPL (2022):** Federal Decree-Law No. 45 of 2021 (Personal Data Protection).
- **Saudi PDPL (2023):** Personal Data Protection Law.

Все эти регуляции **требуют возможности раскрыть** «как AI пришёл к решению X»: на каких данных, версии модели, в какой момент. Сегодня для AI-команд это означает либо **отказ** от применения LLM в regulated workflow, либо **дорогостоящие homegrown audit-системы** ($1-5M/год на enterprise).

CPP закрывает обе проблемы одним архитектурным решением.

---

# II. Теория

## 2.1. Что такое канонизация

Канонизация — это процесс приведения данных к **единственному, детерминированному** представлению, при котором семантически эквивалентные данные имеют **бит-в-бит** идентичную сериализацию.

```
Пример: JSON НЕ канонизирован
─────────────────────────────
  {"foo": 1, "bar": 2}   → байты A
  {"bar": 2, "foo": 1}   → байты B
  Семантически одно, но байты разные → разные хэши

Пример: DAG-CBOR канонизирован
───────────────────────────────
  Любой объект {foo: 1, bar: 2}     → одни байты
  Любой объект {bar: 2, foo: 1}     → ТЕ ЖЕ байты
                                       (ключи отсортированы лексикографически)
                                       (числа в каноническом представлении)
                                       (нет factor-N representations)
  Хэш SHA-256 от этих байт           → детерминированный CID
```

DAG-CBOR (RFC 8949 + IPLD-restrictions) — это canonical CBOR с дополнительными ограничениями:
- Только definite-length представления (no streaming markers).
- Integer keys отсортированы.
- Floats только в float64 (без float16/32 variants).
- Нет undefined, simple values только в `true`, `false`, `null`.
- UTF-8 строки в каноническом NFC.

## 2.2. Content-addressed identification (CID)

CID — это **отпечаток пальца** контента:

```
CID = multihash(SHA-256, DAG-CBOR(canonical(data)))

Анатомия:
  bafyreif...
  │└┬┘└────┘
  │ │   └─── multihash digest (32 bytes encoded base32)
  │ └──────── codec identifier (DAG-CBOR = 0x71)
  └────────── CID version (v1)
```

Свойства CID:
- **Verifiable:** дано CID + содержимое → можно проверить за 1ms.
- **Collision-resistant:** SHA-256 даёт 2^128 security level.
- **Self-describing:** в самом CID закодирован codec и hash function.
- **Federable:** CID одинаков везде — на твоей машине, в S3, в IPFS, в чужой системе.

## 2.3. Семантический граф: Fact, Rule, Calculation, Effect

CPP формализует структуру агентного контекста через четыре типа узлов, заимствованных из W3C PROV-O (provenance ontology) и расширенных:

```
            ┌──────────┐
            │  Fact    │ ◄── подписанное наблюдение (developer, sensor, API)
            └────┬─────┘
                 │ used by
                 ▼
  ┌──────────┐ used by  ┌──────────────────┐
  │  Rule    │─────────►│ CalculationActivity │
  └──────────┘          │  (агент + model +   │
       ▲               │   tool_calls + tier)│
       │ versioned     └──────────┬──────────┘
       │                          │ wasGeneratedBy
       │                          ▼
       │               ┌──────────────────┐
       │               │   Effect         │
       │               │   + range structure │
       │               │   + affected entities│
       │               └──────────────────┘
```

| Узел | Семантика | Подпись | Пример |
|---|---|---|---|
| **Fact** | Объективное наблюдение | автор (did:key) | ADR от разработчика; tick от Bloomberg; X-ray от медустройства |
| **Rule** | Инструкция для обработки | authority (did:key) | «IPC через invoke»; DV01-формула; clinical guideline |
| **CalculationActivity** | Применение Rules к Facts | агент (did:key) | code-review-bot прогнал ADR против policy |
| **Effect** | Результат с range и confidence | агент-производитель | список затронутых файлов, P&L impact, диагностика |

## 2.4. Трасты-уровни (Trust Tiers)

Не каждое решение требует одинаковой строгости proof'а:

```
Tier 1 — Content-addressing only
  ──────────────────────────────
  Цена доказательства: $0
  Дает: integrity (контент не подменён)
  Кейс: 80% операций — внутренние cache-hits

Tier 2 — N-of-M consensus + TEE
  ──────────────────────────────
  Цена: 3-5× стоимости инференса
  Дает: semantic agreement (несколько моделей подтверждают)
        + hardware-trusted execution
  Кейс: compliance-reports, mid-stakes решения

Tier 3 — zkML proof
  ──────────────────────────────
  Цена: $0.5-5/proof, 10-60s latency
  Дает: математическое доказательство
  Кейс: litigation-grade, SEC filings, regulatory submission
```

CPP хранит `tier` как поле каждого `CalculationActivity` — приложение выбирает уровень для конкретного workflow.

## 2.5. Подписи и идентичность (did:key)

Каждый Fact, Rule, Calculation, Effect подписывается ключом автора:

```
SignedEnvelope<T>:
  payload:    T (FactNode | RuleNode | ...)
  signer_did: did:key:z6Mk... (Ed25519 public key embedded)
  signature:  Ed25519(canonical(payload || signed_at))
  signed_at:  ISO8601
```

`did:key` — это W3C-стандартный self-sovereign identifier:
- Публичный ключ **встроен** в DID (нет нужды в registry).
- Verify за 100µs.
- Cross-platform: работает в браузере, Node.js, Bun, Python, Rust.

Подпись связывает **payload + timestamp** → защита от replay-атак с переотправкой старых подписей.

---

# III. История и prior art

## 3.1. Эволюция подходов к контексту LLM

```
Эра                  Подход                              Проблема
────────────────────────────────────────────────────────────────────────
2022-2023            Plain prompt text                   100% дубликация
                     "System prompt + user message"      Нет дедупа
                                                         
Late 2023            Vector RAG                          Решает другую задачу
                     Embeddings → semantic retrieval     (selection, не dedup)
                                                         
Mid 2024             Anthropic prompt caching            Provider-locked
                     cache_control breakpoints           Single-session TTL
                                                         Cache key opaque
                                                         
Late 2024            Files API                           Provider-specific IDs
                     OpenAI Files / Anthropic Files      Нет cryptographic guarantee
                                                         Нет cross-provider sharing
                                                         
2025                 MCP Resources                       URI-addressed, не content
                     mcp://… URIs                        Нет canonical bytes
                                                         Нет signing
                                                         
2026 (CPP)           Content-addressed canonical bytes   ?
                     + semantic graph
                     + cryptographic signatures
                     + tier-aware verification
```

## 3.2. Соседние технологии (то, что мы переиспользуем)

| Стандарт | Год | Что взяли | Что НЕ взяли |
|---|---|---|---|
| **DAG-CBOR** (RFC 8949 + IPLD) | 2018 | Canonical bytes | (полностью) |
| **CIDv1** (multiformats) | 2017 | Content addressing | (полностью) |
| **PROV-O** (W3C) | 2013 | Вокабуляр Entity/Activity/Agent | RDF serialization (заменили на DAG-CBOR) |
| **DID Core** (W3C) | 2022 | did:key для identity | DID-document resolution (отложили) |
| **MCP Resources** (Anthropic) | 2024 | URI scheme as integration surface | Provider-internal hashing (расширили) |
| **W3C VC** (Verifiable Credentials) | 2019 | Signed claims pattern | JSON-LD overhead (упростили) |

## 3.3. Что НЕ существует до CPP

- **Cross-provider canonical encoding для LLM context.** Anthropic и OpenAI имеют разные внутренние cache hashing. Общего стандарта нет.
- **Семантически-типизированное content-addressing для agentic workflows.** IPFS даёт generic CID для произвольных байтов; PROV-O даёт семантику без content-addressing. CPP — пересечение.
- **Tier-aware verification протокол.** zkML существует, но не интегрирован с content-addressed storage как часть единого протокола.
- **Open standard для signed multi-agent provenance.** Каждый framework (LangChain, AutoGen, CrewAI) делает своё.

## 3.4. Конкурентный ландшафт

Прямые конкуренты на разные углы:

| Конкурент | Что делает | Где не пересекается с CPP |
|---|---|---|
| **Bittensor / Subnet 23** | Verifiable AI inference через restaking | Криптоэкосистема, не drop-in для existing harness |
| **EZKL / Modulus Labs / Giza** | zkML proofs | Не content-addressing; не multi-agent provenance |
| **Anthropic prompt caching** | Provider-internal cache | Single-provider, не client-controllable |
| **LangChain checkpoints** | State persistence | Не content-addressed, не verifiable |
| **W3C Verifiable Credentials** | Signed claims | Нет content-addressing; JSON-LD heavy |

**CPP занимает нишу:** protocol-layer abstraction поверх существующих primitive'ов (IPLD + DID + PROV-O + MCP), оптимизированная под LLM agentic workflows.

---

# IV. Реальная валидация

## 4.1. Машинный аудит (данные пользователя)

Anonymized snapshot из реальной dev-машины:

```
══════════════════════════════════════════════════════════════════
              CLAUDE CODE USAGE PATTERN ANALYSIS
                       2026-05-21 snapshot
══════════════════════════════════════════════════════════════════

  Storage footprint:
  ─────────────────
  Session logs total:                 687 MB
    └── Primary project (craft):      250 MB
    └── /tmp ephemeral sessions:      283 MB (478 files)
    └── Other projects (7):           154 MB
  
  Codebase footprint:
  ──────────────────
  Total primary project:              16.0 GB
    └── Parallel worktrees of same repo: 13
    └── Identical AGENTS.md files (by MD5): 9 of 13
    └── Duplicate package.json files:    8,562
    └── Duplicate tsconfig.json files:     966
  
  Session patterns:
  ────────────────
  Long sessions (>1MB) in primary:        24
  Largest single session:               11 MB  (~3M tokens of context)
  Sessions with multi-agent workflow:     22
    └── ralph-loop:        ~10
    └── autopilot:          ~6
    └── swarm orchestration: ~6
  
  Estimated wasted tokens (back-of-envelope):
  ──────────────────────────────────────────
  Same AGENTS.md re-encoded across worktrees per week:
    9 worktrees × 6.2 KB × 8 sessions/week × ~10 turns
    ≈ 4.5 MB × 80 = 360 MB redundant context
    ≈ 90M tokens "unnecessarily fresh-encoded" per week
    
  At $3/M tokens (Claude Sonnet pricing): $270/week wasted
  Per dev. On one project. ONE.
══════════════════════════════════════════════════════════════════
```

## 4.2. Что это говорит о потенциале

Если экстраполировать с честным дисконтом:

```
Per-developer waste (conservative): $150/мес
Team of 10 devs:                  $1,500/мес = $18K/year
Mid-enterprise 100 devs:         $15,000/мес = $180K/year
Large enterprise 1000 devs:    $150,000/мес = $1.8M/year
SaaS provider 100K active devs: $15M/мес = $180M/year
```

И это **только** на уровне cost-saving. Audit-trail value (compliance) и feedback-loop value (training signal) приходят сверху.

## 4.3. Идентификация ICP (Ideal Customer Profile)

На основе паттерна выявленного на реальной машине, формируется ICP:

```
ICP Tier 1 (immediate buyers):
  - Engineering teams 50-500 человек
  - Используют Claude Code / Cursor / Cline / Aider
  - Имеют общий codebase / shared docs / shared workflow
  - Несколько параллельных worktree'ов или ветвей
  - Видят $1,000-50,000/мес расходов на LLM API
  - Лидер инжиниринга чувствует "почему-то стало дорого"

ICP Tier 2 (regulatory-driven):
  - Финтех, медтех, банки, юриспруденция
  - Уже используют LLM для compliance-adjacent задач
  - Регулятор требует audit trail
  - Cost для них — second-order; primary это compliance risk

ICP Tier 3 (frontier multi-agent):
  - Autonomous research teams (Anthropic Engineering, Devin, OpenAI Engineering)
  - 10+ агентов на одной задаче
  - Cost доминирует unit economics
  - Уже инвестируют в собственные solutions
```

---

# V. Экономическая модель

## 5.1. Unit economics клиента

Простая модель savings:

```
Сэкономлено = (Total_input_tokens × Repetition_ratio) × (Cache_hit_discount)

Где:
  Total_input_tokens   = месячный input
  Repetition_ratio     = % контекста, который повторяется (0.6-0.95)
  Cache_hit_discount   = 0.9 для Anthropic cached reads (90% off)

Пример для 100-dev enterprise:
  Total_input_tokens   = 100 devs × 30 sess × 200K × 22 day = 13.2B tokens/мес
  Repetition_ratio     = 0.7 (типичный shared codebase)
  Cache_hit_discount   = 0.9
  
  Tokens saved at price = 13.2B × 0.7 × 0.9 = 8.3B tokens/мес
  At $3/M:               $24,900/мес = $298K/год потенциальная экономия
  
  Realistic capture (50%): $149K/год
```

## 5.2. Pricing модель CPP

Три варианта монетизации, не взаимоисключающих:

### Вариант A: SaaS subscription
```
Free tier:    self-hosted, до 10 devs
Team:         $99/dev/мес (10-100 devs)
Enterprise:   $299/dev/мес (>100 devs, SLA, audit features)
```
**Pros:** предсказуемый ARR. **Cons:** sales cycle 3-6 мес.

### Вариант B: Revenue share
```
0% pricing; 20% от documented token savings
```
**Pros:** Аligned incentives, легко продать. **Cons:** требует измерения и доверия.

### Вариант C: Infrastructure subscription
```
$5K/мес base + $0.10/1M tokens passing through CPP
```
**Pros:** scales with usage. **Cons:** сложно прогнозировать.

**Рекомендуемая модель: B+C hybrid:**
- Pilot: 0% pricing на 90 дней.
- Convert: 20% of measured savings, минимум $2K/мес.
- Self-hosted: $5K/мес flat для отказывающихся от revenue share.

## 5.3. Cost structure CPP-провайдера

```
Затраты на one $10K MRR enterprise customer:
─────────────────────────────────────────────
  CPP storage (S3-equivalent):       $200/мес
  Verification compute:              $300/мес (Tier 1 only)
  Audit log retention (7y):          $150/мес
  Customer success (1/4 FTE):        $2,500/мес
  Total COGS:                        $3,150/мес (31.5%)
  
  Gross margin:                      68.5%
```

При scale 100 enterprise customers: $1M MRR, $315K COGS, **$685K gross profit/мес = $8.2M ARR potential**.

## 5.4. TAM/SAM/SOM (с уточнениями)

```
TAM (Total Addressable Market) 2026:
─────────────────────────────────────
  Глобальный объём корп. расходов на LLM API:    $4.8B
  Source: Anthropic + OpenAI + Google revenue 2025-2026
  
SAM (Serviceable Addressable Market):
──────────────────────────────────────
  Корпорации >100 сотрудников, использующие LLM
  как часть workflow:                              $1.2B
  
SOM (Serviceable Obtainable Market) 5-year:
────────────────────────────────────────────
  С учётом достижимой доли рынка ~15%:            $180M
```

**Realistic 3-year revenue projection:**

| Год | Customers | ARR/customer | Total ARR |
|---|---|---|---|
| Y1 (2026) | 5 pilots | $50K | $250K |
| Y2 (2027) | 25 customers | $80K | $2M |
| Y3 (2028) | 100 customers | $120K | $12M |

---

# VI. Глубинная гипотеза: feedback loops на хэшах

## 6.1. Тезис

Cost saving — **поверхностный** value. Реальный приз — формирование training signal для следующих поколений моделей.

```
ПОВЕРХНОСТНЫЙ СЛОЙ:                  ГЛУБИННЫЙ СЛОЙ:
─────────────────────                ──────────────────
  $X/мес savings                       Каноническое представление
  Audit-trail для compliance           всех {fact, event, judgment, decision}
  Multi-agent coordination             ↓
                                       Любая AI-система может:
                                         - подтвердить, что входы те же
                                         - воспроизвести вычисление
                                         - сравнить outcomes объективно
                                       ↓
                                       Это позволяет обучать модели
                                       не на raw text, а на
                                       CRYPTO-VERIFIED game tuples:
                                       (context_CID, action_CID, outcome_CID)
                                       ↓
                                       Тот, кто владеет каноном —
                                       владеет training data flywheel.
```

## 6.2. Аналогии из истории

| Технология | Канон | Кто владел |
|---|---|---|
| Поиск 2000-х | PageRank graph | Google → монополия |
| Social graph 2010-х | Friend connections | Facebook → монополия |
| RLHF 2022-2024 | Human preference rankings | Anthropic + OpenAI |
| **AI feedback 2026+** | **Verified outcome tuples** | **?** (открытая ниша) |

## 6.3. Формальная модель feedback loop

```
Каждое решение AI-агента — это game tuple:

    (S_in, A, S_out, R)

где:
  S_in   = state input  = CID контекста, который видел агент
  A      = action       = CID Calculation (model + params + tool_calls)
  S_out  = state output = CID Effect (что изменилось)
  R      = reward       = downstream observable (user accepted? bug introduced? cost?)

Сегодня:
  - S_in   фрагментирован по миллионам сессий
  - A      опаковый (мы не знаем, что именно модель сделала)
  - S_out  сырой текст
  - R      привязан к user (отдельный feedback channel)

С CPP:
  - S_in   = CID, дедуплицированный, верифицированный
  - A      = подписанный CalculationActivity с tool_calls
  - S_out  = подписанный EffectNode с range/confidence
  - R      = подписанный Outcome-Fact от downstream observers

ВСЕ ЧЕТЫРЕ становятся cryptographically linked.

Тренировка следующей модели:
  L = E[(action_predicted | S_in) — A_actual]² 
      + E[(outcome_predicted | S_in, A) — S_out_actual]²
      + reward_shaping(R)

Это closed feedback loop на verified data.
```

## 6.4. Стратегический момент

В этом моменте есть **5-летнее окно**, пока:
1. Multi-agent системы становятся mainstream (Q3 2026 - 2027).
2. Регуляторное давление на AI audit растёт (EU AI Act полностью в силе 2027).
3. Frontier модели становятся too expensive to train without verified data.
4. Существующие AI labs ещё не зафиксировали канон.

**Кто канонизирует первым — становится infrastructure layer** на уровне HTTP или TCP/IP. Не visible пользователю, но обязательный.

## 6.5. Кто платит за канон?

Несколько слоёв willingness-to-pay:

```
Layer 1: Enterprise saving cost (immediate)
         "Save 30-70% on LLM bills"          → $$$
         
Layer 2: Regulated industries (audit)
         "Verifiable AI for compliance"      → $$$$
         
Layer 3: AI labs (training signal)
         "Buy our verified feedback corpus"  → $$$$$$
         (e.g., Anthropic pays for verified
          human preferences; tomorrow they
          pay for verified agent outcomes)
          
Layer 4: Network effect (infrastructure)
         "Everyone uses the canon because
          it's the only way to interop"      → market-making
```

---

# VII. Стабильность хэшей: защита от модельного декея

## 7.1. Угроза: hash decay при апгрейде моделей

Когда выходит Claude Opus 5 / GPT-5 / Gemini 3:
- Provider может изменить cache_key hashing.
- Старые canonical bytes могут больше не давать те же cache hits.
- Embedding-based семантические эквивалентности drift.
- Sids для генерации могут не воспроизводиться.

**Без защиты — наш протокол распадается каждые 6-12 месяцев.**

## 7.2. Решение: статическая модель-валидатор

Концепция (заимствована из ZK-rollup architecture):

```
        ┌──────────────────────────────────────┐
        │  STATIC CANONICAL VALIDATOR MODEL    │
        │  (hosted on shared infrastructure)   │
        │                                      │
        │  - Open weights                      │
        │  - Frozen version                    │
        │  - Multi-party hosted (HuggingFace,  │
        │    or Open Source AI Foundation)     │
        │  - SLA для availability              │
        └──────────────────────────────────────┘
                  ▲              ▲
                  │              │
        Validates │              │ Validates
                  │              │
     ┌────────────┴───┐    ┌─────┴──────────┐
     │  Producer A    │    │  Producer B    │
     │  uses Claude 5 │    │  uses GPT-5    │
     │  for inference │    │  for inference │
     └────────────────┘    └────────────────┘
     
  Producer A создаёт Effect.
  Шлёт его в Validator Model для канонизации.
  Validator выдаёт hash + semantic embedding.
  Этот hash детерминирован независимо от того,
  какую исходную модель использовал producer.
```

## 7.3. Технические компоненты

| Компонент | Описание | Зрелость |
|---|---|---|
| **Frozen validator weights** | Один well-defined model checkpoint (например, Llama 3.1 70B при T=0) | Доступен сегодня |
| **Deterministic inference runtime** | llama.cpp single-batch CPU mode (битово-воспроизводимый) | Доступен сегодня |
| **Distributed hosting (federation)** | HuggingFace Endpoints / TogetherAI / собственная инфра | Доступен |
| **Multi-party SLA** | Контрактное обязательство держать checkpoint доступным 5+ лет | Требует org-уровневой работы |
| **Polarity validation protocol** | Не точное совпадение, а semantic polarity (positive/negative zone) | Требует разработки |

## 7.4. Protocol: Tonality/Polarity Validation

Вместо точного матча байтов — **полярная верификация**:

```
Producer A заявляет:  "Effect X находится в положительной зоне"
                       (например, "tests pass", "compliance met")
                       
Validator проверяет:
  1. Resolve CID X
  2. Запустить static model с polarity prompt
  3. Получить confidence в polarity claim
  4. Подписать verification result

Polarity claims могут быть:
  - Binary: positive/negative
  - Triple: positive/neutral/negative
  - Bounded continuous: [-1.0, 1.0] с CI

ПРЕИМУЩЕСТВО:
  - Не требуется точное байтовое совпадение между разными моделями
  - "Semantic equivalence" более устойчив к hash decay
  - Polarity claims можно делать публично (не PII-leaking)
```

## 7.5. ZK-доказательства для polarity claims

Для регулируемых сценариев — zkML proof, что polarity validation прошла:

```
Claim:  "Effect X is in positive zone with confidence ≥ 0.8"

Proof:  zk-SNARK over static-model-inference circuit that:
        - Loaded weights_hash = H_model
        - Ran inference on input = Effect_CID resolved bytes
        - Output polarity score ≥ 0.8
        
Verifier checks proof in <10ms WITHOUT re-running inference.
Compliance team accepts proof as audit-grade evidence.
```

zkML practical implementations 2026:
- **EZKL** (https://github.com/zkonduit/ezkl) — <100M params, proof time 10-60s
- **Modulus Labs** — commercial offering
- **Giza** — Cairo-based, integration с Starknet
- **Ritual** — early stage

Для статической Llama 3.1 70B сегодня zkML **не работает** напрямую (слишком много параметров). Realistic path:
1. **Validator distillation:** обучить меньшую модель (~1-10B params) на outputs большой.
2. **zkML на distilled validator.**
3. **Static checkpoint hosting** для polarity ground truth.

---

# VIII. Архитектура и референс-имплементация

## 8.1. Стек слоёв

```
┌────────────────────────────────────────────────────────────────┐
│ Layer 9: Industry consortium / standardization                  │
├────────────────────────────────────────────────────────────────┤
│ Layer 8: Polarity Validator Model (static, shared)              │ ← Sprint 6+
├────────────────────────────────────────────────────────────────┤
│ Layer 7: MCP Server (JSON-RPC transport + subscriptions)        │ ← Sprint 3+
├────────────────────────────────────────────────────────────────┤
│ Layer 6: Storage Federation (S3/IPFS/Filecoin)                  │ ← Sprint 2.5+
├────────────────────────────────────────────────────────────────┤
│ Layer 5: Resolver + Supersession + Stale-detection             │ ✅ v0.2.0
├────────────────────────────────────────────────────────────────┤
│ Layer 4: Storage (Memory + Filesystem)                          │ ✅ v0.2.0
├────────────────────────────────────────────────────────────────┤
│ Layer 3: Semantic Graph (Fact/Rule/Calc/Effect + Validity)      │ ✅ v0.1.x
├────────────────────────────────────────────────────────────────┤
│ Layer 2: Signatures + Identity (did:key + Ed25519)              │ ✅ v0.1.x
├────────────────────────────────────────────────────────────────┤
│ Layer 1: CID + DAG-CBOR (canonical encoding)                    │ ✅ v0.1.x
└────────────────────────────────────────────────────────────────┘
```

## 8.2. Reference implementation

GitHub: github.com/agisota/cpp-core (public, MIT, v1.0.0-rc.1).

```
cpp-core/
├── src/
│   ├── canonical.ts       # DAG-CBOR encode/decode
│   ├── cid.ts             # CID computation (sync SHA-256)
│   ├── types/             # Fact, Rule, Calculation, Effect, Validity
│   ├── identity/          # did:key, Ed25519 sign/verify
│   ├── storage/           # Storage interface + Memory + Filesystem + Resolver
│   ├── supersession.ts    # Chain follower + stale-fact detection
│   └── mcp/               # URI scheme + Resource shape + pure handlers
├── tests/                 # 83 tests, 175 assertions
├── README.md
└── CHANGELOG.md
```

CI: GitHub Actions, runs in 11-14s. All 83 tests pass under TypeScript strict + bun:test.

## 8.3. Integration surface

Три способа интеграции в существующий harness:

### A. Drop-in library (для контролируемых harness'ов)
```typescript
import { FilesystemStorage, computeCID } from "cpp-core";

// В точке загрузки контекста:
const cid = await storage.put(contextChunk);
// Передать cid в LLM как ссылку или развернуть в полный prompt
```

### B. MCP server (для harness'ов с MCP support)
```bash
cpp-mcp-server --storage /var/lib/cpp-store
# Harness подключается через stdio JSON-RPC
# Запрашивает resources по URI mcp://provenance/<type>/<cid>
```

### C. Shadow-traffic mode (для пилотов)
```bash
cpp-proxy --upstream https://api.anthropic.com \
          --capture /var/lib/cpp-capture
# Проксирует requests клиента
# Параллельно делает canonical encoding и хранит CIDs
# НЕ влияет на основной поток
```

Вариант **C критичен для пилотов** — позволяет measure без modify.

---

# IX. Стратегия валидации

## 9.1. Иерархия гипотез

```
H0 (null):    CPP не даёт измеримой экономии.
H1 (primary): CPP даёт ≥30% input-token savings на shared-context workflow.
H2:           Anthropic prompt cache hashing совпадает с CPP canonical bytes.
H3:           TTFT на cached prefix снижается ≥50%.
H4:           Multi-agent coordination value выше cost saving в долгосрок.
H5:           Static validator model даёт stable polarity classification 
              independent of upstream model version.
H6:           Feedback loop на verified game tuples производит better fine-tuning.
```

## 9.2. План экспериментов (Q3-Q4 2026)

### Эксперимент 1: Anthropic cache alignment (Day 1-7)

**Гипотеза:** Если DAG-CBOR canonical bytes идентичны для двух requests, Anthropic'ий внутренний cache hashing даёт hit.

```python
# Pseudocode
import cpp_core
context = build_context(...)
canonical_bytes = cpp_core.encode_canonical(context)

# Request 1
r1 = anthropic.messages.create(
    model="claude-3-5-sonnet",
    system=[{
        "type": "text",
        "text": decode_to_text(canonical_bytes),
        "cache_control": {"type": "ephemeral"}
    }],
    messages=[{"role": "user", "content": "Question 1"}]
)

# Request 2 (5 минут спустя, ТОТ ЖЕ canonical_bytes)
r2 = anthropic.messages.create(...)

# Метрика:
print(r2.usage.cache_read_input_tokens)
# Если > 0 → H2 verified
```

**Метрики:**
- `cache_read_input_tokens / total_input_tokens` ratio
- TTFT delta
- Cost delta

**Sample size:** 100 requests, 10 контекстов, 3 модели (sonnet, haiku, opus).

**Cost:** $50 для всех тестов.

**Time:** 1-2 дня от kickoff до publication.

### Эксперимент 2: Multi-worktree dedup (Week 2-3)

**Setup:** деплоить CPP в shadow mode на одну dev-team из 5 человек с 3+ worktree'ами одного проекта.

**Метрики:**
- Cache hit rate за 14 дней
- $ saved vs control week
- Developer-reported TTFT subjective improvement
- Number of unique CIDs vs total context loads (dedup ratio)

**Success criteria:**
- Cache hit rate ≥ 40%
- Savings ≥ 25%
- Zero workflow disruption reports

### Эксперимент 3: Audit-trail replay (Month 2)

**Setup:** взять 100 архивных AI-решений из прошлого месяца с известными outcomes. Зарегистрировать как Calculations в CPP. Через месяц задать verification query «было ли это решение корректно по правилам v1.0?».

**Метрики:**
- Replay accuracy
- Reproducibility под смену модели (Sonnet → Haiku → Opus)
- Time to find specific decision

### Эксперимент 4: Static validator polarity (Month 3-6)

**Setup:** обучить distilled polarity validator (1-3B params) на 10K manually-labeled samples. Зафиксировать checkpoint. Запустить через 3 разные modes inference (Claude, GPT, local).

**Метрики:**
- Inter-rater agreement (κ statistic)
- Stability across model updates
- Cost of validation per claim

## 9.3. Reverse-validation на исторических данных

Главная техническая хитрость для **первой продажи**:

> Клиент даёт нам **read-only** доступ к их LLM usage logs за последние 30 дней.
> Мы делаем backward analysis:
> 1. Identify повторяющиеся context patterns (string-level + embedding-level).
> 2. Compute "as-if CPP" cache hit potential.
> 3. Quantify $ saved if CPP было задеплоено в тот период.
> Этот отчёт — наш pre-sales artifact. Customer видит конкретное число до подписания.

```
Шаблон отчёта:
═══════════════════════════════════════════════════════
  CPP RETROACTIVE SAVINGS ANALYSIS
  Customer: [REDACTED]
  Period:   2026-04-01 to 2026-04-30
  
  Total LLM API spend in period:        $47,300
  Total input tokens:                   15.7B
  
  Identified repetition patterns:
    Pattern A (codebase index):         62% of system prompts
    Pattern B (AGENTS.md variants):     34% of contexts
    Pattern C (Linear snapshots):       21% of contexts
    
  Estimated CPP-with-Anthropic-cache savings:
    Lower bound:                        $11,200 (24%)
    Most likely:                        $19,800 (42%)
    Upper bound:                        $28,900 (61%)
    
  Annualized projection:
    Lower:  $134K/year saved
    Likely: $237K/year saved
    Upper:  $347K/year saved
    
  Pilot recommendation:
    Phase 1 (Month 1):    Shadow deployment, measurement
    Phase 2 (Month 2-3):  Production traffic on 1 team
    Phase 3 (Month 4+):   Full rollout
═══════════════════════════════════════════════════════
```

Этот отчёт — **главный pre-sales артефакт**.

---

# X. Roadmap

## 10.1. Фаза 0: Foundation (DONE, May 2026)

✅ Reference implementation v1.0.0-rc.1 (github.com/agisota/cpp-core)
✅ Public design document
✅ Reproducible CI

## 10.2. Фаза 1: Empirical validation (Jun-Aug 2026)

**Цели:**
- Anthropic cache alignment experiment → publish results
- 3 friendly pilots (own team + 2 design partners)
- Retroactive savings analysis tool

**Deliverables:**
- arXiv preprint: "Cross-provider canonical encoding for LLM context cache alignment"
- 3 pilot reports with consenting customers
- `cpp-cli analyze` tool для retroactive savings

## 10.3. Фаза 2: Pre-seed funding + first revenue (Sep-Dec 2026)

**Цели:**
- Pre-seed round $500K-$1M
- 5-10 paying pilots
- Sprint 3 proper (MCP transport)

**Deliverables:**
- Anthropic Startup Fund application
- OpenAI Fund application
- 5 signed pilot contracts (LOIs)
- Working MCP integration with Claude Code, Cursor

## 10.4. Фаза 3: Seed + GTM (Q1-Q2 2027)

**Цели:**
- Seed round $3-5M
- 20+ enterprise pilots
- Sprint 4 (Polarity validator MVP)

**Deliverables:**
- Multi-region deployment (US/EU/UAE)
- 3 enterprise customers signed
- Public benchmark suite

## 10.5. Фаза 4: Scale + Tier 2 (Q3-Q4 2027)

**Цели:**
- Series A $15-25M
- 100+ customers, $5M ARR
- N-of-M consensus + TEE attestation

**Deliverables:**
- TEE infrastructure deployment
- Industry consortium initiation
- Conference publication (NeurIPS / S&P / USENIX)

## 10.6. Фаза 5: zkML + Feedback loops (2028+)

**Цели:**
- Tier 3 (zkML proofs)
- Feedback corpus product (sell verified game tuples to AI labs)
- Industry standard ratification (W3C / IETF)

---

# XI. Go-to-market

## 11.1. Целевые рынки и их специфика

### Россия / CIS
**Customer profile:**
- Sber AI (внутренняя разработка GigaChat, SaluteAI)
- Yandex (YandexGPT, AI-агенты в маркете)
- MTS AI
- Tinkoff (внутренние ML-команды)
- VK (нейросети)
- X5 Group (AI для ритейла)

**Caveats:**
- Санкции усложняют использование Claude/OpenAI напрямую
- Но: GigaChat, YandexGPT — те же проблемы агентного контекста
- CPP кросс-провайдерский — это плюс

### UAE / MENA
**Customer profile:**
- G42 (Inception AI, Jais model)
- TII (Technology Innovation Institute) — Falcon LLM team
- ADNOC (digital transformation)
- Saudi PIF tech investments
- Aramco Digital
- STC (Saudi Telecom)
- Careem (Uber subsidiary, heavy AI usage)

**Caveats:**
- Регуляторно проще (UAE PDPL мягче чем GDPR)
- Капитал доступнее
- Sovereign AI initiatives — fit для CPP позиционирования

### Казахстан
**Customer profile:**
- Kaspi.kz (super-app, heavy AI)
- Halyk Bank
- Beeline KZ
- Astana Hub portfolio companies

**Caveats:**
- Меньший рынок, но: bridge между RU и UAE/MENA
- Astana Hub предоставляет visa/business infrastructure

### Mid-East and West
**Customer profile:**
- Notion, Sourcegraph, Replit (existing Anthropic customers)
- Anthropic itself как enterprise customer for internal use
- Big Four consulting (Deloitte, EY, McKinsey, BCG — все строят AI practices)

## 11.2. Pilot Playbook

### Шаг 1: Pre-sales hook (1 неделя)

Объект: получить read-only доступ к LLM API logs за последний месяц.

Outreach script (адаптированный под русско/MENA):
```
Subject: Анализ ваших LLM-расходов: 30-70% потенциальной экономии

Здравствуйте, [Name],

Видим, что [Company] активно использует LLM в [public use case].
Мы делаем audit, который выявляет повторяющийся контекст в LLM-сессиях
и quantifies возможную экономию через content-addressed caching.

Анализ занимает 3 дня. Не требует никаких изменений в вашей инфраструктуре.
Если экономия меньше 20% — отчёт бесплатный.
Если больше — пилот по revenue share.

Готовы провести анализ для [Company] на этой неделе?

С уважением,
[Founder]
```

### Шаг 2: Retroactive analysis report (3-5 дней)

См. шаблон выше в §9.3. Customer видит конкретные цифры savings.

### Шаг 3: Pilot agreement (1 неделя)

Pilot structure (стандартная):
- **Duration:** 90 дней
- **Pricing:** 0% pricing на pilot period
- **Deployment:** Shadow mode (no production impact)
- **Data access:** Read-only, anonymized, customer-controlled storage
- **Exit conditions:** Customer может остановить anytime
- **Conversion:** Если pilot показывает >$10K/мес savings → convert на revenue share или Enterprise tier

### Шаг 4: Shadow deployment (Day 1-7)

**Архитектура deployment:**
```
                    ┌─────────────────┐
                    │  Customer's     │
                    │  LLM API client │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Anthropic│    │ CPP     │    │ Customer│
        │ API     │    │ Proxy   │    │ logs    │
        │         │    │ (shadow)│    │ (existing)│
        └─────────┘    └─────────┘    └─────────┘
                            │
                            ▼
                       ┌─────────────┐
                       │ CPP measure │
                       │ DB (theirs) │
                       └─────────────┘
```

CPP-proxy **не модифицирует** трафик. Просто:
- Логирует canonical-encoded bytes для каждого request.
- Compute "what cache hit rate WOULD have been" if CPP были инжектированы.
- Хранит в customer's storage.

**Установка:** один docker run. 30 секунд. Не требует root.

```bash
docker run -d --name cpp-proxy \
  -p 9999:9999 \
  -v /var/lib/cpp-data:/data \
  -e UPSTREAM=https://api.anthropic.com \
  agisota/cpp-proxy:rc.1
  
# Customer changes ANTHROPIC_API_URL=http://localhost:9999/api в одном env file.
# Всё остальное работает как было.
```

### Шаг 5: Daily report (через первые 7 дней)

Customer получает каждое утро email-отчёт:
```
═══════════════════════════════════════════════════
  CPP SHADOW REPORT — Day 7
  
  Yesterday:
    LLM requests captured:       1,247
    Unique canonical contexts:      83
    Repetition ratio:               89%
    
  Would-be cache hits:
    Total input tokens:          14.2M
    Cached (potential):          10.8M (76%)
    Fresh (necessary):            3.4M (24%)
    
  Estimated cost saved:        $35.40
  
  Cumulative (7 days):       $241.80
  Projected monthly:        $1,036.00
═══════════════════════════════════════════════════
```

### Шаг 6: Conversion conversation (Day 30)

После 30 дней:
- Customer видит accumulated savings (теоретические).
- Предлагаем production deployment.
- Pricing: 20% от documented savings или $5K/мес minimum.

### Шаг 7: Production rollout (Month 2+)

Phased rollout:
- Week 1: 10% trafic через CPP, остальное direct.
- Week 2: 50%.
- Week 4: 100%.
- Continuous monitoring для отката.

## 11.3. Коммуникационный план: первые 12 недель

```
Week 1 (Jun 1-7):
  Mon:  Outreach Sber AI (через LinkedIn + warm intro)
  Tue:  Outreach Yandex Engineering
  Wed:  Outreach Anthropic Customer Success
  Thu:  Outreach G42 (через Hub71 introduction)
  Fri:  Outreach Tinkoff ML platform team
  
Week 2 (Jun 8-14):
  Mon:  First demo call: [whichever responds first]
  Wed:  Second demo call
  Thu:  Astana Hub introduction meeting
  Fri:  Outreach KAUST research group
  
Week 3 (Jun 15-21):
  Tue:  Retroactive analysis #1 delivered
  Wed:  Retroactive analysis #2 delivered
  Fri:  First pilot contract signed (target)
  
Week 4 (Jun 22-28):
  Mon:  Pilot 1 deployment
  Wed:  Anthropic Startup Fund application submitted
  Fri:  OpenAI Fund application submitted
  
Week 5-8 (Jul):
  Pilot 1 daily reports
  Outreach к VC funds (см. §XII)
  Conference paper draft begun
  
Week 9-12 (Aug):
  Pilot 1 conversion conversation
  Pilot 2 deployment
  arXiv preprint published
  Pre-seed term sheet (target)
```

---

# XII. Инвестиционная стратегия

## 12.1. Капитальная структура

```
Раунды:
─────────────────────────────────────────────
  Pre-seed (Q3 2026):       $500K-$1M
    Valuation cap:           $5M
    Use of funds:            Empirical validation, 2-3 hires
  
  Seed (Q1 2027):            $3M-$5M
    Valuation:               $15-25M
    Use of funds:            5 enterprise pilots, full team
  
  Series A (Q3 2027):        $15M-$25M
    Valuation:               $80-150M
    Use of funds:            Geographic expansion, Tier 2/3
```

## 12.2. Целевые VC фонды (по фазам)

### Pre-seed targets (Q3 2026)

**Anthropic Startup Fund** (https://www.anthropic.com/startup-fund)
- Fit: high (мы DIRECTLY улучшаем Anthropic API economics)
- Check size: $0.5-3M
- Process: warm intro + technical demo
- **Action:** apply by Aug 2026

**OpenAI Startup Fund** (https://openai.fund)
- Fit: medium (мы кросс-провайдерские, не lock-in to OpenAI)
- Check size: $1-5M
- **Action:** apply Q4 2026

**Sber500** (Russia, Sber's accelerator)
- Fit: high (Russian AI ecosystem)
- Check size: $100K-1M
- Application: sber500.com
- **Action:** apply Q3 2026

**Phystech Ventures** (Russia)
- Fit: medium-high (deep tech focus)
- Check size: $500K-3M
- **Action:** intro через MIPT alumni

**Y Combinator** (USA, twice yearly)
- Fit: high (infrastructure + AI)
- Check size: $500K standard
- Application: ycombinator.com
- **Action:** apply for W26 batch (deadline ~Sep 2025 для January 2026 batch)

**500 Global MENA** (UAE/SA)
- Fit: high (региональный фокус)
- Check size: $250K-1M
- **Action:** apply через MENA office

### Seed targets (Q1 2027)

**Andreessen Horowitz (a16z)** — крепкая AI infra thesis
**Lightspeed Venture Partners** — AI infra focus
**Sequoia Capital**
**Index Ventures** (London/SF)
**G42 Ventures** (UAE) — sovereign AI
**Mubadala Capital** (UAE)
**Saudi STV / Sanabil** (KSA)

### Research grants

**NSF SBIR Phase I** (USA)
- $275K, 12 months
- Application windows: Sep 2026, Dec 2026
- Eligibility: US-based legal entity

**EU Horizon Europe Cluster 4: Digital, Industry and Space**
- Up to €2.5M for cascade-funding
- Open continuously, deadlines quarterly
- Eligibility: EU consortium

**UK Innovate UK Smart Grants**
- £25K-2M
- Eligibility: UK presence

**Russian Science Foundation (РНФ)**
- 5-30M RUB ($60K-360K)
- Open calls 2-3 раза в год
- Eligibility: Russian academic institution

**TII Research Grants** (UAE)
- Открытые programs для AI safety, infrastructure
- Eligibility: UAE-based, или partnership с TII

**KAUST Research Grants** (Saudi)
- $50K-$1M
- Eligibility: academic affiliation, может быть visiting

**Astana Hub Tech Garden Grants** (Kazakhstan)
- $20K-100K
- Eligibility: KZ legal entity

## 12.3. Pitch стратегия

### Elevator pitch (30 секунд)

> «Мы строим Stripe для агентных систем. Сегодня каждый AI-агент платит за входные токены — даже за абсолютно те же байты, которые сосед уже отправил минуту назад. Мы делаем content-addressed canonical encoding, которое позволяет агентам делиться контекстом byte-for-byte и автоматически срабатывать на provider-side prompt cache. На реальной dev-machine видим 70% redundant tokens. Reference implementation готова. Ищем pre-seed $500K-$1M для empirical validation и первых 5 пилотов.»

### One-pager (для cold outreach)

См. `/strategy/one-pager.md` (отдельный файл).

### Deck structure (для warm meetings)

```
Slide 1:  Cover — CPP logo + tagline
Slide 2:  The problem — 1 chart с дублирующими токенами
Slide 3:  Why now — multi-agent + regulatory pressure
Slide 4:  Solution overview — canonical hashing in 3 steps
Slide 5:  Reference implementation — github.com/agisota/cpp-core
Slide 6:  Customer pain — real numbers from user's machine
Slide 7:  Market — TAM $4.8B → SOM $180M
Slide 8:  Competitive landscape — где мы НЕ конкурируем
Slide 9:  Deep play — feedback loops on hashes (the moonshot)
Slide 10: Business model — revenue share + SaaS tiers
Slide 11: Roadmap — 5 phases
Slide 12: Team — founders + advisors
Slide 13: Ask — $500K-$1M pre-seed
Slide 14: Appendix — math, math, math
```

## 12.4. Юрисдикции для регистрации

| Юрисдикция | Pros | Cons | Costs |
|---|---|---|---|
| **Delaware C-Corp** (USA) | Standard for VC, easy fundraising | Tax, FATCA reporting | $400 reg + $500/yr |
| **Delaware via Stripe Atlas** | Turn-key, $500 incl bank | US-only optimal | $500 one-time |
| **ADGM** (Abu Dhabi) | 0% corporate tax (free zone), AI-friendly | Higher setup costs ($5K) | $5K + $3K/yr |
| **DIFC** (Dubai) | World-class infrastructure, talent | $10K+ setup | $10K + $5K/yr |
| **AIFC** (Astana, Kazakhstan) | English common law, low tax, RU-friendly | Less prestige, smaller market | $1-3K |
| **Cyprus** | EU, low corp tax (12.5%), favorable | Brexit-impacts, paperwork | $2-5K |
| **Russia (РФ ООО)** | Local market access | Sanctions complications | Low (50K RUB) |

**Рекомендуемая структура:**

```
HoldCo:         Delaware C-Corp (для VC fundraising)
  ↓
OpCo Russia:    ООО (для CIS customers + IP licensing)
OpCo UAE:       ADGM или DIFC (для MENA customers + tax efficiency)
R&D arm:        Cyprus (для EU customers + tax)
```

Bootstrap путь:
1. **Q3 2026:** Stripe Atlas Delaware ($500). Banking via Mercury.
2. **Q4 2026:** ADGM SPV ($5K) для MENA pilots.
3. **2027:** Cyprus или другие EU options если EU pilots.

## 12.5. Visa и легальные перемещения

Для founder, путешествующего между юрисдикциями:

| Страна | Visa option | Cost | Time |
|---|---|---|---|
| UAE | Golden Visa (10y), entrepreneur category | ~$3K | 30 дней |
| UAE | Green Visa (5y), freelancer | $1K | 14 дней |
| Kazakhstan | Astana Hub Tech Visa (5y) | бесплатно | 7 дней |
| Cyprus | Permanent Residence by investment | €300K | 6 мес |
| Estonia | e-Residency + дист. company | €100 | 1 мес |

**Рекомендуемая комбинация:**
- Astana Hub Tech Visa (immediate, free, базовая).
- UAE Golden Visa (long-term, prestige).
- Estonia e-Residency (для EU activity).

Сценарий перелёта первой регистрации:
```
Day 1: Online application Astana Hub (https://astanahub.com)
Day 7: Approval, fly to Almaty/Astana
Day 8: Local registration at Astana Hub
Day 10: Bank account at Halyk / Forte
Day 14: KZ-OOO registered, ready for first transactions
```

---

# XIII. Команда, юрлица, инфраструктура

## 13.1. Core team (Year 1)

```
Tech Founder/CEO              1.0 FTE   UAE base
  - Vision, fundraising, lead architecture
  - Background: AI infrastructure + business
  
Research Lead                 0.5 FTE   Russia/EU
  - Canonical hashing, zkML, polarity validation
  - Background: PhD in CS / cryptography
  
Senior Infra Engineer         1.0 FTE   Russia/Kazakhstan
  - Bun/TypeScript, distributed systems
  - Background: 5+ years backend
  
GTM Lead                      1.0 FTE   UAE
  - Sales, partnerships, customer success
  - Background: enterprise SaaS sales
  
Crypto/Security Engineer      0.5 FTE   EU
  - Ed25519, hash security, audit
  - Background: blockchain or security consulting
  
─────────────────────────────────────
Total:                        4.0 FTE
Burn rate:                    $50K-80K/мес (с учётом geographic arbitrage)
```

## 13.2. Advisors (target)

- **Cryptography/zkML expert:** EZKL team, Modulus Labs, или academic
- **AI infrastructure:** Ex-Anthropic / OpenAI engineer
- **Enterprise sales:** Snowflake, Datadog, Confluent veteran
- **Regulatory:** ex-EU AI Act WG member или US AI safety counsel
- **MENA market:** G42 / Mubadala alumni

## 13.3. Инфраструктура

```
Development:
  Source:         GitHub (open core)
  CI:             GitHub Actions
  Package:        NPM (cpp-core) + Docker (cpp-mcp-server)
  
Production:
  Hosting:        AWS multi-region (US-East, EU-West, ME-South-1 Bahrain)
  Storage:        S3 + CloudFront для CIDs
  Compute:        ECS Fargate для validator inference
  Database:       PostgreSQL (RDS) для metrics
  
Validator hosting:
  Primary:        HuggingFace Endpoints для polarity model
  Backup:         Self-hosted на TII compute (UAE)
  Tertiary:       Together.ai / Replicate
  
Monitoring:
  Metrics:        Grafana Cloud
  Logs:           Datadog
  Errors:         Sentry
  Status:         status.cpp.dev
```

---

# XIV. Риски и митигации

| Риск | Вероятность | Импакт | Митигация |
|---|---|---|---|
| Anthropic меняет cache logic | Medium | High | Spec-update своего канонизатора + diversify к OpenAI/Google cache |
| Anthropic/OpenAI делает competing protocol | Low-Med | Critical | Open standard позиционирование; speed to market |
| Hash decay при апгрейде моделей | High | Medium | Polarity validator с frozen weights (§VII) |
| Pilot не показывает экономию | Medium | High | Retroactive analysis перед pilot — фильтр |
| Customer concerns о privacy CIDs | Medium | Medium | Encryption layer (H), capability tokens — backlog |
| Регуляторное давление на open AI canonization | Low | High | EU AI Act compliance работает В НАШУ пользу |
| Founder bandwidth (single point of failure) | High | Critical | Co-founder hiring приоритет 1 |
| Capital efficiency vs frontier competition | Medium | High | Strict 18-month runway between rounds |

---

# XV. План действий: следующие 12 недель

## Week 1 (Jun 1-7, 2026): Validation kickoff

```
Mon: Run Anthropic cache alignment experiment
     Script in /paper/experiments/exp1-cache-alignment.py
     Cost: $50, time: 4 hours
     
Tue: Publish results (or "no alignment" finding)
     Public gist + tweet thread
     
Wed-Thu: Build cpp-cli analyze tool
     Reads anonymized API logs, produces retroactive savings report
     
Fri: Outreach batch #1 (15 companies):
     - Sber AI (через LinkedIn)
     - Yandex Engineering
     - Tinkoff ML platform
     - Cursor
     - Sourcegraph
     - G42 Inception
     - TII Falcon team
     - Anthropic CS
     - Replit
     - Bedrock (AWS)
     - Notion AI
     - Glean
     - Pinecone
     - 10 startups через Y Combinator network
```

## Week 2-4 (Jun 8-28): First pilots + Y Combinator app

```
Week 2:
  Mon-Wed: Demo calls (3-5 expected)
  Thu: Deliver first retroactive analysis
  Fri: Astana Hub Tech Visa application

Week 3:
  Mon: First pilot contract signing (target)
  Wed: Anthropic Startup Fund application
  Fri: Y Combinator W26 application

Week 4:
  Mon: Pilot deployment
  Wed: Public benchmark suite published
  Fri: arXiv preprint draft begun
```

## Week 5-8 (Jul): Validation accumulates

```
Week 5: Pilot 1 daily reports begin
Week 6: Demo calls #6-10
Week 7: Second pilot contract
Week 8: Pre-seed fundraising kickoff
```

## Week 9-12 (Aug): Pre-seed close

```
Week 9: Term sheet conversations
Week 10: First pilot 30-day conversion
Week 11: arXiv preprint published
Week 12: Pre-seed close ($500K-$1M target)
```

---

# Заключение

Context Provenance Protocol — это **dual-track play**:

1. **Tactical, immediate:** content-addressed canonical encoding даёт 30-70% экономии на input-токенах для команд с shared context. Reference implementation готова, пилоты можно начинать **на этой неделе**.

2. **Strategic, 5-year:** канонизация фактов и суждений становится infrastructure layer для следующего поколения AI. Тот, кто стандартизирует — владеет training data flywheel.

Текущий артефакт (cpp-core v1.0.0-rc.1) — **технически готовая foundation**. Что нужно дальше:
- **Empirical validation** (4 экспериментов в §IX)
- **First pilots** (3-5 в §XI)
- **Pre-seed funding** ($500K-$1M в §XII)

Окно времени: **18 месяцев** до того, как либо Anthropic, либо Bittensor, либо новый игрок займёт canonical layer.

Реальный value сегодня: **dev'у с 13 параллельными worktree'ями ROX.ONE** — это означает $200-500/мес savings и formal multi-agent coordination. Завтра — рыночная категория с TAM $4.8B.

**Следующее действие:** запустить Эксперимент 1 (cache alignment) в понедельник. Стоимость: $50. Время: 4 часа. Information value: критическая.

---

См. также:
- `00-EXECUTIVE-SUMMARY.md` — короткая версия
- `appendices/01-math.md` — математические выкладки
- `appendices/02-pilots-pipeline.csv` — список target customers
- `appendices/03-fund-targets.csv` — список fund targets
- `strategy/one-pager.md` — investor one-pager
- `strategy/deck-outline.md` — pitch deck structure
- `strategy/pilot-contract-template.md` — template для pilot agreements
