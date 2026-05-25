# Безопасность и архитектура валидатора

> *Deep technical dive для security review, due diligence, academic peer review.*
> *Версия 0.1 (2026-05-21). Предполагает знакомство с §§ II, VII основного paper'а.*

---

## I. Модель безопасности хэш-функции

### 1.1. SHA-256: уровень безопасности

CPP использует SHA-256 в составе DAG-CBOR canonical encoding → CIDv1.
Безопасность хэш-схемы строится на трёх свойствах SHA-256:

```
╭────────────────────────────────────────────────────────────────────────╮
│  Property 1: Preimage resistance                                       │
│  ─────────────────────────────────────────────────────────────────     │
│  Дано: h = SHA-256(x)                                                  │
│  Найти: x такой что SHA-256(x) = h                                     │
│  Сложность: O(2^256) — невозможно при любых computing resources        │
│                                                                        │
│  Property 2: Second preimage resistance                                │
│  ─────────────────────────────────────────────────────────────────     │
│  Дано: x, h = SHA-256(x)                                               │
│  Найти: x' ≠ x такой что SHA-256(x') = h                              │
│  Сложность: O(2^256)                                                   │
│                                                                        │
│  Property 3: Collision resistance                                      │
│  ─────────────────────────────────────────────────────────────────     │
│  Найти: x, x' такие что SHA-256(x) = SHA-256(x'), x ≠ x'              │
│  Сложность: O(2^128) по birthday bound                                 │
│  Текущее состояние (2026): нет известных практических атак на SHA-256  │
╰────────────────────────────────────────────────────────────────────────╯
```

**Security level:** 128 bits против generic collision attack (birthday paradox),
256 bits против preimage attack. Достаточно для всех практических сценариев CPP.

### 1.2. Length extension attacks: защита через DAG-CBOR

SHA-256 уязвим к **length extension attack** при naive construction:
если атакующий знает `H(m)` и `|m|`, он может вычислить `H(m || padding || extension)`
без знания `m`.

```
Уязвимый паттерн (НЕ используется в CPP):
  H(secret || data)  →  атакующий может вычислить H(secret || data || extension)
  
CPP защита:
  ├── DAG-CBOR canonical encoding включает структурную информацию:
  │     - length prefixes для каждого поля (CBOR definite-length items)
  │     - type tags (CBOR major types)
  │     - нет возможности тривиально добавить extension без нарушения структуры
  │
  ├── CID содержит codec identifier (0x71 = dag-cbor):
  │     проверяющий знает какой decoder применять
  │
  └── Подписи (Ed25519) покрывают canonical(payload || signed_at):
        атака на SHA-256 не компрометирует подпись
```

### 1.3. Устойчивость к квантовым атакам

SHA-256 под квантовым компьютером (Grover's algorithm):
- Preimage: O(2^128) → уменьшается до O(2^64) на quantum.
- Collision: O(2^128) → уменьшается до O(2^85) на quantum.

Текущий статус (2026): квантовые компьютеры не достигли криптографически
значимого масштаба для атаки SHA-256. NIST PQC финализирован (ML-KEM, ML-DSA),
но SHA-256 остаётся standard-compliant для hash applications.

**Mitigation roadmap для CPP:**
1. Short-term: SHA-256 достаточен.
2. Medium-term (2030+): при необходимости миграция на SHA3-256 или BLAKE3.
3. Migration path: CID self-describing format позволяет сменить hash function
   без изменения структуры протокола (codec и hash function закодированы в CID).

---

## II. Модель угроз

### 2.1. Adversary model

```
╭──────────────────────────────────────────────────────────────────────────╮
│  Типы adversaries, которых рассматривает CPP:                           │
│                                                                          │
│  A1 — Malicious Producer                                                 │
│  Цель: заставить систему принять фальшивый Fact/Calculation/Effect       │
│  Возможности: создавать любые payloads, подписывать своим ключом         │
│  Ограничения: не контролирует другие participant'ы                       │
│                                                                          │
│  A2 — Network Adversary (man-in-the-middle)                              │
│  Цель: подменить CID → content mapping в транзите                       │
│  Возможности: перехватывать HTTP/IPFS трафик                            │
│  Ограничения: не имеет private keys участников                           │
│                                                                          │
│  A3 — Compromised Validator                                              │
│  Цель: выдать ложное polarity attestation                                │
│  Возможности: контролирует один validator node                           │
│  Ограничения: N-of-M consensus требует компрометации k nodes             │
│                                                                          │
│  A4 — Model Provider Attack (Anthropic / OpenAI)                         │
│  Цель: нарушить hash stability при апгрейде модели                      │
│  Возможности: меняют tokenizer, weights, inference backend               │
│  Ограничения: static validator не меняется                               │
│                                                                          │
│  A5 — Storage Layer Attack                                               │
│  Цель: подменить content для заданного CID                               │
│  Возможности: запись в S3 / IPFS storage                                │
│  Ограничения: content verification через CID тривиально                 │
╰──────────────────────────────────────────────────────────────────────────╯
```

### 2.2. Векторы атак и их митигации

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ВЕКТОР                       │  КАК РАБОТАЕТ        │  МИТИГАЦИЯ CPP   │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Fake Fact injection          │  A1 создаёт Fact с   │  did:key sig.    │
│                               │  чужой did, или       │  верифицируется  │
│                               │  поддельными данными  │  получателем     │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  CID collision                │  A1 ищет x' такой    │  SHA-256 collision│
│                               │  что CID(x') = CID(x)│  resistance:     │
│                               │                       │  O(2^128) effort │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Storage substitution         │  A2/A5 подменяют      │  Верификация:    │
│                               │  bytes под CID ключём │  SHA-256(bytes)  │
│                               │                       │  = CID always    │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Replay attack                │  A1/A2 повторно       │  signed_at +     │
│                               │  отправляет старую    │  sequence numbers│
│                               │  подпись              │  + TTL           │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Stale fact manipulation      │  A1 инжектирует       │  Supersession    │
│                               │  устаревший Fact      │  chain + validity│
│                               │  как актуальный       │  period          │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Polarity validator            │  A3 выдаёт           │  N-of-M consensus│
│  compromise                   │  ложный attestation   │  (k nodes must   │
│                               │  для single node      │  agree)          │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Key exfiltration              │  Attacker крадёт     │  Key rotation    │
│                               │  Ed25519 private key  │  + revocation    │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│  Model drift attack            │  Provider выпускает  │  Static validator│
│                               │  new model, нарушает  │  (frozen weights)│
│                               │  hash stability       │                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3. Атака через подделку Fact

Подробный разбор наиболее вероятной атаки:

```
Scenario: A1 хочет заставить систему принять фальшивый Fact
          (например, "тест прошёл" когда он упал)

Attack path:
  1. A1 создаёт FactNode:
     { type: "Fact", content: "all tests pass", timestamp: ... }
  2. A1 подписывает своим did:key: Ed25519(canonical(fact))
  3. A1 публикует в storage с CID

Defense:
  4. Consumer получает Fact + CID + signature
  5. Проверяет: SHA-256(canonical(fact)) = CID → Content integrity ✓
  6. Проверяет: Ed25519.verify(sig, signer_did.pubkey, canonical(fact)) → ✓
  7. НО: signer_did = did:key:z6MkABCD (неизвестный / не авторизованный ключ)
  
  Consumer нужно проверить:
    - Авторизован ли этот DID создавать Facts данного типа?
    - Соответствует ли DID ожидаемому автору (developer, sensor)?

CPP Trust Model:
  CID гарантирует integrity — что bytes не изменились.
  Signature гарантирует authorship — кто подписал.
  Authorization — ЗА ПРЕДЕЛАМИ CPP core (application-level decision).
  
  CPP v1 НЕ реализует authorization model.
  Authorization — задача для CPP v2 (capability tokens, см. §VI).
```

---

## III. Атаки через модельный дрейф

### 3.1. Природа проблемы

Модельный дрейф — наиболее специфичная для CPP угроза. Когда Anthropic
выпускает Claude Opus 5:

```
Что меняется:
  ├── Tokenizer: другие tokenization rules → разные token IDs для тех же байт
  ├── Weights: другие embeddings → разные probability distributions
  ├── Inference backend: другие floating-point rounding → разные outputs
  │   (даже при T=0 greedy decoding могут быть changes)
  ├── Context window: расширение → другие cache key hashing
  └── Cache API: Anthropic может изменить internal cache_key computation

Impact на CPP (без защиты):
  ├── cache_control prefix hits снижаются → экономия падает
  ├── Semantic embeddings drift → polarity attestations теряют актуальность
  ├── Historical Calculation replay не воспроизводится → audit trail ломается
  └── Static validator inference results меняются → consesus разрушается
```

### 3.2. Формальная модель hash decay

```
Определим:
  M_t    — frontier модель в момент времени t
  ctx    — фиксированный контекст (bytes)
  E_t    — embedding функция модели M_t

Hash decay метрика:
  δ(t₁, t₂) = 1 - cosine_similarity(E_{t₁}(ctx), E_{t₂}(ctx))
  
  При малом δ: модели семантически совместимы
  При δ → 1:   модели семантически несовместимы
  
Polarity stability метрика:
  ρ(t₁, t₂) = Pr[polarity_{t₁}(ctx) = polarity_{t₂}(ctx)]
  
  Эмпирически: ρ >> δ (полярность стабильнее точного embedding)
  Гипотеза: ρ ≥ 0.85 при minor model updates (patch versions)
             ρ ≥ 0.75 при major model updates (major versions)
```

### 3.3. Static Validator: полная архитектура

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  STATIC VALIDATOR ARCHITECTURE                                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Validator Checkpoint Registry                                  │    │
│  │                                                                 │    │
│  │  cpp-validator-v1.0:                                            │    │
│  │    architecture: Llama 3.2 1B (distilled on polarity task)      │    │
│  │    weights_cid:  bafyrei{sha256(weights.bin)}                   │    │
│  │    runtime_cid:  bafyrei{sha256(llama.cpp_build)}               │    │
│  │    config:       T=0, top_p=1.0, seed=42, max_tokens=3          │    │
│  │    published:    2026-08-01T00:00:00Z                            │    │
│  │    expires:      2031-08-01T00:00:00Z  (5-year SLA)             │    │
│  │    hosted_by:    [HuggingFace, TII, Together.ai, Replicate]     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  Validation flow:                                                       │
│                                                                         │
│  Producer                  Validator Node              Consumer          │
│    │                           │                           │            │
│    │── claim(effect_cid) ──────►│                           │            │
│    │   {zone: "POSITIVE"}       │                           │            │
│    │                           │── resolve(effect_cid) ───►│            │
│    │                           │   (fetch bytes from store)│            │
│    │                           │◄─ bytes ─────────────────│            │
│    │                           │                           │            │
│    │                           │  run_validator(bytes,     │            │
│    │                           │    checkpoint_v1.0)       │            │
│    │                           │  → {zone:"POSITIVE", 0.91}│            │
│    │                           │                           │            │
│    │                           │  sign(result, validator_key)           │
│    │◄── attestation ───────────│                           │            │
│    │  {effect_cid, zone: "POSITIVE",                       │            │
│    │   confidence: 0.91,                                   │            │
│    │   validator_did: "did:key:z6MkXXX",                   │            │
│    │   checkpoint: "cpp-validator-v1.0",                   │            │
│    │   signature: "..."}                                   │            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4. Separation of concerns: inference vs validation

```
Ключевое архитектурное решение CPP:

  INFERENCE MODEL         ≠     VALIDATOR MODEL
  ────────────────────────────────────────────────────────────────────
  Anthropic Claude Opus 5        cpp-validator-v1.0
  GPT-5 / Gemini 3               (frozen, static)
  YandexGPT v3 / GigaChat        
  
  Inference model:               Validator model:
    - выполняет reasoning           - verifies polarity claims
    - генерирует ответы             - НИКОГДА не меняется
    - обновляется регулярно         - 5-year SLA на хостинг
    - provider-controlled           - federated hosting
    - proprietary или open          - open weights
    
  Аналогия:
    Бухгалтер (inference) может обновить свои знания.
    Стандарт бухгалтерского учёта (validator) не меняется без согласования.
```

---

## IV. ZK-доказательства для polarity claims

### 4.1. zkML stack 2026

ZK-доказательства для машинного обучения (zkML) — активная область исследований.
Ключевые проекты:

```
╭──────────────────────────────────────────────────────────────────────────╮
│  EZKL (ezkl.xyz)                                         ★★★★☆          │
│  ─────────────────────────────────────────────────────────────────────   │
│  Подход: преобразует ONNX модель в PLONK circuit                        │
│  Proof system: KZG + halo2 (ECC-based)                                  │
│  Verifier: Solidity (EVM-compatible)                                     │
│  Limitations (2026): models up to ~100M parameters практически          │
│  Latency: 10-60 секунд для small models (≤10M params)                   │
│  Cost per proof: $0.01 - $0.50 зависит от model size                    │
│                                                                          │
│  Status for CPP: подходит для distilled validator (1-3B params)          │
│   но потребует aggressive quantization (INT4/INT8)                       │
╰──────────────────────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────╮
│  MODULUS LABS (modulus.xyz)                              ★★★☆☆          │
│  ─────────────────────────────────────────────────────────────────────   │
│  Подход: custom SNARK circuits для transformer inference                 │
│  Proof system: PlonKy2 (fast proving)                                    │
│  Status (2026): commercial offering, closed beta                        │
│  Focus: "AI on-chain" use cases                                          │
│  Reference paper: "RockyBot: Run AI on Chain" (2023)                    │
╰──────────────────────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────╮
│  GIZA (gizatech.xyz)                                     ★★★☆☆          │
│  ─────────────────────────────────────────────────────────────────────   │
│  Подход: Cairo-based (StarkNet compatible)                               │
│  Proof system: STARK (post-quantum!)                                     │
│  Verifier: StarkNet smart contracts                                      │
│  Key advantage: STARKs постквантово устойчивы                           │
│  Limitations: Cairo circuit overhead + StarkNet ecosystem lock-in        │
│  Reference: github.com/gizatechxyz/giza-sdk                              │
╰──────────────────────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────╮
│  RISC ZERO (risczero.com)                                ★★★★☆          │
│  ─────────────────────────────────────────────────────────────────────   │
│  Подход: zkVM — доказывает выполнение любой Rust программы               │
│  Proof system: STARK + FRI                                               │
│  Key advantage: можно доказать не neural network, а весь pipeline        │
│  CPP relevance: доказать что canonical encoding + validator были         │
│                 выполнены корректно (весь Rust llama.cpp pipeline)       │
│  Latency: 5-30 секунд для small compute (GPU-accelerated proving)        │
╰──────────────────────────────────────────────────────────────────────────╯
```

### 4.2. Практический путь zkML для CPP

```
Реалистичный roadmap (не wishful thinking):

2026 Q3-Q4: Proof of concept с EZKL
  ────────────────────────────────────────────────────────────────────────
  Target model: Llama 3.2 1B → quantize до INT8 → ONNX export
  EZKL generate circuit: ~2-4 часа на GPU
  Proof generation: ~30-60 сек per inference на A100
  Verifier: Ethereum Sepolia testnet
  
  Ограничения:
    - 1B params INT8 = ~500MB model → large circuit
    - Proof time > 60sec для compliance-grade latency
    - Нужна дальнейшая distillation
  
2027 Q1-Q2: Distilled validator zkML production
  ────────────────────────────────────────────────────────────────────────
  Target: 100M param model (distilled from 1B)
  EZKL proof time: ~5-10 sec (acceptable для non-realtime compliance)
  Cost per proof: ~$0.05 (acceptable для regulatory submissions)
  
  Use case: litigation-grade audit submissions
    "Prove that on 2026-12-01, validator concluded POSITIVE for effect_cid"

2028+: RISC ZERO full pipeline proof
  ────────────────────────────────────────────────────────────────────────
  Target: prove entire CPP pipeline (canonical encoding → validation → attestation)
  Proof time: <10 sec на GPU cluster
  Verify time: <10 ms on-chain or off-chain
```

### 4.3. Архитектура zkML proof для CPP

```
╭───────────────────────────────────────────────────────────────────────────╮
│  INPUT                                                                    │
│    ctx_bytes: bytes      (content за CID)                                 │
│    ctx_cid:   CIDv1      (commitment к ctx_bytes)                        │
│    checkpoint: "cpp-validator-v1.0"                                       │
│                                                                           │
│  CIRCUIT (zkML)                                                           │
│    1. Verify: SHA-256(ctx_bytes) == ctx_cid                               │
│       (доказываем что bytes matching CID)                                 │
│    2. Load: validator_weights (frozen, public)                             │
│    3. Compute: polarity = validator(ctx_bytes)                            │
│       (forward pass через neural network circuit)                        │
│    4. Assert: polarity_score ∈ claimed_zone                               │
│                                                                           │
│  PUBLIC INPUTS (видны верификатору)                                       │
│    ctx_cid, claimed_zone, checkpoint                                      │
│                                                                           │
│  PRIVATE INPUTS (скрыты от верификатора)                                  │
│    ctx_bytes (если privacy требуется)                                     │
│                                                                           │
│  OUTPUT                                                                   │
│    proof π  (compact, ~2-5 KB для PLONK)                                  │
│    Верификатор принимает π за <10 ms без доступа к ctx_bytes              │
│                                                                           │
╰───────────────────────────────────────────────────────────────────────────╯
```

Применение privacy ZK proof:

```
Сценарий: Enterprise хочет доказать регулятору что AI-решение X было корректным,
          не раскрывая содержимое X (trade secrets).
          
  Producer → zkML proof: "polarity(X) = POSITIVE, с уверенностью ≥ 0.85"
  Регулятор → verify proof: True/False (за <10ms, без чтения X)
  
  Privacy preserved: содержимое X скрыто
  Compliance achieved: regulator has cryptographic guarantee
```

---

## V. Polarity-zone consensus

### 5.1. Протокол N-of-M консенсуса

```
Параметры:
  N = число валидаторов в комитете (рекомендуется 5)
  M = threshold для consensus (рекомендуется 3)
  t = timeout для сбора attestations (рекомендуется 30 сек)

Шаги:
  1. Producer публикует claim:
     { effect_cid, claimed_zone, producer_sig }
  
  2. CPP aggregator рассылает claim всем N валидаторам.
  
  3. Каждый validator_i (независимо):
     a. Resolv effect_cid (fetch bytes)
     b. Verify: SHA-256(bytes) == effect_cid
     c. Run: static_validator(bytes) → (zone_i, score_i)
     d. Sign: { validator_did_i, effect_cid, zone_i, score_i, ts_i }
     e. Return attestation_i
  
  4. Aggregator собирает attestations за timeout t.
     Если получено < M attestations → claim rejected (validator unavailability).
  
  5. Check consensus:
     agreed_zone = mode({ zone_i for attestation_i received })
     agreement_count = count({ zone_i == agreed_zone })
     
     if agreement_count >= M:
       emit ConsensusAttestation(effect_cid, agreed_zone, attestations)
     else:
       emit ConflictReport(effect_cid, attestations)  # requires human review
  
  6. ConsensusAttestation подписывается aggregator key.
     Публикуется в CPP store.
```

### 5.2. Byzantine fault tolerance

```
При N=5, M=3 (классический 3-of-5):

  Сценарий: 1 validator скомпрометирован (Byzantine)
  Результат: 4 честных, 1 Byzantine
    Честные: все говорят "POSITIVE"
    Byzantine: говорит "NEGATIVE"
    Agreement: 4 из 5 = POSITIVE > threshold 3 → consensus "POSITIVE" ✓
    
  Сценарий: 2 validators скомпрометированы
  Результат: 3 честных, 2 Byzantine
    Честные: "POSITIVE"
    Byzantine: оба говорят "NEGATIVE"
    Agreement: 3 из 5 = POSITIVE = threshold 3 → consensus "POSITIVE" ✓
    
  Сценарий: 3 validators скомпрометированы (колляция)
  Результат: 2 честных, 3 Byzantine
    Byzantine: все говорят "NEGATIVE"
    Agreement: 3 из 5 = NEGATIVE → FALSE CONSENSUS (attack success)
    
  → Для N=5, M=3 система безопасна если ≤ 2 validators скомпрометированы.
  → Для higher security: N=7, M=5 (выдерживает 2 Byzantine из 7).
```

### 5.3. Validator selection и rotation

```
Validator selection criteria:
  ├── Техническое: running correct checkpoint + deterministic runtime
  ├── Репутационное: stake (lock CPP tokens как collateral)
  ├── Организационное: signed SLA для uptime и checkpoint preservation
  └── Диверсификационное: разные geographic + organizational owners
  
Validation committee composition (рекомендуемая для beta):
  - HuggingFace Endpoints (Western Europe)
  - Together.ai (US West)
  - TII compute (UAE/MENA)
  - Academic institution node (EU/US)
  - Self-hosted enterprise node (для enterprise tier клиентов)
  
Rotation protocol:
  Validators can be added/removed by governance vote.
  New validator must:
    1. Run reproducibility test against known test vectors
    2. Pass 99.9% uptime SLA for 30 days
    3. Post stake
  Old validator removed via supermajority vote (4/5).
```

---

## VI. Управление ключами: did:key Ed25519

### 6.1. Анатомия did:key

```
Пример:  did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK

Декодинг:
  did         — DID scheme
  key         — DID method (key = public key directly embedded)
  z6Mk...     — base58btc-encoded multikey (0xed01 prefix = Ed25519)
  
Публичный ключ:
  Embedded в DID string — no registry needed.
  Ed25519 pubkey = 32 bytes.
  Verification = Ed25519.verify(sig, pubkey, message) за ~100 µs.
  
did:key advantages для CPP:
  ├── Zero infrastructure: нет need в DID resolver
  ├── Offline-verifiable: работает без сетевого доступа
  ├── Self-describing: ключ и алгоритм закодированы в DID
  └── W3C standard: совместим с Verifiable Credentials ecosystem
```

### 6.2. Key lifecycle

```
1. Generation:
   ─────────────────────────────────────────────────────────
   const keypair = await generateKeyPair("Ed25519");
   const did = keypairToDidKey(keypair.publicKey);
   // Store: keypair.privateKey в secure storage (Keychain / HSM)
   
   НИКОГДА не экспортировать private key в plaintext.
   Рекомендация: hardware-backed key (MacOS Secure Enclave, TPM, HSM).
   
2. Usage:
   ─────────────────────────────────────────────────────────
   const sig = Ed25519.sign(privateKey, canonical(payload || signed_at));
   // signed_at: ISO8601, UTC, millisecond precision
   
3. Rotation (при компрометации / плановой замене):
   ─────────────────────────────────────────────────────────
   a. Создать новый keypair → new_did
   b. Создать KeyRotation fact:
      { type: "KeyRotation",
        old_did: did_old,
        new_did: did_new,
        signed_at: now() }
      Подписать ОБОИМИ ключами: sig_old + sig_new
   c. Publish KeyRotation в CPP store с timestamp
   d. All consumers: после KeyRotation timestamp принимать только new_did
   
4. Revocation:
   ─────────────────────────────────────────────────────────
   a. Publish RevocationFact:
      { type: "Revocation", did: did_compromised, reason: "key_theft" }
      Подписать альтернативным authority ключом (backup)
   b. Распространить RevocationFact по всем validators
   c. Validators отказывают в attestation для claims подписанных revoked did
   
   ВАЖНО: CPP v1 не реализует автоматическую revocation propagation.
           Это V2 feature. V1 — manual notification.
```

### 6.3. Multi-signature для critical facts

Для критических Fact'ов (regulatory submissions, high-stakes decisions):

```
MultiSigFact:
  payload:    FactNode
  signers:    [
    { did: did_1, sig: Ed25519(canonical(payload || signed_at_1)) },
    { did: did_2, sig: Ed25519(canonical(payload || signed_at_2)) },
    { did: did_3, sig: Ed25519(canonical(payload || signed_at_3)) }
  ]
  threshold:  2  // minimum required valid signatures

Consumer: проверяет >= threshold valid signatures.
Semantic: Fact действителен, только если подтверждён минимум 2 авторизованными.
```

---

## VII. Encryption layer (post-MVP)

### 7.1. Текущее состояние (v1)

В v1 CPP **не шифрует** content в CID store. CID — публичный идентификатор.
Это сознательное решение для простоты первой версии.

**Requirement для encryption:** customer с чувствительными данными должен
иметь capability-based access control для CID resolution.

### 7.2. Capability tokens (v2 план)

```
UCAN-based (User Controlled Authorization Networks) capability tokens:
  URL: github.com/ucan-wg/ucan-spec

Принцип:
  ├── Каждый CID — это resource
  ├── Capability = { resource: cid, ability: "resolve" }
  ├── Token = capability + proof chain (chain of delegations)
  └── Consumer должен предъявить valid capability чтобы resolve CID

Пример:
  Root issuer (data owner):
    { iss: did_owner, sub: did_owner,
      cap: { cid_XXXX: { "cpp/resolve": {} } },
      exp: 1800000000 }
    
  Delegation к reviewer:
    { iss: did_owner, sub: did_reviewer,
      cap: { cid_XXXX: { "cpp/resolve": {} } },
      prf: [root_token_cid] }
    
  CPP store при запросе от reviewer:
    Verifies capability chain → grants access
    Без токена → 404 (content not found response, не 403)
```

### 7.3. Selective disclosure (v2+ план)

```
Для compliance scenarios где регулятор должен видеть subset данных:

  Full CID:     bafyrei_FULL (все поля FactNode)
  Redacted CID: bafyrei_REDACTED (PII fields заменены на CID-placeholders)
  
  Producer создаёт оба:
    full_cid → хранится encrypted в enterprise storage
    redacted_cid → публичный (или с низким security clearance)
    
  Merkle proof:
    Producer может доказать: redacted_cid является subset full_cid
    БЕЗ раскрытия скрытых полей.
    
  Compliance audit:
    Регулятор получает redacted_cid + Merkle proof о completeness.
    При necessary: full disclosure через secure channel.
```

---

## VIII. Operational security

### 8.1. Infrastructure security model

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CPP PRODUCTION SECURITY REQUIREMENTS                                    │
├──────────────────────────────────────────────────────────────────────────┤
│  Storage:                                                                │
│  ├── CID → bytes mapping: append-only (никогда не изменять)              │
│  ├── S3 Object Lock (WORM: Write Once Read Many) для audit grade         │
│  ├── At-rest encryption: AES-256 (optional, не нарушает content-address) │
│  └── Geo-replication: минимум 2 regions для availability                 │
├──────────────────────────────────────────────────────────────────────────┤
│  API layer:                                                              │
│  ├── TLS 1.3 для всего транзита                                          │
│  ├── Rate limiting: 1000 req/min per client (default)                    │
│  ├── Authentication: bearer token (JWT) или did:key                      │
│  └── IP allowlisting для enterprise тир                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Validator nodes:                                                        │
│  ├── Isolated from public internet (private network)                     │
│  ├── Read-only access к CID storage                                      │
│  ├── Signing key in HSM (Hardware Security Module)                       │
│  └── Audit log для всех attestation operations                           │
├──────────────────────────────────────────────────────────────────────────┤
│  Key management service:                                                 │
│  ├── Root keys in AWS KMS или HashiCorp Vault                            │
│  ├── Automatic rotation: 365 days                                        │
│  ├── Break-glass procedure для emergency rotation                        │
│  └── Key ceremony documentation (для regulatory grade)                   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 8.2. Audit trail для CPP itself

Рекурсивное применение CPP к своей собственной operational log:

```
CPP audit log = CPP-style signed FactNodes
  ├── Каждое API call логируется как Fact
  ├── Каждое attestation — подписанный EffectNode
  ├── Retention: S3 Glacier за 7 лет
  └── Query: SQL over Parquet (DuckDB / Athena)
  
Compliance команда может спросить:
  "Кто resolve'ил CID X в диапазоне времени Y?"
  → 1 SQL query
```

---

## Заключение: security posture

```
╭────────────────────────────────────────────────────────────────────────────╮
│                                                                            │
│  CPP v1 Security Level:  MODERATE (sufficient for enterprise pilots)      │
│  CPP v2 Security Level:  HIGH (sufficient for regulated industries)       │
│  CPP v3 Security Level:  VERY HIGH (litigation-grade with zkML proofs)    │
│                                                                            │
│  Current gaps (v1):                                                       │
│    ├── No capability-based access control (все CIDs публичны)             │
│    ├── No automated key revocation propagation                            │
│    ├── No zkML proofs (Tier 3 validation manual)                          │
│    └── N-of-M consensus в прототипе, не production-hardened               │
│                                                                            │
│  What is solid (v1):                                                      │
│    ├── SHA-256 collision resistance (2^128 security)                      │
│    ├── Ed25519 signature verification                                     │
│    ├── Content integrity (any substitution detectable)                    │
│    ├── Supersession chain integrity (Merkle property)                     │
│    └── Protocol-level model drift protection (static validator design)    │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯
```

**Ключевые ссылки:**

- EZKL: arXiv:2312.15116 "EZKL: A Framework for Verifiable Machine Learning"
- Modulus Labs: "The Cost of Intelligence: Proving Machine Learning Inference with ZK-SNARKs" (2023)
- Giza: "AI on StarkNet" — gizatech.xyz/research
- "Verifiable Inference of Large Language Models" — Weng et al. (2024), arXiv:2404.18373
- RISC Zero: "Boundless Computation for AI" — risczero.com/research
- UCAN spec: github.com/ucan-wg/ucan-spec
- W3C DID Core: w3c.github.io/did-core/
- NIST Post-Quantum Cryptography: csrc.nist.gov/Projects/post-quantum-cryptography

---

*Следующее: `05-FINANCIAL-MODEL.md` — 3-летняя финансовая модель с формулами,
таблицами и sensitivity analysis.*
