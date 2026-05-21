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
  expect(cpp.TrustTier.Tier1 as string).toBe("tier-1-cache");
});
