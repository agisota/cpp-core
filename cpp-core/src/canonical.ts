import * as cbor from "@ipld/dag-cbor";

export function encodeCanonical(value: unknown): Uint8Array {
  return cbor.encode(value);
}

export function decodeCanonical<T>(bytes: Uint8Array): T {
  return cbor.decode(bytes) as T;
}
