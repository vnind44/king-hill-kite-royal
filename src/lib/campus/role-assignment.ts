import { CAMPUS_ZONES, ROLES, type Role } from "./types.ts";

export type RoleAssignmentInput = {
  actorId: string;
  actorRole: Role;
  targetId: string;
  targetRole: Role;
  nextRole: Role;
  campusZone?: string | null;
  adminCount: number;
};

export type RoleAssignmentOk = {
  ok: true;
  nextRole: Role;
  campusZone: string | null;
  duty: "PRIMARY" | null;
  summary: string;
};

export type RoleAssignmentDenied = {
  ok: false;
  reason: string;
};

export type RoleAssignmentDecision = RoleAssignmentOk | RoleAssignmentDenied;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function evaluateRoleAssignment(input: RoleAssignmentInput): RoleAssignmentDecision {
  if (input.actorRole !== "ADMIN") {
    return { ok: false, reason: "Admin access required. Role changes are server-assigned." };
  }
  if (!input.actorId || !input.targetId) {
    return { ok: false, reason: "Missing user identity." };
  }
  if (input.actorId === input.targetId) {
    return { ok: false, reason: "You cannot change your own role." };
  }
  if (!isRole(input.nextRole)) {
    return { ok: false, reason: "Invalid role." };
  }
  if (input.nextRole === input.targetRole && input.nextRole !== "STAFF") {
    return { ok: false, reason: "User already has that role." };
  }
  if (input.targetRole === "ADMIN" && input.nextRole !== "ADMIN" && input.adminCount <= 1) {
    return { ok: false, reason: "Cannot demote the last campus administrator." };
  }

  if (input.nextRole === "STAFF") {
    const campusZone = (input.campusZone ?? "").trim();
    if (!campusZone) {
      return { ok: false, reason: "Staff must be assigned to a campus area." };
    }
    if (!(CAMPUS_ZONES as readonly string[]).includes(campusZone)) {
      return { ok: false, reason: "Unknown campus area." };
    }
    return {
      ok: true,
      nextRole: "STAFF",
      campusZone,
      duty: "PRIMARY",
      summary: `Assigned STAFF for ${campusZone} (was ${input.targetRole})`,
    };
  }

  return {
    ok: true,
    nextRole: input.nextRole,
    campusZone: input.nextRole === "ADMIN" ? (input.campusZone ?? null) : null,
    duty: null,
    summary: `Set role to ${input.nextRole} (was ${input.targetRole})`,
  };
}

export function staffCoversArea(opts: {
  role: Role;
  assignedAreas: string[];
  homeZone: string;
  itemZone: string;
  itemLocation?: string;
}): boolean {
  if (opts.role === "ADMIN") return true;
  if (opts.role !== "STAFF") return false;
  const areas = opts.assignedAreas.length > 0 ? opts.assignedAreas : [opts.homeZone];
  return areas.includes(opts.itemZone) || Boolean(opts.itemLocation && areas.includes(opts.itemLocation));
}

export function canAssignRole(actor: Role, targetCurrent: Role, next: Role): boolean {
  return evaluateRoleAssignment({
    actorId: "actor",
    actorRole: actor,
    targetId: "target",
    targetRole: targetCurrent,
    nextRole: next,
    campusZone: next === "STAFF" ? "Library" : null,
    adminCount: 2,
  }).ok;
}
