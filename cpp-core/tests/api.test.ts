import { test, expect } from "bun:test";
import * as cpp from "../src/index";

test("public API exposes core symbols", () => {
  expect(typeof cpp.makeFactNode).toBe("function");
  expect(typeof cpp.makeRuleNode).toBe("function");
  expect(typeof cpp.makeCalculationActivity).toBe("function");
  expect(typeof cpp.makeEffectNode).toBe("function");
  expect(typeof cpp.makeValidity).toBe("function");
  expect(typeof cpp.makeInterval).toBe("function");
  expect(typeof cpp.makeConfidence).toBe("function");
  expect(typeof cpp.makeCausalDAGNode).toBe("function");
  expect(typeof cpp.computeCID).toBe("function");
  expect(typeof cpp.encodeCanonical).toBe("function");
  expect(typeof cpp.generateDIDKey).toBe("function");
  expect(typeof cpp.sealEnvelope).toBe("function");
  expect(typeof cpp.openEnvelope).toBe("function");
  expect(cpp.TrustTier.Tier1 as string).toBe("tier-1-cache");

  // Sprint 2 additions
  expect(typeof cpp.MemoryStorage).toBe("function");
  expect(typeof cpp.FilesystemStorage).toBe("function");
  expect(typeof cpp.Resolver).toBe("function");
  expect(typeof cpp.followSupersession).toBe("function");
  expect(typeof cpp.isStale).toBe("function");
  expect(typeof cpp.StorageNotFoundError).toBe("function");
  expect(typeof cpp.StorageIntegrityError).toBe("function");
  expect(typeof cpp.ResolverTypeMismatchError).toBe("function");
  expect(typeof cpp.SupersessionCycleError).toBe("function");
});
