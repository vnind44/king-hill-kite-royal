import { hashPassword } from "better-auth/crypto";
import { getSql } from "@/lib/db";
import { CAMPUS_OPERATORS } from "./operators";

export async function ensureCampusOperators(): Promise<void> {
  const sql = await getSql();
  for (const op of CAMPUS_OPERATORS) {
    const existingUser = await sql<{ id: string }>`
      select id from "user" where email = ${op.email} limit 1`;
    const userId = existingUser[0]?.id ?? op.id;
    if (!existingUser[0]) {
      await sql`
        insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        values (${op.id}, ${op.name}, ${op.email}, ${true}, now(), now())
        on conflict (id) do nothing`;
    }
    const existingAccount = await sql<{ id: string }>`
      select id from account where "userId" = ${userId} and "providerId" = ${"credential"} limit 1`;
    if (!existingAccount[0]) {
      const passwordHash = await hashPassword(op.password);
      await sql`
        insert into account (
          id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
        ) values (
          ${`${userId}-credential`}, ${userId}, ${"credential"}, ${userId},
          ${passwordHash}, now(), now()
        )
        on conflict (id) do nothing`;
    }
    await sql`
      insert into campus_users (id, email, display_name, student_id, campus_zone, role)
      values (${userId}, ${op.email}, ${op.name}, ${op.studentId}, ${op.zone}, ${op.role})
      on conflict (id) do update set
        email = excluded.email,
        display_name = excluded.display_name,
        student_id = excluded.student_id,
        campus_zone = excluded.campus_zone,
        role = excluded.role`;
    if (op.role === "STAFF") {
      await sql`
        insert into staff_assignments (id, user_id, area, duty, active, assigned_by)
        values (${`${userId}-primary`}, ${userId}, ${op.zone}, ${"PRIMARY"}, ${true}, ${userId})
        on conflict (id) do nothing`;
    }
    if (op.role === "STAFF" || op.role === "ADMIN") {
      await sql`
        insert into staff_permissions (user_id, can_confirm_receipt, can_verify_claims, can_complete_handover, updated_by)
        values (${userId}, ${true}, ${true}, ${true}, ${userId})
        on conflict (user_id) do nothing`;
    }
  }
}
