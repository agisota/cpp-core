import type { AgentRef, CID } from "./common";
import type { Validity } from "./validity";

export interface RuleNode {
  readonly type: "rule";
  readonly expression_cid: CID;
  readonly version: string;
  readonly authority: AgentRef;
  readonly applicable_to: ReadonlyArray<string>;
  readonly validity: Validity;
}

const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

interface MakeRuleNodeInput {
  expression_cid: CID;
  version: string;
  authority: AgentRef;
  applicable_to: ReadonlyArray<string>;
  validity: Validity;
}

export function makeRuleNode(input: MakeRuleNodeInput): RuleNode {
  if (!SEMVER.test(input.version)) {
    throw new Error(`Invalid SemVer version: ${input.version}`);
  }
  return {
    type: "rule",
    expression_cid: input.expression_cid,
    version: input.version,
    authority: input.authority,
    applicable_to: input.applicable_to,
    validity: input.validity,
  };
}
