import { test, expect, describe } from "bun:test";
import { makeCausalDAGNode, mergeIntervals } from "../../src/types/range";
import { makeInterval } from "../../src/types/common";
import { computeCID } from "../../src/cid";

describe("CausalDAGNode", () => {
  test("constructs leaf node (no upstream)", () => {
    const entity = computeCID({ entity: "X" });
    const node = makeCausalDAGNode({
      entity_cid: entity,
      weight: makeInterval(-2.2, -1.8),
      confidence: makeInterval(0.8, 0.95),
      upstream: [],
    });
    expect(node.upstream.length).toBe(0);
    expect(node.weight.low).toBe(-2.2);
  });

  test("supports nested upstream causal DAG", () => {
    const leaf = computeCID({ entity: "leaf" });
    const root = computeCID({ entity: "root" });
    const leafNode = makeCausalDAGNode({
      entity_cid: leaf,
      weight: makeInterval(0.1, 0.2),
      confidence: makeInterval(0.7, 0.9),
      upstream: [],
    });
    const rootNode = makeCausalDAGNode({
      entity_cid: root,
      weight: makeInterval(1.0, 2.0),
      confidence: makeInterval(0.5, 0.8),
      upstream: [leafNode],
    });
    expect(rootNode.upstream.length).toBe(1);
    expect(rootNode.upstream[0]!.entity_cid.toString()).toBe(leaf.toString());
  });

  test("pruned_at preserved when set", () => {
    const entity = computeCID({ entity: "X" });
    const node = makeCausalDAGNode({
      entity_cid: entity,
      weight: makeInterval(0, 0),
      confidence: makeInterval(0, 0),
      upstream: [],
      pruned_at: "depth-limit",
    });
    expect(node.pruned_at).toBe("depth-limit");
  });

  test("mergeIntervals combines intervals correctly", () => {
    const merged = mergeIntervals(
      makeInterval(0.1, 0.5),
      makeInterval(0.3, 0.7)
    );
    expect(merged.low).toBe(0.4);
    expect(merged.high).toBe(1.2);
  });
});
