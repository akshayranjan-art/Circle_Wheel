import { expect, test } from "bun:test";
import { ICON_PACKS } from "./wheel-apps";

test("launcher offers ten distinct icon themes", () => {
  expect(new Set(ICON_PACKS).size).toBe(10);
});