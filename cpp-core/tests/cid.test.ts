import { test, expect, describe } from "bun:test";
import { computeCID, cidToString, cidFromString } from "../src/cid";

describe("CID computation", () => {
  test("computes deterministic CID for identical input", () => {
    const obj = { foo: 1, bar: "baz" };
    const cidA = computeCID(obj);
    const cidB = computeCID(obj);
    expect(cidToString(cidA)).toBe(cidToString(cidB));
  });

  test("produces different CIDs for different inputs", () => {
    const cid1 = computeCID({ x: 1 });
    const cid2 = computeCID({ x: 2 });
    expect(cidToString(cid1)).not.toBe(cidToString(cid2));
  });

  test("CID round-trips through string form", () => {
    const original = computeCID({ hello: "world" });
    const asString = cidToString(original);
    const restored = cidFromString(asString);
    expect(cidToString(restored)).toBe(asString);
  });

  test("CID string is base32-encoded and starts with 'b'", () => {
    const cid = computeCID({ x: 1 });
    const s = cidToString(cid);
    expect(s.startsWith("b")).toBe(true);
  });

  test("cidFromString throws on invalid input", () => {
    expect(() => cidFromString("not-a-cid")).toThrow();
  });
});
