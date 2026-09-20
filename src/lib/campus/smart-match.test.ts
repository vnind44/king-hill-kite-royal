import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canonicalColor,
  MATCH_THRESHOLD,
  scoreMatch,
  shouldSurfaceMatch,
} from "./smart-match.ts";

describe("SmartMatchEngine", () => {
  it("is deterministic for identical inputs", () => {
    const lost = {
      title: "Wildcraft black backpack",
      category: "Bags & luggage",
      color: "navy",
      brand: "Wildcraft",
      location: "Library",
      description: "laptop sleeve and keychain on zipper",
    };
    const found = {
      title: "Black Wildcraft backpack",
      category: "Bags & luggage",
      color: "blue",
      brand: "Wildcraft",
      location: "Main Library Help Desk",
      description: "zipper keychain, laptop sleeve",
    };
    const a = scoreMatch(lost, found);
    const b = scoreMatch(lost, found);
    assert.equal(a.score, b.score);
    assert.deepEqual(a.breakdown, b.breakdown);
  });

  it("scores a strong same-item pair above the surface threshold", () => {
    const result = scoreMatch(
      {
        title: "Sony WF-C500 earbuds",
        category: "Electronics",
        color: "white",
        brand: "Sony",
        location: "Student Center",
        description: "white charging case",
      },
      {
        title: "Sony WF-C500 earbuds white case",
        category: "Electronics",
        color: "white",
        brand: "Sony",
        location: "Student Center info hub",
        description: "white charging case found near the lounge",
      },
    );
    assert.ok(result.score >= MATCH_THRESHOLD, String(result.score));
    assert.equal(shouldSurfaceMatch(result), true);
    assert.match(result.explanation, /category|name|color|brand/i);
  });

  it("does not hardcode 82 percent", () => {
    const weak = scoreMatch(
      { title: "Red umbrella", category: "Accessories", color: "red", location: "Library" },
      { title: "Blue bottle", category: "Bottles & drinkware", color: "blue", location: "Security Office" },
    );
    assert.notEqual(weak.score, 82);
    assert.ok(weak.score < 40, String(weak.score));
    assert.equal(shouldSurfaceMatch(weak), false);
  });

  it("treats navy as blue", () => {
    assert.equal(canonicalColor("Navy"), "blue");
    const result = scoreMatch(
      { title: "Hydro flask", category: "Bottles & drinkware", color: "navy", brand: "Hydro Flask" },
      { title: "Hydroflask bottle", category: "Bottles & drinkware", color: "blue", brand: "Hydro Flask" },
    );
    assert.ok(result.breakdown.color > 0);
  });

  it("category mismatch caps the score even if titles overlap", () => {
    const withCat = scoreMatch(
      { title: "Black backpack", category: "Bags & luggage", color: "black" },
      { title: "Black backpack", category: "Bags & luggage", color: "black" },
    );
    const withoutCat = scoreMatch(
      { title: "Black backpack", category: "Bags & luggage", color: "black" },
      { title: "Black backpack", category: "Electronics", color: "black" },
    );
    assert.ok(withCat.score > withoutCat.score);
  });
});
