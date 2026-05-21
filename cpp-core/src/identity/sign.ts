import * as ed from "@noble/ed25519";

export async function sign(
  message: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array> {
  return await ed.signAsync(message, privateKey);
}
