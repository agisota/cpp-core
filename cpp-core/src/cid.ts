import { CID } from "multiformats/cid";
import * as Digest from "multiformats/hashes/digest";
import { sha256 } from "@noble/hashes/sha256";
import * as cbor from "@ipld/dag-cbor";
import { encodeCanonical } from "./canonical";

const DAG_CBOR_CODE = cbor.code;   // 0x71
const SHA256_MULTICODEC = 0x12;    // sha2-256

export function computeCID(value: unknown): CID {
  const bytes = encodeCanonical(value);
  const digestBytes = sha256(bytes);
  const mh = Digest.create(SHA256_MULTICODEC, digestBytes);
  return CID.create(1, DAG_CBOR_CODE, mh);
}

export function cidToString(cid: CID): string {
  return cid.toString();
}

export function cidFromString(s: string): CID {
  return CID.parse(s);
}
