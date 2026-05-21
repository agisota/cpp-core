import * as ed from "@noble/ed25519";
import { base58btc } from "multiformats/bases/base58";
import type { DID } from "../types/common";

const ED25519_PUB_MULTICODEC = new Uint8Array([0xed, 0x01]);

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export interface DIDKeyPair {
  readonly did: DID;
  readonly publicKey: Uint8Array;
  readonly privateKey: Uint8Array;
}

export async function generateDIDKey(): Promise<DIDKeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  const prefixed = concat(ED25519_PUB_MULTICODEC, publicKey);
  const encoded = base58btc.encode(prefixed);
  const did = `did:key:${encoded}` as DID;
  return { did, publicKey, privateKey };
}

export function parseDIDKey(did: DID | string): Uint8Array {
  if (!did.startsWith("did:key:")) {
    throw new Error(`Not a did:key DID: ${did}`);
  }
  const encoded = did.slice("did:key:".length);
  let decoded: Uint8Array;
  try {
    decoded = base58btc.decode(encoded);
  } catch (e) {
    throw new Error(`Invalid base58btc encoding in did:key: ${did}`);
  }
  if (
    decoded.length !== 34 ||
    decoded[0] !== 0xed ||
    decoded[1] !== 0x01
  ) {
    throw new Error(`Not an Ed25519 did:key (expected 0xed 0x01 prefix): ${did}`);
  }
  return decoded.slice(2);
}
