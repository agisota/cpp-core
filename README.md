# Context Provenance Protocol (CPP)

Content-addressed serialization protocol for LLM and agentic harnesses.
Allows multi-agent / multi-user systems to share, verify, and dedup context
through cryptographic content addressing instead of text-blob duplication.

## Status

**v0.1.2** — Sprint 0+1 complete. Core types library shipped.

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

- ✅ **Sprint 0+1 (v0.1.x)** — Core types, DAG-CBOR canonical encoding, CID, did:key, SignedEnvelope
- 🚧 **Sprint 2** — Storage + Resolver + supersession runtime
- 📋 **Sprint 3** — MCP server with `mcp://provenance/*` URI scheme
- 📋 **Sprint 4** — Integration with ROX.ONE agentic harness
- 📋 **Sprint 5** — Polish, npm publish, CLI tooling

## License

MIT — see [LICENSE](./LICENSE).
