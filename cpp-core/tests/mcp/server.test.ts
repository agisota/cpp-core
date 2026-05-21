import { test, expect, describe } from "bun:test";
import { CppMcpServer, McpResourceNotFoundError } from "../../src/mcp/server";
import { MemoryStorage } from "../../src/storage/memory";
import { Resolver } from "../../src/storage/resolver";
import { makeFactNode } from "../../src/types/fact";
import { makeRuleNode } from "../../src/types/rule";
import { makeValidity } from "../../src/types/validity";
import { computeCID } from "../../src/cid";
import { buildProvenanceURI } from "../../src/mcp/uri";

describe("CppMcpServer", () => {
  test("handleListResources lists catalog with correct URIs", async () => {
    const storage = new MemoryStorage();
    const resolver = new Resolver(storage);

    const fact = makeFactNode({
      payload_cid: computeCID({ p: 1 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const factCID = await storage.put(fact);

    const rule = makeRuleNode({
      expression_cid: computeCID({ formula: "x" }),
      version: "1.0.0",
      authority: { did: "did:key:z6MkA", role: "x" },
      applicable_to: [],
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const ruleCID = await storage.put(rule);

    const server = new CppMcpServer({
      resolver,
      catalog: [
        { type: "fact", cid: factCID },
        { type: "rule", cid: ruleCID },
      ],
    });

    const result = await server.handleListResources();
    expect(result.resources.length).toBe(2);
    expect(result.resources[0]!.uri).toBe(buildProvenanceURI({ type: "fact", cid: factCID }));
    expect(result.resources[1]!.uri).toBe(buildProvenanceURI({ type: "rule", cid: ruleCID }));
  });

  test("handleListResources skips entries not found in storage", async () => {
    const storage = new MemoryStorage();
    const resolver = new Resolver(storage);
    const presentFact = makeFactNode({
      payload_cid: computeCID({ p: 1 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const presentCID = await storage.put(presentFact);
    const ghostCID = computeCID({ never: "stored" });

    const server = new CppMcpServer({
      resolver,
      catalog: [
        { type: "fact", cid: presentCID },
        { type: "fact", cid: ghostCID }, // not in storage
      ],
    });
    const result = await server.handleListResources();
    expect(result.resources.length).toBe(1);
  });

  test("handleReadResource returns JSON contents for valid URI", async () => {
    const storage = new MemoryStorage();
    const resolver = new Resolver(storage);
    const fact = makeFactNode({
      payload_cid: computeCID({ p: 42 }),
      source: { did: "did:key:z6MkA", role: "x" },
      timestamp: "2026-05-21T00:00:00Z",
      validity: makeValidity({ valid_from: "2026-05-21T00:00:00Z" }),
    });
    const cid = await storage.put(fact);
    const uri = buildProvenanceURI({ type: "fact", cid });

    const server = new CppMcpServer({
      resolver,
      catalog: [{ type: "fact", cid }],
    });

    const result = await server.handleReadResource(uri);
    expect(result.contents.length).toBe(1);
    expect(result.contents[0]!.uri).toBe(uri);
    expect(result.contents[0]!.mimeType).toBe("application/json");
    const parsed = JSON.parse(result.contents[0]!.text!);
    expect(parsed.type).toBe("fact");
  });

  test("handleReadResource throws McpResourceNotFoundError for missing CID", async () => {
    const storage = new MemoryStorage();
    const resolver = new Resolver(storage);
    const server = new CppMcpServer({ resolver, catalog: [] });

    const ghostCID = computeCID({ never: "stored" });
    const uri = buildProvenanceURI({ type: "fact", cid: ghostCID });

    await expect(server.handleReadResource(uri)).rejects.toThrow(
      McpResourceNotFoundError
    );
  });
});
