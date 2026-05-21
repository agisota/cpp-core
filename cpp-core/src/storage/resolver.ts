import type { CID } from "../types/common";
import type { Storage } from "./interface";
import type { FactNode } from "../types/fact";
import type { RuleNode } from "../types/rule";
import type { CalculationActivity } from "../types/calculation";
import type { EffectNode } from "../types/effect";
import { decodeCanonical } from "../canonical";

export type CPPNodeType = "fact" | "rule" | "calculation" | "effect";

export class ResolverTypeMismatchError extends Error {
  constructor(
    public readonly cid: CID,
    public readonly expected: CPPNodeType,
    public readonly actual: string
  ) {
    super(
      `Type mismatch at ${cid.toString()}: expected "${expected}", got "${actual}"`
    );
    this.name = "ResolverTypeMismatchError";
  }
}

export class Resolver {
  constructor(private readonly storage: Storage) {}

  /**
   * Untyped resolve: returns the decoded value or null if not stored.
   * Caller is responsible for any type narrowing.
   */
  async resolve<T = unknown>(cid: CID): Promise<T | null> {
    const bytes = await this.storage.get(cid);
    if (bytes === null) return null;
    return decodeCanonical<T>(bytes);
  }

  private async resolveTyped<T extends { type: CPPNodeType }>(
    cid: CID,
    expectedType: CPPNodeType
  ): Promise<T | null> {
    const decoded = await this.resolve<{ type?: unknown }>(cid);
    if (decoded === null) return null;
    const actualType = typeof decoded.type === "string" ? decoded.type : "<unknown>";
    if (actualType !== expectedType) {
      throw new ResolverTypeMismatchError(cid, expectedType, actualType);
    }
    return decoded as unknown as T;
  }

  resolveFact(cid: CID): Promise<FactNode | null> {
    return this.resolveTyped<FactNode>(cid, "fact");
  }

  resolveRule(cid: CID): Promise<RuleNode | null> {
    return this.resolveTyped<RuleNode>(cid, "rule");
  }

  resolveCalculation(cid: CID): Promise<CalculationActivity | null> {
    return this.resolveTyped<CalculationActivity>(cid, "calculation");
  }

  resolveEffect(cid: CID): Promise<EffectNode | null> {
    return this.resolveTyped<EffectNode>(cid, "effect");
  }
}
