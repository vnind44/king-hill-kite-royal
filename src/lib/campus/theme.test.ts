import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contrastRatio, isWcagAa, PALETTE } from "./theme.ts";

describe("theme contrast", () => {
  it("keeps dark navy text readable on teal CTAs", () => {
    const ratio = contrastRatio(PALETTE.dark.background, PALETTE.dark.secondary);
    assert.ok(ratio >= 3, String(ratio));
  });

  it("meets AA for primary text on light and dark surfaces", () => {
    assert.equal(isWcagAa(PALETTE.light.text, PALETTE.light.background), true);
    assert.equal(isWcagAa(PALETTE.light.text, PALETTE.light.surface), true);
    assert.equal(isWcagAa(PALETTE.dark.text, PALETTE.dark.background), true);
    assert.equal(isWcagAa(PALETTE.dark.text, PALETTE.dark.surface), true);
  });

  it("does not treat light gray on white as AA body text", () => {
    assert.equal(isWcagAa("#CBD5E1", PALETTE.light.background), false);
  });
});
