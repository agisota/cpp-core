import { test, expect, describe } from "bun:test";
import { buildResource } from "../../src/mcp/resource";
import { makeFactNode } from "../../src/types/fact";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("MCP Resource builder", () => {
  test("builds a Resource for a FactNode", () => {
    const payloadCID = computeCID({ price: 100 });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkAlice", role: "trader" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const cid = computeCID(fact);

    const res = buildResource({ node: fact, type: "fact", cid });

    expect(res.uri).toBe(`mcp://provenance/fact/${cid.toString()}`);
    expect(res.name).toContain("fact");
    expect(res.mimeType).toBe("application/vnd.cpp.fact+dag-cbor");
    expect(res.annotations?.cpp_cid).toBe(cid.toString());
    expect(res.annotations?.cpp_signed_by).toBe("did:key:z6MkAlice");
    expect(res.annotations?.lastModified).toBe("2026-05-21T13:30:00Z");
  });

  test("annotations include audience and priority defaults", () => {
    const payloadCID = computeCID({ x: 1 });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkB", role: "x" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    const cid = computeCID(fact);
    const res = buildResource({ node: fact, type: "fact", cid });
    expect(res.annotations?.audience).toEqual(["assistant", "user"]);
    expect(res.annotations?.priority).toBeGreaterThanOrEqual(0);
    expect(res.annotations?.priority).toBeLessThanOrEqual(1);
  });
});
