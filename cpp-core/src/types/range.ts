import type { CID, Interval } from "./common";
import { makeInterval } from "./common";

export interface CausalDAGNode {
  readonly entity_cid: CID;
  readonly weight: Interval;
  readonly confidence: Interval;
  readonly upstream: ReadonlyArray<CausalDAGNode>;
  readonly pruned_at?: string;
}

interface MakeCausalDAGNodeInput {
  entity_cid: CID;
  weight: Interval;
  confidence: Interval;
  upstream: ReadonlyArray<CausalDAGNode>;
  pruned_at?: string;
}

export function makeCausalDAGNode(input: MakeCausalDAGNodeInput): CausalDAGNode {
  return {
    entity_cid: input.entity_cid,
    weight: input.weight,
    confidence: input.confidence,
    upstream: input.upstream,
    ...(input.pruned_at !== undefined ? { pruned_at: input.pruned_at } : {}),
  };
}

/**
 * Combines two intervals with additive semantics: result.low = a.low + b.low,
 * result.high = a.high + b.high. Use for weight aggregation where ranges sum.
 * NOT appropriate for probabilities / confidence intervals — those need bound
 * clamping which this function does not perform.
 */
export function mergeIntervals(a: Interval, b: Interval): Interval {
  return makeInterval(a.low + b.low, a.high + b.high);
}
