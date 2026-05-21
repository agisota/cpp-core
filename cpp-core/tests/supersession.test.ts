import { test, expect, describe } from "bun:test";
import { MemoryStorage } from "../src/storage/memory";
import { Resolver } from "../src/storage/resolver";
import { followSupersession, isStale, SupersessionCycleError } from "../src/supersession";
import { makeFactNode } from "../src/types/fact";
import { makeValidity } from "../src/types/validity";
import { computeCID } from "../src/cid";
import type { FactNode } from "../src/types/fact";
import type { CID } from "../src/types/common";

describe("followSupersession", () => {
  test("returns the node itself if not superseded", async () => {
    const storage = new MemoryStorage();
    const r = new Resolver(storage);
    const payloadCID = computeCID({ v: 1 });
    const fact: FactNode = makeFactNode({
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const cid = await storage.put(fact);
    const final = await followSupersession(cid, (id: CID) => r.resolveFact(id));
    expect(final).not.toBeNull();
    expect(final!.source.role).toBe("x");
  });

  test("follows chain of supersession to the tip", async () => {
    const storage = new MemoryStorage();
    const r = new Resolver(storage);

    // v3 (tip) — no superseded_by
    const v3 = makeFactNode({
      payload_cid: computeCID({ v: 3 }),
      source: { did: "did:key:z6MkA", role: "v3" },
      timestamp: "2026-05-21T03:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T03:00:00Z" }),
    });
    const cid_v3 = await storage.put(v3);

    // v2 — superseded_by v3
    const v2 = makeFactNode({
      payload_cid: computeCID({ v: 2 }),
      source: { did: "did:key:z6MkA", role: "v2" },
      timestamp: "2026-05-21T02:00:00Z",
      validity: makeValidity({
        valid_from: "2026-05-21T02:00:00Z",
        superseded_by: cid_v3,
      }),
    });
    const cid_v2 = await storage.put(v2);

    // v1 — superseded_by v2
    const v1 = makeFactNode({
      payload_cid: computeCID({ v: 1 }),
      source: { did: "did:key:z6MkA", role: "v1" },
      timestamp: "2026-05-21T01:00:00Z",
      validity: makeValidity({
        valid_from: "2026-05-21T01:00:00Z",
        superseded_by: cid_v2,
      }),
    });
    const cid_v1 = await storage.put(v1);

    // Follow from v1 to v3
    const final = await followSupersession(cid_v1, (id: CID) => r.resolveFact(id));
    expect(final?.source.role).toBe("v3");
  });

  test("returns null when the start CID is unknown", async () => {
    const r = new Resolver(new MemoryStorage());
    const unknownCID = computeCID({ never: "stored" });
    const final = await followSupersession(unknownCID, (id: CID) => r.resolveFact(id));
    expect(final).toBeNull();
  });

  test("throws SupersessionCycleError on simple cycle", async () => {
    // Cycle is hard to construct legitimately because superseded_by must reference
    // an existing CID. We simulate a "broken store" by manually constructing the cycle.
    // Use a resolver mock that returns nodes pointing to themselves.
    const fakeCID = computeCID({ cycle: 1 });
    const fact = makeFactNode({
      payload_cid: computeCID({ v: 1 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({
        valid_from: "2026-05-21T00:00:00Z",
        superseded_by: fakeCID,
      }),
    });
    const cycleResolveFn = async (_cid: CID) => fact;

    await expect(
      followSupersession(fakeCID, cycleResolveFn)
    ).rejects.toThrow(SupersessionCycleError);
  });
});

describe("isStale", () => {
  test("returns false for fresh, unsuperseded node", () => {
    const fact = makeFactNode({
      payload_cid: computeCID({ v: 1 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    expect(isStale(fact, new Date("2026-05-21T01:00:00Z"))).toBe(false);
  });

  test("returns true when superseded_by is set", () => {
    const fact = makeFactNode({
      payload_cid: computeCID({ v: 1 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({
        valid_from: "2026-05-21T00:00:00Z",
        superseded_by: computeCID({ next: true }),
      }),
    });
    expect(isStale(fact, new Date("2026-05-21T01:00:00Z"))).toBe(true);
  });

  test("returns true when valid_until is in the past", () => {
    const fact = makeFactNode({
      payload_cid: computeCID({ v: 1 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({
        valid_from: "2026-05-21T00:00:00Z",
        valid_until: "2026-05-21T01:00:00Z",
      }),
    });
    expect(isStale(fact, new Date("2026-05-21T02:00:00Z"))).toBe(true);
  });
});
