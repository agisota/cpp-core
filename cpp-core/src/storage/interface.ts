import type { CID } from "../types/common";

export interface Storage {
  /**
   * Canonical-encodes the value, computes its CID, persists bytes under that CID,
   * and returns the CID. Idempotent: putting the same value twice produces the
   * same CID and does not duplicate storage.
   */
  put(value: unknown): Promise<CID>;

  /**
   * Retrieves raw DAG-CBOR bytes for the given CID, or null if unknown.
   * Callers are expected to decode via canonical.ts or via a higher-level Resolver.
   */
  get(cid: CID): Promise<Uint8Array | null>;

  /** Returns true if the CID is currently stored. */
  has(cid: CID): Promise<boolean>;
}

export class StorageNotFoundError extends Error {
  constructor(public readonly cid: CID) {
    super(`CID not found in storage: ${cid.toString()}`);
    this.name = "StorageNotFoundError";
  }
}

export class StorageIntegrityError extends Error {
  constructor(
    public readonly cid: CID,
    message: string,
  ) {
    super(`Integrity error for ${cid.toString()}: ${message}`);
    this.name = "StorageIntegrityError";
  }
}
