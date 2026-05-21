import type { CID } from "../types/common";
import { cidFromString, cidToString } from "../cid";

export type CPPNodeType = "fact" | "rule" | "calculation" | "effect";

const VALID_TYPES: ReadonlySet<string> = new Set([
  "fact",
  "rule",
  "calculation",
  "effect",
]);

const URI_SCHEME = "mcp";
const URI_HOST = "provenance";

export interface ParsedProvenanceURI {
  readonly type: CPPNodeType;
  readonly cid: CID;
}

export class InvalidProvenanceURIError extends Error {
  constructor(
    public readonly uri: string,
    reason: string
  ) {
    super(`Invalid provenance URI "${uri}": ${reason}`);
    this.name = "InvalidProvenanceURIError";
  }
}

export function buildProvenanceURI(input: ParsedProvenanceURI): string {
  return `${URI_SCHEME}://${URI_HOST}/${input.type}/${cidToString(input.cid)}`;
}

export function parseProvenanceURI(uri: string): ParsedProvenanceURI {
  // Expected: mcp://provenance/<type>/<cid>
  const schemeSeparator = "://";
  const schemeEnd = uri.indexOf(schemeSeparator);
  if (schemeEnd === -1) {
    throw new InvalidProvenanceURIError(uri, "missing scheme separator");
  }
  const scheme = uri.slice(0, schemeEnd);
  if (scheme !== URI_SCHEME) {
    throw new InvalidProvenanceURIError(
      uri,
      `expected scheme "${URI_SCHEME}", got "${scheme}"`
    );
  }

  const rest = uri.slice(schemeEnd + schemeSeparator.length);
  const parts = rest.split("/");
  if (parts.length < 3) {
    throw new InvalidProvenanceURIError(uri, "expected host/<type>/<cid>");
  }
  const host = parts[0]!;
  const typeStr = parts[1]!;
  const cidStr = parts.slice(2).join("/"); // CIDs don't contain "/" but be tolerant

  if (host !== URI_HOST) {
    throw new InvalidProvenanceURIError(
      uri,
      `expected host "${URI_HOST}", got "${host}"`
    );
  }
  if (!VALID_TYPES.has(typeStr)) {
    throw new InvalidProvenanceURIError(uri, `unknown node type "${typeStr}"`);
  }
  let cid: CID;
  try {
    cid = cidFromString(cidStr);
  } catch (err) {
    throw new InvalidProvenanceURIError(
      uri,
      `cannot parse CID "${cidStr}": ${(err as Error).message}`
    );
  }
  return { type: typeStr as CPPNodeType, cid };
}
