import type { CID } from "./types/common";
import type { Validity } from "./types/validity";
import { isExpired } from "./types/validity";

const MAX_SUPERSESSION_DEPTH = 1000;

export class SupersessionCycleError extends Error {
  constructor(public readonly visited: ReadonlyArray<string>) {
    super(
      `Supersession cycle detected after ${visited.length} hops (max depth ${MAX_SUPERSESSION_DEPTH})`
    );
    this.name = "SupersessionCycleError";
  }
}

export interface HasValidity {
  readonly validity: Validity;
}

/**
 * Follow the supersession chain from startCID to its tip. Returns the most
 * recent (non-superseded) node, or null if startCID is unknown to the resolver.
 *
 * Throws SupersessionCycleError if the chain exceeds MAX_SUPERSESSION_DEPTH
 * (cycle detection — supersession should always terminate at a node with no
 * `superseded_by` field).
 */
export async function followSupersession<T extends HasValidity>(
  startCID: CID,
  resolveFn: (cid: CID) => Promise<T | null>
): Promise<T | null> {
  const visited = new Set<string>();
  let currentCID = startCID;
  let currentNode = await resolveFn(currentCID);
  if (currentNode === null) return null;

  let depth = 0;
  while (currentNode.validity.superseded_by !== undefined) {
    depth++;
    const cidStr = currentCID.toString();
    if (visited.has(cidStr) || depth > MAX_SUPERSESSION_DEPTH) {
      throw new SupersessionCycleError([...visited, cidStr]);
    }
    visited.add(cidStr);
    const next = await resolveFn(currentNode.validity.superseded_by);
    if (next === null) return currentNode; // chain broken — return last reachable
    currentCID = currentNode.validity.superseded_by;
    currentNode = next;
  }
  return currentNode;
}

/**
 * A node is considered stale if it has been superseded by a newer revision OR
 * its valid_until window has passed. Pure function — no storage access.
 */
export function isStale(node: HasValidity, now: Date = new Date()): boolean {
  if (node.validity.superseded_by !== undefined) return true;
  if (isExpired(node.validity, now)) return true;
  return false;
}
