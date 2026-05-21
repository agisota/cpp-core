import { test, expect, describe } from "bun:test";
import { makeInterval, makeConfidence, type Interval } from "../../src/types/common";

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

describe("Confidence", () => {
  test("accepts valid [0,1] confidence interval", () => {
    const c = makeConfidence(0.1, 0.9);
    expect(c.low).toBe(0.1);
    expect(c.high).toBe(0.9);
  });

  test("rejects negative low", () => {
    expect(() => makeConfidence(-0.1, 0.5)).toThrow();
  });

  test("rejects high above 1.0", () => {
    expect(() => makeConfidence(0.5, 1.5)).toThrow();
  });

  test("accepts edge values 0 and 1", () => {
    const c = makeConfidence(0, 1);
    expect(c.low).toBe(0);
    expect(c.high).toBe(1);
  });
});
