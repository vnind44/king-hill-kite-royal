import type { ClaimStatus, Role } from "./types";

const TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["VERIFIED", "REJECTED"],
  VERIFIED: ["HANDOVER_PENDING"],
  REJECTED: [],
  HANDOVER_PENDING: ["COMPLETED"],
  COMPLETED: [],
};

export function canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function actorCanApply(
  role: Role,
  from: ClaimStatus,
  to: ClaimStatus,
  opts: { actorId: string; claimantId: string; itemReporterId: string },
): boolean {
  if (!canTransition(from, to)) return false;
  if (opts.actorId === opts.claimantId) return false;
  if (role === "STUDENT") return false;
  if (role === "STAFF" || role === "ADMIN") return true;
  return false;
}

export function nextStatuses(from: ClaimStatus): ClaimStatus[] {
  return [...(TRANSITIONS[from] ?? [])];
}

export function isTerminal(status: ClaimStatus): boolean {
  return status === "REJECTED" || status === "COMPLETED";
}
