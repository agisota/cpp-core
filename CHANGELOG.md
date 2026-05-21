# Changelog

All notable changes to cpp-core. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning per [SemVer](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc.1] — 2026-05-21

Release candidate. Tier-1 MVP scope is feature-complete; gathering review feedback before final 1.0.0.

### Scope of v1.0
- ✅ Core typed nodes: FactNode, RuleNode, CalculationActivity, EffectNode, AffectedEntity, ToolCall, ModelRef, CausalDAGNode, Validity, SignedEnvelope
- ✅ Canonical DAG-CBOR encoding + CIDv1 (SHA-256 multihash)
- ✅ did:key (Ed25519) identity + sign/verify
- ✅ SignedEnvelope seal/open round-trip with tamper detection
- ✅ Storage abstraction with MemoryStorage + FilesystemStorage implementations
- ✅ Type-aware Resolver + per-node-type helpers
- ✅ Supersession chain follower with cycle detection
- ✅ Stale-fact detection (isExpired + superseded check)
- ✅ MCP `mcp://provenance/<type>/<cid>` URI scheme parser/builder
- ✅ CPP-node-to-MCP-Resource converter with annotations
- ✅ Pure-handler CppMcpServer (handleListResources + handleReadResource)

### Explicit non-goals for v1.0 (deferred to v2.x)
- MCP JSON-RPC transport (stdio / HTTP / WebSocket) and subscriptions
- Trust Tier 2 (N-of-M consensus + TEE attestation)
- Trust Tier 3 (zkML proofs)
- Privacy layer (encryption, capability tokens, selective disclosure)
- Federation / discovery / pinning incentives
- Higher-level workflows (event sourcing, replay, conflict resolution)

## [0.3.0-scaffold.1] — 2026-05-21

### Added
- MCP integration scaffold: `mcp://provenance/<type>/<cid>` URI parser/builder, `buildResource` converter (CPP node → MCP Resource shape), `CppMcpServer` class with pure `handleListResources` and `handleReadResource` handlers.
- No JSON-RPC transport — caller wraps handlers in their preferred transport (stdio, HTTP, etc.).

## [0.2.0] — 2026-05-21

### Added
- `Storage` interface with `put` / `get` / `has`.
- `MemoryStorage` (Map-backed) and `FilesystemStorage` (one `.bin` file per CID) implementations.
- `Resolver` with type-aware `resolveFact` / `resolveRule` / `resolveCalculation` / `resolveEffect`; throws `ResolverTypeMismatchError` on type mismatch.
- `followSupersession` chain walker with cycle detection and `MAX_SUPERSESSION_DEPTH=1000` guard.
- `isStale` predicate combining `superseded_by` presence and `valid_until` expiry.

## [0.1.2] — 2026-05-21

### Added
- `makeConfidence(low, high)` factory with [0, 1] range guard for probability intervals.
- Test for `cidFromString` error path.
- JSDoc on `sealEnvelope` documenting the `signedAt` default and timestamp-replay protection.

## [0.1.1] — 2026-05-21

### Added
- ISO8601 validation in `makeFactNode.timestamp`.
- `readonly` on `DIDKeyPair` fields.
- JSDoc on `mergeIntervals` clarifying additive (non-clamping) semantics.

## [0.1.0] — 2026-05-21

### Added
- Initial release: typed nodes (Fact / Rule / Calculation / Effect / Validity / Range / SignedEnvelope), canonical DAG-CBOR, CIDv1 (SHA-256), did:key Ed25519 identity, sign/verify, SignedEnvelope round-trip.
- 39 unit tests + 1 end-to-end integration test (ROX.ONE-like ADR scenario).
- Reference design document and implementation plan.

[1.0.0-rc.1]: https://github.com/agisota/cpp-core/releases/tag/cpp-core-v1.0.0-rc.1
[0.3.0-scaffold.1]: https://github.com/agisota/cpp-core/releases/tag/cpp-core-v0.3.0-scaffold.1
[0.2.0]: https://github.com/agisota/cpp-core/releases/tag/cpp-core-v0.2.0
[0.1.2]: https://github.com/agisota/cpp-core/releases/tag/cpp-core-v0.1.2
[0.1.1]: https://github.com/agisota/cpp-core/releases/tag/cpp-core-v0.1.1
[0.1.0]: https://github.com/agisota/cpp-core/releases/tag/cpp-core-v0.1.0
