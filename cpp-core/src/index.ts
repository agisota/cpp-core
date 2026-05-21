export const version = "0.1.0";

export { encodeCanonical, decodeCanonical } from "./canonical";
export { computeCID, cidToString, cidFromString } from "./cid";

export type { CID, DID, Signature, ISO8601, Interval, AgentRef } from "./types/common";
export { makeInterval } from "./types/common";

export type { Validity } from "./types/validity";
export { makeValidity, isExpired } from "./types/validity";

export type { FactNode } from "./types/fact";
export { makeFactNode } from "./types/fact";

export type { RuleNode } from "./types/rule";
export { makeRuleNode } from "./types/rule";

export type {
  CalculationActivity,
  ToolCall,
  ModelRef,
} from "./types/calculation";
export {
  makeCalculationActivity,
  makeToolCall,
  TrustTier,
} from "./types/calculation";

export type { EffectNode, AffectedEntity } from "./types/effect";
export { makeEffectNode, makeAffectedEntity } from "./types/effect";

export type { CausalDAGNode } from "./types/range";
export { makeCausalDAGNode, mergeIntervals } from "./types/range";

export type { SignedEnvelope, OpenedEnvelope } from "./types/envelope";
export { sealEnvelope, openEnvelope } from "./types/envelope";

export type { DIDKeyPair } from "./identity/did-key";
export { generateDIDKey, parseDIDKey } from "./identity/did-key";
export { sign } from "./identity/sign";
export { verify } from "./identity/verify";
