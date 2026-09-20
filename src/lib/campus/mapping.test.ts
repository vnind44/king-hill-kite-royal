import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterItems, itemFromDto, redactItemForPublic, shouldSendNotification } from "./mapping.ts";

describe("firestore-style item mapping", () => {
  it("maps snake_case documents and conceals incognito finders", () => {
    const item = itemFromDto({
      id: "i1",
      reporter_id: "u1",
      reporter_name: "Jordan Lee",
      title: "Room keys",
      category: "Keys",
      item_type: "FOUND",
      status: "UNDER_REVIEW",
      location: "Student Center",
      created_at: "2026-09-20T00:00:00.000Z",
      incognito_finder: true,
    });
    assert.equal(item.reporterName, "Anonymous finder");
    assert.equal(item.itemType, "FOUND");
    assert.equal(item.locationZone, "Main Campus");
  });

  it("strips identifying marks from the public view", () => {
    const item = itemFromDto({
      id: "i2",
      reporter_id: "u1",
      title: "Student ID",
      category: "IDs & cards",
      identifying_marks: "Name on reverse",
      item_type: "FOUND",
      status: "UNDER_REVIEW",
      location: "Administration Block",
      created_at: "t",
    });
    assert.equal(item.identifyingMarks, "Name on reverse");
    assert.equal(redactItemForPublic(item).identifyingMarks, "");
  });
});

describe("item search and filtering", () => {
  const items = [
    itemFromDto({
      id: "1",
      reporter_id: "a",
      title: "Black backpack",
      category: "Bags & luggage",
      description: "small tear on the pocket",
      color: "black",
      item_type: "FOUND",
      status: "UNDER_REVIEW",
      location: "Library",
      location_zone: "Library",
      created_at: "t",
    }),
    itemFromDto({
      id: "2",
      reporter_id: "b",
      title: "Student ID",
      category: "IDs & cards",
      item_type: "LOST",
      status: "SEARCHING",
      location: "Administration Block",
      location_zone: "Administration Block",
      created_at: "t",
    }),
  ];

  it("filters by query across title, location, and details", () => {
    assert.equal(filterItems(items, { query: "library" }).length, 1);
    assert.equal(filterItems(items, { query: "student" })[0]?.id, "2");
  });

  it("filters by category, type, and location", () => {
    assert.equal(filterItems(items, { category: "Keys" }).length, 0);
    assert.equal(filterItems(items, { type: "LOST" }).length, 1);
    assert.equal(filterItems(items, { location: "Library" }).length, 1);
    assert.equal(filterItems(items, { category: "All", type: "ALL" }).length, 2);
  });
});

describe("notification generation", () => {
  it("honors quiet mode and preference flags", () => {
    assert.equal(
      shouldSendNotification({ quietMode: true, smartMatchPush: true, claimAlerts: true }, "MATCH"),
      false,
    );
    assert.equal(
      shouldSendNotification({ quietMode: false, smartMatchPush: false, claimAlerts: true }, "MATCH"),
      false,
    );
    assert.equal(
      shouldSendNotification({ quietMode: false, smartMatchPush: true, claimAlerts: false }, "CLAIM"),
      false,
    );
    assert.equal(
      shouldSendNotification({ quietMode: false, smartMatchPush: true, claimAlerts: true }, "CLAIM"),
      true,
    );
  });
});
