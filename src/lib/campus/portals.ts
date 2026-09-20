import type { Role } from "./types";

export const LOGIN_ROLES = ["student", "staff", "admin"] as const;
export type LoginRole = (typeof LOGIN_ROLES)[number];

export const PORTALS: Record<
  LoginRole,
  {
    label: string;
    title: string;
    hint: string;
    next: "/home" | "/staff" | "/admin";
    required: Role[];
    permissions: string[];
  }
> = {
  student: {
    label: "Student",
    title: "Student sign in",
    hint: "Report lost or found items, search the campus registry, and claim your belongings.",
    next: "/home",
    required: ["STUDENT", "STAFF", "ADMIN"],
    permissions: ["Report lost and found", "Search the campus registry", "Submit ownership claims"],
  },
  staff: {
    label: "Staff",
    title: "Staff sign in",
    hint: "Area desk only. Confirm physical receipt, verify claims, and complete handover.",
    next: "/staff",
    required: ["STAFF", "ADMIN"],
    permissions: ["Confirm receipt in your area", "Verify ownership claims", "Complete protected handover"],
  },
  admin: {
    label: "Admin",
    title: "Admin sign in",
    hint: "Full campus control. Assign roles, bind staff to areas, and manage every desk.",
    next: "/admin",
    required: ["ADMIN"],
    permissions: [
      "Assign Student, Staff, and Admin",
      "Bind staff to campus areas",
      "Manage users and custody desks",
      "Open every area desk",
    ],
  },
};

export function parseLoginRole(value: unknown, next?: unknown): LoginRole {
  if (value === "staff" || value === "admin" || value === "student") return value;
  if (next === "/staff") return "staff";
  if (next === "/admin") return "admin";
  return "student";
}

export function canEnterPortal(accountRole: Role, portal: LoginRole): boolean {
  return PORTALS[portal].required.includes(accountRole);
}
