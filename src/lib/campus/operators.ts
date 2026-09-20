import type { Role } from "./types";
import type { LoginRole } from "./portals";

export type CampusOperator = {
  id: string;
  email: string;
  password: string;
  name: string;
  studentId: string;
  zone: string;
  role: Role;
};

/** Server-assigned operator accounts. Clients cannot grant these roles. */
export const CAMPUS_OPERATORS: CampusOperator[] = [
  {
    id: "campus-student",
    email: "student@campus.edu",
    password: "CampusStudent!24",
    name: "Campus Student",
    studentId: "STU-1001",
    zone: "Student Center",
    role: "STUDENT",
  },
  {
    id: "campus-staff",
    email: "staff@campus.edu",
    password: "CampusStaff!24",
    name: "Library Staff",
    studentId: "STAFF-LIB",
    zone: "Library",
    role: "STAFF",
  },
  {
    id: "campus-admin",
    email: "admin@campus.edu",
    password: "CampusAdmin!24",
    name: "Campus Admin",
    studentId: "ADMIN-01",
    zone: "Administration Block",
    role: "ADMIN",
  },
];

export function operatorForRole(role?: LoginRole | string): CampusOperator | undefined {
  if (role === "staff") return CAMPUS_OPERATORS.find((o) => o.role === "STAFF");
  if (role === "admin") return CAMPUS_OPERATORS.find((o) => o.role === "ADMIN");
  if (role === "student") return CAMPUS_OPERATORS.find((o) => o.role === "STUDENT");
  return undefined;
}

export function operatorForPath(next?: string): CampusOperator | undefined {
  if (next === "/staff") return operatorForRole("staff");
  if (next === "/admin") return operatorForRole("admin");
  if (next === "/home") return operatorForRole("student");
  return undefined;
}
