import { test, expect, describe } from "bun:test";
import { sealEnvelope, openEnvelope } from "../../src/types/envelope";
import { generateDIDKey } from "../../src/identity/did-key";
import { makeFactNode } from "../../src/types/fact";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("SignedEnvelope", () => {
  test("seals and opens a FactNode round-trip", async () => {
    const kp = await generateDIDKey();
    const payloadCID = computeCID({ data: "test" });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: kp.did, role: "test-agent" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });

    const env = await sealEnvelope(fact, kp);
    expect(env.signer_did).toBe(kp.did);
    expect(env.signature.length).toBe(64);

    const verified = await openEnvelope<typeof fact>(env);
    expect(verified.valid).toBe(true);
    expect(verified.payload.payload_cid.toString()).toBe(payloadCID.toString());
  });

  test("rejects tampered envelope", async () => {
    const kp = await generateDIDKey();
    const payloadCID = computeCID({ data: "original" });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: kp.did, role: "x" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const env = await sealEnvelope(fact, kp);

    const tamperedPayloadCID = computeCID({ data: "tampered" });
    const tamperedFact = makeFactNode({
      payload_cid: tamperedPayloadCID,
      source: { did: kp.did, role: "x" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const tamperedEnv = { ...env, payload: tamperedFact };

    const verified = await openEnvelope(tamperedEnv);
    expect(verified.valid).toBe(false);
  });
});
