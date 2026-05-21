import { test, expect, describe } from "bun:test";
import { makeFactNode } from "../../src/types/fact";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";

describe("FactNode", () => {
  test("constructs valid FactNode", () => {
    const payloadCID = computeCID({ price: 100 });
    const fact = makeFactNode({
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkAlice", role: "bloomberg-feed" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });
    expect(fact.type).toBe("fact");
    expect(fact.source.role).toBe("bloomberg-feed");
  });

  test("two FactNodes with same content have same CID", () => {
    const payloadCID = computeCID({ price: 100 });
    const input = {
      payload_cid: payloadCID,
      source: { did: "did:key:z6MkAlice" as const, role: "bloomberg-feed" },
      timestamp: "2026-05-21T13:30:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    };
    const factA = makeFactNode(input);
    const factB = makeFactNode(input);
    expect(computeCID(factA).toString()).toBe(computeCID(factB).toString());
  });
});
