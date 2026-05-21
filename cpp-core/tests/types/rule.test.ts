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
