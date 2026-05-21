import { test, expect } from "bun:test";
import { version } from "../src/index";

test("library exports version", () => {
  expect(version).toBe("1.0.0-rc.1");
});
