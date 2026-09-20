import type { Role } from "./types";

export function isStaff(role: Role): boolean {
  return role === "STAFF" || role === "ADMIN";
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

export function canAssignRole(actor: Role, targetCurrent: Role, next: Role): boolean {
  if (actor !== "ADMIN") return false;
  if (next === targetCurrent) return false;
  return true;
}

export function canSelfPromote(actorId: string, targetId: string): boolean {
  return actorId === targetId;
}

/** Client-supplied role values are ignored. New accounts are always STUDENT. */
export const DEFAULT_NEW_USER_ROLE: Role = "STUDENT";

export const PROTECTED_USER_FIELDS = [
  "role",
  "karmaPoints",
  "trustScore",
  "itemsReturned",
  "recoveredItems",
  "falseClaims",
] as const;
