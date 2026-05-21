import { test, expect, describe } from "bun:test";
import { generateDIDKey } from "../../src/identity/did-key";
import { sign } from "../../src/identity/sign";
import { verify } from "../../src/identity/verify";

describe("sign + verify", () => {
  test("verifies a signature created by its keypair", async () => {
    const kp = await generateDIDKey();
    const msg = new TextEncoder().encode("hello world");
    const sig = await sign(msg, kp.privateKey);
    const ok = await verify(msg, sig, kp.did);
    expect(ok).toBe(true);
  });

  test("rejects tampered message", async () => {
    const kp = await generateDIDKey();
    const msg = new TextEncoder().encode("hello");
    const sig = await sign(msg, kp.privateKey);
    const tampered = new TextEncoder().encode("HELLO");
    const ok = await verify(tampered, sig, kp.did);
    expect(ok).toBe(false);
  });

  test("rejects signature from wrong key", async () => {
    const kpA = await generateDIDKey();
    const kpB = await generateDIDKey();
    const msg = new TextEncoder().encode("hi");
    const sig = await sign(msg, kpA.privateKey);
    const ok = await verify(msg, sig, kpB.did);
    expect(ok).toBe(false);
  });
});
