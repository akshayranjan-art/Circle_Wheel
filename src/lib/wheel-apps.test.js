import { expect, test } from "bun:test";
import { ICON_PACKS, iconPackCategory, saveLauncherPreferences, loadLauncherPreferences, DEFAULT_LAUNCHER_PREFERENCES } from "./wheel-apps";

test("launcher offers thirty distinct icon themes after twenty additions", () => {
  expect(new Set(ICON_PACKS).size).toBe(30);
});

test("favorite pack survives saving and loading launcher preferences", () => {
  const store = new Map();
  const oldWindow = globalThis.window;
  const oldStorage = globalThis.localStorage;
  globalThis.window = { dispatchEvent() {} };
  globalThis.localStorage = { setItem: (key, value) => store.set(key, value), getItem: (key) => store.get(key) ?? null };
  try {
    saveLauncherPreferences({ ...DEFAULT_LAUNCHER_PREFERENCES, favoriteIconPacks: ["peacock-jewel"] });
    expect(loadLauncherPreferences().favoriteIconPacks).toEqual(["peacock-jewel"]);
  } finally {
    globalThis.window = oldWindow;
    globalThis.localStorage = oldStorage;
  }
});

test("festival, glass, dark and light collections are categorized separately", () => {
  expect(iconPackCategory("diwali-diya")).toBe("Festivals");
  expect(iconPackCategory("christmas-glass")).toBe("Festivals");
  expect(iconPackCategory("crystal-clear")).toBe("Glass");
  expect(iconPackCategory("amoled-onyx")).toBe("Dark");
  expect(iconPackCategory("porcelain-light")).toBe("Light");
});