import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAssignRole, evaluateRoleAssignment, staffCoversArea } from "./role-assignment.ts";

describe("role assignment", () => {
  it("blocks students and staff from assigning roles", () => {
    assert.equal(
      evaluateRoleAssignment({
        actorId: "s1",
        actorRole: "STUDENT",
        targetId: "t1",
        targetRole: "STUDENT",
        nextRole: "STAFF",
        campusZone: "Library",
        adminCount: 1,
      }).ok,
      false,
    );
    assert.equal(
      evaluateRoleAssignment({
        actorId: "st1",
        actorRole: "STAFF",
        targetId: "t1",
        targetRole: "STUDENT",
        nextRole: "ADMIN",
        adminCount: 1,
      }).ok,
      false,
    );
  });

  it("blocks self-assignment even for admins", () => {
    const decision = evaluateRoleAssignment({
      actorId: "admin-1",
      actorRole: "ADMIN",
      targetId: "admin-1",
      targetRole: "ADMIN",
      nextRole: "STAFF",
      campusZone: "Library",
      adminCount: 2,
    });
    assert.equal(decision.ok, false);
    if (!decision.ok) assert.match(decision.reason, /own role/i);
  });

  it("requires a known campus area when granting STAFF", () => {
    const missing = evaluateRoleAssignment({
      actorId: "admin-1",
      actorRole: "ADMIN",
      targetId: "u2",
      targetRole: "STUDENT",
      nextRole: "STAFF",
      adminCount: 1,
    });
    assert.equal(missing.ok, false);

    const unknown = evaluateRoleAssignment({
      actorId: "admin-1",
      actorRole: "ADMIN",
      targetId: "u2",
      targetRole: "STUDENT",
      nextRole: "STAFF",
      campusZone: "Moon Base",
      adminCount: 1,
    });
    assert.equal(unknown.ok, false);

    const ok = evaluateRoleAssignment({
      actorId: "admin-1",
      actorRole: "ADMIN",
      targetId: "u2",
      targetRole: "STUDENT",
      nextRole: "STAFF",
      campusZone: "Library",
      adminCount: 1,
    });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.campusZone, "Library");
      assert.equal(ok.duty, "PRIMARY");
    }
  });

  it("refuses to demote the last administrator", () => {
    const last = evaluateRoleAssignment({
      actorId: "admin-1",
      actorRole: "ADMIN",
      targetId: "admin-2",
      targetRole: "ADMIN",
      nextRole: "STUDENT",
      adminCount: 1,
    });
    assert.equal(last.ok, false);

    const ok = evaluateRoleAssignment({
      actorId: "admin-1",
      actorRole: "ADMIN",
      targetId: "admin-2",
      targetRole: "ADMIN",
      nextRole: "STAFF",
      campusZone: "Library",
      adminCount: 2,
    });
    assert.equal(ok.ok, true);
  });

  it("keeps the thin canAssignRole helper aligned", () => {
    assert.equal(canAssignRole("STUDENT", "STUDENT", "ADMIN"), false);
    assert.equal(canAssignRole("ADMIN", "STUDENT", "STAFF"), true);
    assert.equal(canAssignRole("ADMIN", "STUDENT", "ADMIN"), true);
  });

  it("scopes staff to assigned areas and lets admin cover all", () => {
    assert.equal(
      staffCoversArea({
        role: "STAFF",
        assignedAreas: ["Library"],
        homeZone: "Library",
        itemZone: "Hostel",
      }),
      false,
    );
    assert.equal(
      staffCoversArea({
        role: "STAFF",
        assignedAreas: ["Library"],
        homeZone: "Library",
        itemZone: "Library",
      }),
      true,
    );
    assert.equal(
      staffCoversArea({
        role: "ADMIN",
        assignedAreas: [],
        homeZone: "Administration Block",
        itemZone: "Hostel",
      }),
      true,
    );
    assert.equal(
      staffCoversArea({
        role: "STUDENT",
        assignedAreas: ["Library"],
        homeZone: "Library",
        itemZone: "Library",
      }),
      false,
    );
  });
});
