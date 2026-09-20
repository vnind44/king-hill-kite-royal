import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canPerformDuty, dutyForClaimAction, permissionsForRole } from "./permissions.ts";

describe("staff permissions", () => {
  it("gives admin full control regardless of stored flags", () => {
    assert.equal(canPerformDuty("ADMIN", { canConfirmReceipt: false, canVerifyClaims: false, canCompleteHandover: false }, "RECEIPT"), true);
    assert.equal(canPerformDuty("ADMIN", null, "HANDOVER"), true);
  });

  it("lets admin grant or revoke individual staff duties", () => {
    const limited = { canConfirmReceipt: true, canVerifyClaims: false, canCompleteHandover: false };
    assert.equal(canPerformDuty("STAFF", limited, "RECEIPT"), true);
    assert.equal(canPerformDuty("STAFF", limited, "VERIFY"), false);
    assert.equal(canPerformDuty("STAFF", limited, "HANDOVER"), false);
    assert.equal(canPerformDuty("STUDENT", limited, "RECEIPT"), false);
  });

  it("maps claim actions to duties", () => {
    assert.equal(dutyForClaimAction("VERIFIED"), "VERIFY");
    assert.equal(dutyForClaimAction("COMPLETED"), "HANDOVER");
    assert.equal(permissionsForRole("STUDENT").canVerifyClaims, false);
  });
});
