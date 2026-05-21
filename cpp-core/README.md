# cpp-core

Reference TypeScript implementation of the **Context Provenance Protocol (CPP)** core types.

Sprint 0+1 deliverable: typed nodes (Fact / Rule / Calculation / Effect), canonical DAG-CBOR encoding, CID computation, did:key identity, Ed25519 signatures, and SignedEnvelope wrapper.

**Status:** v0.1.0 — Core types library. No storage, no MCP server yet (those are Sprint 2 and Sprint 3).

## Install

```bash
bun install
```

## Run tests

```bash
bun test
```

## Quickstart

```typescript
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
```

## Spec

Full design at [`../2026-05-21-context-provenance-protocol-design.md`](../2026-05-21-context-provenance-protocol-design.md).

## License

MIT — see [LICENSE](../LICENSE).
