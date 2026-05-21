import { test, expect, describe } from "bun:test";
import { makeEffectNode, makeAffectedEntity } from "../../src/types/effect";
import { makeValidity } from "../../src/types/validity";
import { makeInterval } from "../../src/types/common";
import { computeCID } from "../../src/cid";

describe("EffectNode", () => {
  test("constructs valid effect with affected entities", () => {
    const calcCID = computeCID({ type: "calculation" });
    const rangeCID = computeCID({ root: "merkle" });
    const entityCID = computeCID({ entity: "position-12" });

    const aff = makeAffectedEntity({
      entity_cid: entityCID,
      weight: makeInterval(-2.2, -1.8),
      confidence: makeInterval(0.8, 0.95),
      label: "must_change",
    });

    const effect = makeEffectNode({
      caused_by: calcCID,
      affects: [aff],
      range_root: rangeCID,
      validity: makeValidity({ valid_from: "2026-05-21T13:30:00Z" }),
    });

    expect(effect.type).toBe("effect");
    expect(effect.affects.length).toBe(1);
    expect(effect.affects[0]!.label).toBe("must_change");
  });

  test("summary_cid is optional", () => {
    const calcCID = computeCID({ x: 1 });
    const rangeCID = computeCID({ y: 2 });
    const effect = makeEffectNode({
      caused_by: calcCID,
      affects: [],
      range_root: rangeCID,
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    expect(effect.summary_cid).toBeUndefined();
  });
});
