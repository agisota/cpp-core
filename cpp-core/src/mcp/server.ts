import type { CID } from "../types/common";
import type { Resolver } from "../storage/resolver";
import type { FactNode } from "../types/fact";
import type { RuleNode } from "../types/rule";
import type { CalculationActivity } from "../types/calculation";
import type { EffectNode } from "../types/effect";
import type { McpResource } from "./resource";
import { buildResource } from "./resource";
import { parseProvenanceURI, type CPPNodeType } from "./uri";

type CPPNode = FactNode | RuleNode | CalculationActivity | EffectNode;

export type { CPPNodeType };

export interface CatalogEntry {
  readonly type: CPPNodeType;
  readonly cid: CID;
}

export interface CppMcpServerOptions {
  readonly resolver: Resolver;
  readonly catalog: Iterable<CatalogEntry>;
}

export interface McpResourceContent {
  readonly uri: string;
  readonly mimeType: string;
  readonly text?: string;
  readonly blob?: string;
}

export class McpResourceNotFoundError extends Error {
  constructor(public readonly uri: string) {
    super(`MCP resource not found: ${uri}`);
    this.name = "McpResourceNotFoundError";
  }
}

/**
 * Pure-handler MCP server for CPP. Does NOT include JSON-RPC transport —
 * caller wraps these handlers in stdio / HTTP / WebSocket as appropriate.
 *
 * This is Sprint 3 SCAFFOLD: protocol primitives + handlers. Full server with
 * transport, subscriptions, and capability negotiation is Sprint 3 proper.
 */
export class CppMcpServer {
  private readonly resolver: Resolver;
  private readonly catalog: ReadonlyArray<CatalogEntry>;

  constructor(options: CppMcpServerOptions) {
    this.resolver = options.resolver;
    this.catalog = [...options.catalog];
  }

  async handleListResources(): Promise<{ resources: ReadonlyArray<McpResource> }> {
    const resources: McpResource[] = [];
    for (const entry of this.catalog) {
      const node = await this.resolveByType(entry.type, entry.cid);
      if (node === null) continue;
      resources.push(buildResource({ node, type: entry.type, cid: entry.cid }));
    }
    return { resources };
  }

  async handleReadResource(
    uri: string
  ): Promise<{ contents: ReadonlyArray<McpResourceContent> }> {
    const { type, cid } = parseProvenanceURI(uri);
    const node = await this.resolveByType(type, cid);
    if (node === null) {
      throw new McpResourceNotFoundError(uri);
    }
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(node, jsonReplacer),
        },
      ],
    };
  }

  private async resolveByType(type: CPPNodeType, cid: CID): Promise<CPPNode | null> {
    switch (type) {
      case "fact":
        return this.resolver.resolveFact(cid);
      case "rule":
        return this.resolver.resolveRule(cid);
      case "calculation":
        return this.resolver.resolveCalculation(cid);
      case "effect":
        return this.resolver.resolveEffect(cid);
    }
  }
}

/**
 * JSON.stringify replacer that converts CID and Uint8Array instances to
 * human-readable forms. Without this, CID objects serialize as opaque blobs
 * and Uint8Arrays serialize as `{}`.
 */
function jsonReplacer(_key: string, value: unknown): unknown {
  if (value !== null && typeof value === "object") {
    if (value instanceof Uint8Array) {
      return Array.from(value);
    }
    // CID instances from multiformats have version + code + toString()
    if (
      "toString" in value &&
      "version" in value &&
      "code" in value &&
      typeof (value as { toString: () => string }).toString === "function"
    ) {
      return (value as { toString: () => string }).toString();
    }
  }
  return value;
}
