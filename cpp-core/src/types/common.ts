import type { CID as MultiformatsCID } from "multiformats/cid";

export type CID = MultiformatsCID;
export type DID = `did:${string}:${string}`;
export type Signature = Uint8Array;
export type ISO8601 = string;

export interface Interval {
  readonly low: number;
  readonly high: number;
}

export function makeInterval(low: number, high: number): Interval {
  if (low > high) {
    throw new Error(`Invalid interval: low (${low}) > high (${high})`);
  }
  return { low, high };
}

export interface AgentRef {
  readonly did: DID;
  readonly role: string;
}
