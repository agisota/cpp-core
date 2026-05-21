import { test, expect, describe } from "bun:test";
import { MemoryStorage } from "../../src/storage/memory";
import { decodeCanonical } from "../../src/canonical";
import { computeCID } from "../../src/cid";

describe("MemoryStorage", () => {
  test("put returns deterministic CID for value", async () => {
    const s = new MemoryStorage();
    const cid1 = await s.put({ foo: 1 });
    const cid2 = await s.put({ foo: 1 });
    expect(cid1.toString()).toBe(cid2.toString());
  });

  test("get returns bytes that decode to original value", async () => {
    const s = new MemoryStorage();
    const original = { name: "fact", count: 42 };
    const cid = await s.put(original);
    const bytes = await s.get(cid);
    expect(bytes).not.toBeNull();
    const decoded = decodeCanonical<typeof original>(bytes!);
    expect(decoded).toEqual(original);
  });

  test("get returns null for unknown CID", async () => {
    const s = new MemoryStorage();
    const unknownCID = computeCID({ never: "stored" });
    const bytes = await s.get(unknownCID);
    expect(bytes).toBeNull();
  });

  test("has returns true after put, false for unknown", async () => {
    const s = new MemoryStorage();
    const cid = await s.put({ x: 1 });
    expect(await s.has(cid)).toBe(true);
    const unknownCID = computeCID({ y: 2 });
    expect(await s.has(unknownCID)).toBe(false);
  });

  test("put is idempotent (no duplicate entries)", async () => {
    const s = new MemoryStorage();
    await s.put({ a: 1 });
    await s.put({ a: 1 });
    await s.put({ a: 1 });
    expect(s.size).toBe(1);
  });

  test("put of different values yields different sizes", async () => {
    const s = new MemoryStorage();
    await s.put({ a: 1 });
    await s.put({ b: 2 });
    expect(s.size).toBe(2);
  });
});
