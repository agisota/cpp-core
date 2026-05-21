import { test, expect, describe } from "bun:test";
import {
  parseProvenanceURI,
  buildProvenanceURI,
  InvalidProvenanceURIError,
} from "../../src/mcp/uri";
import { computeCID, cidToString } from "../../src/cid";

describe("provenance URI", () => {
  test("builds a fact URI from type + CID", () => {
    const cid = computeCID({ test: 1 });
    const uri = buildProvenanceURI({ type: "fact", cid });
    expect(uri).toBe(`mcp://provenance/fact/${cidToString(cid)}`);
  });

  test("parses a valid fact URI back to type + CID", () => {
    const cid = computeCID({ test: 2 });
    const uri = buildProvenanceURI({ type: "fact", cid });
    const parsed = parseProvenanceURI(uri);
    expect(parsed.type).toBe("fact");
    expect(parsed.cid.toString()).toBe(cid.toString());
  });

  test("round-trips for all four node types", () => {
    const cid = computeCID({ rt: 1 });
    for (const t of ["fact", "rule", "calculation", "effect"] as const) {
      const uri = buildProvenanceURI({ type: t, cid });
      const parsed = parseProvenanceURI(uri);
      expect(parsed.type).toBe(t);
      expect(parsed.cid.toString()).toBe(cid.toString());
    }
  });

  test("rejects non-mcp scheme", () => {
    expect(() => parseProvenanceURI("http://provenance/fact/abc")).toThrow(
      InvalidProvenanceURIError
    );
  });

  test("rejects wrong host (not 'provenance')", () => {
    expect(() => parseProvenanceURI("mcp://other/fact/abc")).toThrow(
      InvalidProvenanceURIError
    );
  });

  test("rejects unknown node type", () => {
    const cid = computeCID({ x: 1 });
    expect(() =>
      parseProvenanceURI(`mcp://provenance/unknown/${cidToString(cid)}`)
    ).toThrow(InvalidProvenanceURIError);
  });

  test("rejects malformed CID portion", () => {
    expect(() =>
      parseProvenanceURI("mcp://provenance/fact/not-a-cid")
    ).toThrow(InvalidProvenanceURIError);
  });
});
