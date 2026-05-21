import { test, expect, describe } from "bun:test";
import { makeValidity, isExpired, type Validity } from "../../src/types/validity";

describe("Validity", () => {
  test("constructs minimal validity with from-only", () => {
    const v: Validity = makeValidity({ valid_from: "2026-05-21T00:00:00Z" });
    expect(v.valid_from).toBe("2026-05-21T00:00:00Z");
    expect(v.valid_until).toBeUndefined();
    expect(v.supersedes).toEqual([]);
  });

  test("rejects invalid ISO8601", () => {
    expect(() =>
      makeValidity({ valid_from: "not-a-date" })
    ).toThrow();
  });

  test("rejects valid_until before valid_from", () => {
    expect(() =>
      makeValidity({
        valid_from: "2026-05-21T10:00:00Z",
        valid_until: "2026-05-20T10:00:00Z",
      })
    ).toThrow();
  });

  test("isExpired returns true when now > valid_until", () => {
    const v = makeValidity({
      valid_from: "2026-05-20T00:00:00Z",
      valid_until: "2026-05-20T01:00:00Z",
    });
    expect(isExpired(v, new Date("2026-05-20T02:00:00Z"))).toBe(true);
  });

  test("isExpired returns false when valid_until is undefined", () => {
    const v = makeValidity({ valid_from: "2026-05-20T00:00:00Z" });
    expect(isExpired(v, new Date("2030-01-01T00:00:00Z"))).toBe(false);
  });
});
