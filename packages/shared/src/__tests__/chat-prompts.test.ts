import {
  getPromptPresets,
  getPromptPresetsAsStrings,
  STARTER_PROMPTS,
  FOLLOW_UP_PROMPTS,
} from "../utils/chat-prompts";
import { describe, it, expect } from "vitest";

describe("chat-prompts", () => {
  it("returns starter prompts when messageCount is 0", () => {
    const presets = getPromptPresets({
      messageCount: 0,
      seed: 12345,
      count: 4,
    });
    expect(presets.length).toBe(4);
    expect(
      presets.every(p => STARTER_PROMPTS.some(sp => sp.prompt === p.prompt)),
    ).toBe(true);
  });

  it("returns follow-up prompts when messageCount > 0", () => {
    const presets = getPromptPresets({
      messageCount: 1,
      seed: 12345,
      count: 4,
    });
    expect(presets.length).toBe(4);
    expect(
      presets.every(p => FOLLOW_UP_PROMPTS.some(fp => fp.prompt === p.prompt)),
    ).toBe(true);
  });

  it("returns fewer results when count exceeds pool size", () => {
    const presets = getPromptPresets({
      messageCount: 0,
      seed: 12345,
      count: 999,
    });
    expect(presets.length).toBe(STARTER_PROMPTS.length);
  });

  it("returns different results for different seeds", () => {
    const presets1 = getPromptPresets({ messageCount: 0, seed: 1, count: 4 });
    const presets2 = getPromptPresets({ messageCount: 0, seed: 2, count: 4 });
    expect(presets1).not.toEqual(presets2);
  });

  it("getPromptPresetsAsStrings returns only prompt strings", () => {
    const strings = getPromptPresetsAsStrings({
      messageCount: 0,
      seed: 12345,
      count: 3,
    });
    expect(strings.length).toBe(3);
    expect(strings.every(s => typeof s === "string")).toBe(true);
  });

  it("each preset has required fields", () => {
    const presets = getPromptPresets({
      messageCount: 0,
      seed: 12345,
      count: 4,
    });
    for (const preset of presets) {
      expect(preset.label).toBeTruthy();
      expect(preset.prompt).toBeTruthy();
      expect(["app", "landing", "component", "dashboard", "general"]).toContain(
        preset.category,
      );
    }
  });
});
