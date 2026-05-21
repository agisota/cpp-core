import type { DID, ISO8601, Signature } from "./common";
import { encodeCanonical } from "../canonical";
import { sign } from "../identity/sign";
import { verify } from "../identity/verify";
import type { DIDKeyPair } from "../identity/did-key";

export interface SignedEnvelope<T> {
  readonly payload: T;
  readonly signer_did: DID;
  readonly signature: Signature;
  readonly signed_at: ISO8601;
}

/**
 * Seals a payload in a SignedEnvelope. The canonical encoding binds both
 * `payload` and `signed_at` together before signing, preventing timestamp
 * replay attacks.
 *
 * **Note on `signedAt` default**: if omitted, uses `new Date().toISOString()`.
 * Two calls with identical inputs will produce DIFFERENT envelopes because the
 * implicit timestamps differ. For deterministic outputs (tests, content-addressed
 * storage), always pass an explicit `signedAt`.
 */
export async function sealEnvelope<T>(
  payload: T,
  keypair: DIDKeyPair,
  signedAt: ISO8601 = new Date().toISOString()
): Promise<SignedEnvelope<T>> {
  const bytes = encodeCanonical({ payload, signed_at: signedAt });
  const signature = await sign(bytes, keypair.privateKey);
  return {
    payload,
    signer_did: keypair.did,
    signature,
    signed_at: signedAt,
  };
}

export interface OpenedEnvelope<T> {
  readonly valid: boolean;
  readonly payload: T;
  readonly signer_did: DID;
}

export async function openEnvelope<T>(
  env: SignedEnvelope<T>
): Promise<OpenedEnvelope<T>> {
  const bytes = encodeCanonical({ payload: env.payload, signed_at: env.signed_at });
  const valid = await verify(bytes, env.signature, env.signer_did);
  return { valid, payload: env.payload, signer_did: env.signer_did };
}
