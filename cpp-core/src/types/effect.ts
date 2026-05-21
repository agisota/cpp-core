import type { CID, Interval } from "./common";
import type { Validity } from "./validity";

export interface AffectedEntity {
  readonly entity_cid: CID;
  readonly weight: Interval;
  readonly confidence: Interval;
  readonly label?: string;
}

interface MakeAffectedEntityInput {
  entity_cid: CID;
  weight: Interval;
  confidence: Interval;
  label?: string;
}

export function makeAffectedEntity(input: MakeAffectedEntityInput): AffectedEntity {
  return {
    entity_cid: input.entity_cid,
    weight: input.weight,
    confidence: input.confidence,
    ...(input.label !== undefined ? { label: input.label } : {}),
  };
}

export interface EffectNode {
  readonly type: "effect";
  readonly caused_by: CID;
  readonly affects: ReadonlyArray<AffectedEntity>;
  readonly range_root: CID;
  readonly summary_cid?: CID;
  readonly validity: Validity;
}

interface MakeEffectNodeInput {
  caused_by: CID;
  affects: ReadonlyArray<AffectedEntity>;
  range_root: CID;
  summary_cid?: CID;
  validity: Validity;
}

export function makeEffectNode(input: MakeEffectNodeInput): EffectNode {
  return {
    type: "effect",
    caused_by: input.caused_by,
    affects: input.affects,
    range_root: input.range_root,
    ...(input.summary_cid !== undefined ? { summary_cid: input.summary_cid } : {}),
    validity: input.validity,
  };
}
