import type { AgentRef, CID, ISO8601 } from "./common";
import type { Validity } from "./validity";

export interface FactNode {
  readonly type: "fact";
  readonly payload_cid: CID;
  readonly source: AgentRef;
  readonly timestamp: ISO8601;
  readonly validity: Validity;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

interface MakeFactNodeInput {
  payload_cid: CID;
  source: AgentRef;
  timestamp: ISO8601;
  validity: Validity;
  metadata?: Readonly<Record<string, unknown>>;
}

export function makeFactNode(input: MakeFactNodeInput): FactNode {
  return {
    type: "fact",
    payload_cid: input.payload_cid,
    source: input.source,
    timestamp: input.timestamp,
    validity: input.validity,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}
