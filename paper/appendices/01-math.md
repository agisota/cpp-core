# Appendix I: Математические основы CPP

## A1.1. Канонический хэш — формальное определение

```
                                                                      
   ┌──────────────────────────────────────────────────────────────┐  
   │                                                              │  
   │    ╭─ Definition 1.1 ─────────────────────────────────────╮  │  
   │    │                                                       │  │  
   │    │  Пусть D — множество всех сериализуемых данных в      │  │  
   │    │  модели типов CPP (Fact | Rule | Calc | Effect | …).  │  │  
   │    │                                                       │  │  
   │    │  Функция канонизации  κ : D  →  {0,1}*                │  │  
   │    │                                                       │  │  
   │    │  обладает свойствами:                                 │  │  
   │    │                                                       │  │  
   │    │     (i)  Детерминизм:                                 │  │  
   │    │              ∀ x ∈ D :  κ(x) = κ(x)                   │  │  
   │    │                                                       │  │  
   │    │    (ii)  Семантическая инвариантность:                │  │  
   │    │              x ≡ y  ⇒  κ(x) = κ(y)                    │  │  
   │    │                                                       │  │  
   │    │   (iii)  Инъективность по байтам:                     │  │  
   │    │              κ(x) = κ(y)  ⇒  bytes(x) = bytes(y)      │  │  
   │    │                                                       │  │  
   │    ╰───────────────────────────────────────────────────────╯  │  
   │                                                              │  
   └──────────────────────────────────────────────────────────────┘  
```

Хэш-функция CID:

```
        H : D  →  {0,1}^256
        H(x) := SHA-256(κ(x))
```

Где `κ` — DAG-CBOR canonical encoding (RFC 8949 + IPLD constraints).

---

## A1.2. Теорема о cache hit probability

```
╭─ Theorem 1 ────────────────────────────────────────────────────╮
│                                                                │
│  Пусть P — провайдер LLM с prefix-cache над непрозрачным       │
│  hash-function h_P : {0,1}* → {0,1}^k.                         │
│                                                                │
│  Пусть {x_1, …, x_n} — последовательность requests с одним     │
│  логическим prefix.                                            │
│                                                                │
│  Без CPP:                                                      │
│      Pr[h_P(prefix(x_i)) = h_P(prefix(x_j))]  =  α              │
│                                                                │
│  где α зависит от unobservable variability в построении        │
│  promt'а (key order, whitespace, encoding).                    │
│                                                                │
│  С CPP:                                                        │
│      ∀ i,j :  κ(context_i) = κ(context_j)  ⇒                   │
│               byte-identical prefix  ⇒                         │
│               h_P(prefix(x_i)) = h_P(prefix(x_j))              │
│                                                                │
│  Заключение:                                                    │
│      Pr[cache_hit | CPP]  ≥  Pr[cache_hit | no CPP]            │
│                                                                │
│  Равенство только если h_P зависит от extra-bytes полей        │
│  (например, randomly inserted nonce), что нарушает              │
│  rational cache design.                                        │
│                                                                │
╰────────────────────────────────────────────────────────────────╯
```

**Следствие:** при достаточно большом n, доля cache hits с CPP стремится к **физической верхней границе** (определяемой только реальным repetition rate контекста).

---

## A1.3. Экономика дедупликации

### Модель потока запросов

```
Пусть:
  N   — количество запросов в день
  L   — средний размер контекста (tokens)
  ρ   — доля повторяющегося контекста (0 ≤ ρ ≤ 1)
  c   — цена одного fresh-token ($/token)
  d   — discount на cached read (≈ 0.9 для Anthropic)
  TTL — время жизни в кэше (5 min default, 1 hour extended)

Дневная стоимость без CPP:
  C₀ = N · L · c

Дневная стоимость с идеальным CPP (ρ как доля кешируемая):
  C_CPP = N · L · c · (1 - ρ·d)

Экономия:
  ΔC = C₀ - C_CPP = N · L · c · ρ · d
```

### Численный пример

```
N = 30 sessions/day per dev × 10 turns = 300 turns/day
L = 200,000 tokens
c = $3 / 1,000,000 tokens = 3e-6 $/token
ρ = 0.7 (типичный shared codebase)
d = 0.9

C₀     = 300 · 200,000 · 3e-6           = $180/dev/day
C_CPP  = 300 · 200,000 · 3e-6 · (1-0.63) = $66.6/dev/day
ΔC     = $113.4/dev/day  =  $2,495/dev/мес  =  $30K/dev/год
```

**Для команды 100 devs: $3M/год потенциальной экономии.**

### Sensitivity analysis

```
ρ \ d │  0.5    0.7    0.9    
──────┼─────────────────────────
0.3   │  4.5%   6.3%   8.1%   savings
0.5   │  7.5%   10.5%  13.5%
0.7   │ 10.5%   14.7%  18.9%
0.9   │ 13.5%   18.9%  24.3%
```

При **ρ = 0.7, d = 0.9** (типичные значения для multi-worktree dev workflow): **18.9% reduction**.

---

## A1.4. Полярная валидация: information-theoretic bound

```
╭─ Theorem 2 ────────────────────────────────────────────────────╮
│                                                                │
│  Пусть V — статическая validator-модель с binary polarity      │
│  output  V : context → {pos, neg}.                             │
│                                                                │
│  Inter-rater agreement κ Cohen'а:                              │
│                                                                │
│         p_o - p_e                                              │
│   κ = ─────────────                                             │
│        1  -  p_e                                                │
│                                                                │
│  где:                                                           │
│   p_o = observed agreement                                     │
│   p_e = expected agreement by chance                           │
│                                                                │
│  Для CPP-grade reliability требуется κ ≥ 0.80                  │
│  (Landis-Koch interpretation: "substantial agreement").        │
│                                                                │
│  Для регулирующих органов: κ ≥ 0.90                            │
│  ("almost perfect").                                            │
│                                                                │
╰────────────────────────────────────────────────────────────────╯
```

### Bayesian update over multiple validators

При N-of-M консенсусе:
```
Pr[true polarity | k of N validators agree]
  = [Pr[k agree | true] · π] / Pr[k agree]

При independent validators с individual κ_i ≥ 0.85:
  3-of-5 majority даёт effective κ_combined ≥ 0.97
```

---

## A1.5. Cost model для validator infrastructure

```
Допущения:
  M    — параметры validator-модели (например 7B)
  T_v  — время inference per claim (Llama-3 7B на GPU ≈ 0.5s)
  R    — claims/sec пропускная способность одного GPU
  C_g  — стоимость GPU-часа (A100 ≈ $1.20/h на spot)

R = 3600 / T_v ≈ 7200 claims/hour per GPU

Cost per claim:
  c_claim = C_g / R = $1.20 / 7200 ≈ $0.000167 = $1.67 per 10K claims
```

При 10M claims/day у large enterprise:
- 1,389 claims/sec needed
- ~190 GPUs requirement
- $228/hour = $5,472/day = **$165K/мес validator cost**

При revenue share 20% от $1M/мес savings = $200K/мес revenue.
**Margin: $35K/мес = 17%.**

Это **ниже** target margin 60%+, поэтому Tier 2/3 validator services должны:
- Использовать distilled smaller validators (1-3B params).
- Caching validator results (это идемпотентно — claim → result).
- ASIC-acceleration для polarity inference.

---

## A1.6. Hash chain integrity

CPP supersession chain:

```
v_1 ──superseded_by──► v_2 ──superseded_by──► v_3
 │                      │                      │
 H(v_1)               H(v_2)                 H(v_3)
```

Где `H(v_{i+1}) = SHA-256(canonical(payload || supersedes: v_i))`.

```
Свойство: tampering с v_2 (создание ложной версии v_2') обнаружимо,
если известен ЛЮБОЙ из {v_1, v_3}:
   - Если знаем v_3: v_3.supersedes = v_2 ≠ v_2'
   - Если знаем v_1: chain integrity check fails
```

Это **Merkle property** одностороннего хэширования.

---

## A1.7. Throughput при federated storage

```
Простая модель: P producers, V validators, S storage nodes.

Производительность сети:
  Π = min(P · r_p, V · r_v, S · r_s)

Где:
  r_p — rate of CID generation per producer
  r_v — rate of validation per validator
  r_s — rate of storage put/get per node

Для 100 enterprise customers с average 1000 CIDs/day:
  Total: 100,000 CIDs/day = 1.16 CID/sec
  Trivial requirements: 1 S3 bucket + 1 validator GPU
```

CPP **не сталкивается** с throughput-проблемами на realistic scale. Bottleneck возникает только если:
- 10K+ enterprises (через 3-5 лет growth)
- Real-time validation для каждого LLM-call (не для каждого Calculation)

---

## A1.8. Полярная инвариантность под model drift

```
╭─ Hypothesis 5 (verifiable) ────────────────────────────────────╮
│                                                                │
│  Дано:                                                          │
│    M_v1, M_v2 — две версии validator-модели                     │
│    X — fixed test set из 10K labeled claims                     │
│                                                                │
│  Если для большинства x ∈ X:                                    │
│    M_v1(x) ≈ M_v2(x) в polarity space (binary классификация)    │
│  но возможно                                                    │
│    M_v1(x) ≠ M_v2(x) в семантическом space (точный output)      │
│                                                                │
│  Тогда CPP polarity hash:                                       │
│    h_pol(x) := M_v(x) ∈ {pos, neg}                              │
│                                                                │
│  устойчив под model drift,                                      │
│  даже если raw output hash:                                     │
│    h_raw(x) := SHA-256(M_v(x))                                  │
│                                                                │
│  декеит.                                                        │
│                                                                │
╰────────────────────────────────────────────────────────────────╯
```

**Эмпирическая проверка** этой гипотезы — Эксперимент 4 (§IX.2).

---

## A1.9. Сводная таблица констант

| Symbol | Описание | Значение |
|---|---|---|
| `H` | Hash function | SHA-256 |
| `κ` | Canonical encoding | DAG-CBOR (RFC 8949 + IPLD) |
| `MAX_DEPTH` | Max supersession chain depth | 1000 |
| `d` | Provider cache discount | 0.9 (Anthropic) |
| `TTL` | Default cache TTL | 300s (5 min) |
| `TTL_ext` | Extended cache TTL | 3600s (1 hour, paid) |
| `c_sonnet` | Claude Sonnet input cost | $3/M tokens |
| `c_opus` | Claude Opus input cost | $15/M tokens |
| `c_haiku` | Claude Haiku input cost | $0.25/M tokens |
| `κ_target` | Required polarity agreement | ≥ 0.85 |
| `κ_regulator` | Regulator-grade agreement | ≥ 0.90 |
