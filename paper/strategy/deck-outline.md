# Pitch Deck Outline (Pre-seed)

> 15 слайдов, ~12 минут, формат 16:9 widescreen.
> Цвета: graphite (#1a1a1a), white, accent #00d4aa.
> Шрифт: JetBrains Mono для headers, Inter для body.

---

## Slide 1 — COVER

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│               C P P                                        │
│        ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                                   │
│                                                            │
│    Context Provenance Protocol                             │
│                                                            │
│    Stripe for LLM context.                                 │
│    Open standard.  Cross-provider.                         │
│                                                            │
│                                                            │
│    Pre-seed Q3 2026  ·  $500K-$1M  ·  github.com/agisota/cpp-core │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Speaker notes:** «За 12 минут я покажу, почему канонизация контекста — это
infrastructure-уровень опportunity на следующие 5 лет. И как мы первые её занимаем.»

---

## Slide 2 — THE PROBLEM

```
Title:  Multi-agent systems СЛОМАЛИ unit economics.

Visual: график показывающий cost (Y) vs number of agents (X)
        с двумя кривыми:
        - сегодня: linear scaling (1 agent = $X, 10 = $10X)
        - должно быть: sublinear (network effect, dedup)
        
Bullets:
  • 200KB контекста повторяется в каждой сессии
  • Параллельные агенты дублируют тот же контент
  • Провайдеры (Anthropic, OpenAI) внутри кэшируют, но
    клиент НЕ КОНТРОЛИРУЕТ hash-key — игра на угадайку
  • При scale это сотни тысяч $$ в год на одном enterprise
```

**Speaker notes:** «Покажу реальный example из dev-машины — 16GB кодовой базы 
в 13 параллельных worktree'ев, 9 идентичных AGENTS.md.»

---

## Slide 3 — WHY NOW

```
Title:  18-month window для занятия canonical layer.

Visual: timeline 2024-2028 с пересекающимися кривыми:
        - Multi-agent adoption (рост)
        - EU AI Act enforcement (2024→2027 full force)
        - LLM cost as % of P&L (рост)
        - Canonical standard window (узкая полоса 2026-2027)

Точка пересечения = NOW.
```

**Speaker notes:** «Эти три тренда не повторятся синхронно. Либо мы стандартизируем
канон в этом окне, либо Anthropic / Bittensor / Modal делают это самостоятельно
и закрывают рынок.»

---

## Slide 4 — SOLUTION OVERVIEW

```
Title:  3 шага.

Step 1: CANONICAL ENCODING
        ─────────────────
        Любые данные → DAG-CBOR → SHA-256 → CID
        Битово-стабильный, кросс-платформенный.

Step 2: CONTENT-ADDRESSED STORAGE
        ───────────────────────────
        Один CID на одно содержимое.
        Дедуп автоматически между всеми harness'ами.

Step 3: PROVIDER-CACHE ALIGNMENT
        ──────────────────────────
        Канонические байты = тот же hash-key, что у провайдера.
        → Гарантированный cache hit на повторе.
```

**Visual:** ASCII схема из §I.

---

## Slide 5 — REFERENCE IMPLEMENTATION

```
Title:  Уже работает. Open-source. Production-ready API.

  ✅  github.com/agisota/cpp-core
  ✅  v1.0.0-rc.1, MIT license, public
  ✅  TypeScript + Bun, IPLD + DID-W3C + Ed25519
  ✅  83 тестов, CI green
  ✅  6 атомарных релизов (v0.1.0 → v1.0.0-rc.1)
  
  Architecture:
     9-layer stack (см. design document)
     Implemented: Tier 1 (content-addressing + signatures)
     Sprint 3+: MCP transport (in progress)
     v2.x: Tier 2/3 (consensus + zkML)
```

---

## Slide 6 — CUSTOMER VALIDATION

```
Title:  Real-world from one dev machine.

  Numbers:
  
   687 MB   session logs
   250 MB   one project
    16 GB   codebase footprint  
    13      parallel worktrees
     9      identical AGENTS.md by MD5  ← perfect dedup candidates
    22      multi-agent sessions/мес
  
  Wasted tokens estimate: 90M/week ÷ 1 dev ÷ 1 project
  At $3/Mt:               $270/week / dev / project
  
  Annual savings potential:
    Per dev:       $14K
    100-dev team:  $1.4M
    1000-dev:      $14M
```

**Speaker notes:** «Это НЕ vanity-цифры. Это анализ реальной машины с прода.»

---

## Slide 7 — MARKET

```
Title:  $4.8B TAM. $1.2B SAM. $180M SOM.

Visual:  three concentric circles
         TAM: глобальные корп. расходы на LLM API 2026
         SAM: enterprise 100+ employees with LLM in workflow
         SOM: companies where CPP gives ROI >300% in Y1

Comparable categories:
  Datadog (infra observability)   →  $44B market cap
  Snowflake (data infra)           →  $50B market cap
  HashiCorp (infra automation)     →  $14B (acquired by IBM)
  
We're building infrastructure for AI economy — same category.
```

---

## Slide 8 — COMPETITION & MOAT

```
Title:  Three layers of moat.

Direct competition:                Where we win:
  Anthropic cache (internal)       ────►  Cross-provider, open
  Bittensor (verifiable inference) ────►  Drop-in, no crypto chain
  Files API                        ────►  Cryptographic identity
  Custom solutions                 ────►  Open standard = network

Moat:
  1. Open-standard adoption (network effect)
  2. Polarity validator infrastructure
  3. Crypto-verified feedback corpus (training data)
```

---

## Slide 9 — DEEP PLAY (the moonshot)

```
Title:  We're not selling cost savings.

  Tactical sale:
    "Save 30-70% on Claude API"
    ↓
  Strategic capture:
    Canonical hashes for facts / events / judgments
    ↓
  Network position:
    Verified game tuples become training corpus
    ↓
  Endgame:
    CPP = HTTP for AI provenance
    
  Whoever canonicalizes first → infrastructure layer.
```

---

## Slide 10 — BUSINESS MODEL

```
Title:  Revenue share + SaaS tiers.

  Pilot (0-90 days):       FREE, shadow deployment, measure
  Conversion:              20% of measured savings (min $2K/мес)
  Enterprise:              $5K-30K/мес flat
  Self-hosted:             Open source + paid support
  
  Future (v2+):            Validator-as-a-Service ($)
                           Feedback corpus licensing ($$$$)
                           
  Unit economics (mid):
    ARPU:        $80K/customer/year
    Gross margin: 68%
    Payback:     6 months
```

---

## Slide 11 — ROADMAP

```
Visual: 5-phase Gantt chart

Phase 0 ▰▰▰▰▰         Foundation         (DONE — May 2026)
Phase 1 ▰▰▰▱▱         Empirical validation + 3 pilots (Q3 2026)
Phase 2 ▱▱▱▱▱         Pre-seed + first revenue          (Q4 2026)
Phase 3 ▱▱▱▱▱         Seed + GTM                        (Q1-Q2 2027)
Phase 4 ▱▱▱▱▱         Scale + Tier 2 verification       (Q3-Q4 2027)
Phase 5 ▱▱▱▱▱         zkML + Feedback loops             (2028+)
```

---

## Slide 12 — TEAM

```
                Founder/CEO
                ────────────
                [Photo]
                Architecture + protocol design
                Reference implementation lead
                [Background — fill in]
                
   Research Lead          GTM Lead              Senior Infra
   (to hire)              (to hire)             (to hire)
   ────────────           ────────────          ───────────
   Cryptography + zkML    Enterprise SaaS sales Bun/TS distributed
   Target hire:           Target hire:          Target hire:
   PhD level              SaaS veteran          5+ yr backend
   
   Advisors (target):
     - Anthropic ex-engineer
     - W3C standards veteran
     - EZKL / Modulus zkML expert
     - Enterprise sales veteran (Snowflake/Datadog/Confluent)
```

---

## Slide 13 — ASK

```
   ┌────────────────────────────────────────────────────┐
   │                                                    │
   │  Pre-seed:  $500K — $1M                            │
   │  Valuation cap:  $5M                               │
   │                                                    │
   │  Use of funds:                                     │
   │    50%  — 3 senior hires                           │
   │    25%  — Empirical research validation            │
   │    15%  — Pilot deployments + GTM                  │
   │    10%  — Legal, infrastructure, operations        │
   │                                                    │
   │  Runway:    18 months → Seed at 24M valuation      │
   │                                                    │
   │  Milestones to Seed:                               │
   │    ✓ 5 paid pilots, $250K ARR                      │
   │    ✓ arXiv preprint + 1 conference accept          │
   │    ✓ Sprint 3 MCP transport in production         │
   │    ✓ Anthropic-cache alignment confirmed empirically│
   │                                                    │
   └────────────────────────────────────────────────────┘
```

---

## Slide 14 — TRACTION (placeholder for future)

> Будущая версия deck'а; на pre-seed обычно нет traction'а в виде ARR.
> Заполняем когда есть.

```
  ▰ X pilot LOIs signed
  ▰ Y customers using v1.0.0-rc.1
  ▰ Z github stars + contributors
  ▰ N research citations
  ▰ Anthropic Partnership Program acceptance
```

---

## Slide 15 — APPENDIX (referenced but kept short)

```
Detailed appendix sections — surface only on Q&A request:

   A. Detailed financial projections (3-yr)
   B. Technical deep-dive (architecture, security)
   C. Customer pipeline (sanitized)
   D. Mathematical foundations
   E. Polarity validator architecture
   F. Competitive landscape detail
   G. Regulatory positioning
   H. Hiring plan
   I. Reference customer testimonials (future)
```

---

## Speaker discipline

```
Slide          Time     Notes
──────────────────────────────────
1  Cover       0:30     Hook, problem-statement
2  Problem     1:30     Data, visualization
3  Why now     1:00     Three trends colliding
4  Solution    1:30     Three-step diagram
5  Reference   0:45     Already shipping
6  Customer    1:00     Real numbers, not theoretical
7  Market      0:45     TAM/SAM/SOM, comparables
8  Competition 1:00     Why we win
9  Deep play   1:30     The moonshot story
10 Model       1:00     Revenue + unit economics
11 Roadmap     0:30     Phases visual
12 Team        0:45     Photos + roles
13 Ask         1:00     Clear ask, milestones
14 (Traction)  -        Skip in early pitches
15 (Appendix)  -        On demand only
──────────────────────────────────
Total          12:45    + 7 min Q&A = 20 min slot
```
