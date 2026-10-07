import { expect, test } from "bun:test";
import { ICON_PACKS } from "./wheel-apps";

test("launcher offers thirty distinct icon themes after twenty additions", () => {
  expect(new Set(ICON_PACKS).size).toBe(30);
});