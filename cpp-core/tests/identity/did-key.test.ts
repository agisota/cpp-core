import { test, expect, describe } from "bun:test";
import {
  generateDIDKey,
  parseDIDKey,
} from "../../src/identity/did-key";

describe("did:key", () => {
  test("generates valid did:key with z6Mk prefix (Ed25519)", async () => {
    const { did } = await generateDIDKey();
    expect(did.startsWith("did:key:z6Mk")).toBe(true);
  });

  test("parses generated did:key back to same public key", async () => {
    const { did, publicKey } = await generateDIDKey();
    const parsed = parseDIDKey(did);
    expect(parsed).toEqual(publicKey);
  });

  test("rejects malformed did:key", () => {
    expect(() => parseDIDKey("did:key:zINVALID")).toThrow();
  });

  test("rejects non-did:key DIDs", () => {
    expect(() => parseDIDKey("did:web:example.com" as never)).toThrow();
  });
});
