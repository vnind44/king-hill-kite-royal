import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actorCanApply, canTransition, isTerminal, nextStatuses } from "./claim-machine.ts";
import { canAssignRole, canSelfPromote, DEFAULT_NEW_USER_ROLE, isAdmin, isStaff } from "./roles.ts";

describe("claim state machine", () => {
  it("allows the documented forward path", () => {
    assert.equal(canTransition("SUBMITTED", "UNDER_REVIEW"), true);
    assert.equal(canTransition("UNDER_REVIEW", "VERIFIED"), true);
    assert.equal(canTransition("VERIFIED", "HANDOVER_PENDING"), true);
    assert.equal(canTransition("HANDOVER_PENDING", "COMPLETED"), true);
  });

  it("rejects skips and reverse moves", () => {
    assert.equal(canTransition("SUBMITTED", "COMPLETED"), false);
    assert.equal(canTransition("COMPLETED", "SUBMITTED"), false);
    assert.equal(canTransition("REJECTED", "VERIFIED"), false);
  });

  it("blocks students from verification and self-approval", () => {
    const student = actorCanApply("STUDENT", "UNDER_REVIEW", "VERIFIED", {
      actorId: "staff-1",
      claimantId: "stu-1",
      itemReporterId: "stu-2",
    });
    assert.equal(student, false);

    const selfVerify = actorCanApply("STAFF", "UNDER_REVIEW", "VERIFIED", {
      actorId: "stu-1",
      claimantId: "stu-1",
      itemReporterId: "stu-2",
    });
    assert.equal(selfVerify, false);

    const staffOk = actorCanApply("STAFF", "UNDER_REVIEW", "VERIFIED", {
      actorId: "staff-1",
      claimantId: "stu-1",
      itemReporterId: "stu-2",
    });
    assert.equal(staffOk, true);
  });

  it("exposes next statuses and terminals", () => {
    assert.deepEqual(nextStatuses("UNDER_REVIEW"), ["VERIFIED", "REJECTED"]);
    assert.equal(isTerminal("COMPLETED"), true);
    assert.equal(isTerminal("SUBMITTED"), false);
  });
});

describe("role handling", () => {
  it("assigns STUDENT to new users", () => {
    assert.equal(DEFAULT_NEW_USER_ROLE, "STUDENT");
  });

  it("only admins may assign roles, and never to themselves via client id equality", () => {
    assert.equal(canAssignRole("STUDENT", "STUDENT", "ADMIN"), false);
    assert.equal(canAssignRole("STAFF", "STUDENT", "STAFF"), false);
    assert.equal(canAssignRole("ADMIN", "STUDENT", "STAFF"), true);
    assert.equal(canSelfPromote("u1", "u1"), true);
    assert.equal(canSelfPromote("admin", "other"), false);
  });

  it("treats staff and admin as staff-capable", () => {
    assert.equal(isStaff("STAFF"), true);
    assert.equal(isStaff("ADMIN"), true);
    assert.equal(isStaff("STUDENT"), false);
    assert.equal(isAdmin("ADMIN"), true);
    assert.equal(isAdmin("STAFF"), false);
  });
});
