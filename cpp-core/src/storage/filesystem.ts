import type { Storage } from "./interface";
import type { CID } from "../types/common";
import { encodeCanonical } from "../canonical";
import { computeCID } from "../cid";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

export class FilesystemStorage implements Storage {
  constructor(private readonly baseDir: string) {}

  private pathFor(cid: CID): string {
    return join(this.baseDir, `${cid.toString()}.bin`);
  }

  async put(value: unknown): Promise<CID> {
    const encoded = encodeCanonical(value);
    const cid = computeCID(value);
    await mkdir(this.baseDir, { recursive: true });
    await writeFile(this.pathFor(cid), encoded);
    return cid;
  }

  async get(cid: CID): Promise<Uint8Array | null> {
    try {
      return await readFile(this.pathFor(cid));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw err;
    }
  }

  async has(cid: CID): Promise<boolean> {
    try {
      await access(this.pathFor(cid));
      return true;
    } catch {
      return false;
    }
  }
}
