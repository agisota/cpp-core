# Context Provenance Protocol (CPP) — Design Specification

**Author:** Brainstorming session with user
**Date:** 2026-05-21
**Status:** Draft / Pre-implementation
**Working title:** Context Provenance Protocol (CPP)

---

## 1. Problem Statement

Современные агентные обёртки (Claude Code, Cursor, Cline, Aider, LangChain harnesses) гоняют контекст между сессиями, пользователями и агентами как «полотно текста». Каждый виток разговора заново кодирует одни и те же файлы, документы, инструкции, ранее извлечённые факты. У этого есть пять одновременных издержек:

1. **Деньги.** Input-токены оплачиваются заново на каждом турне. На enterprise-масштабе это $1M-67M/год за провайдерскую инференцию, которой можно избежать.
2. **Latency.** Time-to-first-token (TTFT) растёт линейно по размеру неcached префикса. Для длинного контекста — 5-10 секунд только на prefill.
3. **Внимание пользователя.** Человек повторно верифицирует «AI прочитал документ X корректно?» в каждой новой сессии, потому что нет криптографически верифицируемой связки «версия документа → решение AI».
4. **Compliance/audit.** В регулируемых индустриях (фарма, банки, медицина) требуется доказательство «AI принял это решение на основании ровно этих входных данных версии Y». Сегодня этого нет.
5. **Cross-provider lock-in.** OpenAI-prompt-cache не разговаривает с Anthropic-prompt-cache. Контекст, закэшированный у одного провайдера, нельзя переиспользовать у другого.

CPP — это **content-addressed, model-agnostic, cross-harness протокол** для сериализации, передачи и верификации контекста LLM-агентов. Его центральные примитивы — `Fact`, `Rule`, `Calculation`, `Effect` — связаны типизированным семантическим графом и адресуются через CIDs (Content Identifiers).

---

## 2. Goals and Non-Goals

### Goals

1. **Content-addressed транспорт** — одинаковый контент = одинаковый CID = передаётся как 32-байтовый хэш вместо MB-блоба.
2. **Кросс-провайдерская портабельность** — CID, рассчитанный нашим протоколом, не привязан к конкретному LLM-провайдеру.
3. **Cache dedup** — если несколько сессий/пользователей разделяют контекст, он хранится и кодируется в LLM один раз.
4. **Semantic provenance** — структурный граф «Fact → Rule → Calculation → Effect» с подписями и версионированием.
5. **Tier-aware verification** — разные Calculation'ы могут требовать разного уровня cryptographic proof.
6. **MCP compatibility** — интеграция с существующей экосистемой harness'ов через MCP Resources.
7. **Audit-readable surface** — plain-text expansion любого CID на запрос (regulatory compliance).

### Non-Goals

1. **Битовая воспроизводимость LLM-инференса.** Это открытая research-проблема; CPP принимает реальность семантической, а не битовой воспроизводимости.
2. **Замена существующих LLM API.** CPP — это слой *над* провайдерскими API, не альтернатива им.
3. **Универсальный data exchange format.** CPP специализирован под LLM/agentic harness use case; не претендует на замену общих data interchange форматов.
4. **Blockchain или децентрализация на L1.** Используем cryptographic primitives (хэши, подписи), но не требуем blockchain. Federation возможен post-MVP.

---

## 3. Use Cases

### 3.1. Финансовый — Portfolio Risk Management

**Сценарий:** Доходность 10Y UST растёт на 25 bps в 13:30 UTC. Risk-engine применяет правило DV01 v2.3.1 к 47 позициям портфеля. Effect: «Fund_A теряет ~$2.3M ± $0.5M; экспозиция на Position #12 растёт; затронуты 12 материальных позиций → 4 портфеля → 2 counterparty exposures».

**CPP nodes:**
- `FactNode F_yield` (Bloomberg-signed, immutable, timestamped)
- `RuleNode R_dv01` (compliance-signed, version 2.3.1)
- `CalculationActivity C_impact` (Claude-Opus-4.7, T=0, with tool_calls to portfolio DB)
- `EffectNode E_impact` (range_root = Merkle над причинной цепочкой)

**Tier-routing:**
- Live trader refresh → Tier 1 (только content-addressing)
- End-of-day P&L report → Tier 2 (N-of-M consensus + TEE)
- SEC filing → Tier 3 (zkML proof для критических переоценок)

**Value:** $1-4M/год экономии input-токенов; sub-second TTFT для cached portfolios; criptographic audit trail для compliance.

### 3.2. ROX.ONE — Multi-Agent Collaboration

**Сценарий:** 5 разработчиков + 3 бота (code-reviewer, CI, deployment) работают на общей кодовой базе. Developer #1 коммитит ADR. Developer #2, code-reviewer-bot, и Developer #3 за 30 минут трижды загружают тот же контекст (150K токенов each).

**CPP nodes:**
- `FactNode F_adr` (developer-signed via did:key)
- `RuleNode R_ipc_pattern` (1.0.0)
- `CalculationActivity C_find_scope` (с tool_calls: grep, read, repeated invocations)
- `EffectNode E_refactor_scope` (затронутые файлы с weight: must_change / should_review / must_revalidate)

**Tier-routing:** Только Tier 1 (cache layer).

**Value:** $5-25/day на команду экономия; **главное** — единый source-of-truth для multi-agent collab; stale-fact detection; tool-call dedup.

### 3.3. Medical — Diagnostic AI

**Сценарий:** Diagnostic AI агент анализирует X-ray. Fact = encrypted image + patient metadata. Rule = diagnostic model + clinical guidelines. Effect = differential diagnosis with calibrated probabilities.

**CPP nodes:**
- `FactNode F_xray` (encrypted, capability-token-gated, hospital-signed)
- `RuleNode R_diagnostic_v3.2` (FDA-cleared model, regulator-signed)
- `CalculationActivity C_diagnose` (specified model + clinical context)
- `EffectNode E_differential` (Bayesian probabilities, не интервалы)

**Tier-routing:** Tier 3 для critical diagnoses; H (Privacy) обязателен.

**Value:** HIPAA-compliant audit trail; GDPR Art. 22 explanation на запрос; долгосрочная liability protection (5-7 лет retention).

---

## 4. Architecture: Full 9-Layer Stack

```
┌──────────────────────────────────────────────────────────┐
│ D. Surface layer (human-readable on demand)              │
│ H. Privacy layer (encryption, selective disclosure)      │
├──────────────────────────────────────────────────────────┤
│ B. Semantic graph (PROV-O vocabulary + IPLD schemas)     │
│ E. Temporal (versioning, validity, supersession)         │
│ F. Governance (DID-based identity, signatures, trust)    │
├──────────────────────────────────────────────────────────┤
│ A. Range structure (causal DAG + interval weights)       │
├──────────────────────────────────────────────────────────┤
│ C. Trust tiers (Tier 1/2/3)                              │
│ G. Economic (storage, verification, anti-spam)           │
│ I. Network (discovery, replication, pinning)             │
└──────────────────────────────────────────────────────────┘
```

**Слои не альтернативны — это стек.** Каждый use case активирует свою комбинацию. Минимум для рабочего протокола: A + B + C-tier-1 + D-basic + E + F-basic.

---

## 5. MVP Scope (6 Layers)

| Слой | MVP? | Обоснование |
|---|---|---|
| **A. Range structure** | ✅ | Без range нет содержания Effect'а |
| **B. Semantic graph** | ✅ | Без графа нет протокола |
| **C-Tier-1** | ✅ | Content-addressing — главный value |
| **D-basic** | ✅ | Минимум: plain-text expansion на запрос |
| **E. Temporal** | ✅ | Без versioning MVP сломается через неделю |
| **F-basic** | ✅ | Минимум: did:key + Ed25519 signatures |
| C-Tier-2/3 | ⏳ post-MVP | Требует TEE-инфры / zkML; high-stakes only |
| G. Economic | ⏳ post-MVP | Runtime decision, не protocol question |
| H. Privacy | ⏳ post-MVP | Orthogonal extension; обязателен для medical |
| I. Network | ⏳ post-MVP | Сначала single storage, потом federated |

**MVP-протокол собирается за 2-3 месяца силами 1-2 человек** (с учётом ~70% reuse из IPLD/MCP/DID-W3C/PROV-O экосистем).

---

## 6. Type Definitions (IPLD Schema Notation)

CPP-узлы определены через IPLD Schemas. Canonical serialization — DAG-CBOR. CID = SHA-256(DAG-CBOR(node)).

### 6.1. Core types

```ipldsch
type CID &Any        # content identifier
type DID string      # decentralized identifier (e.g., did:key:z6Mk...)
type Signature bytes # Ed25519 signature
type ISO8601 string  # ISO 8601 timestamp

type Interval struct {
  low Float
  high Float
}

type SignedEnvelope struct {
  payload     &Any
  signer_did  DID
  signature   Signature
  signed_at   ISO8601
} representation tuple
```

### 6.2. FactNode

```ipldsch
type FactNode struct {
  type        String          # "fact"
  payload_cid CID             # underlying data (encrypted in H-layer scenarios)
  source      AgentRef
  timestamp   ISO8601
  validity    Validity
  metadata    {String: Any}  # optional, extensible
}

type AgentRef struct {
  did         DID
  role        String          # e.g., "bloomberg-feed", "human:developer", "claude-sonnet-4.6"
}
```

### 6.3. RuleNode

```ipldsch
type RuleNode struct {
  type           String       # "rule"
  expression_cid CID          # logic, formula, or natural-language rule body
  version        String       # SemVer
  authority      AgentRef     # who authored/blessed this rule
  applicable_to  [String]     # tags or entity-type matchers
  validity       Validity
}
```

### 6.4. CalculationActivity

```ipldsch
type CalculationActivity struct {
  type             String         # "calculation"
  inputs           [&Any]         # &FactNode | &EffectNode
  rules            [&RuleNode]
  model            ModelRef
  tool_calls       [ToolCall]     # ordered chain of agent actions
  outputs          [&EffectNode]
  tier             TrustTier
  started_at       ISO8601
  finished_at      ISO8601
}

type ModelRef struct {
  model_cid    CID               # registry entry for the model (weights or API endpoint)
  display_name String             # e.g., "claude-opus-4.7"
  seed         optional Int
  params       {String: Any}     # T, top_p, top_k, etc.
}

type ToolCall struct {
  name         String             # "grep", "read", "edit", "http_request", etc.
  args_cid     CID                # canonical args
  result_cid   CID                # canonical result
  started_at   ISO8601
  finished_at  ISO8601
}

type TrustTier enum {
  | Tier1  ("tier-1-cache")
  | Tier2  ("tier-2-consensus-tee")
  | Tier3  ("tier-3-zkml")
}
```

### 6.5. EffectNode

```ipldsch
type EffectNode struct {
  type        String              # "effect"
  caused_by   &CalculationActivity
  affects     [AffectedEntity]
  range_root  CID                 # Merkle root over causal DAG (full propagation graph)
  summary_cid optional CID        # human-readable summary, for D-layer
  validity    Validity
}

type AffectedEntity struct {
  entity_cid  CID
  weight      Interval            # impact magnitude
  confidence  Interval            # how sure we are
  label       optional String     # human-readable tag, e.g., "must_change"
}
```

### 6.6. Range structure (interval-weighted causal DAG)

```ipldsch
type CausalDAGNode struct {
  entity_cid    CID
  weight        Interval
  confidence    Interval
  upstream      [&CausalDAGNode]   # causes
  pruned_at     optional String    # if subtree truncated, why
}
```

`EffectNode.range_root` — это CID корня этого DAG (как обычный IPLD Merkle DAG).

### 6.7. Temporal (E-layer)

```ipldsch
type Validity struct {
  valid_from     ISO8601
  valid_until    optional ISO8601  # null = until superseded
  supersedes     [CID]              # what this replaces
  superseded_by  optional CID       # filled retroactively
}
```

### 6.8. Governance (F-basic)

Все верхне-уровневые узлы (FactNode, RuleNode, CalculationActivity, EffectNode) сериализуются внутри `SignedEnvelope`. Подписание:

1. Канонизировать payload через DAG-CBOR.
2. Подписать DAG-CBOR-байты приватным ключом, соответствующим `signer_did`.
3. Verifier разрешает DID (для `did:key` — извлекает публичный ключ прямо из identifier) и проверяет signature.

**MVP method:** `did:key` с Ed25519. Никакой resolution infrastructure не требуется.

---

## 7. MCP Integration

CPP интегрируется с MCP Resources как primary surface для harness'ов.

### 7.1. URI scheme

```
mcp://provenance/<node_type>/<cid>

Examples:
mcp://provenance/fact/bafyreif...
mcp://provenance/rule/bafyrei...
mcp://provenance/calculation/bafyrei...
mcp://provenance/effect/bafyrei...
```

### 7.2. MCP Resource shape

```json
{
  "uri": "mcp://provenance/effect/bafyrei...",
  "name": "Effect: Yield rise impact on Fund_A",
  "title": "Portfolio Loss Estimate",
  "description": "Impact of 25 bps UST 10Y rise on Fund_A; ~$2.3M loss; 12 positions",
  "mimeType": "application/vnd.cpp.effect+dag-cbor",
  "annotations": {
    "audience": ["assistant", "user"],
    "priority": 0.9,
    "lastModified": "2026-05-21T13:35:12Z",
    "cpp_cid": "bafyrei...",
    "cpp_tier": "tier-1-cache",
    "cpp_signed_by": "did:key:z6Mk..."
  }
}
```

### 7.3. Resolver dedup

MCP server, реализующий CPP, дедуплицирует resource'ы по CID, даже если приходят разные URI (например, `mcp://provenance/fact/<cid>` и `mcp://provenance/effect/<cid>` указывают на разные logical types, но один и тот же payload по CID — резолвится из одного blob storage):

```
type CPPResolver = {
  resolve(uri): {
    cid       = parse_cid(uri)
    node_type = parse_type(uri)
    payload   = storage.get(cid)        # одна копия, дедуплицировано
    return wrap_with_type(payload, node_type)
  }
}
```

### 7.4. Subscriptions for supersession

При `superseded_by` обновлении сервер шлёт MCP `notifications/resources/updated` всем подписавшимся клиентам. Они могут переключиться на новую версию (или придерживаться старой для воспроизводимости — это их выбор).

### 7.5. Bridge to Anthropic prompt caching

Anthropic prompt caching внутренне хэширует префикс. Если канонические байты нашего payload совпадают с тем, что Anthropic хэширует для своего cache key — мы получаем provider-side cache hits **бесплатно**, дополнительно к нашему content-addressed дедупу.

**Open question (см. Section 11.1):** Согласованы ли canonical bytes (DAG-CBOR) с Anthropic'ким внутренним cache hashing? Если нет — это hash-key alignment проект.

---

## 8. CID Computation

```
CID = multihash(SHA-256, DAG-CBOR(canonical(node)))
```

где:
- **canonical(node)** — обнуляет mutable fields (Validity.superseded_by — это retroactive update, не входит в CID), сортирует map keys, убирает default values.
- **DAG-CBOR** — IPLD canonical CBOR serialization (RFC 8949 + IPLD restrictions).
- **multihash** — multiformats encoding `<algo>-<length>-<digest>`.

Это даёт битово-стабильную сериализацию и взаимозаменяемость CID между реализациями на JS/Rust/Go/Python.

---

## 9. Trust Tiers (Layer C detail)

| Tier | Механизм | Когда применять | Стоимость | Latency |
|---|---|---|---|---|
| **Tier 1** | Только content-addressing (CID) | MVP, low-stakes, всё что cache-dominated | ~$0 | мс |
| **Tier 2** | N-of-M consensus (3-5 моделей голосуют) + опц. TEE attestation | Mid-stakes, compliance-adjacent | ×3-5 инференса | +parallel max |
| **Tier 3** | zkML proof (post-LLM verifier) + audit trail | High-stakes, regulatory, litigation-grade | $0.5-5/proof | 10-60s, async |

**Tier selection** — это поле `CalculationActivity.tier`. Routing logic — application-level, не protocol-level (протокол только описывает required artefacts per tier).

**MVP behavior:** MVP-имплементация может **записать** `CalculationActivity` с любым значением `tier` (поле зарезервировано в protocol для forward-compatibility), но **верифицирует** только Tier 1 (content-addressing integrity). Calculation'ы с `tier=Tier2` или `tier=Tier3`, записанные на MVP-инфре, валидны как protocol-objects, но не несут required proof artefacts до соответствующих post-MVP фаз.

---

## 10. Post-MVP Roadmap

### Phase 2 (Q3-Q4 2026): Privacy + Economic

- **H. Privacy layer** — encryption-at-rest, capability tokens, selective disclosure proofs. Критично для medical и любых PHI/PII use cases.
- **G. Economic layer (basic)** — producer-pays storage, pin policies, anti-spam через подписи + reputation tracking.

### Phase 3 (2027): Federation + Higher Tiers

- **I. Network layer** — federated discovery, replication, pinning incentives.
- **C-Tier-2** — N-of-M consensus orchestration; TEE attestation integration (NVIDIA H100 Confidential Compute via Azure).
- **C-Tier-3** — zkML integration через EZKL/Modulus для critical-path Calculations.

### Phase 4 (later): Full PROV-O export

- Generate W3C PROV-O / RDF export for any subgraph on demand, for regulator-facing audits.
- Verifiable Credentials (W3C VC) wrapper для cross-organizational trust.

---

## 11. Open Questions

1. **Anthropic cache key alignment (Section 7.5).** Можно ли согласовать наш canonical bytes с тем, что Anthropic хэширует внутренне для cache keys? Если да — это «free» provider-side cache layer для всех CPP-юзеров. Требует либо документации от Anthropic, либо empirical reverse-engineering.

2. **Range pruning policy.** Causal DAG может расти экспоненциально. Какие defaults для materiality threshold и max depth? Per-domain или universal?

3. **Tool-call canonicalization.** Что значит «одинаковый tool call»? `grep -r "X" .` и `grep "X" -r .` — это один call или два? Нужен canonical normalization rules для each tool type, или принимаем как есть и иногда дедупа не происходит?

4. **Stale-fact detection semantics.** Когда Fact считается stale? По истечении `valid_until`? По появлению `superseded_by`? По истечении max age в его metadata?

5. **Conflict resolution в multi-author scenarios (ROX.ONE).** Два автора одновременно создают Facts на одну тему. Tiebreaker rules: timestamp? author authority? voting?

6. **Encryption-key management для H.** Capability tokens — отдельный protocol или extension MCP authentication?

7. **MVP test domain.** ROX.ONE — самый realistic для validation. Но нужны реальные harness'ы (Claude Code, Cursor) для интеграционных тестов. Кто партнёр-pilot?

---

## 12. Implementation Plan (High Level)

### Sprint 0 (week 1-2): Foundations
- Repo scaffold (monorepo with packages: `core`, `mcp-server`, `cli`)
- Choose stack: TypeScript + Bun (alignment с ROX.ONE)
- Integrate IPLD libs (`@ipld/dag-cbor`, `multiformats`)
- Integrate DID libs (`@noble/ed25519`, `did-key`)

### Sprint 1 (week 3-4): Core types
- IPLD Schema definitions
- Canonicalization + CID computation
- SignedEnvelope wrapper
- Round-trip tests (encode/decode/verify)

### Sprint 2 (week 5-6): Storage + Resolver
- Local content-addressed storage (filesystem-backed)
- CPP Resolver implementation
- Validity / supersession logic
- Stale-fact detection

### Sprint 3 (week 7-8): MCP server
- MCP Resources implementation
- URI scheme `mcp://provenance/*`
- Subscriptions for supersession
- Annotations with CPP metadata

### Sprint 4 (week 9-10): Integration tests
- Pilot integration with ROX.ONE harness
- End-to-end scenario: ADR → multi-agent context sharing
- Measure dedup hit rate, latency improvement

### Sprint 5 (week 11-12): Polish + Docs
- Reference implementation docs
- CLI tools for inspecting CIDs
- Spec v1.0.0 release

---

## 13. References

### Standards reused

- **IPLD Schemas** — https://ipld.io/docs/schemas/
- **DAG-CBOR** — https://ipld.io/specs/codecs/dag-cbor/spec/
- **CID (Content Identifier)** — https://github.com/multiformats/cid
- **MCP Resources** (2025-06-18) — https://modelcontextprotocol.io/specification/2025-06-18/server/resources
- **PROV-O** (W3C 2013) — https://www.w3.org/TR/prov-o/
- **DID Core** (W3C 2022) — https://www.w3.org/TR/did-core/
- **did:key** — https://w3c-ccg.github.io/did-method-key/

### Inspirations

- **Anthropic prompt caching** — provider-internal content-hash префиксов
- **Git** — content-addressed object store, human-readable expansion on demand
- **IPFS** — content-addressed federation
- **W3C Verifiable Credentials** — signed claims on top of DIDs
- **EZKL / Modulus Labs / Giza** — zkML practical implementations
- **NVIDIA H100 Confidential Compute** — TEE-protected GPU inference (Azure preview)

---

## 14. Change Log

- **2026-05-21:** Initial draft from brainstorming session.

---

## Appendix A: Glossary

- **CID** — Content Identifier; multihash-based content address.
- **DAG-CBOR** — IPLD canonical CBOR serialization.
- **DID** — Decentralized Identifier (W3C).
- **MCP** — Model Context Protocol (Anthropic).
- **PROV-O** — Provenance Ontology (W3C).
- **TEE** — Trusted Execution Environment.
- **zkML** — Zero-Knowledge Machine Learning (cryptographic proofs of inference).
- **TTFT** — Time To First Token.
