import { test, expect } from "bun:test";
import {
  generateDIDKey,
  computeCID,
  makeFactNode,
  makeRuleNode,
  makeCalculationActivity,
  makeToolCall,
  makeEffectNode,
  makeAffectedEntity,
  makeCausalDAGNode,
  makeValidity,
  makeInterval,
  sealEnvelope,
  openEnvelope,
  TrustTier,
} from "../../src/index";

test("end-to-end ROX.ONE ADR scenario", async () => {
  const developer = await generateDIDKey();
  const reviewerBot = await generateDIDKey();

  // 1. Developer authors an ADR (Fact)
  const adrBodyCID = computeCID({
    title: "Switch IPC from .send to .invoke",
    rationale: "Avoid races at quit time",
  });
  const adrFact = makeFactNode({
    payload_cid: adrBodyCID,
    source: { did: developer.did, role: "human:developer" },
    timestamp: "2026-05-21T13:00:00Z",
    validity: makeValidity({ valid_from: "2026-05-21T13:00:00Z" }),
  });
  const signedFact = await sealEnvelope(adrFact, developer);

  // 2. Rule: "Use ipcRenderer.invoke not .send"
  const ruleExprCID = computeCID({ pattern: "ipcRenderer.send", replacement: "ipcRenderer.invoke" });
  const rule = makeRuleNode({
    expression_cid: ruleExprCID,
    version: "1.0.0",
    authority: { did: developer.did, role: "team-lead" },
    applicable_to: ["typescript", "electron"],
    validity: makeValidity({ valid_from: "2026-05-21T13:00:00Z" }),
  });
  const signedRule = await sealEnvelope(rule, developer);

  // 3. Reviewer-bot runs a calculation: grep for usages, plan refactor scope
  const grepArgsCID = computeCID({ pattern: "ipcRenderer.send" });
  const grepResultCID = computeCID({
    matches: ["src/main/ipc/window.ts", "src/main/ipc/menu.ts", "src/renderer/api.ts"],
  });
  const grepCall = makeToolCall({
    name: "grep",
    args_cid: grepArgsCID,
    result_cid: grepResultCID,
    started_at: "2026-05-21T13:15:00Z",
    finished_at: "2026-05-21T13:15:00Z",
  });

  const factCID = computeCID(adrFact);
  const ruleCID = computeCID(rule);
  const modelCID = computeCID({ model: "claude-opus-4.7" });

  const calc = makeCalculationActivity({
    inputs: [factCID],
    rules: [ruleCID],
    model: {
      model_cid: modelCID,
      display_name: "claude-opus-4.7",
      params: { temperature: 0 },
    },
    tool_calls: [grepCall],
    outputs: [],
    tier: TrustTier.Tier1,
    started_at: "2026-05-21T13:15:00Z",
    finished_at: "2026-05-21T13:16:00Z",
  });
  const signedCalc = await sealEnvelope(calc, reviewerBot);

  // 4. Effect: refactor scope with affected files
  const file1CID = computeCID({ path: "src/main/ipc/window.ts" });
  const file2CID = computeCID({ path: "src/main/ipc/menu.ts" });

  const dagLeaf1 = makeCausalDAGNode({
    entity_cid: file1CID,
    weight: makeInterval(1, 1),
    confidence: makeInterval(1, 1),
    upstream: [],
  });
  const dagLeaf2 = makeCausalDAGNode({
    entity_cid: file2CID,
    weight: makeInterval(1, 1),
    confidence: makeInterval(1, 1),
    upstream: [],
  });
  const rangeRootCID = computeCID({ root: [dagLeaf1, dagLeaf2] });

  const calcCID = computeCID(calc);
  const effect = makeEffectNode({
    caused_by: calcCID,
    affects: [
      makeAffectedEntity({
        entity_cid: file1CID,
        weight: makeInterval(1, 1),
        confidence: makeInterval(0.9, 1.0),
        label: "must_change",
      }),
      makeAffectedEntity({
        entity_cid: file2CID,
        weight: makeInterval(1, 1),
        confidence: makeInterval(0.9, 1.0),
        label: "must_change",
      }),
    ],
    range_root: rangeRootCID,
    validity: makeValidity({ valid_from: "2026-05-21T13:16:00Z" }),
  });
  const signedEffect = await sealEnvelope(effect, reviewerBot);

  // 5. A third party verifies the chain
  const factOpened = await openEnvelope(signedFact);
  const ruleOpened = await openEnvelope(signedRule);
  const calcOpened = await openEnvelope(signedCalc);
  const effectOpened = await openEnvelope(signedEffect);

  expect(factOpened.valid).toBe(true);
  expect(ruleOpened.valid).toBe(true);
  expect(calcOpened.valid).toBe(true);
  expect(effectOpened.valid).toBe(true);

  // 6. The Effect references the Calculation, which references the Fact and Rule
  expect(effectOpened.payload.caused_by.toString()).toBe(calcCID.toString());
  expect(calcOpened.payload.inputs[0]!.toString()).toBe(factCID.toString());
  expect(calcOpened.payload.rules[0]!.toString()).toBe(ruleCID.toString());

  // 7. Cache property: two CIDs of the same Fact match (dedup baseline)
  const factCID2 = computeCID(adrFact);
  expect(factCID.toString()).toBe(factCID2.toString());
});
