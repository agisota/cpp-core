import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { FilesystemStorage } from "../../src/storage/filesystem";
import { decodeCanonical } from "../../src/canonical";
import { computeCID } from "../../src/cid";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("FilesystemStorage", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "cpp-fs-test-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("put returns CID and persists bytes to disk", async () => {
    const s = new FilesystemStorage(dir);
    const cid = await s.put({ value: 100 });
    const bytes = await s.get(cid);
    expect(bytes).not.toBeNull();
    const decoded = decodeCanonical<{ value: number }>(bytes!);
    expect(decoded.value).toBe(100);
  });

  test("get returns null for unknown CID", async () => {
    const s = new FilesystemStorage(dir);
    const unknownCID = computeCID({ never: "stored" });
    expect(await s.get(unknownCID)).toBeNull();
  });

  test("has reflects on-disk presence", async () => {
    const s = new FilesystemStorage(dir);
    const cid = await s.put({ key: "value" });
    expect(await s.has(cid)).toBe(true);
    const unknownCID = computeCID({ other: "data" });
    expect(await s.has(unknownCID)).toBe(false);
  });

  test("persists across instances (re-read after re-open)", async () => {
    const s1 = new FilesystemStorage(dir);
    const cid = await s1.put({ persistent: true });

    const s2 = new FilesystemStorage(dir);
    const bytes = await s2.get(cid);
    expect(bytes).not.toBeNull();
    const decoded = decodeCanonical<{ persistent: boolean }>(bytes!);
    expect(decoded.persistent).toBe(true);
  });

  test("put is idempotent on disk", async () => {
    const s = new FilesystemStorage(dir);
    await s.put({ x: 1 });
    await s.put({ x: 1 });
    // No assertion on FS count here — just that it doesn't throw and stays consistent
    expect(await s.has(await s.put({ x: 1 }))).toBe(true);
  });
});
