import * as ed from "@noble/ed25519";
import { parseDIDKey } from "./did-key";
import type { DID } from "../types/common";

export async function verify(
  message: Uint8Array,
  signature: Uint8Array,
  signerDID: DID
): Promise<boolean> {
  const publicKey = parseDIDKey(signerDID);
  try {
    return await ed.verifyAsync(signature, message, publicKey);
  } catch {
    return false;
  }
}
