```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║        ██████╗ ██████╗  ██████╗                                              ║
║       ██╔════╝██╔══██╗██╔══██╗                                               ║
║       ██║     ██████╔╝██████╔╝                                               ║
║       ██║     ██╔═══╝ ██╔═══╝                                                ║
║       ╚██████╗██║     ██║                                                    ║
║        ╚═════╝╚═╝     ╚═╝                                                    ║
║                                                                              ║
║            C o n t e x t   P r o v e n a n c e   P r o t o c o l           ║
║                                                                              ║
║         От оптимизации затрат к игротеоретической инфраструктуре            ║
║                        обратной связи AI-экономики                          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   Версия рабочего документа:    0.1                                          ║
║   Дата:                         2026-05-21                                   ║
║   Автор:                        agisota                                      ║
║   Reference implementation:     github.com/agisota/cpp-core  v1.0.0-rc.1    ║
║   Лицензия (impl):              MIT                                          ║
║   Лицензия (paper):             CC BY 4.0                                    ║
║   Контакт:                      founder@cpp.dev                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

═══════════════════════════════════════════════════════════════════════════════

## Оглавление

```
╭────────────────────────────────────────────────────────────────────────────╮
│                                                                            │
│  PART I   · RESEARCH PAPER                                                 │
│  ─────────────────────────────────────────────────────────────────         │
│  §I      Проблема: парадокс масштабирования LLM-агентов           [p.  4]  │
│  §II     Теория: что такое канонизация контекста                  [p.  8]  │
│  §III    История и prior art                                      [p. 12]  │
│  §IV     Реальная валидация: данные с продакшен-машины            [p. 15]  │
│  §V      Экономическая модель и unit economics                    [p. 18]  │
│  §VI     Глубинная гипотеза: feedback loops на хэшах              [p. 22]  │
│  §VII    Стабильность хэшей: защита от модельного декея           [p. 27]  │
│  §VIII   Архитектура и референс-имплементация                     [p. 31]  │
│  §IX     Стратегия валидации и эксперименты                       [p. 35]  │
│  §X      Roadmap по фазам                                         [p. 39]  │
│  §XI     Go-to-market: пилоты и каналы                            [p. 42]  │
│  §XII    Инвестиционная стратегия                                 [p. 45]  │
│  §XIII   Команда, юрлица, инфраструктура                          [p. 47]  │
│  §XIV    Риски и митигации                                        [p. 49]  │
│  §XV     Глубинная гипотеза (standalone deep-dive)                [p. 52]  │
│                                                                            │
│  PART II  · FINANCIAL MODEL                                                │
│  ─────────────────────────────────────────────────────────────────         │
│  §XVI    Три сценария                                             [p. 60]  │
│  §XVII   Revenue projections по годам                             [p. 62]  │
│  §XVIII  Unit economics                                           [p. 66]  │
│  §XIX    OpEx и cash runway                                       [p. 68]  │
│  §XX     Sensitivity analysis                                     [p. 70]  │
│  §XXI    KPI dashboard                                            [p. 72]  │
│                                                                            │
│  PART III · SECURITY ARCHITECTURE                                          │
│  ─────────────────────────────────────────────────────────────────         │
│  §XXII   Модель безопасности хэш-функции                          [p. 74]  │
│  §XXIII  Threat model и атаки                                     [p. 76]  │
│  §XXIV   Статический валидатор                                    [p. 79]  │
│  §XXV    zkML и polarity consensus                                [p. 82]  │
│                                                                            │
│  PART IV  · EXECUTION                                                      │
│  ─────────────────────────────────────────────────────────────────         │
│  §XXVI   Communications plan: 12 недель                           [p. 85]  │
│  §XXVII  Pilots pipeline                                          [p. 92]  │
│  §XXVIII Fund targets                                             [p. 96]  │
│                                                                            │
│  APPENDICES                                                                │
│  ─────────────────────────────────────────────────────────────────         │
│  A       Математические основы CPP                                [p. 99]  │
│  B       Список рисунков и таблиц                                 [p.108]  │
│  C       Библиография                                             [p.110]  │
│  D       Колофон                                                  [p.112]  │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯
```

═══════════════════════════════════════════════════════════════════════════════

```
                              ╔═════╗
                              ║ CPP ║
                              ╚═════╝

               P A R T   I   ·   R E S E A R C H   P A P E R

═══════════════════════════════════════════════════════════════════════════════
```

# §I. Проблема

## 1.1. Парадокс масштабирования LLM-агентов

В 2024–2026 годах массово появились **многоагентные системы**: Claude Code, Cursor, Cline,
Aider, AutoGPT-подобные harness'ы, RAG-агенты, autonomous research-агенты (Devin,
OpenHands, ROX.ONE). Их экономическая природа парадоксальна:

```
┌─────────────────────────────────────────────────────────────────┐
│  ПАРАДОКС: чем больше агентов, тем хуже unit-экономика          │
└─────────────────────────────────────────────────────────────────┘

  1 агент     →  стоимость = X
  3 агента    →  стоимость = 3X     (без шеринга контекста)
  10 агентов  →  стоимость = 10X    (linear scaling)
  100 агентов →  стоимость = 100X   (нет network effect)

В классических распределённых системах с ростом узлов растёт полезный output
(Metcalfe, Reed). В агентных системах сегодня — наоборот: с ростом числа
агентов растёт стоимость повторно загружаемого контекста.
```

**Корень проблемы:** каждый агент сегодня загружает контекст как **opaque text blob**.
Нет инфраструктурного слоя, позволяющего нескольким агентам договориться, что они
смотрят на один и тот же контент. Провайдеры (Anthropic, OpenAI) внутри кэшируют
префиксы, но **client-side нет видимости**, что попадёт в кэш.

## 1.2. Конкретный пример (real-world, не выдуманный)

Анализ продакшен-машины пользователя за май 2026:

| Метрика | Значение |
|---------|--------:|
| Общий объём сессий Claude Code | **687 MB** |
| Главный проект (craft) | **250 MB логов, 16 GB кода** |
| Активных параллельных worktree'ов | **13** |
| Из них с байт-в-байт идентичным AGENTS.md | **9 из 13** |
| Самая длинная сессия | **11 MB** (≈ 3M токенов) |
| Длинных сессий в одном проекте за месяц | **24** |
| Дублирующих `package.json` в проекте | **8,562** |
| Сессий с multi-agent workflow | **22** |

При средней цене Claude API $3/M input tokens:

```
Грубый расчёт расхода без CPP:
    24 сессий × 200K tokens × 10 turns × $3/Mt
  = 24 × 2M × $3/Mt
  = $144/мес ТОЛЬКО на одного разработчика, ТОЛЬКО на один проект

С учётом swarm (7 параллельных агентов):
    22 swarm-сессий × 7 × 200K × $3/Mt
  = $92.4/мес дополнительно

Итого: ~$236/мес × 1 dev × 1 проект = ~$2,832/год

Команда из 5:          ~$14K/год
Enterprise из 100:    ~$283K/год
SaaS с 100K юзеров:  $283M/год (теоретически)
```

И это **с уже работающим** prompt caching на стороне Anthropic. Большая часть —
кэш-миссы: нет синхронизации байтов между параллельными агентами и worktree'ами.

## 1.3. Регуляторная проблема

С 2025–2026 года вступают в силу требования к AI:

• **EU AI Act** (поэтапно 2024–2027): высокорисковые AI-системы обязаны иметь
  transparency obligations, human oversight, logging, audit trails.
• **GDPR Art. 22:** право на объяснение для автоматизированных решений
  со «значительным эффектом».
• **NIST AI RMF (USA):** требует traceability и explainability.
• **PCI DSS / HIPAA / SOX:** domain-specific audit logs.
• **UAE PDPL (2022):** Federal Decree-Law No. 45 of 2021.
• **Saudi PDPL (2023):** Personal Data Protection Law.

Все эти регуляции **требуют раскрыть** «как AI пришёл к решению X»: на каких данных,
версии модели, в какой момент. Сегодня это означает либо **отказ** от LLM в
regulated workflow, либо **homegrown audit-системы** ($1–5M/год на enterprise).

> **Инсайт:** CPP закрывает обе проблемы — cost savings и compliance audit —
> одним архитектурным решением.

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §II. Теория

## 2.1. Что такое канонизация

Канонизация — процесс приведения данных к **единственному, детерминированному**
представлению, при котором семантически эквивалентные данные имеют **бит-в-бит**
идентичную сериализацию.

```
JSON НЕ канонизирован:
  {"foo": 1, "bar": 2}   → байты A
  {"bar": 2, "foo": 1}   → байты B       ← семантически одно, хэши разные

DAG-CBOR канонизирован:
  {foo: 1, bar: 2}       → детерминированные байты (ключи лексически)
  {bar: 2, foo: 1}       → ТЕ ЖЕ байты   ← гарантированный совпадающий хэш
```

DAG-CBOR (RFC 8949 + IPLD-restrictions) — это canonical CBOR с ограничениями:
- Только definite-length представления.
- Integer keys отсортированы.
- Floats только в float64.
- UTF-8 строки в каноническом NFC.

## 2.2. Content-addressed identification (CID)

```text
CID = multihash(SHA-256, DAG-CBOR(canonical(data)))

Анатомия:
  bafyreif...
  │└┬┘└────┘
  │ │   └─── multihash digest (32 bytes, base32)
  │ └──────── codec identifier (dag-cbor = 0x71)
  └────────── CID version (v1)
```

Свойства CID:
• **Verifiable** — дано CID + содержимое → проверка за 1 мс.
• **Collision-resistant** — SHA-256 даёт 2^128 security level.
• **Self-describing** — codec и hash function закодированы в самом CID.
• **Federable** — одинаков везде: локально, в S3, в IPFS, у партнёра.

## 2.3. Семантический граф: Fact, Rule, Calculation, Effect

CPP формализует структуру агентного контекста через четыре типа узлов,
заимствованных из W3C PROV-O и расширенных:

```
            ┌──────────┐
            │  Fact    │ ◄── подписанное наблюдение (developer, sensor, API)
            └────┬─────┘
                 │ used by
                 ▼
  ┌──────────┐         ┌──────────────────────┐
  │  Rule    │────────►│  CalculationActivity │
  └──────────┘ used by │  (агент + model +    │
       ▲               │   tool_calls + tier) │
       │ versioned     └──────────┬───────────┘
       │                          │ wasGeneratedBy
       │                          ▼
       │               ┌──────────────────────┐
       │               │   Effect             │
       │               │   + range structure  │
       │               │   + confidence       │
       │               └──────────────────────┘
```

| Узел | Семантика | Подпись |
|------|-----------|---------|
| **Fact** | Объективное наблюдение | автор (did:key) |
| **Rule** | Инструкция для обработки | authority (did:key) |
| **CalculationActivity** | Применение Rules к Facts | агент (did:key) |
| **Effect** | Результат с range и confidence | агент-производитель |

## 2.4. Trust Tiers

```
Tier 1 — Content-addressing only
  Цена: $0
  Даёт: integrity (контент не подменён)
  Охват: 80% операций — внутренние cache-hits

Tier 2 — N-of-M consensus + TEE
  Цена: 3–5× стоимости инференса
  Даёт: semantic agreement + hardware-trusted execution
  Охват: compliance-reports, mid-stakes решения

Tier 3 — zkML proof
  Цена: $0.5–5/proof, 10–60 с latency
  Даёт: математическое доказательство
  Охват: litigation-grade, SEC filings, regulatory submission
```

## 2.5. Подписи и идентичность (did:key)

Каждый узел графа подписывается ключом автора:

```text
SignedEnvelope<T>:
  payload:    T (FactNode | RuleNode | CalculationActivity | EffectNode)
  signer_did: did:key:z6Mk...  (Ed25519 public key embedded)
  signature:  Ed25519(canonical(payload || signed_at))
  signed_at:  ISO8601
```

`did:key` — W3C-стандартный self-sovereign identifier. Публичный ключ **встроен** в DID,
нет нужды в registry. Verify за 100 мкс. Cross-platform.

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §III. История и Prior Art

## 3.1. Эволюция подходов к контексту LLM

```
Эра          Подход                           Проблема
────────────────────────────────────────────────────────────────────────
2022–2023    Plain prompt text                100% дубликация, нет дедупа
Late 2023    Vector RAG (embeddings)          Решает другую задачу (selection)
Mid 2024     Anthropic prompt caching         Provider-locked; cache key opaque
Late 2024    Files API (OpenAI / Anthropic)   Provider-specific IDs; нет crypto
2025         MCP Resources (mcp:// URIs)      URI-addressed, не content; нет signing
2026 (CPP)   Content-addressed canonical      Первый open cross-provider standard
             bytes + semantic graph
             + cryptographic signatures
             + tier-aware verification
```

## 3.2. Соседние технологии

| Стандарт | Год | Что взяли |
|----------|-----|-----------|
| **DAG-CBOR** (RFC 8949 + IPLD) | 2018 | Canonical bytes (полностью) |
| **CIDv1** (multiformats) | 2017 | Content addressing (полностью) |
| **PROV-O** (W3C) | 2013 | Вокабуляр Entity/Activity/Agent |
| **DID Core** (W3C) | 2022 | did:key для identity |
| **MCP Resources** (Anthropic) | 2024 | URI scheme как integration surface |
| **W3C VC** (Verifiable Credentials) | 2019 | Signed claims pattern |

## 3.3. Что не существовало до CPP

• **Cross-provider canonical encoding для LLM context.** Anthropic и OpenAI имеют
  разные внутренние cache hashing. Общего стандарта нет.
• **Семантически-типизированное content-addressing для agentic workflows.**
  IPFS даёт generic CID; PROV-O даёт семантику. CPP — пересечение.
• **Tier-aware verification protocol.** zkML существует, но не интегрирован
  с content-addressed storage как единый протокол.
• **Open standard для signed multi-agent provenance.**

## 3.4. Конкурентный ландшафт

| Конкурент | Что делает | Зазор с CPP |
|-----------|------------|-------------|
| **Bittensor / Subnet 23** | Verifiable AI inference | Криптоэкосистема, не drop-in |
| **EZKL / Modulus / Giza** | zkML proofs | Не content-addressing; не multi-agent |
| **Anthropic prompt caching** | Provider-internal cache | Single-provider, не клиент-видим |
| **LangChain checkpoints** | State persistence | Не content-addressed, не verifiable |
| **W3C Verifiable Credentials** | Signed claims | Нет content-addressing; JSON-LD heavy |

**CPP занимает нишу:** protocol-layer abstraction поверх IPLD + DID + PROV-O + MCP,
оптимизированная под LLM agentic workflows.

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §IV. Реальная валидация

## 4.1. Машинный аудит

```
══════════════════════════════════════════════════════════════════
          CLAUDE CODE USAGE PATTERN ANALYSIS
                     2026-05-21 snapshot
══════════════════════════════════════════════════════════════════

  Storage footprint:
  ─────────────────
  Session logs total:               687 MB
    └── Primary project (craft):    250 MB
    └── /tmp ephemeral sessions:    283 MB  (478 files)
    └── Other projects (7):         154 MB

  Codebase footprint:
  ──────────────────
  Total primary project:              16.0 GB
    └── Parallel worktrees:            13
    └── Identical AGENTS.md (MD5):      9 of 13
    └── Duplicate package.json:     8,562
    └── Duplicate tsconfig.json:       966

  Session patterns:
  ────────────────
  Long sessions (>1 MB) in primary:   24
  Largest single session:           11 MB  (≈ 3M tokens)
  Sessions with multi-agent:          22

  Estimated wasted tokens:
  ────────────────────────
  9 worktrees × 6.2 KB × 8 sessions/week × 10 turns
  ≈ 90M tokens "unnecessarily re-encoded" per week
  At $3/M tokens:  $270/week wasted · per dev · per project
══════════════════════════════════════════════════════════════════
```

## 4.2. Что это говорит о потенциале

```
Per-developer waste (conservative):   $150/мес
Team of 10 devs:                    $1,500/мес = $18K/год
Mid-enterprise 100 devs:           $15,000/мес = $180K/год
Large enterprise 1,000 devs:      $150,000/мес = $1.8M/год
SaaS provider 100K active devs:    $15M/мес    = $180M/год
```

И это **только** на уровне cost-saving. Audit-trail value и feedback-loop value
приходят сверху.

## 4.3. Ideal Customer Profile

```
ICP Tier 1 (immediate buyers):
  ○ Engineering teams 50–500 человек
  ○ Используют Claude Code / Cursor / Cline / Aider
  ○ Несколько параллельных worktree'ов
  ○ Видят $1K–$50K/мес расходов на LLM API
  ○ Лидер инжиниринга чувствует «почему-то стало дорого»

ICP Tier 2 (regulatory-driven):
  ○ Финтех, медтех, банки, юриспруденция
  ○ Регулятор требует audit trail
  ○ Cost — second-order; primary — compliance risk

ICP Tier 3 (frontier multi-agent):
  ○ Autonomous research teams (10+ агентов на задачу)
  ○ Cost доминирует unit economics
  ○ Уже инвестируют в собственные solutions
```

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §V. Экономическая модель

## 5.1. Unit economics клиента

```text
Сэкономлено = Total_input_tokens × Repetition_ratio × Cache_hit_discount

Где:
  Repetition_ratio     = доля повторяющегося контекста (0.6–0.95)
  Cache_hit_discount   = 0.9 (Anthropic cached reads: 90% off)

Пример для 100-dev enterprise:
  Total_input_tokens   = 100 × 30 × 200K × 22 дня = 13.2B/мес
  Repetition_ratio     = 0.7  (типичный shared codebase)
  Cache_hit_discount   = 0.9

  Tokens saved         = 13.2B × 0.7 × 0.9 = 8.3B/мес
  At $3/M:             = $24,900/мес = $298K/год
  Realistic capture (50%): $149K/год для клиента
```

## 5.2. Pricing модель CPP

**Рекомендуемая гибридная модель (Pilot → Production):**

• Pilot (90 дней): 0% pricing.
• Convert: 20% от documented token savings, минимум $2K/мес.
• Self-hosted: $5K/мес flat для отказывающихся от revenue share.

Альтернативы:
- SaaS: $99–$299/dev/мес.
- Infrastructure: $5K/мес base + $0.10/1M tokens through CPP.

## 5.3. TAM/SAM/SOM

| Рынок | Размер | Определение |
|-------|-------:|-------------|
| **TAM** | **$4.8B** | Глобальные корп. расходы на LLM API (2026) |
| **SAM** | **$1.2B** | Корпорации >100 сотрудников, LLM в workflow |
| **SOM** | **$180M** | ROI >300% в первый год (5-летний горизонт) |

| Год | Клиенты | ARR/клиент | Total ARR |
|-----|--------:|-----------:|----------:|
| Y1 (2026) | 5 | $50K | $250K |
| Y2 (2027) | 25 | $80K | $2M |
| Y3 (2028) | 100 | $120K | $12M |

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §VI. Глубинная гипотеза

## 6.1. Тезис

Cost saving — **поверхностный** value. Реальный приз — формирование training signal
для следующих поколений моделей.

```
ПОВЕРХНОСТНЫЙ СЛОЙ:           ГЛУБИННЫЙ СЛОЙ:
─────────────────────         ─────────────────────────────────────
$X/мес savings                Каноническое представление всех
Audit-trail                   {fact, event, judgment, decision} →
Multi-agent coordination      любая AI-система может:
                                ○ подтвердить идентичность входов
                                ○ воспроизвести вычисление
                                ○ сравнить outcomes объективно
                              → обучение на CRYPTO-VERIFIED game tuples:
                                (context_CID, action_CID, outcome_CID)
                              → тот, кто владеет каноном,
                                владеет training data flywheel.
```

## 6.2. Аналогии из истории

| Технология | Канон | Кто владел |
|------------|-------|------------|
| Поиск 2000-х | PageRank graph | Google → монополия |
| Social graph 2010-х | Friend connections | Facebook → монополия |
| RLHF 2022–2024 | Human preference rankings | Anthropic + OpenAI |
| **AI feedback 2026+** | **Verified outcome tuples** | **? (открытая ниша)** |

## 6.3. Формальная модель feedback loop

```text
Каждое решение AI-агента — game tuple:

    T = (S_in, A, S_out, R)

  S_in   = CID контекста, который видел агент
  A      = CID CalculationActivity (model + params + tool_calls)
  S_out  = CID Effect (что изменилось)
  R      = downstream observable (принято / отклонено / баг?)

С CPP все четыре компонента становятся cryptographically linked.

187.5M verified game tuples/год от одной enterprise команды:
  100 devs × 30 sessions/day × 250 decisions × 250 дней
  = $0 marginal cost  (CPP уже задеплоен ради savings)
```

## 6.4. Кто платит за канон?

```
Layer 1: Enterprise cost saving            → $$$
Layer 2: Regulated industries (audit)      → $$$$
Layer 3: AI labs (training signal)         → $$$$$$ (platform-level)
Layer 4: Network effect (infrastructure)   → market-making
```

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §VII. Стабильность хэшей

## 7.1. Угроза: hash decay при апгрейде моделей

Когда выходит Claude Opus 5 / GPT-5 / Gemini 3:
- Provider может изменить cache_key hashing.
- Старые canonical bytes могут больше не давать те же cache hits.
- **Без защиты — протокол распадается каждые 6–12 месяцев.**

## 7.2. Решение: статическая модель-валидатор

Концепция заимствована из ZK-rollup architecture:

```
┌──────────────────────────────────────────────────────────────┐
│  STATIC CANONICAL VALIDATOR MODEL                            │
│  ─────────────────────────────────────────────────────────── │
│  ○ Open weights (publicly auditable)                         │
│  ○ Frozen version (NEVER updated, only versioned)            │
│  ○ Deterministic at T=0 (single-batch, fixed seed)           │
│  ○ Bit-reproducible across hardware                          │
│  ○ ≤10B params (zkML feasibility 2027–2028)                  │
│  ─────────────────────────────────────────────────────────── │
│  Кандидаты:  Llama 3.1 8B  ·  Mistral 7B  ·  Phi-3 Mini 3.8B│
│  Hosting:    HuggingFace  ·  Together.ai  ·  TII compute     │
└──────────────────────────────────────────────────────────────┘
```

## 7.3. Polarity Validation Protocol

Вместо точного матча байтов — **полярная верификация**:

```text
Producer заявляет:  Effect X → POSITIVE zone (confidence 0.93)

Validator (N из M):
  1. Resolve CID X → bytes
  2. Запустить static model с polarity prompt
  3. Подписать: {validator_did, effect_cid, zone, score, timestamp}

ConsensusAttestation (k-of-N):
  → включить в training data как reward signal
  → использовать как compliance audit evidence
  → передавать downstream без raw content
```

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §VIII. Архитектура

## 8.1. Стек слоёв

```
┌────────────────────────────────────────────────────────────────┐
│ Layer 9: Industry consortium / standardization                  │
├────────────────────────────────────────────────────────────────┤
│ Layer 8: Polarity Validator Model (static, shared)              │ ← Sprint 6+
├────────────────────────────────────────────────────────────────┤
│ Layer 7: MCP Server (JSON-RPC transport + subscriptions)        │ ← Sprint 3+
├────────────────────────────────────────────────────────────────┤
│ Layer 6: Storage Federation (S3 / IPFS / Filecoin)              │ ← Sprint 2.5+
├────────────────────────────────────────────────────────────────┤
│ Layer 5: Resolver + Supersession + Stale-detection             │ ✅ v0.2.0
├────────────────────────────────────────────────────────────────┤
│ Layer 4: Storage (Memory + Filesystem)                          │ ✅ v0.2.0
├────────────────────────────────────────────────────────────────┤
│ Layer 3: Semantic Graph (Fact / Rule / Calc / Effect)           │ ✅ v0.1.x
├────────────────────────────────────────────────────────────────┤
│ Layer 2: Signatures + Identity (did:key + Ed25519)              │ ✅ v0.1.x
├────────────────────────────────────────────────────────────────┤
│ Layer 1: CID + DAG-CBOR (canonical encoding)                    │ ✅ v0.1.x
└────────────────────────────────────────────────────────────────┘
```

## 8.2. Reference implementation (v1.0.0-rc.1)

```text
cpp-core/
├── src/
│   ├── canonical.ts       # DAG-CBOR encode/decode
│   ├── cid.ts             # CID computation (sync SHA-256)
│   ├── types/             # Fact, Rule, Calculation, Effect, Validity
│   ├── identity/          # did:key, Ed25519 sign/verify
│   ├── storage/           # Storage interface + Memory + Filesystem
│   ├── supersession.ts    # Chain follower + stale-fact detection
│   └── mcp/               # URI scheme + Resource shape
├── tests/                 # 83 tests, 175 assertions
└── CI                     # GitHub Actions: 11–14 s, all green
```

## 8.3. Три пути интеграции

**A. Drop-in library** (контролируемые harness'ы):

```typescript
import { FilesystemStorage, computeCID } from "cpp-core";
const cid = await storage.put(contextChunk);
```

**B. MCP server** (harness'ы с MCP support):

```bash
cpp-mcp-server --storage /var/lib/cpp-store
```

**C. Shadow-traffic mode** (для пилотов, без изменения основного потока):

```bash
cpp-proxy --upstream https://api.anthropic.com \
          --capture /var/lib/cpp-capture
```

► **Вариант C критичен для первых пилотов** — позволяет измерять без изменения workflow.

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §IX. Стратегия валидации

## 9.1. Иерархия гипотез

```
H0 (null):    CPP не даёт измеримой экономии.
H1 (primary): CPP даёт ≥30% input-token savings на shared-context workflow.
H2:           Anthropic cache hashing совпадает с CPP canonical bytes.
H3:           TTFT на cached prefix снижается ≥50%.
H4:           Multi-agent coordination value > cost saving в долгосрок.
H5:           Static validator stable → polarity независима от версии модели.
H6:           Verified game tuples → better fine-tuning signal.
```

## 9.2. Эксперимент 1: Cache alignment (Day 1–7)

**Гипотеза:** байт-идентичные canonical bytes → Anthropic cache hit.

**Метрики:** `cache_read_input_tokens / total_input_tokens` ratio, TTFT delta.

**Стоимость:** $50. **Время:** 1–2 дня от kickoff.

## 9.3. Retroactive savings analysis (главный пресейл-артефакт)

> Клиент даёт **read-only** доступ к LLM usage logs за 30 дней.
> Мы делаем backward analysis: identify повторяющиеся context patterns,
> compute «as-if CPP» cache hit potential, quantify $ saved.
> Клиент видит конкретное число до подписания контракта.

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# §X–XV. Roadmap, GTM, Инвестиции, Риски

## §X. Roadmap по фазам

```
Фаза 0 (done):   Reference implementation v1.0.0-rc.1 · MIT · public
                 83 tests · TypeScript + Bun · full design spec

Фаза 1 (Q3 2026): Experiments 1–3 · 3–5 pilot contracts
                  shadow-traffic deployment · retroactive analysis CLI

Фаза 2 (Q4 2026): Pre-seed $500K–$1M · 4 hires · MCP server (Sprint 3)
                  First enterprise customer at scale

Фаза 3 (2027):   Seed round · Polarity validator MVP · 25+ customers
                  Static checkpoint published on HuggingFace

Фаза 4 (2028):   zkML proof prototype · W3C Community Group
                 100+ customers · Series A

Фаза 5 (2029+):  Industry consortium · W3C Recommendation track
                 Training data marketplace · $50M+ ARR
```

## §XI. Go-to-Market

**Три параллельных трека:**

1. ► **PLG motion** — `cpp-cli analyze` → public retroactive report → convert.
2. ► **Outbound enterprise** — retroactive savings analysis → pilot → contract.
3. ► **Research channel** — arXiv preprint → conference (NeurIPS / ICLR) → labs.

**Конверсионная воронка (12 недель):**

| Этап | Target rate | Абсолютная цель |
|------|:-----------:|----------------:|
| Outreach → Response | 25% | 15 responses (из 60) |
| Response → Demo | 100% | 15 demos |
| Demo → Retro analysis | 60% | 9 analyses |
| Retro → LOI | 90% (при ROI >$10K/мес) | 8 LOI |
| LOI → Signed | 60% | 5 pilots |

## §XII. Инвестиционная стратегия

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Раунд:    Pre-seed  ·  $500K–$1M  ·  Q4 2026                               ║
║  Runway:   18 месяцев до Seed round (Q2 2028)                                ║
║                                                                              ║
║  Трек 1:  Anthropic Startup Fund + OpenAI Fund + CIS VC (Sber500/Phystech)   ║
║  Трек 2:  Pilot revenue $50K–$200K (3–5 корпоративных пилота)               ║
║  Трек 3:  Research grant $300K–$2M (NSF SBIR / EU Horizon / KAUST)          ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Exit comparables:**

| Компания | Модель | EV/ARR multiple |
|----------|--------|----------------:|
| Datadog | Infrastructure SaaS | 10× |
| HashiCorp | Open-core infra | 12× |
| Snowflake | Data platform | 15× |

## §XIII. Команда

| Роль | FTE | Локация | Статус |
|------|----:|---------|--------|
| Tech Founder — architecture + protocol | 1.0 | UAE / CIS | ✅ |
| Research Lead — canonical hashing + zkML | 0.5 | EU / RU | 🔘 To hire |
| GTM Lead — enterprise SaaS | 1.0 | UAE / MENA | 🔘 To hire |
| Senior Infra Engineer | 1.0 | RU / KZ | 🔘 To hire |
| Crypto / Security Engineer | 0.5 | EU | 🔘 To hire |
| **Итого** | **4.0** | | |

## §XIV. Риски и митигации

| Риск | Вероятность | Митигация |
|------|:-----------:|-----------|
| Anthropic меняет cache-key логику | Средняя | 1 spec-update; update clause в пилот-контрактах |
| Конкурент (Anthropic / OpenAI) опережает | Низкая | Open-standard позиционирование; первый мувер — мы |
| Hash decay при апгрейде моделей | Средняя | Static validator model protocol |
| Долгий enterprise sales cycle | Высокая | PLG + retroactive analysis как ROI-first hook |
| zkML не масштабируется до 2027 | Средняя | Distilled <10B validator; phased approach |

## §XV. Глубинная гипотеза (краткое изложение)

*Полная версия: `02-DEEP-HYPOTHESIS.md`*

> **Тезис:** каноническое хэширование контекста — это не оптимизация. Это
> формирование основания, на котором работает следующий класс AI-систем. Substrate
> для верифицируемых обратных связей между AI-агентами. Тот, кто канонизирует факты
> и суждения первым, становится infrastructure layer уровня TCP/IP или HTTP.

**Ключевые аргументы:**

1. **AI-суждение верифицируемо тогда и только тогда**, когда его контекст имеет
   стабильный, детерминированный идентификатор. CID — это этот идентификатор.

2. **Verified training data** — фундаментальное преимущество. При `S_in_CID₁ = S_in_CID₂`
   гарантировано `bytes(S_in₁) = bytes(S_in₂)` → два кортежа безусловно сопоставимы
   как training samples.

3. **5-летнее winner-take-all окно** открыто сейчас:
   - Взрыв multi-agent систем (2025–2027).
   - EU AI Act полностью в силе с 2026.
   - Frontier labs ещё не зафиксировали canonical encoding standard.

```
╭──────────────────────────────────────────────────────────────────────╮
│  Ставка CPP:                                                         │
│                                                                      │
│  Краткосрочно (1–3 года): cost saving + compliance                  │
│      → достаточно для pre-seed + seed + первых $5M ARR              │
│                                                                      │
│  Среднесрочно (3–7 лет): canonical standard для AI context          │
│      → industry consortium + W3C ratification                       │
│      → $50–200M ARR от infra licensing + training data marketplace  │
│                                                                      │
│  Долгосрочно (7+ лет): substrate для verified AI economy            │
│      → потолок неочевиден; comparable с Stripe ($50B) / Twilio      │
╰──────────────────────────────────────────────────────────────────────╯
```

═══════════════════════════════════════════════════════════════════════════════

```
                              ╔═════╗
                              ║ CPP ║
                              ╚═════╝

             P A R T   I I   ·   F I N A N C I A L   M O D E L

═══════════════════════════════════════════════════════════════════════════════
```

# §XVI. Три сценария

```
╭─────────────────────────────────────────────────────────────────────────╮
│                                                                         │
│   BEAR              BASE               BULL                            │
│   ────────          ────────           ────────                        │
│   Y1: $100K ARR     Y1: $250K ARR      Y1: $500K ARR                  │
│   Y2: $600K ARR     Y2: $2M ARR        Y2: $5M ARR                    │
│   Y3: $2.5M ARR     Y3: $12M ARR       Y3: $30M ARR                   │
│                                                                         │
│   Pre-seed close:  Q4 2026  (все сценарии)                             │
│   Runway to Series A: Q3 2027                                          │
│                                                                         │
╰─────────────────────────────────────────────────────────────────────────╯
```

# §XVII. Revenue Projections

## Year 1 (2026) — Base Scenario

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  YEAR 1 (2026) — BASE SCENARIO                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Q3 2026 (Jul–Sep):                                                      ║
║    New Tier 1 customers:    2  (pilot conversions)                      ║
║    New Tier 2 customers:    1  (first enterprise)                       ║
║    Avg ACV:  T1=$3K/мес,  T2=$12K/мес                                  ║
║    ARR end Q3:  2×$36K + 1×$144K = $216K                               ║
║                                                                          ║
║  Q4 2026 (Oct–Dec):                                                      ║
║    New Tier 1: +1  ·  New Tier 2: +1                                    ║
║    ARR end Q4:  3×$36K + 2×$144K = $396K ≈ $400K                      ║
║                                                                          ║
║  Year 1 Summary:  5 customers  ·  $400K ARR  ·  $150K recognized       ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

# §XVIII. Unit Economics

**Три тира клиентов:**

| Тир | Профиль | ACV | Churn | Gross Margin | Sales Motion |
|-----|---------|----:|------:|-------------:|--------------|
| Tier 1 — Developer Teams | 10–50 devs, AI-native | $24K–60K | 15% | 75% | PLG self-serve |
| Tier 2 — Enterprise | 100–500 devs, regulated | $120K–360K | 7% | 70% | Retro analysis → pilot |
| Tier 3 — Sovereign AI Lab | G42, TII, Sber AI | $600K–$2.4M | 5% | 65% | Gov relationship |

**Затраты на $10K MRR enterprise customer:**

```
CPP storage (S3-equivalent):    $200/мес
Verification compute:           $300/мес  (Tier 1 only)
Audit log retention (7 лет):    $150/мес
Customer success (¼ FTE):     $2,500/мес
─────────────────────────────────────────
COGS total:                   $3,150/мес  (31.5%)
Gross margin:                     68.5%
```

# §XIX–XXI. OpEx, Sensitivity, KPI Dashboard

## §XIX. OpEx и Cash Runway

**Ежемесячный burn (post pre-seed, 4 FTE):**

```
Engineering (2 FTE × $8K/мес):    $16,000
GTM (1 FTE × $6K/мес):             $6,000
Research (0.5 FTE × $7K/мес):      $3,500
Infrastructure + tools:             $2,000
Legal + accounting:                 $1,500
Travel + conferences:               $1,000
─────────────────────────────────────────
Total monthly burn:                $30,000
─────────────────────────────────────────
Pre-seed ($750K mid):  25 months runway
Break-even (base):     Q4 2027 (Month 18)
```

## §XX. Sensitivity Analysis

| Сценарий | ACV delta | Churn delta | ARR Y2 | Break-even |
|----------|----------:|------------:|-------:|:-----------:|
| Bear | −30% | +5% | $600K | Q2 2029 |
| Base | — | — | $2M | Q4 2027 |
| Bull | +50% | −2% | $5M | Q2 2027 |

## §XXI. KPI Dashboard (Board Reporting)

| Метрика | Q3 2026 | Q4 2026 | Q2 2027 | Q4 2027 |
|---------|--------:|--------:|--------:|--------:|
| ARR | $216K | $400K | $1.2M | $2M |
| Customers | 3 | 5 | 12 | 25 |
| NRR | — | — | 110% | 115% |
| Gross Margin | 72% | 72% | 74% | 74% |
| CAC payback | — | 8 мес | 7 мес | 6 мес |
| Cash runway | 22 мес | 19 мес | 14 мес | 8 мес |

═══════════════════════════════════════════════════════════════════════════════

```
                              ╔═════╗
                              ║ CPP ║
                              ╚═════╝

          P A R T   I I I   ·   S E C U R I T Y   A R C H I T E C T U R E

═══════════════════════════════════════════════════════════════════════════════
```

# §XXII. Модель безопасности хэш-функции

## SHA-256: три свойства

```
╭────────────────────────────────────────────────────────────────────────╮
│  Property 1: Preimage resistance                                       │
│  Дано: h = SHA-256(x)  ·  Найти: x  ·  Сложность: O(2^256)            │
│                                                                        │
│  Property 2: Second preimage resistance                                │
│  Дано: x, h  ·  Найти: x'≠x с тем же h  ·  Сложность: O(2^256)       │
│                                                                        │
│  Property 3: Collision resistance                                      │
│  Найти: x, x' такие что SHA-256(x) = SHA-256(x')                      │
│  Сложность: O(2^128) по birthday bound                                │
│  Состояние 2026: нет известных практических атак                      │
╰────────────────────────────────────────────────────────────────────────╯
```

**Security level:** 128 bits против generic collision attack, 256 bits против preimage.
Достаточно для всех практических сценариев CPP.

## Length Extension: защита через DAG-CBOR

DAG-CBOR canonical encoding защищает от length extension attacks: структурные
length prefixes и type tags не позволяют тривиально добавить extension без
нарушения CBOR-структуры. Подписи Ed25519 покрывают `canonical(payload || signed_at)`.

# §XXIII. Threat Model

| Атака | Вектор | Митигация |
|-------|--------|-----------|
| Content substitution | Подмена bytes при одном CID | Preimage resistance SHA-256: O(2^256) |
| Hash collision | Два разных контекста → один CID | Birthday bound: O(2^128) — практически невозможно |
| Model drift | Апгрейд модели меняет семантику | Static validator model + polarity zones |
| Replay attack | Переотправка старых подписей | `signed_at` в подписи + expiry |
| Validator compromise | N-of-M nodes collide | Порог k-of-N; разные юрисдикции хостинга |
| Key compromise | Кража did:key private key | Key rotation protocol; Ed25519 |

# §XXIV. Статический валидатор

## Дистилляция валидатора

```
Шаг 1: Собрать 100K labeled examples
  {context, claim, true_polarity}
  Human annotation: 10K  ·  GPT-4o / Claude ensemble: 90K
  Баланс: 40% positive · 30% neutral · 30% negative

Шаг 2: Дистилляция (1–3B params)
  Teacher: Claude Opus 4 + GPT-4o ensemble
  Student: Llama 3.2 1B fine-tuned on task
  Training: 4×A100, ~8 часов, ~$200

Шаг 3: Зафиксировать checkpoint
  sha256(weights.bin) = 0x...
  Published: HuggingFace Model Hub
  Versioned: cpp-validator-v1.0  (NEVER updated, only versioned)

Шаг 4: Verify determinism
  100 hardware configs → same output at T=0 greedy decoding
```

# §XXV. zkML и Polarity Consensus

## Polarity Zones

```text
Polarity Zone C ⊂ [-1, 1]:

  POSITIVE_ZONE  = [+0.3, +1.0]
  NEUTRAL_ZONE   = [-0.3, +0.3]
  NEGATIVE_ZONE  = [-1.0, -0.3]

  Consensus threshold: 3-of-5 validators agree on zone.
```

**Эмпирическая стабильность:**
- Polarity agreement между Claude Opus 3.5, 4, GPT-4o, Llama 70B: 4/4 = 100% на тест-кейсе.
- Ожидаемый дрейф при major model update: 5–15% binary disagreement.
- При static validator + zone consensus: <5% zone boundary violations.

## zkML Stack (2026–2027)

| Инструмент | Params limit | Proof time | Status |
|------------|-------------:|-----------:|--------|
| EZKL | <100M | 10–60 с | Production-ready |
| Modulus Labs | ~1B | 30–120 с | Commercial |
| Giza (Cairo) | <500M | 20–90 с | Beta |

Для Llama 70B zkML **не работает** напрямую. Путь: distilled validator 1–3B → zkML.

═══════════════════════════════════════════════════════════════════════════════

```
                              ╔═════╗
                              ║ CPP ║
                              ╚═════╝

                P A R T   I V   ·   E X E C U T I O N

═══════════════════════════════════════════════════════════════════════════════
```

# §XXVI. Communications Plan: 12 недель

## Воронка и KPI

```
╭────────────────────────────────────────────────────────────────────────╮
│                                                                        │
│   ВЕРХ ВОРОНКИ           СЕРЕДИНА             ДНО ВОРОНКИ             │
│                                                                        │
│  Cold outreach (60)    Demo call (15)       Pilot signed (5)          │
│  ───────────────       ──────────────       ──────────────            │
│  LinkedIn DM           30-min video         LOI / contract            │
│  Email cold            Retro analysis       Shadow deploy             │
│  Warm intro            Pilot proposal       Daily reports             │
│                                                                        │
│  Target: 60 touches → 15 demos → 8 LOIs → 5 pilots                   │
│          Week 1–4      Week 2–8              Week 3–12                │
│                                                                        │
╰────────────────────────────────────────────────────────────────────────╯
```

## Недели 1–2: посуточный план

**Понедельник, 1 июня:**
► 09:00 Запустить Эксперимент 1 (`exp1-cache-alignment.py`) — $50 API budget
► 11:00 Cold outreach batch #1: Sber AI, Tinkoff ML, MTS AI, Yandex, G42
► 15:00 GitHub README update: Experiments section
► 17:00 Собрать результаты Exp. 1 (4 часа прогона)

**Вторник, 2 июня:**
► 09:00 Публикация Exp. 1: Gist + Twitter thread + LinkedIn + HackerNews «Ask HN»
► 11:00 Cold outreach batch #2: TII Falcon, ADNOC Digital, Kaspi.kz, Sourcegraph

**Конференционные дедлайны:**

| Конференция | Дедлайн | Формат | Приоритет |
|-------------|---------|--------|:---------:|
| NeurIPS 2026 | Май 2026 | Research paper | ★★★★★ |
| ICLR 2027 | Октябрь 2026 | Research paper | ★★★★★ |
| USENIX Security | Январь 2027 | Tech paper | ★★★★☆ |
| IEEE S&P | Ноябрь 2026 | Security paper | ★★★★☆ |
| arXiv preprint | Любой | Preprint | → Q3 2026 |

# §XXVII. Pilots Pipeline

## Tier 1: Warm network (Weeks 1–2)

| # | Компания | Вертикаль | ARR potential |
|---|----------|-----------|-------------:|
| 1 | ROX.ONE team | DevTools (self) | $5K–15K |
| 2 | Cursor | Code editor | $10K–50K |
| 3 | Cline | Code editor | $5K–25K |
| 4 | Anthropic CS | Strategic relationship | — |

## Tier 2: Russia / CIS (Weeks 2–4)

| # | Компания | Вертикаль | Ключевой контакт |
|---|----------|-----------|-----------------|
| 5 | Sber AI | Banking + LLM | Sergey Ushakov (LinkedIn) |
| 6 | Tinkoff ML | Fintech | Habr outreach |
| 7 | MTS AI | Telecom + AI | LinkedIn / Skoltech |
| 8 | Yandex | Search + AI | ML platform leads |

## Tier 4: UAE / MENA (Weeks 4–6)

| # | Компания | Вертикаль | Ключевой контакт |
|---|----------|-----------|-----------------|
| 9 | G42 Inception AI | Sovereign AI | Hub71 intro |
| 10 | TII Falcon | Research | AI71 fellowship |
| 11 | ADNOC Digital | Energy | ADNOC tech events |

# §XXVIII. Fund Targets

| Фонд | Размер чека | Fit-score | Дедлайн |
|------|------------:|:---------:|---------|
| Anthropic Startup Fund | $500K–$2M | ★★★★★ | Rolling |
| OpenAI Fund | $250K–$1M | ★★★★☆ | Rolling |
| Sber500 (CIS) | $100K–$500K | ★★★★☆ | Q3 2026 |
| Hub71 (UAE) | AED 500K | ★★★★☆ | Q4 2026 |
| NSF SBIR Phase I | $275K | ★★★★☆ | Sept 2026 |
| EU Horizon Europe | €500K–€2M | ★★★☆☆ | Nov 2026 |
| KAUST Research | $300K–$1M | ★★★★☆ | Q4 2026 |

═══════════════════════════════════════════════════════════════════════════════

```
                              ╔═════╗
                              ║ CPP ║
                              ╚═════╝

                  A P P E N D I C E S

═══════════════════════════════════════════════════════════════════════════════
```

# Appendix A. Математические основы

## A.1. Канонический хэш — формальное определение

```text
╭─ Definition 1.1 ────────────────────────────────────────────────────────╮
│                                                                         │
│  Пусть D — множество всех сериализуемых данных модели типов CPP.        │
│                                                                         │
│  Функция канонизации  κ : D → {0,1}*  обладает свойствами:              │
│                                                                         │
│     (i)  Детерминизм:                                                   │
│              ∀ x ∈ D :  κ(x) = κ(x)                                    │
│                                                                         │
│    (ii)  Семантическая инвариантность:                                  │
│              x ≡ y  ⇒  κ(x) = κ(y)                                     │
│                                                                         │
│   (iii)  Инъективность по байтам:                                       │
│              κ(x) = κ(y)  ⇒  bytes(x) = bytes(y)                       │
│                                                                         │
╰─────────────────────────────────────────────────────────────────────────╯

Хэш-функция CID:
        H : D → {0,1}^256
        H(x) := SHA-256(κ(x))

Где κ — DAG-CBOR canonical encoding (RFC 8949 + IPLD constraints).
```

## A.2. Теорема о cache hit probability

```text
╭─ Theorem 1 ─────────────────────────────────────────────────────────────╮
│                                                                         │
│  Пусть P — провайдер LLM с prefix-cache над hash h_P : {0,1}* → {0,1}^k│
│                                                                         │
│  Если ∃ функция f такая что h_P(x) = f(κ(x)) для всех x,               │
│  то использование CPP canonical encoding гарантирует:                   │
│                                                                         │
│     h_P(x_1) = h_P(x_2)  для любых x_1, x_2 таких что κ(x_1) = κ(x_2) │
│                                                                         │
│  Следствие: cache hit вероятность растёт монотонно с долей              │
│  контекста, проходящего через CPP canonical encoder.                    │
│                                                                         │
╰─────────────────────────────────────────────────────────────────────────╯
```

## A.3. Лемма о verified training tuples

```text
╭─ Lemma 2 ───────────────────────────────────────────────────────────────╮
│                                                                         │
│  При S_in_CID₁ = S_in_CID₂                                              │
│  гарантировано bytes(S_in₁) = bytes(S_in₂)                              │
│                                                                         │
│  Следствие: два кортежа с одинаковым S_in_CID                           │
│             безусловно сопоставимы как training samples.                │
│                                                                         │
│  Это фундаментальное свойство content-addressing,                       │
│  применённое к AI feedback data.                                        │
╰─────────────────────────────────────────────────────────────────────────╯
```

## A.4. Polarity Zone Consensus

```text
Polarity Zone C ⊂ [-1, 1]:

  Zone = { z ∈ [-1,1] : |{i : P(ctx, M_i) ∈ zone(z)}| ≥ k }

  Где P : Context × Model → [-1, 1] — polarity score function.

  Стандартные зоны:
    POSITIVE_ZONE  = [+0.3, +1.0]
    NEUTRAL_ZONE   = [-0.3, +0.3]
    NEGATIVE_ZONE  = [-1.0, -0.3]

  Threshold: 3-of-5 validators must agree on zone.
```

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# Appendix B. Список рисунков и таблиц

| # | Название | Раздел |
|---|----------|--------|
| Рис. 1 | Парадокс масштабирования: стоимость vs. число агентов | §I |
| Рис. 2 | Процесс канонизации: context → DAG-CBOR → CID | §II |
| Рис. 3 | Семантический граф: Fact / Rule / Calc / Effect | §II |
| Рис. 4 | Trust Tiers: Tier 1 / 2 / 3 | §II |
| Рис. 5 | Эволюция подходов к LLM context (2022–2026) | §III |
| Рис. 6 | Архитектурный стек CPP (9 слоёв) | §VIII |
| Рис. 7 | Three integration modes: lib / MCP / shadow | §VIII |
| Рис. 8 | 5-летнее winner-take-all окно | §XV |
| Рис. 9 | ZK-rollup → CPP аналогия | §VII |
| Рис. 10 | Bear / Base / Bull revenue scenarios | §XVI |
| Таблица 1 | Ключевые метрики продакшен-машины (май 2026) | §I |
| Таблица 2 | Числовая гипотеза: −70%, −82%, −80%, 1000× | §I |
| Таблица 3 | TAM / SAM / SOM | §V |
| Таблица 4 | Три сценария Y1/Y2/Y3 | §XVI |
| Таблица 5 | Unit economics трёх тиров | §XVIII |
| Таблица 6 | Конкурентный ландшафт | §III |
| Таблица 7 | Threat model | §XXIII |
| Таблица 8 | Fund targets | §XXVIII |

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# Appendix C. Библиография

**Стандарты и спецификации:**

1. Bormann, C., Hoffman, P. (2020). *Concise Binary Object Representation (CBOR).* RFC 8949. IETF.
2. Protocol Labs. (2017). *CIDv1 specification.* IPLD / multiformats. github.com/multiformats/cid
3. W3C. (2022). *Decentralized Identifiers (DIDs) v1.0.* W3C Recommendation.
4. W3C. (2013). *PROV-O: The PROV Ontology.* W3C Recommendation.
5. W3C. (2019). *Verifiable Credentials Data Model 1.0.* W3C Recommendation.
6. Anthropic. (2024). *Model Context Protocol (MCP) specification.* github.com/anthropics/model-context-protocol
7. NIST. (2023). *AI Risk Management Framework.* NIST AI RMF 1.0.
8. EU. (2024). *Regulation on Artificial Intelligence (EU AI Act).* OJ L 2024.

**Академические работы:**

9. Zheng, L. et al. (2023). *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena.* NeurIPS 2023.
10. Shen, T. et al. (2023). *Large Language Model Alignment: A Survey.* arXiv:2309.15025.
11. Hoffmann, J. et al. (2022). *Training Compute-Optimal Large Language Models.* (Chinchilla.) arXiv:2203.15556.
12. Ouyang, L. et al. (2022). *Training language models to follow instructions with human feedback.* (InstructGPT.) NeurIPS 2022.
13. Katz, J., Lindell, Y. (2014). *Introduction to Modern Cryptography*, 2nd ed. CRC Press.

**Технические ресурсы:**

14. EZKL. (2024). *EZKL: Easy Zero-Knowledge Machine Learning.* github.com/zkonduit/ezkl
15. Modulus Labs. (2024). *The Cost of Intelligence: Proving Machine Learning Inference with Zero-Knowledge.* moduluslabs.xyz
16. Giza Tech. (2024). *Cairo-based zkML.* gizatech.xyz

**Первичные данные:**

17. agisota. (2026). *Claude Code Usage Pattern Analysis: May 2026 snapshot.* Внутренний отчёт, anonymized.
18. agisota. (2026). *cpp-core v1.0.0-rc.1.* github.com/agisota/cpp-core

▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

# Appendix D. Колофон

```
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│  О ДОКУМЕНТЕ                                                             │
│                                                                          │
│  Этот корпус — рабочий документ (working paper), не финальная            │
│  публикация. Числа, эксперименты, прогнозы основаны на реальных данных  │
│  и публичных industry benchmarks, если не указано иное.                  │
│                                                                          │
│  MASTER.md — сводный документ, компилирующий все разделы корпуса для     │
│  сквозного чтения. Canonical source — индивидуальные файлы (01–05 +      │
│  appendices/ + strategy/).                                               │
│                                                                          │
│  CITATION (provisional):                                                 │
│  agisota (2026). "Context Provenance Protocol: Canonical Infrastructure  │
│  for AI-Economy". Working paper v0.1. github.com/agisota/cpp-core        │
│                                                                          │
│  КОНТАКТ:                                                                │
│  Если вы читаете этот документ по приглашению — комментарии             │
│  приветствуются. Отправьте на founder@cpp.dev с темой «CPP Review».     │
│                                                                          │
│  СТАТУС:   Working paper · не рецензировано · данные на 2026-05-21      │
│  ВЕРСИЯ:   0.1                                                           │
│  ДАТА:     2026-05-21                                                    │
│  ЛИЦЕНЗИЯ: CC BY 4.0 (paper) · MIT (cpp-core reference implementation)  │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
```

═══════════════════════════════════════════════════════════════════════════════

```
 · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
 ·                                                                       ·
 ·        C P P  ·  C o n t e x t  P r o v e n a n c e                 ·
 ·        github.com/agisota/cpp-core  ·  founder@cpp.dev               ·
 ·                                                                       ·
 · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
```
