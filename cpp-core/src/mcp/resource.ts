import type { CID } from "../types/common";
import type { FactNode } from "../types/fact";
import type { RuleNode } from "../types/rule";
import type { CalculationActivity } from "../types/calculation";
import type { EffectNode } from "../types/effect";
import { buildProvenanceURI, type CPPNodeType } from "./uri";

export interface McpAnnotations {
  readonly audience: ReadonlyArray<"user" | "assistant">;
  readonly priority: number;
  readonly lastModified?: string;
  readonly cpp_cid: string;
  readonly cpp_signed_by?: string;
}

export interface McpResource {
  readonly uri: string;
  readonly name: string;
  readonly title?: string;
  readonly description?: string;
  readonly mimeType: string;
  readonly annotations: McpAnnotations;
}

type CPPNode = FactNode | RuleNode | CalculationActivity | EffectNode;

export interface BuildResourceInput {
  node: CPPNode;
  type: CPPNodeType;
  cid: CID;
}

function extractSignedBy(node: CPPNode, type: CPPNodeType): string | undefined {
  if (type === "fact") return (node as FactNode).source.did;
  if (type === "rule") return (node as RuleNode).authority.did;
  return undefined; // calculation/effect — signed via SignedEnvelope at a higher layer
}

function extractTimestamp(
  node: CPPNode,
  type: CPPNodeType
): string | undefined {
  if (type === "fact") return (node as FactNode).timestamp;
  if (type === "calculation") return (node as CalculationActivity).finished_at;
  // rule/effect — use validity.valid_from
  return (node as RuleNode | EffectNode).validity.valid_from;
}

export function buildResource(input: BuildResourceInput): McpResource {
  const { node, type, cid } = input;
  const uri = buildProvenanceURI({ type, cid });
  const signedBy = extractSignedBy(node, type);
  const lastModified = extractTimestamp(node, type);

  const annotations: McpAnnotations = {
    audience: ["assistant", "user"],
    priority: 0.5,
    cpp_cid: cid.toString(),
    ...(lastModified !== undefined ? { lastModified } : {}),
    ...(signedBy !== undefined ? { cpp_signed_by: signedBy } : {}),
  };

  return {
    uri,
    name: `${type}:${cid.toString().slice(0, 12)}…`,
    mimeType: `application/vnd.cpp.${type}+dag-cbor`,
    annotations,
  };
}
