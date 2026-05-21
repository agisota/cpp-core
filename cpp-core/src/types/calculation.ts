import type { CID, ISO8601 } from "./common";

export enum TrustTier {
  Tier1 = "tier-1-cache",
  Tier2 = "tier-2-consensus-tee",
  Tier3 = "tier-3-zkml",
}

export interface ModelRef {
  readonly model_cid: CID;
  readonly display_name: string;
  readonly seed?: number;
  readonly params: Readonly<Record<string, unknown>>;
}

export interface ToolCall {
  readonly name: string;
  readonly args_cid: CID;
  readonly result_cid: CID;
  readonly started_at: ISO8601;
  readonly finished_at: ISO8601;
}

export interface CalculationActivity {
  readonly type: "calculation";
  readonly inputs: ReadonlyArray<CID>;
  readonly rules: ReadonlyArray<CID>;
  readonly model: ModelRef;
  readonly tool_calls: ReadonlyArray<ToolCall>;
  readonly outputs: ReadonlyArray<CID>;
  readonly tier: TrustTier;
  readonly started_at: ISO8601;
  readonly finished_at: ISO8601;
}

interface MakeToolCallInput {
  name: string;
  args_cid: CID;
  result_cid: CID;
  started_at: ISO8601;
  finished_at: ISO8601;
}

export function makeToolCall(input: MakeToolCallInput): ToolCall {
  const start = new Date(input.started_at).getTime();
  const end = new Date(input.finished_at).getTime();
  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid ISO8601 timestamps in ToolCall");
  }
  if (end < start) {
    throw new Error(
      `ToolCall finished_at (${input.finished_at}) is before started_at (${input.started_at})`
    );
  }
  return { ...input };
}

interface MakeCalculationActivityInput {
  inputs: ReadonlyArray<CID>;
  rules: ReadonlyArray<CID>;
  model: ModelRef;
  tool_calls: ReadonlyArray<ToolCall>;
  outputs: ReadonlyArray<CID>;
  tier: TrustTier;
  started_at: ISO8601;
  finished_at: ISO8601;
}

export function makeCalculationActivity(
  input: MakeCalculationActivityInput
): CalculationActivity {
  const start = new Date(input.started_at).getTime();
  const end = new Date(input.finished_at).getTime();
  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid ISO8601 timestamps");
  }
  if (end < start) {
    throw new Error(
      `Calculation finished_at (${input.finished_at}) is before started_at (${input.started_at})`
    );
  }
  return { type: "calculation", ...input };
}
