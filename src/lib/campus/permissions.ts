import type { Role } from "./types";

export const STAFF_DUTIES = ["RECEIPT", "VERIFY", "HANDOVER"] as const;
export type StaffDuty = (typeof STAFF_DUTIES)[number];

export type StaffPermissions = {
  canConfirmReceipt: boolean;
  canVerifyClaims: boolean;
  canCompleteHandover: boolean;
};

export const FULL_STAFF_PERMISSIONS: StaffPermissions = {
  canConfirmReceipt: true,
  canVerifyClaims: true,
  canCompleteHandover: true,
};

export const NO_STAFF_PERMISSIONS: StaffPermissions = {
  canConfirmReceipt: false,
  canVerifyClaims: false,
  canCompleteHandover: false,
};

export function permissionsForRole(role: Role, stored?: StaffPermissions | null): StaffPermissions {
  if (role === "ADMIN") return FULL_STAFF_PERMISSIONS;
  if (role !== "STAFF") return NO_STAFF_PERMISSIONS;
  return stored ?? FULL_STAFF_PERMISSIONS;
}

export function canPerformDuty(role: Role, perms: StaffPermissions | null | undefined, duty: StaffDuty): boolean {
  const resolved = permissionsForRole(role, perms);
  if (duty === "RECEIPT") return resolved.canConfirmReceipt;
  if (duty === "VERIFY") return resolved.canVerifyClaims;
  return resolved.canCompleteHandover;
}

export function dutyForClaimAction(action: string): StaffDuty | null {
  if (action === "UNDER_REVIEW" || action === "VERIFIED" || action === "REJECTED") return "VERIFY";
  if (action === "HANDOVER_PENDING" || action === "COMPLETED") return "HANDOVER";
  return null;
}
