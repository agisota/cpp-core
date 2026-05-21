# Context Provenance Protocol (CPP)

[![CI](https://github.com/agisota/cpp-core/actions/workflows/test.yml/badge.svg)](https://github.com/agisota/cpp-core/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue.svg)](./CHANGELOG.md)

Content-addressed serialization protocol for LLM and agentic harnesses.
Allows multi-agent / multi-user systems to share, verify, and dedup context
through cryptographic content addressing instead of text-blob duplication.

## Status

**v1.0.0-rc.1** — Tier-1 MVP scope is feature-complete: core types, content-addressing, signatures, storage, resolver, supersession, and MCP-scaffold. Release candidate; gathering review feedback before final 1.0.0.

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

## Repository Layout

- [`cpp-core/`](./cpp-core/) — TypeScript reference implementation (Bun + IPLD + did:key + Ed25519)
- [`2026-05-21-context-provenance-protocol-design.md`](./2026-05-21-context-provenance-protocol-design.md) — full design spec (9-layer stack, MVP scope, post-MVP roadmap)
- [`plans/`](./plans/) — sprint-by-sprint implementation plans

## Quickstart

```bash
cd cpp-core
bun install
bun test
```

## What CPP Solves

Agentic harnesses today send full text-blob context on every turn. CPP introduces a content-addressed protocol where:

- **Facts, Rules, Calculations, and Effects** are typed semantic graph nodes with stable CIDs.
- **Dedup is automatic** — identical content has identical CIDs across users, sessions, and harnesses.
- **Provenance is verifiable** — Ed25519 signatures via did:key on each node prove authorship and integrity.
- **MCP-compatible** — designed to integrate with existing harnesses via `mcp://provenance/<cid>` URIs.

See the [design spec](./2026-05-21-context-provenance-protocol-design.md) for the full architecture and use cases (finance, ROX.ONE multi-agent, medical diagnostic AI).

## Roadmap

- ✅ **Sprint 0+1 (v0.1.x)** — Core types, canonical DAG-CBOR encoding, CIDv1, did:key + Ed25519, SignedEnvelope
- ✅ **Sprint 2 (v0.2.0)** — Storage abstraction (memory + filesystem), Resolver, supersession chain walker, stale-fact detection
- ✅ **Sprint 3 scaffold (v0.3.0-scaffold.1)** — MCP URI scheme, Resource shape, pure-handler server stub
- 🎯 **v1.0.0-rc.1** — Release candidate for Tier-1 MVP
- 🚧 **Sprint 3 proper (v1.1.x)** — JSON-RPC transport (stdio / HTTP), MCP subscriptions, ROX.ONE harness integration
- 📋 **v2.0+** — Trust Tier 2 (N-of-M consensus + TEE), Trust Tier 3 (zkML), Privacy layer (encryption + capability tokens), Federation

## License

MIT — see [LICENSE](./LICENSE).
