import type { Role } from "./types.ts";
import { canAssignRole as canAssignRoleDecision } from "./role-assignment.ts";

export function isStaff(role: Role): boolean {
  return role === "STAFF" || role === "ADMIN";
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

export const canAssignRole = canAssignRoleDecision;

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
