# cpp-core

Reference TypeScript implementation of the **Context Provenance Protocol (CPP)** core types.

Sprint 0+1 deliverable: typed nodes (Fact / Rule / Calculation / Effect), canonical DAG-CBOR encoding, CID computation, did:key identity, Ed25519 signatures, and SignedEnvelope wrapper.

**Status:** v1.0.0-rc.1 — Tier-1 MVP release candidate. Tier 2/3 (consensus, zkML), MCP transport, and privacy layer are post-v1.

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

## Storage + Resolver

```typescript
import { FilesystemStorage, Resolver } from "cpp-core";

const storage = new FilesystemStorage("/var/lib/cpp/store");
const resolver = new Resolver(storage);

const factCID = await storage.put(myFact);     // canonical CID, idempotent
const sameFact = await resolver.resolveFact(factCID);
```

## MCP Integration (Sprint 3 scaffold)

```typescript
import { CppMcpServer, MemoryStorage, Resolver, buildProvenanceURI } from "cpp-core";

const storage = new MemoryStorage();
const resolver = new Resolver(storage);
const factCID = await storage.put(myFact);

const server = new CppMcpServer({
  resolver,
  catalog: [{ type: "fact", cid: factCID }],
});

const list = await server.handleListResources();
const content = await server.handleReadResource(buildProvenanceURI({ type: "fact", cid: factCID }));
```

Note: Sprint 3 scaffold ships only the protocol primitives (URI scheme, Resource shape, pure handler methods). The full server with JSON-RPC transport and subscriptions is the next sprint.

## Spec

Full design at [`../2026-05-21-context-provenance-protocol-design.md`](../2026-05-21-context-provenance-protocol-design.md).

## License

MIT — see [LICENSE](../LICENSE).
