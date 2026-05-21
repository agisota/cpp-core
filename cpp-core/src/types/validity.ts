import type { CID, ISO8601 } from "./common";

export interface Validity {
  readonly valid_from: ISO8601;
  readonly valid_until?: ISO8601;
  readonly supersedes: ReadonlyArray<CID>;
  readonly superseded_by?: CID;
}

interface MakeValidityInput {
  valid_from: ISO8601;
  valid_until?: ISO8601;
  supersedes?: ReadonlyArray<CID>;
  superseded_by?: CID;
}

function parseISO(s: string): Date {
  const d = new Date(s);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid ISO8601 timestamp: ${s}`);
  }
  return d;
}

export function makeValidity(input: MakeValidityInput): Validity {
  const from = parseISO(input.valid_from);
  if (input.valid_until !== undefined) {
    const until = parseISO(input.valid_until);
    if (until.getTime() < from.getTime()) {
      throw new Error(
        `valid_until (${input.valid_until}) is before valid_from (${input.valid_from})`
      );
    }
  }
  return {
    valid_from: input.valid_from,
    ...(input.valid_until !== undefined ? { valid_until: input.valid_until } : {}),
    supersedes: input.supersedes ?? [],
    ...(input.superseded_by !== undefined ? { superseded_by: input.superseded_by } : {}),
  };
}

export function isExpired(v: Validity, now: Date): boolean {
  if (v.valid_until === undefined) return false;
  return now.getTime() > parseISO(v.valid_until).getTime();
}
