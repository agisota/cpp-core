import { test, expect } from "bun:test";
import { version } from "../src/index";

test("library exports version", () => {
  expect(version).toBe("0.3.0-scaffold.1");
});
