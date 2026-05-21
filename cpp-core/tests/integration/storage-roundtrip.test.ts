import { test, expect } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FilesystemStorage,
  Resolver,
  followSupersession,
  isStale,
  generateDIDKey,
  computeCID,
  makeFactNode,
  makeRuleNode,
  makeCalculationActivity,
  makeToolCall,
  makeEffectNode,
  makeAffectedEntity,
  makeValidity,
  makeInterval,
  makeConfidence,
  TrustTier,
} from "../../src/index";

test("end-to-end: store full ADR chain on filesystem, resolve typed nodes, follow supersession", async () => {
  const dir = await mkdtemp(join(tmpdir(), "cpp-roundtrip-"));
  try {
    const storage = new FilesystemStorage(dir);
    const resolver = new Resolver(storage);
    const developer = await generateDIDKey();

    // --- 1. Store a Fact (initial ADR)
    const adrBodyCID = computeCID({
      title: "Switch IPC from .send to .invoke",
      rationale: "Avoid races at quit time",
    });
    const factV1 = makeFactNode({
      payload_cid: adrBodyCID,
      source: { did: developer.did, role: "human:developer" },
      timestamp: "2026-05-21T13:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T13:00:00Z" }),
    });
    const factV1_CID = await storage.put(factV1);

    // --- 2. Store a Rule
    const rule = makeRuleNode({
      expression_cid: computeCID({ pattern: "ipcRenderer.send" }),
      version: "1.0.0",
      authority: { did: developer.did, role: "team-lead" },
      applicable_to: ["typescript"],
      validity: makeValidity({ valid_from: "2026-05-21T13:00:00Z" }),
    });
    const ruleCID = await storage.put(rule);

    // --- 3. Store a Calculation
    const toolCall = makeToolCall({
      name: "grep",
      args_cid: computeCID({ pattern: "ipcRenderer.send" }),
      result_cid: computeCID({ matches: ["a.ts", "b.ts"] }),
      started_at: "2026-05-21T13:15:00Z",
      finished_at: "2026-05-21T13:15:01Z",
    });
    const calc = makeCalculationActivity({
      inputs: [factV1_CID],
      rules: [ruleCID],
      model: {
        model_cid: computeCID({ model: "claude-opus-4.7" }),
        display_name: "claude-opus-4.7",
        params: { temperature: 0 },
      },
      tool_calls: [toolCall],
      outputs: [],
      tier: TrustTier.Tier1,
      started_at: "2026-05-21T13:15:00Z",
      finished_at: "2026-05-21T13:16:00Z",
    });
    const calcCID = await storage.put(calc);

    // --- 4. Store an Effect
    const fileCID = computeCID({ path: "src/main/ipc/window.ts" });
    const effect = makeEffectNode({
      caused_by: calcCID,
      affects: [
        makeAffectedEntity({
          entity_cid: fileCID,
          weight: makeInterval(1, 1),
          confidence: makeConfidence(0.9, 1.0),
          label: "must_change",
        }),
      ],
      range_root: computeCID({ root: [fileCID] }),
      validity: makeValidity({ valid_from: "2026-05-21T13:16:00Z" }),
    });
    const effectCID = await storage.put(effect);

    // --- 5. Resolver retrieves each node with correct type
    const resolvedFact = await resolver.resolveFact(factV1_CID);
    const resolvedRule = await resolver.resolveRule(ruleCID);
    const resolvedCalc = await resolver.resolveCalculation(calcCID);
    const resolvedEffect = await resolver.resolveEffect(effectCID);

    expect(resolvedFact?.type).toBe("fact");
    expect(resolvedRule?.type).toBe("rule");
    expect(resolvedCalc?.type).toBe("calculation");
    expect(resolvedEffect?.type).toBe("effect");
    expect(resolvedEffect?.caused_by.toString()).toBe(calcCID.toString());
    expect(resolvedCalc?.inputs[0]!.toString()).toBe(factV1_CID.toString());

    // --- 6. Issue a superseded version of the Fact (v2)
    const factV2 = makeFactNode({
      payload_cid: computeCID({
        title: "Switch IPC from .send to .invoke (revised)",
        rationale: "Avoid races at quit + improve type safety",
      }),
      source: { did: developer.did, role: "human:developer" },
      timestamp: "2026-05-21T14:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T14:00:00Z" }),
    });
    const factV2_CID = await storage.put(factV2);

    // Re-store v1 with superseded_by pointing at v2
    const factV1_revised = makeFactNode({
      payload_cid: adrBodyCID,
      source: { did: developer.did, role: "human:developer" },
      timestamp: "2026-05-21T13:00:00Z",
      validity: makeValidity({
        valid_from: "2026-05-21T13:00:00Z",
        superseded_by: factV2_CID,
      }),
    });
    const factV1_revised_CID = await storage.put(factV1_revised);

    // --- 7. isStale + followSupersession
    expect(isStale(factV2, new Date("2026-05-21T15:00:00Z"))).toBe(false);
    expect(isStale(factV1_revised, new Date("2026-05-21T15:00:00Z"))).toBe(true);

    const tip = await followSupersession(
      factV1_revised_CID,
      (cid) => resolver.resolveFact(cid)
    );
    expect(tip?.timestamp).toBe("2026-05-21T14:00:00Z");

    // --- 8. Idempotence: writing the same fact twice yields same CID
    const dup = await storage.put(factV2);
    expect(dup.toString()).toBe(factV2_CID.toString());
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
