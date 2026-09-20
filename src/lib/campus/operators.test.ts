import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAMPUS_OPERATORS, operatorForPath, operatorForRole } from "./operators.ts";
import { canEnterPortal } from "./portals.ts";

describe("campus operators", () => {
  it("seeds a Library STAFF role and an ADMIN role", () => {
    const staff = CAMPUS_OPERATORS.find((o) => o.role === "STAFF");
    const admin = CAMPUS_OPERATORS.find((o) => o.role === "ADMIN");
    assert.equal(staff?.email, "staff@campus.edu");
    assert.equal(staff?.zone, "Library");
    assert.equal(admin?.email, "admin@campus.edu");
    assert.notEqual(staff?.password, admin?.password);
  });

  it("maps staff and admin taps to backend roles", () => {
    assert.equal(operatorForPath("/staff")?.role, "STAFF");
    assert.equal(operatorForPath("/admin")?.role, "ADMIN");
    assert.equal(operatorForPath("/home")?.role, "STUDENT");
    assert.equal(operatorForRole("student")?.email, "student@campus.edu");
    assert.equal(operatorForRole("staff")?.email, "staff@campus.edu");
    assert.equal(operatorForRole("admin")?.email, "admin@campus.edu");
  });

  it("segregates portal access so only admin has full control", () => {
    assert.equal(canEnterPortal("STUDENT", "admin"), false);
    assert.equal(canEnterPortal("STAFF", "admin"), false);
    assert.equal(canEnterPortal("ADMIN", "admin"), true);
    assert.equal(canEnterPortal("ADMIN", "staff"), true);
    assert.equal(canEnterPortal("STUDENT", "staff"), false);
    assert.equal(canEnterPortal("STUDENT", "student"), true);
  });
});

