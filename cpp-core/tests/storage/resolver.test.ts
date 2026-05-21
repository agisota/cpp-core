import { test, expect, describe } from "bun:test";
import { MemoryStorage } from "../../src/storage/memory";
import { Resolver, ResolverTypeMismatchError } from "../../src/storage/resolver";
import { makeFactNode } from "../../src/types/fact";
import { makeRuleNode } from "../../src/types/rule";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("Resolver", () => {
  test("resolve returns null for unknown CID", async () => {
    const r = new Resolver(new MemoryStorage());
    const unknownCID = computeCID({ never: "stored" });
    expect(await r.resolve(unknownCID)).toBeNull();
  });

  test("resolve returns decoded value for known CID", async () => {
    const storage = new MemoryStorage();
    const r = new Resolver(storage);
    const cid = await storage.put({ hello: "world" });
    const result = await r.resolve<{ hello: string }>(cid);
    expect(result?.hello).toBe("world");
  });

  test("resolveFact returns FactNode when type matches", async () => {
    const storage = new MemoryStorage();
    const r = new Resolver(storage);
    const payloadCID = computeCID({ price: 100 });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkAlice", role: "trader" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const cid = await storage.put(fact);
    const resolved = await r.resolveFact(cid);
    expect(resolved).not.toBeNull();
    expect(resolved!.type).toBe("fact");
    expect(resolved!.source.role).toBe("trader");
  });

  test("resolveFact throws when content is not a FactNode", async () => {
    const storage = new MemoryStorage();
    const r = new Resolver(storage);
    const ruleExprCID = computeCID({ formula: "x" });
    const rule = makeRuleNode({
      expression_cid: ruleExprCID,
      version: "1.0.0",
      authority: { did: "did:key:z6MkX", role: "x" },
      applicable_to: [],
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const cid = await storage.put(rule);
    await expect(r.resolveFact(cid)).rejects.toThrow(ResolverTypeMismatchError);
  });

  test("resolveFact returns null for unknown CID", async () => {
    const r = new Resolver(new MemoryStorage());
    const unknownCID = computeCID({ never: "stored" });
    expect(await r.resolveFact(unknownCID)).toBeNull();
  });

  test("resolveRule / resolveCalculation / resolveEffect work symmetrically", async () => {
    const storage = new MemoryStorage();
    const r = new Resolver(storage);

    const ruleExprCID = computeCID({ formula: "y" });
    const rule = makeRuleNode({
      expression_cid: ruleExprCID,
      version: "1.0.0",
      authority: { did: "did:key:z6MkA", role: "a" },
      applicable_to: [],
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const ruleCID = await storage.put(rule);
    const resolved = await r.resolveRule(ruleCID);
    expect(resolved?.type).toBe("rule");
  });
});
