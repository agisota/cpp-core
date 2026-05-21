import { test, expect, describe } from "bun:test";
import {
  makeCalculationActivity,
  makeToolCall,
  TrustTier,
} from "../../src/types/calculation";
import { computeCID } from "../../src/cid";

describe("CalculationActivity", () => {
  test("constructs activity with tool calls", () => {
    const inputCID = computeCID({ position: "Fund_A" });
    const ruleCID = computeCID({ formula: "DV01" });
    const modelCID = computeCID({ name: "claude-opus-4.7" });
    const argsCID = computeCID({ pattern: "ipcRenderer.send" });
    const resultCID = computeCID({ matches: ["file1.ts", "file2.ts"] });

    const tc = makeToolCall({
      name: "grep",
      args_cid: argsCID,
      result_cid: resultCID,
      started_at: "2026-05-21T13:30:00Z",
      finished_at: "2026-05-21T13:30:01Z",
    });

    const activity = makeCalculationActivity({
      inputs: [inputCID],
      rules: [ruleCID],
      model: {
        model_cid: modelCID,
        display_name: "claude-opus-4.7",
        params: { temperature: 0 },
      },
      tool_calls: [tc],
      outputs: [],
      tier: TrustTier.Tier1,
      started_at: "2026-05-21T13:30:00Z",
      finished_at: "2026-05-21T13:30:02Z",
    });

    expect(activity.type).toBe("calculation");
    expect(activity.tool_calls.length).toBe(1);
    expect(activity.tier).toBe(TrustTier.Tier1);
  });

  test("rejects activity where finished_at is before started_at", () => {
    const modelCID = computeCID({ name: "x" });
    expect(() =>
      makeCalculationActivity({
        inputs: [],
        rules: [],
        model: { model_cid: modelCID, display_name: "x", params: {} },
        tool_calls: [],
        outputs: [],
        tier: TrustTier.Tier1,
        started_at: "2026-05-21T13:30:01Z",
        finished_at: "2026-05-21T13:30:00Z",
      })
    ).toThrow();
  });
});
