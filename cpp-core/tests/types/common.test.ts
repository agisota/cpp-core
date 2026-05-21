import { test, expect, describe } from "bun:test";
import { makeInterval, type Interval } from "../../src/types/common";

describe("Interval", () => {
  test("constructs valid interval with low <= high", () => {
    const i: Interval = makeInterval(0.1, 0.5);
    expect(i.low).toBe(0.1);
    expect(i.high).toBe(0.5);
  });

  test("rejects interval with low > high", () => {
    expect(() => makeInterval(0.5, 0.1)).toThrow();
  });

  test("accepts degenerate interval (low === high)", () => {
    const i = makeInterval(0.3, 0.3);
    expect(i.low).toBe(0.3);
    expect(i.high).toBe(0.3);
  });
});
