# CPP Sprint 0+1 — Core Types Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `cpp-core` — a TypeScript library that constructs, canonicalizes, CID-computes, signs, and verifies the six core CPP node types (FactNode, RuleNode, CalculationActivity, EffectNode, Validity, SignedEnvelope). Covers spec sections 5-8 + F-basic for MVP layers A, B, C-tier-1, E, F-basic.

**Architecture:** Single-package TypeScript library on Bun runtime. Pure-functional API: factories construct typed objects, encoders produce DAG-CBOR canonical bytes, hashers compute CIDs, signers wrap in `SignedEnvelope`. No storage, no MCP server, no resolver — those are Sprint 2-3. Library exposes ~12 functions through `src/index.ts`.

**Tech Stack:**
- **Runtime:** Bun 1.x (alignment с ROX.ONE)
- **Language:** TypeScript 5.x strict mode
- **Test runner:** `bun:test`
- **Dependencies:** `@ipld/dag-cbor`, `multiformats`, `@noble/ed25519`, `@noble/hashes`
- **Out of scope:** No build step (Bun loads TS directly); no bundler; no MCP server; no storage layer.

**Out of plan (deferred to Sprint 2-5):**
- Storage layer + Resolver (Sprint 2)
- MCP server with `mcp://provenance/*` URI scheme (Sprint 3)
- Integration tests against real ROX.ONE harness (Sprint 4)
- Documentation polish + npm publish (Sprint 5)

---

## File Structure (locked in here, referenced by tasks)

```
/home/dev/serialization_design/cpp-core/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                       # public API barrel exports
│   ├── canonical.ts                   # DAG-CBOR encode/decode + canonicalization
│   ├── cid.ts                         # CID computation (SHA-256 + multihash)
│   ├── errors.ts                      # custom error classes
│   ├── types/
│   │   ├── common.ts                  # CID, DID, Signature, ISO8601, Interval
│   │   ├── validity.ts                # Validity (temporal layer E)
│   │   ├── fact.ts                    # FactNode + factory
│   │   ├── rule.ts                    # RuleNode + factory
│   │   ├── calculation.ts             # CalculationActivity, ToolCall, ModelRef, TrustTier
│   │   ├── effect.ts                  # EffectNode, AffectedEntity
│   │   ├── range.ts                   # CausalDAGNode (range structure)
│   │   └── envelope.ts                # SignedEnvelope wrapper
│   └── identity/
│       ├── did-key.ts                 # did:key generation + parsing
│       ├── sign.ts                    # Ed25519 signing
│       └── verify.ts                  # signature verification
└── tests/
    ├── canonical.test.ts
    ├── cid.test.ts
    ├── types/
    │   ├── fact.test.ts
    │   ├── rule.test.ts
    │   ├── calculation.test.ts
    │   ├── effect.test.ts
    │   ├── range.test.ts
    │   ├── validity.test.ts
    │   └── envelope.test.ts
    ├── identity/
    │   ├── did-key.test.ts
    │   └── sign-verify.test.ts
    └── integration/
        └── adr-scenario.test.ts       # end-to-end ROX.ONE-like scenario
```

Each file has a single, clear responsibility. No file is expected to exceed 150 lines in this sprint.

---

## Task 0: Repo Scaffold + Dependencies

**Files:**
- Create: `cpp-core/package.json`
- Create: `cpp-core/tsconfig.json`
- Create: `cpp-core/src/index.ts`
- Create: `cpp-core/tests/sanity.test.ts`

- [ ] **Step 1: Create directory and initialize**

Run:
```bash
cd /home/dev/serialization_design
mkdir -p cpp-core/src/types cpp-core/src/identity cpp-core/tests/types cpp-core/tests/identity cpp-core/tests/integration
cd cpp-core
bun init -y
```

- [ ] **Step 2: Write `package.json`**

Replace contents of `cpp-core/package.json`:
```json
{
  "name": "cpp-core",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.4.0"
  },
  "dependencies": {
    "@ipld/dag-cbor": "^9.2.0",
    "@noble/ed25519": "^2.1.0",
    "@noble/hashes": "^1.5.0",
    "multiformats": "^13.3.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run:
```bash
bun install
```

Expected: deps installed without errors; `bun.lockb` created.

- [ ] **Step 4: Write `tsconfig.json`**

Replace contents:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "types": ["bun-types"],
    "lib": ["ESNext"],
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write minimal `src/index.ts`**

Replace contents:
```typescript
export const version = "0.0.1";
```

- [ ] **Step 6: Write sanity test**

Create `cpp-core/tests/sanity.test.ts`:
```typescript
import { test, expect } from "bun:test";
import { version } from "../src/index";

test("library exports version", () => {
  expect(version).toBe("0.0.1");
});
```

- [ ] **Step 7: Verify test runs and typecheck passes**

Run:
```bash
bun test
bun run typecheck
```

Expected: 1 test pass, typecheck clean.

- [ ] **Step 8: Commit scaffold**

```bash
cd /home/dev/serialization_design
git init 2>/dev/null || true
git add cpp-core/package.json cpp-core/tsconfig.json cpp-core/src/index.ts cpp-core/tests/sanity.test.ts cpp-core/bun.lockb
git commit -m "chore: scaffold cpp-core package with Bun + TypeScript strict"
```

---

## Task 1: Common Type Definitions

**Files:**
- Create: `cpp-core/src/types/common.ts`
- Create: `cpp-core/tests/types/common.test.ts`

- [ ] **Step 1: Write failing test for `Interval` validation**

Create `cpp-core/tests/types/common.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { makeInterval, type Interval } from "../../src/types/common";

describe("Interval", () => {
  test("constructs valid interval with low <= high", () => {
    const i: Interval = makeInterval(0.1, 0.5);
    expect(i.low).toBe(0.1);
    expect(i.high).toBe(0.5);
  });

  test("rejects interval with low > high", () => {
    expect(() => makeInterval(0.5, 0.1)).toThrow();
  });

  test("accepts degenerate interval (low === high)", () => {
    const i = makeInterval(0.3, 0.3);
    expect(i.low).toBe(0.3);
    expect(i.high).toBe(0.3);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run:
```bash
bun test tests/types/common.test.ts
```

Expected: FAIL (cannot find `common` module).

- [ ] **Step 3: Implement `src/types/common.ts`**

Create:
```typescript
import type { CID as MultiformatsCID } from "multiformats/cid";

export type CID = MultiformatsCID;
export type DID = `did:${string}:${string}`;
export type Signature = Uint8Array;
export type ISO8601 = string;

export interface Interval {
  readonly low: number;
  readonly high: number;
}

export function makeInterval(low: number, high: number): Interval {
  if (low > high) {
    throw new Error(`Invalid interval: low (${low}) > high (${high})`);
  }
  return { low, high };
}

export interface AgentRef {
  readonly did: DID;
  readonly role: string;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
bun test tests/types/common.test.ts
bun run typecheck
```

Expected: 3 tests pass, typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/common.ts cpp-core/tests/types/common.test.ts
git commit -m "feat(types): add common types (CID, DID, Interval, AgentRef)"
```

---

## Task 2: Canonical DAG-CBOR Encoding

**Files:**
- Create: `cpp-core/src/canonical.ts`
- Create: `cpp-core/tests/canonical.test.ts`

DAG-CBOR is deterministic by design (canonical CBOR rules from RFC 8949 + IPLD restrictions: only definite-length items, integer keys sorted, etc.). `@ipld/dag-cbor` enforces these rules.

- [ ] **Step 1: Write failing test for canonical encoding**

Create `cpp-core/tests/canonical.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { encodeCanonical, decodeCanonical } from "../src/canonical";

describe("canonical encoding", () => {
  test("encodes identical objects to identical bytes regardless of key order", () => {
    const a = { foo: 1, bar: 2, baz: 3 };
    const b = { baz: 3, bar: 2, foo: 1 };
    const bytesA = encodeCanonical(a);
    const bytesB = encodeCanonical(b);
    expect(bytesA).toEqual(bytesB);
  });

  test("round-trips through encode/decode", () => {
    const input = { name: "fact", value: 42, nested: { ok: true } };
    const bytes = encodeCanonical(input);
    const decoded = decodeCanonical<typeof input>(bytes);
    expect(decoded).toEqual(input);
  });

  test("preserves Uint8Array as bytes (not array)", () => {
    const input = { sig: new Uint8Array([1, 2, 3]) };
    const bytes = encodeCanonical(input);
    const decoded = decodeCanonical<{ sig: Uint8Array }>(bytes);
    expect(decoded.sig).toBeInstanceOf(Uint8Array);
    expect(Array.from(decoded.sig)).toEqual([1, 2, 3]);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run:
```bash
bun test tests/canonical.test.ts
```

Expected: FAIL (cannot find `canonical` module).

- [ ] **Step 3: Implement `src/canonical.ts`**

Create:
```typescript
import * as cbor from "@ipld/dag-cbor";

export function encodeCanonical(value: unknown): Uint8Array {
  return cbor.encode(value);
}

export function decodeCanonical<T>(bytes: Uint8Array): T {
  return cbor.decode(bytes) as T;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
bun test tests/canonical.test.ts
bun run typecheck
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/canonical.ts cpp-core/tests/canonical.test.ts
git commit -m "feat(canonical): add DAG-CBOR canonical encoding"
```

---

## Task 3: CID Computation

**Files:**
- Create: `cpp-core/src/cid.ts`
- Create: `cpp-core/tests/cid.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/cid.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { computeCID, cidToString, cidFromString } from "../src/cid";

describe("CID computation", () => {
  test("computes deterministic CID for identical input", () => {
    const obj = { foo: 1, bar: "baz" };
    const cidA = computeCID(obj);
    const cidB = computeCID(obj);
    expect(cidToString(cidA)).toBe(cidToString(cidB));
  });

  test("produces different CIDs for different inputs", () => {
    const cid1 = computeCID({ x: 1 });
    const cid2 = computeCID({ x: 2 });
    expect(cidToString(cid1)).not.toBe(cidToString(cid2));
  });

  test("CID round-trips through string form", () => {
    const original = computeCID({ hello: "world" });
    const asString = cidToString(original);
    const restored = cidFromString(asString);
    expect(cidToString(restored)).toBe(asString);
  });

  test("CID string is base32-encoded and starts with 'b'", () => {
    const cid = computeCID({ x: 1 });
    const s = cidToString(cid);
    expect(s.startsWith("b")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run:
```bash
bun test tests/cid.test.ts
```

Expected: FAIL (cannot find `cid` module).

- [ ] **Step 3: Implement `src/cid.ts`**

We use `@noble/hashes/sha256` (synchronous) instead of `multiformats/hashes/sha2` (which returns Promise on Web-Crypto-only platforms like Bun). Multihash is constructed manually via `multiformats/hashes/digest.create`.

Create:
```typescript
import { CID } from "multiformats/cid";
import * as Digest from "multiformats/hashes/digest";
import { sha256 } from "@noble/hashes/sha256";
import * as cbor from "@ipld/dag-cbor";
import { encodeCanonical } from "./canonical";

const DAG_CBOR_CODE = cbor.code;       // 0x71
const SHA256_MULTICODEC = 0x12;         // sha2-256

export function computeCID(value: unknown): CID {
  const bytes = encodeCanonical(value);
  const digestBytes = sha256(bytes);
  const mh = Digest.create(SHA256_MULTICODEC, digestBytes);
  return CID.create(1, DAG_CBOR_CODE, mh);
}

export function cidToString(cid: CID): string {
  return cid.toString();
}

export function cidFromString(s: string): CID {
  return CID.parse(s);
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
bun test tests/cid.test.ts
bun run typecheck
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/cid.ts cpp-core/tests/cid.test.ts
git commit -m "feat(cid): add CID computation (SHA-256 + DAG-CBOR + multihash)"
```

---

## Task 4: Validity (Temporal Layer E)

**Files:**
- Create: `cpp-core/src/types/validity.ts`
- Create: `cpp-core/tests/types/validity.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/validity.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { makeValidity, isExpired, type Validity } from "../../src/types/validity";

describe("Validity", () => {
  test("constructs minimal validity with from-only", () => {
    const v: Validity = makeValidity({ valid_from: "2026-05-21T00:00:00Z" });
    expect(v.valid_from).toBe("2026-05-21T00:00:00Z");
    expect(v.valid_until).toBeUndefined();
    expect(v.supersedes).toEqual([]);
  });

  test("rejects invalid ISO8601", () => {
    expect(() =>
      makeValidity({ valid_from: "not-a-date" })
    ).toThrow();
  });

  test("rejects valid_until before valid_from", () => {
    expect(() =>
      makeValidity({
        valid_from: "2026-05-21T10:00:00Z",
        valid_until: "2026-05-20T10:00:00Z",
      })
    ).toThrow();
  });

  test("isExpired returns true when now > valid_until", () => {
    const v = makeValidity({
      valid_from: "2026-05-20T00:00:00Z",
      valid_until: "2026-05-20T01:00:00Z",
    });
    expect(isExpired(v, new Date("2026-05-20T02:00:00Z"))).toBe(true);
  });

  test("isExpired returns false when valid_until is undefined", () => {
    const v = makeValidity({ valid_from: "2026-05-20T00:00:00Z" });
    expect(isExpired(v, new Date("2030-01-01T00:00:00Z"))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/validity.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/validity.ts`**

Create:
```typescript
import type { CID, ISO8601 } from "./common";

export interface Validity {
  readonly valid_from: ISO8601;
  readonly valid_until?: ISO8601;
  readonly supersedes: ReadonlyArray<CID>;
  readonly superseded_by?: CID;
}

interface MakeValidityInput {
  valid_from: ISO8601;
  valid_until?: ISO8601;
  supersedes?: ReadonlyArray<CID>;
  superseded_by?: CID;
}

function parseISO(s: string): Date {
  const d = new Date(s);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid ISO8601 timestamp: ${s}`);
  }
  return d;
}

export function makeValidity(input: MakeValidityInput): Validity {
  const from = parseISO(input.valid_from);
  if (input.valid_until !== undefined) {
    const until = parseISO(input.valid_until);
    if (until.getTime() < from.getTime()) {
      throw new Error(
        `valid_until (${input.valid_until}) is before valid_from (${input.valid_from})`
      );
    }
  }
  return {
    valid_from: input.valid_from,
    ...(input.valid_until !== undefined ? { valid_until: input.valid_until } : {}),
    supersedes: input.supersedes ?? [],
    ...(input.superseded_by !== undefined ? { superseded_by: input.superseded_by } : {}),
  };
}

export function isExpired(v: Validity, now: Date): boolean {
  if (v.valid_until === undefined) return false;
  return now.getTime() > parseISO(v.valid_until).getTime();
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/validity.test.ts && bun run typecheck`. Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/validity.ts cpp-core/tests/types/validity.test.ts
git commit -m "feat(types): add Validity type (temporal layer E)"
```

---

## Task 5: FactNode

**Files:**
- Create: `cpp-core/src/types/fact.ts`
- Create: `cpp-core/tests/types/fact.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/fact.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { makeFactNode } from "../../src/types/fact";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("FactNode", () => {
  test("constructs valid FactNode", () => {
    const payloadCID = computeCID({ price: 100 });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkAlice", role: "bloomberg-feed" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    expect(fact.type).toBe("fact");
    expect(fact.source.role).toBe("bloomberg-feed");
  });

  test("two FactNodes with same content have same CID", () => {
    const payloadCID = computeCID({ price: 100 });
    const input = {
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkAlice" as const, role: "bloomberg-feed" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    };
    const factA = makeFactNode(input);
    const factB = makeFactNode(input);
    expect(computeCID(factA).toString()).toBe(computeCID(factB).toString());
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/fact.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/fact.ts`**

Create:
```typescript
import type { AgentRef, CID, ISO8601 } from "./common";
import type { Validity } from "./validity";

export interface FactNode {
  readonly type: "fact";
  readonly payload_cid: CID;
  readonly source: AgentRef;
  readonly timestamp: ISO8601;
  readonly validity: Validity;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

interface MakeFactNodeInput {
  payload_cid: CID;
  source: AgentRef;
  timestamp: ISO8601;
  validity: Validity;
  metadata?: Readonly<Record<string, unknown>>;
}

export function makeFactNode(input: MakeFactNodeInput): FactNode {
  return {
    type: "fact",
    payload_cid: input.payload_cid,
    source: input.source,
    timestamp: input.timestamp,
    validity: input.validity,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/fact.test.ts && bun run typecheck`. Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/fact.ts cpp-core/tests/types/fact.test.ts
git commit -m "feat(types): add FactNode"
```

---

## Task 6: RuleNode

**Files:**
- Create: `cpp-core/src/types/rule.ts`
- Create: `cpp-core/tests/types/rule.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/rule.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { makeRuleNode } from "../../src/types/rule";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("RuleNode", () => {
  test("constructs valid RuleNode", () => {
    const exprCID = computeCID({ formula: "DV01 = -modified_duration * yield_change * price" });
    const rule = makeRuleNode({
      expression_cid: exprCID,
      version: "2.3.1",
      authority: { did: "did:key:z6MkCompliance", role: "compliance-officer" },
      applicable_to: ["bond", "fixed-income"],
      validity: makeValidity({ valid_from: "2026-01-01T00:00:00Z" }),
    });
    expect(rule.type).toBe("rule");
    expect(rule.version).toBe("2.3.1");
    expect(rule.applicable_to).toEqual(["bond", "fixed-income"]);
  });

  test("rejects invalid SemVer", () => {
    const exprCID = computeCID({ formula: "x" });
    expect(() =>
      makeRuleNode({
        expression_cid: exprCID,
        version: "not-semver",
        authority: { did: "did:key:z6MkX", role: "x" },
        applicable_to: [],
        validity: makeValidity({ valid_from: "2026-01-01T00:00:00Z" }),
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/rule.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/rule.ts`**

Create:
```typescript
import type { AgentRef, CID } from "./common";
import type { Validity } from "./validity";

export interface RuleNode {
  readonly type: "rule";
  readonly expression_cid: CID;
  readonly version: string;
  readonly authority: AgentRef;
  readonly applicable_to: ReadonlyArray<string>;
  readonly validity: Validity;
}

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

interface MakeRuleNodeInput {
  expression_cid: CID;
  version: string;
  authority: AgentRef;
  applicable_to: ReadonlyArray<string>;
  validity: Validity;
}

export function makeRuleNode(input: MakeRuleNodeInput): RuleNode {
  if (!SEMVER.test(input.version)) {
    throw new Error(`Invalid SemVer version: ${input.version}`);
  }
  return {
    type: "rule",
    expression_cid: input.expression_cid,
    version: input.version,
    authority: input.authority,
    applicable_to: input.applicable_to,
    validity: input.validity,
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/rule.test.ts && bun run typecheck`. Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/rule.ts cpp-core/tests/types/rule.test.ts
git commit -m "feat(types): add RuleNode with SemVer validation"
```

---

## Task 7: ToolCall + CalculationActivity

**Files:**
- Create: `cpp-core/src/types/calculation.ts`
- Create: `cpp-core/tests/types/calculation.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/calculation.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import {
  makeCalculationActivity,
  makeToolCall,
  TrustTier,
} from "../../src/types/calculation";
import { computeCID } from "../../src/cid";

describe("CalculationActivity", () => {
  test("constructs activity with tool calls", () => {
    const inputCID = computeCID({ position: "Fund_A" });
    const ruleCID = computeCID({ formula: "DV01" });
    const modelCID = computeCID({ name: "claude-opus-4.7" });
    const argsCID = computeCID({ pattern: "ipcRenderer.send" });
    const resultCID = computeCID({ matches: ["file1.ts", "file2.ts"] });

    const tc = makeToolCall({
      name: "grep",
      args_cid: argsCID,
      result_cid: resultCID,
      started_at: "2026-05-21T13:30:00Z",
      finished_at: "2026-05-21T13:30:01Z",
    });

    const activity = makeCalculationActivity({
      inputs: [inputCID],
      rules: [ruleCID],
      model: {
        model_cid: modelCID,
        display_name: "claude-opus-4.7",
        params: { temperature: 0 },
      },
      tool_calls: [tc],
      outputs: [],
      tier: TrustTier.Tier1,
      started_at: "2026-05-21T13:30:00Z",
      finished_at: "2026-05-21T13:30:02Z",
    });

    expect(activity.type).toBe("calculation");
    expect(activity.tool_calls.length).toBe(1);
    expect(activity.tier).toBe(TrustTier.Tier1);
  });

  test("rejects activity where finished_at is before started_at", () => {
    const modelCID = computeCID({ name: "x" });
    expect(() =>
      makeCalculationActivity({
        inputs: [],
        rules: [],
        model: { model_cid: modelCID, display_name: "x", params: {} },
        tool_calls: [],
        outputs: [],
        tier: TrustTier.Tier1,
        started_at: "2026-05-21T13:30:01Z",
        finished_at: "2026-05-21T13:30:00Z",
      })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/calculation.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/calculation.ts`**

Create:
```typescript
import type { CID, ISO8601 } from "./common";

export enum TrustTier {
  Tier1 = "tier-1-cache",
  Tier2 = "tier-2-consensus-tee",
  Tier3 = "tier-3-zkml",
}

export interface ModelRef {
  readonly model_cid: CID;
  readonly display_name: string;
  readonly seed?: number;
  readonly params: Readonly<Record<string, unknown>>;
}

export interface ToolCall {
  readonly name: string;
  readonly args_cid: CID;
  readonly result_cid: CID;
  readonly started_at: ISO8601;
  readonly finished_at: ISO8601;
}

export interface CalculationActivity {
  readonly type: "calculation";
  readonly inputs: ReadonlyArray<CID>;
  readonly rules: ReadonlyArray<CID>;
  readonly model: ModelRef;
  readonly tool_calls: ReadonlyArray<ToolCall>;
  readonly outputs: ReadonlyArray<CID>;
  readonly tier: TrustTier;
  readonly started_at: ISO8601;
  readonly finished_at: ISO8601;
}

interface MakeToolCallInput {
  name: string;
  args_cid: CID;
  result_cid: CID;
  started_at: ISO8601;
  finished_at: ISO8601;
}

export function makeToolCall(input: MakeToolCallInput): ToolCall {
  const start = new Date(input.started_at).getTime();
  const end = new Date(input.finished_at).getTime();
  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid ISO8601 timestamps in ToolCall");
  }
  if (end < start) {
    throw new Error(`ToolCall finished_at (${input.finished_at}) is before started_at (${input.started_at})`);
  }
  return { ...input };
}

interface MakeCalculationActivityInput {
  inputs: ReadonlyArray<CID>;
  rules: ReadonlyArray<CID>;
  model: ModelRef;
  tool_calls: ReadonlyArray<ToolCall>;
  outputs: ReadonlyArray<CID>;
  tier: TrustTier;
  started_at: ISO8601;
  finished_at: ISO8601;
}

export function makeCalculationActivity(
  input: MakeCalculationActivityInput
): CalculationActivity {
  const start = new Date(input.started_at).getTime();
  const end = new Date(input.finished_at).getTime();
  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid ISO8601 timestamps");
  }
  if (end < start) {
    throw new Error(
      `Calculation finished_at (${input.finished_at}) is before started_at (${input.started_at})`
    );
  }
  return { type: "calculation", ...input };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/calculation.test.ts && bun run typecheck`. Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/calculation.ts cpp-core/tests/types/calculation.test.ts
git commit -m "feat(types): add CalculationActivity, ToolCall, ModelRef, TrustTier"
```

---

## Task 8: Range Structure (CausalDAGNode)

**Files:**
- Create: `cpp-core/src/types/range.ts`
- Create: `cpp-core/tests/types/range.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/range.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { makeCausalDAGNode, mergeIntervals } from "../../src/types/range";
import { makeInterval } from "../../src/types/common";
import { computeCID } from "../../src/cid";

describe("CausalDAGNode", () => {
  test("constructs leaf node (no upstream)", () => {
    const entity = computeCID({ entity: "X" });
    const node = makeCausalDAGNode({
      entity_cid: entity,
      weight: makeInterval(-2.2, -1.8),
      confidence: makeInterval(0.8, 0.95),
      upstream: [],
    });
    expect(node.upstream.length).toBe(0);
    expect(node.weight.low).toBe(-2.2);
  });

  test("supports nested upstream causal DAG", () => {
    const leaf = computeCID({ entity: "leaf" });
    const root = computeCID({ entity: "root" });
    const leafNode = makeCausalDAGNode({
      entity_cid: leaf,
      weight: makeInterval(0.1, 0.2),
      confidence: makeInterval(0.7, 0.9),
      upstream: [],
    });
    const rootNode = makeCausalDAGNode({
      entity_cid: root,
      weight: makeInterval(1.0, 2.0),
      confidence: makeInterval(0.5, 0.8),
      upstream: [leafNode],
    });
    expect(rootNode.upstream.length).toBe(1);
    expect(rootNode.upstream[0]!.entity_cid.toString()).toBe(leaf.toString());
  });

  test("pruned_at preserved when set", () => {
    const entity = computeCID({ entity: "X" });
    const node = makeCausalDAGNode({
      entity_cid: entity,
      weight: makeInterval(0, 0),
      confidence: makeInterval(0, 0),
      upstream: [],
      pruned_at: "depth-limit",
    });
    expect(node.pruned_at).toBe("depth-limit");
  });

  test("mergeIntervals combines intervals correctly", () => {
    const merged = mergeIntervals(
      makeInterval(0.1, 0.5),
      makeInterval(0.3, 0.7)
    );
    expect(merged.low).toBe(0.4);
    expect(merged.high).toBe(1.2);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/range.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/range.ts`**

Create:
```typescript
import type { CID, Interval } from "./common";
import { makeInterval } from "./common";

export interface CausalDAGNode {
  readonly entity_cid: CID;
  readonly weight: Interval;
  readonly confidence: Interval;
  readonly upstream: ReadonlyArray<CausalDAGNode>;
  readonly pruned_at?: string;
}

interface MakeCausalDAGNodeInput {
  entity_cid: CID;
  weight: Interval;
  confidence: Interval;
  upstream: ReadonlyArray<CausalDAGNode>;
  pruned_at?: string;
}

export function makeCausalDAGNode(input: MakeCausalDAGNodeInput): CausalDAGNode {
  return {
    entity_cid: input.entity_cid,
    weight: input.weight,
    confidence: input.confidence,
    upstream: input.upstream,
    ...(input.pruned_at !== undefined ? { pruned_at: input.pruned_at } : {}),
  };
}

export function mergeIntervals(a: Interval, b: Interval): Interval {
  return makeInterval(a.low + b.low, a.high + b.high);
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/range.test.ts && bun run typecheck`. Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/range.ts cpp-core/tests/types/range.test.ts
git commit -m "feat(types): add CausalDAGNode (range structure, layer A)"
```

---

## Task 9: EffectNode

**Files:**
- Create: `cpp-core/src/types/effect.ts`
- Create: `cpp-core/tests/types/effect.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/effect.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { makeEffectNode, makeAffectedEntity } from "../../src/types/effect";
import { makeValidity } from "../../src/types/validity";
import { makeInterval } from "../../src/types/common";
import { computeCID } from "../../src/cid";

describe("EffectNode", () => {
  test("constructs valid effect with affected entities", () => {
    const calcCID = computeCID({ type: "calculation" });
    const rangeCID = computeCID({ root: "merkle" });
    const entityCID = computeCID({ entity: "position-12" });

    const aff = makeAffectedEntity({
      entity_cid: entityCID,
      weight: makeInterval(-2.2, -1.8),
      confidence: makeInterval(0.8, 0.95),
      label: "must_change",
    });

    const effect = makeEffectNode({
      caused_by: calcCID,
      affects: [aff],
      range_root: rangeCID,
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });

    expect(effect.type).toBe("effect");
    expect(effect.affects.length).toBe(1);
    expect(effect.affects[0]!.label).toBe("must_change");
  });

  test("summary_cid is optional", () => {
    const calcCID = computeCID({ x: 1 });
    const rangeCID = computeCID({ y: 2 });
    const effect = makeEffectNode({
      caused_by: calcCID,
      affects: [],
      range_root: rangeCID,
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    expect(effect.summary_cid).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/effect.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/effect.ts`**

Create:
```typescript
import type { CID, Interval } from "./common";
import type { Validity } from "./validity";

export interface AffectedEntity {
  readonly entity_cid: CID;
  readonly weight: Interval;
  readonly confidence: Interval;
  readonly label?: string;
}

interface MakeAffectedEntityInput {
  entity_cid: CID;
  weight: Interval;
  confidence: Interval;
  label?: string;
}

export function makeAffectedEntity(input: MakeAffectedEntityInput): AffectedEntity {
  return {
    entity_cid: input.entity_cid,
    weight: input.weight,
    confidence: input.confidence,
    ...(input.label !== undefined ? { label: input.label } : {}),
  };
}

export interface EffectNode {
  readonly type: "effect";
  readonly caused_by: CID;
  readonly affects: ReadonlyArray<AffectedEntity>;
  readonly range_root: CID;
  readonly summary_cid?: CID;
  readonly validity: Validity;
}

interface MakeEffectNodeInput {
  caused_by: CID;
  affects: ReadonlyArray<AffectedEntity>;
  range_root: CID;
  summary_cid?: CID;
  validity: Validity;
}

export function makeEffectNode(input: MakeEffectNodeInput): EffectNode {
  return {
    type: "effect",
    caused_by: input.caused_by,
    affects: input.affects,
    range_root: input.range_root,
    ...(input.summary_cid !== undefined ? { summary_cid: input.summary_cid } : {}),
    validity: input.validity,
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/effect.test.ts && bun run typecheck`. Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/effect.ts cpp-core/tests/types/effect.test.ts
git commit -m "feat(types): add EffectNode and AffectedEntity"
```

---

## Task 10: did:key Identity Generation + Parsing

**Files:**
- Create: `cpp-core/src/identity/did-key.ts`
- Create: `cpp-core/tests/identity/did-key.test.ts`

`did:key` for Ed25519: `did:key:z` + base58btc of `0xed01` (multicodec varint for ed25519-pub) + 32-byte public key.

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/identity/did-key.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import {
  generateDIDKey,
  parseDIDKey,
} from "../../src/identity/did-key";

describe("did:key", () => {
  test("generates valid did:key with z6Mk prefix (Ed25519)", async () => {
    const { did } = await generateDIDKey();
    expect(did.startsWith("did:key:z6Mk")).toBe(true);
  });

  test("parses generated did:key back to same public key", async () => {
    const { did, publicKey } = await generateDIDKey();
    const parsed = parseDIDKey(did);
    expect(parsed).toEqual(publicKey);
  });

  test("rejects malformed did:key", () => {
    expect(() => parseDIDKey("did:key:zINVALID")).toThrow();
  });

  test("rejects non-did:key DIDs", () => {
    expect(() => parseDIDKey("did:web:example.com" as never)).toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/identity/did-key.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/identity/did-key.ts`**

Create:
```typescript
import * as ed from "@noble/ed25519";
import { base58btc } from "multiformats/bases/base58";
import type { DID } from "../types/common";

const ED25519_PUB_MULTICODEC = new Uint8Array([0xed, 0x01]);

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export interface DIDKeyPair {
  did: DID;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export async function generateDIDKey(): Promise<DIDKeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  const prefixed = concat(ED25519_PUB_MULTICODEC, publicKey);
  const encoded = base58btc.encode(prefixed);
  const did = `did:key:${encoded}` as DID;
  return { did, publicKey, privateKey };
}

export function parseDIDKey(did: DID | string): Uint8Array {
  if (!did.startsWith("did:key:")) {
    throw new Error(`Not a did:key DID: ${did}`);
  }
  const encoded = did.slice("did:key:".length);
  let decoded: Uint8Array;
  try {
    decoded = base58btc.decode(encoded);
  } catch (e) {
    throw new Error(`Invalid base58btc encoding in did:key: ${did}`);
  }
  if (
    decoded.length !== 34 ||
    decoded[0] !== 0xed ||
    decoded[1] !== 0x01
  ) {
    throw new Error(`Not an Ed25519 did:key (expected 0xed 0x01 prefix): ${did}`);
  }
  return decoded.slice(2);
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/identity/did-key.test.ts && bun run typecheck`. Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/identity/did-key.ts cpp-core/tests/identity/did-key.test.ts
git commit -m "feat(identity): add did:key generation and parsing (Ed25519)"
```

---

## Task 11: Ed25519 Sign + Verify

**Files:**
- Create: `cpp-core/src/identity/sign.ts`
- Create: `cpp-core/src/identity/verify.ts`
- Create: `cpp-core/tests/identity/sign-verify.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/identity/sign-verify.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { generateDIDKey } from "../../src/identity/did-key";
import { sign } from "../../src/identity/sign";
import { verify } from "../../src/identity/verify";

describe("sign + verify", () => {
  test("verifies a signature created by its keypair", async () => {
    const kp = await generateDIDKey();
    const msg = new TextEncoder().encode("hello world");
    const sig = await sign(msg, kp.privateKey);
    const ok = await verify(msg, sig, kp.did);
    expect(ok).toBe(true);
  });

  test("rejects tampered message", async () => {
    const kp = await generateDIDKey();
    const msg = new TextEncoder().encode("hello");
    const sig = await sign(msg, kp.privateKey);
    const tampered = new TextEncoder().encode("HELLO");
    const ok = await verify(tampered, sig, kp.did);
    expect(ok).toBe(false);
  });

  test("rejects signature from wrong key", async () => {
    const kpA = await generateDIDKey();
    const kpB = await generateDIDKey();
    const msg = new TextEncoder().encode("hi");
    const sig = await sign(msg, kpA.privateKey);
    const ok = await verify(msg, sig, kpB.did);
    expect(ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/identity/sign-verify.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/identity/sign.ts`**

Create:
```typescript
import * as ed from "@noble/ed25519";

export async function sign(
  message: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array> {
  return await ed.signAsync(message, privateKey);
}
```

- [ ] **Step 4: Implement `src/identity/verify.ts`**

Create:
```typescript
import * as ed from "@noble/ed25519";
import { parseDIDKey } from "./did-key";
import type { DID } from "../types/common";

export async function verify(
  message: Uint8Array,
  signature: Uint8Array,
  signerDID: DID
): Promise<boolean> {
  const publicKey = parseDIDKey(signerDID);
  try {
    return await ed.verifyAsync(signature, message, publicKey);
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `bun test tests/identity/sign-verify.test.ts && bun run typecheck`. Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add cpp-core/src/identity/sign.ts cpp-core/src/identity/verify.ts cpp-core/tests/identity/sign-verify.test.ts
git commit -m "feat(identity): add Ed25519 sign and verify"
```

---

## Task 12: SignedEnvelope Wrapper

**Files:**
- Create: `cpp-core/src/types/envelope.ts`
- Create: `cpp-core/tests/types/envelope.test.ts`

- [ ] **Step 1: Write failing test**

Create `cpp-core/tests/types/envelope.test.ts`:
```typescript
import { test, expect, describe } from "bun:test";
import { sealEnvelope, openEnvelope } from "../../src/types/envelope";
import { generateDIDKey } from "../../src/identity/did-key";
import { makeFactNode } from "../../src/types/fact";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("SignedEnvelope", () => {
  test("seals and opens a FactNode round-trip", async () => {
    const kp = await generateDIDKey();
    const payloadCID = computeCID({ data: "test" });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: kp.did, role: "test-agent" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });

    const env = await sealEnvelope(fact, kp);
    expect(env.signer_did).toBe(kp.did);
    expect(env.signature.length).toBe(64);

    const verified = await openEnvelope<typeof fact>(env);
    expect(verified.valid).toBe(true);
    expect(verified.payload.payload_cid.toString()).toBe(payloadCID.toString());
  });

  test("rejects tampered envelope", async () => {
    const kp = await generateDIDKey();
    const payloadCID = computeCID({ data: "original" });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: kp.did, role: "x" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const env = await sealEnvelope(fact, kp);

    const tamperedPayloadCID = computeCID({ data: "tampered" });
    const tamperedFact = makeFactNode({
      payload_cid: tamperedPayloadCID,
      source: { did: kp.did, role: "x" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const tamperedEnv = { ...env, payload: tamperedFact };

    const verified = await openEnvelope(tamperedEnv);
    expect(verified.valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/types/envelope.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement `src/types/envelope.ts`**

Create:
```typescript
import type { DID, ISO8601, Signature } from "./common";
import { encodeCanonical } from "../canonical";
import { sign } from "../identity/sign";
import { verify } from "../identity/verify";
import type { DIDKeyPair } from "../identity/did-key";

export interface SignedEnvelope<T> {
  readonly payload: T;
  readonly signer_did: DID;
  readonly signature: Signature;
  readonly signed_at: ISO8601;
}

export async function sealEnvelope<T>(
  payload: T,
  keypair: DIDKeyPair,
  signedAt: ISO8601 = new Date().toISOString()
): Promise<SignedEnvelope<T>> {
  const bytes = encodeCanonical({ payload, signed_at: signedAt });
  const signature = await sign(bytes, keypair.privateKey);
  return {
    payload,
    signer_did: keypair.did,
    signature,
    signed_at: signedAt,
  };
}

export interface OpenedEnvelope<T> {
  readonly valid: boolean;
  readonly payload: T;
  readonly signer_did: DID;
}

export async function openEnvelope<T>(
  env: SignedEnvelope<T>
): Promise<OpenedEnvelope<T>> {
  const bytes = encodeCanonical({ payload: env.payload, signed_at: env.signed_at });
  const valid = await verify(bytes, env.signature, env.signer_did);
  return { valid, payload: env.payload, signer_did: env.signer_did };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `bun test tests/types/envelope.test.ts && bun run typecheck`. Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add cpp-core/src/types/envelope.ts cpp-core/tests/types/envelope.test.ts
git commit -m "feat(types): add SignedEnvelope with seal/open round-trip"
```

---

## Task 13: Wire up `src/index.ts` Public API

**Files:**
- Modify: `cpp-core/src/index.ts`

- [ ] **Step 1: Write integration test for public exports**

Create `cpp-core/tests/api.test.ts`:
```typescript
import { test, expect } from "bun:test";
import * as cpp from "../src/index";

test("public API exposes core symbols", () => {
  expect(typeof cpp.makeFactNode).toBe("function");
  expect(typeof cpp.makeRuleNode).toBe("function");
  expect(typeof cpp.makeCalculationActivity).toBe("function");
  expect(typeof cpp.makeEffectNode).toBe("function");
  expect(typeof cpp.makeValidity).toBe("function");
  expect(typeof cpp.makeInterval).toBe("function");
  expect(typeof cpp.makeCausalDAGNode).toBe("function");
  expect(typeof cpp.computeCID).toBe("function");
  expect(typeof cpp.encodeCanonical).toBe("function");
  expect(typeof cpp.generateDIDKey).toBe("function");
  expect(typeof cpp.sealEnvelope).toBe("function");
  expect(typeof cpp.openEnvelope).toBe("function");
  expect(cpp.TrustTier.Tier1).toBe("tier-1-cache");
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `bun test tests/api.test.ts`. Expected: FAIL.

- [ ] **Step 3: Replace `src/index.ts`**

Replace contents:
```typescript
export const version = "0.1.0";

export { encodeCanonical, decodeCanonical } from "./canonical";
export { computeCID, cidToString, cidFromString } from "./cid";

export type { CID, DID, Signature, ISO8601, Interval, AgentRef } from "./types/common";
export { makeInterval } from "./types/common";

export type { Validity } from "./types/validity";
export { makeValidity, isExpired } from "./types/validity";

export type { FactNode } from "./types/fact";
export { makeFactNode } from "./types/fact";

export type { RuleNode } from "./types/rule";
export { makeRuleNode } from "./types/rule";

export type {
  CalculationActivity,
  ToolCall,
  ModelRef,
} from "./types/calculation";
export {
  makeCalculationActivity,
  makeToolCall,
  TrustTier,
} from "./types/calculation";

export type { EffectNode, AffectedEntity } from "./types/effect";
export { makeEffectNode, makeAffectedEntity } from "./types/effect";

export type { CausalDAGNode } from "./types/range";
export { makeCausalDAGNode, mergeIntervals } from "./types/range";

export type { SignedEnvelope, OpenedEnvelope } from "./types/envelope";
export { sealEnvelope, openEnvelope } from "./types/envelope";

export type { DIDKeyPair } from "./identity/did-key";
export { generateDIDKey, parseDIDKey } from "./identity/did-key";
export { sign } from "./identity/sign";
export { verify } from "./identity/verify";
```

- [ ] **Step 4: Update sanity test**

Replace `cpp-core/tests/sanity.test.ts`:
```typescript
import { test, expect } from "bun:test";
import { version } from "../src/index";

test("library exports version", () => {
  expect(version).toBe("0.1.0");
});
```

- [ ] **Step 5: Run all tests, verify pass**

Run: `bun test && bun run typecheck`. Expected: all tests pass, typecheck clean.

- [ ] **Step 6: Commit**

```bash
git add cpp-core/src/index.ts cpp-core/tests/api.test.ts cpp-core/tests/sanity.test.ts
git commit -m "feat: wire public API exports in index.ts (v0.1.0)"
```

---

## Task 14: End-to-End ADR Scenario (ROX.ONE-Like)

This task simulates the ROX.ONE scenario from spec §3.2 end-to-end inside one test: developer signs an ADR fact, agent runs a calculation with tool_calls, produces an effect with range structure, envelope is sealed and verified by a third party.

**Files:**
- Create: `cpp-core/tests/integration/adr-scenario.test.ts`

- [ ] **Step 1: Write end-to-end integration test**

Create `cpp-core/tests/integration/adr-scenario.test.ts`:
```typescript
import { test, expect } from "bun:test";
import {
  generateDIDKey,
  computeCID,
  makeFactNode,
  makeRuleNode,
  makeCalculationActivity,
  makeToolCall,
  makeEffectNode,
  makeAffectedEntity,
  makeCausalDAGNode,
  makeValidity,
  makeInterval,
  sealEnvelope,
  openEnvelope,
  TrustTier,
} from "../../src/index";

test("end-to-end ROX.ONE ADR scenario", async () => {
  const developer = await generateDIDKey();
  const reviewerBot = await generateDIDKey();

  // 1. Developer authors an ADR (Fact)
  const adrBodyCID = computeCID({
    title: "Switch IPC from .send to .invoke",
    rationale: "Avoid races at quit time",
  });
  const adrFact = makeFactNode({
    payload_cid: adrBodyCID,
    source: { did: developer.did, role: "human:developer" },
    timestamp: "2026-05-21T13:00:00Z",
    validity: makeValidity({ valid_from: "2026-05-21T13:00:00Z" }),
  });
  const signedFact = await sealEnvelope(adrFact, developer);

  // 2. Rule: "Use ipcRenderer.invoke not .send"
  const ruleExprCID = computeCID({ pattern: "ipcRenderer.send", replacement: "ipcRenderer.invoke" });
  const rule = makeRuleNode({
    expression_cid: ruleExprCID,
    version: "1.0.0",
    authority: { did: developer.did, role: "team-lead" },
    applicable_to: ["typescript", "electron"],
    validity: makeValidity({ valid_from: "2026-05-21T13:00:00Z" }),
  });
  const signedRule = await sealEnvelope(rule, developer);

  // 3. Reviewer-bot runs a calculation: grep for usages, plan refactor scope
  const grepArgsCID = computeCID({ pattern: "ipcRenderer.send" });
  const grepResultCID = computeCID({
    matches: ["src/main/ipc/window.ts", "src/main/ipc/menu.ts", "src/renderer/api.ts"],
  });
  const grepCall = makeToolCall({
    name: "grep",
    args_cid: grepArgsCID,
    result_cid: grepResultCID,
    started_at: "2026-05-21T13:15:00Z",
    finished_at: "2026-05-21T13:15:00Z",
  });

  const factCID = computeCID(adrFact);
  const ruleCID = computeCID(rule);
  const modelCID = computeCID({ model: "claude-opus-4.7" });

  const calc = makeCalculationActivity({
    inputs: [factCID],
    rules: [ruleCID],
    model: {
      model_cid: modelCID,
      display_name: "claude-opus-4.7",
      params: { temperature: 0 },
    },
    tool_calls: [grepCall],
    outputs: [],
    tier: TrustTier.Tier1,
    started_at: "2026-05-21T13:15:00Z",
    finished_at: "2026-05-21T13:16:00Z",
  });
  const signedCalc = await sealEnvelope(calc, reviewerBot);

  // 4. Effect: refactor scope with affected files
  const file1CID = computeCID({ path: "src/main/ipc/window.ts" });
  const file2CID = computeCID({ path: "src/main/ipc/menu.ts" });

  const dagLeaf1 = makeCausalDAGNode({
    entity_cid: file1CID,
    weight: makeInterval(1, 1),
    confidence: makeInterval(1, 1),
    upstream: [],
  });
  const dagLeaf2 = makeCausalDAGNode({
    entity_cid: file2CID,
    weight: makeInterval(1, 1),
    confidence: makeInterval(1, 1),
    upstream: [],
  });
  const rangeRootCID = computeCID({ root: [dagLeaf1, dagLeaf2] });

  const calcCID = computeCID(calc);
  const effect = makeEffectNode({
    caused_by: calcCID,
    affects: [
      makeAffectedEntity({
        entity_cid: file1CID,
        weight: makeInterval(1, 1),
        confidence: makeInterval(0.9, 1.0),
        label: "must_change",
      }),
      makeAffectedEntity({
        entity_cid: file2CID,
        weight: makeInterval(1, 1),
        confidence: makeInterval(0.9, 1.0),
        label: "must_change",
      }),
    ],
    range_root: rangeRootCID,
    validity: makeValidity({ valid_from: "2026-05-21T13:16:00Z" }),
  });
  const signedEffect = await sealEnvelope(effect, reviewerBot);

  // 5. A third party verifies the chain
  const factOpened = await openEnvelope(signedFact);
  const ruleOpened = await openEnvelope(signedRule);
  const calcOpened = await openEnvelope(signedCalc);
  const effectOpened = await openEnvelope(signedEffect);

  expect(factOpened.valid).toBe(true);
  expect(ruleOpened.valid).toBe(true);
  expect(calcOpened.valid).toBe(true);
  expect(effectOpened.valid).toBe(true);

  // 6. The Effect references the Calculation, which references the Fact and Rule
  expect(effectOpened.payload.caused_by.toString()).toBe(calcCID.toString());
  expect(calcOpened.payload.inputs[0]!.toString()).toBe(factCID.toString());
  expect(calcOpened.payload.rules[0]!.toString()).toBe(ruleCID.toString());

  // 7. Cache property: two CIDs of the same Fact match (dedup baseline)
  const factCID2 = computeCID(adrFact);
  expect(factCID.toString()).toBe(factCID2.toString());
});
```

- [ ] **Step 2: Run test, verify pass**

Run: `bun test tests/integration/adr-scenario.test.ts`. Expected: PASS.

- [ ] **Step 3: Run full test suite**

Run:
```bash
bun test
bun run typecheck
```

Expected: all tests pass, typecheck clean.

- [ ] **Step 4: Commit**

```bash
git add cpp-core/tests/integration/adr-scenario.test.ts
git commit -m "test(integration): end-to-end ROX.ONE ADR scenario"
```

---

## Task 15: README + v0.1.0 Tag

**Files:**
- Create: `cpp-core/README.md`
- Modify: `cpp-core/package.json` (version bump already done in Task 13's index.ts but bump here too)

- [ ] **Step 1: Write README**

Create `cpp-core/README.md`:
```markdown
# cpp-core

Reference TypeScript implementation of the **Context Provenance Protocol (CPP)** core types.

Sprint 0+1 deliverable: typed nodes (Fact / Rule / Calculation / Effect), canonical DAG-CBOR encoding, CID computation, did:key identity, Ed25519 signatures, and SignedEnvelope wrapper.

**Status:** v0.1.0 — Core types library. No storage, no MCP server yet (those are Sprint 2 and Sprint 3).

## Install

\`\`\`bash
bun install
\`\`\`

## Run tests

\`\`\`bash
bun test
\`\`\`

## Quickstart

\`\`\`typescript
import {
  generateDIDKey,
  computeCID,
  makeFactNode,
  makeValidity,
  sealEnvelope,
  openEnvelope,
} from "cpp-core";

const alice = await generateDIDKey();
const payloadCID = computeCID({ price: 100 });

const fact = makeFactNode({
  payload_cid: payloadCID,
  source: { did: alice.did, role: "trader" },
  timestamp: "2026-05-21T13:30:00Z",
  validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
});

const signed = await sealEnvelope(fact, alice);
const verified = await openEnvelope(signed);
console.log(verified.valid); // true
\`\`\`

## Spec

Full design at \`docs/superpowers/specs/2026-05-21-context-provenance-protocol-design.md\`.

## License

TBD.
\`\`\`

- [ ] **Step 2: Bump version in package.json**

Modify `cpp-core/package.json`: change `"version": "0.0.1"` to `"version": "0.1.0"`.

- [ ] **Step 3: Run full test suite once more**

Run:
```bash
bun test
bun run typecheck
```

Expected: all tests pass.

- [ ] **Step 4: Commit + tag**

```bash
git add cpp-core/README.md cpp-core/package.json
git commit -m "chore: release cpp-core v0.1.0"
git tag -a cpp-core-v0.1.0 -m "cpp-core v0.1.0 — Sprint 0+1 core types library"
```

---

## Done Criteria

Sprint 0+1 is complete when:

- [ ] All 15 tasks above are completed and committed
- [ ] `bun test` reports all green (~30 tests total)
- [ ] `bun run typecheck` reports zero errors
- [ ] Public API in `src/index.ts` exposes all documented symbols
- [ ] End-to-end ADR scenario test (Task 14) passes
- [ ] v0.1.0 git tag exists

## Next Plans (out of scope here, future plan docs)

- **Sprint 2** — Storage + Resolver + supersession logic (file-backed CID storage; query by CID; stale-fact detection)
- **Sprint 3** — MCP server with `mcp://provenance/*` URI scheme; subscriptions; annotations
- **Sprint 4** — Integration tests against real ROX.ONE harness; measure dedup hit rate
- **Sprint 5** — Documentation, npm publish, CLI tooling

---

## Self-Review Notes

**Spec coverage (MVP layers per spec §5):**
- ✅ A (Range structure) — Task 8 (CausalDAGNode)
- ✅ B (Semantic graph) — Tasks 5-9 (Fact/Rule/Calculation/Effect)
- ✅ C-Tier-1 (content-addressing) — Tasks 2-3 (canonical + CID)
- ❌ D-basic (surface layer) — **not in this plan**; deferred to Sprint 3 (MCP server). Justified because D-basic surface = MCP integration, which is its own subsystem.
- ✅ E (Temporal) — Task 4 (Validity)
- ✅ F-basic (Governance) — Tasks 10-12 (did:key + Ed25519 + SignedEnvelope)

**Adjusted scope:** Sprint 0+1 originally aimed at A+B+C-tier-1+E+F-basic. D-basic moved to Sprint 3 because it's surface/integration, not core. This is a refinement of spec §12 which listed all of Sprint 1 under "Core types".

**Type consistency check:** All factory functions named `make<TypeName>`. All types use `readonly` and `ReadonlyArray`. All optional fields conditionally spread to avoid `undefined` ambiguity under `exactOptionalPropertyTypes`. Naming consistent across Tasks 5-12.
