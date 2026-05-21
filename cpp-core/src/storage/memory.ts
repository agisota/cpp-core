import type { Storage } from "./interface";
import type { CID } from "../types/common";
import { encodeCanonical } from "../canonical";
import { computeCID } from "../cid";

export class MemoryStorage implements Storage {
  private readonly bytes = new Map<string, Uint8Array>();

  async put(value: unknown): Promise<CID> {
    const encoded = encodeCanonical(value);
    const cid = computeCID(value);
    this.bytes.set(cid.toString(), encoded);
    return cid;
  }

  async get(cid: CID): Promise<Uint8Array | null> {
    const result = this.bytes.get(cid.toString());
    return result ?? null;
  }

  async has(cid: CID): Promise<boolean> {
    return this.bytes.has(cid.toString());
  }

  get size(): number {
    return this.bytes.size;
  }
}
