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

/**
 * Confidence-bounded interval constructor.
 * Enforces low >= 0 and high <= 1 in addition to makeInterval's low <= high check.
 * Use for AffectedEntity.confidence and CausalDAGNode.confidence — fields that
 * semantically represent probabilities and must stay within [0, 1].
 */
export function makeConfidence(low: number, high: number): Interval {
  if (low < 0 || high > 1) {
    throw new Error(`Confidence must be in [0, 1]: got [${low}, ${high}]`);
  }
  return makeInterval(low, high);
}

export interface AgentRef {
  readonly did: DID;
  readonly role: string;
}
