import { test, expect, describe } from "bun:test";
import { encodeCanonical, decodeCanonical } from "../src/canonical";

describe("canonical encoding", () => {
  test("encodes identical objects to identical bytes regardless of key order", () => {
    const a = { foo: 1, bar: 2, baz: 3 };
    const b = { baz: 3, bar: 2, foo: 1 };
    const bytesA = encodeCanonical(a);
    const bytesB = encodeCanonical(b);
    expect(bytesA).toEqual(bytesB);
  });

  test("round-trips through encode/decode", () => {
    const input = { name: "fact", value: 42, nested: { ok: true } };
    const bytes = encodeCanonical(input);
    const decoded = decodeCanonical<typeof input>(bytes);
    expect(decoded).toEqual(input);
  });

  test("preserves Uint8Array as bytes (not array)", () => {
    const input = { sig: new Uint8Array([1, 2, 3]) };
    const bytes = encodeCanonical(input);
    const decoded = decodeCanonical<{ sig: Uint8Array }>(bytes);
    expect(decoded.sig).toBeInstanceOf(Uint8Array);
    expect(Array.from(decoded.sig)).toEqual([1, 2, 3]);
  });
});
