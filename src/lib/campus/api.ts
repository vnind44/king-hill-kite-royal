import { createServerFn } from "@tanstack/react-start";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { actorCanApply } from "./claim-machine";
import { DEFAULT_NEW_USER_ROLE, isAdmin, isStaff } from "./roles";
import { CAMPUS_OPERATORS } from "./operators";
import { ensureCampusOperators } from "./operators.server";
import { evaluateRoleAssignment, staffCoversArea } from "./role-assignment";
import {
  FULL_STAFF_PERMISSIONS,
  canPerformDuty,
  dutyForClaimAction,
  permissionsForRole,
  type StaffPermissions,
} from "./permissions";
import { filterItems, redactItemForPublic } from "./mapping";
import {
  MATCH_THRESHOLD,
  oppositeType,
  scoreMatch,
  shouldSurfaceMatch,
} from "./smart-match";
import type {
  ActivityEvent,
  CampusItem,
  CampusNotification,
  CampusUser,
  Claim,
  ClaimStatus,
  Desk,
  ItemStatus,
  ItemType,
  Role,
} from "./types";

type UserRow = {
  id: string;
  email: string;
  display_name: string;
  student_id: string;
  phone: string;
  campus_zone: string;
  role: Role;
  karma_points: number;
  trust_score: number;
  items_returned: number;
  recovered_items: number;
  false_claims: number;
  incognito_finder: boolean;
  conceal_residence: boolean;
  smart_match_push: boolean;
  claim_alerts: boolean;
  quiet_mode: boolean;
  theme: "light" | "dark" | "system";
  created_at: string;
};

type ItemRow = {
  id: string;
  reporter_id: string;
  reporter_name: string;
  title: string;
  category: string;
  description: string;
  color: string;
  brand: string;
  identifying_marks: string;
  item_type: ItemType;
  status: ItemStatus;
  location: string;
  location_zone: string;
  photo_url: string | null;
  custody_desk_id: string | null;
  in_custody?: boolean;
  custody_staff_id?: string | null;
  match_score: number | null;
  match_item_id: string | null;
  match_explanation: string | null;
  created_at: string;
  updated_at: string;
  incognito_finder?: boolean;
};

function mapUser(row: UserRow): CampusUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    studentId: row.student_id,
    phone: row.phone,
    campusZone: row.campus_zone,
    role: row.role,
    karmaPoints: Number(row.karma_points),
    trustScore: Number(row.trust_score),
    itemsReturned: Number(row.items_returned),
    recoveredItems: Number(row.recovered_items),
    falseClaims: Number(row.false_claims),
    incognitoFinder: Boolean(row.incognito_finder),
    concealResidence: Boolean(row.conceal_residence),
    smartMatchPush: Boolean(row.smart_match_push),
    claimAlerts: Boolean(row.claim_alerts),
    quietMode: Boolean(row.quiet_mode),
    theme: row.theme,
    createdAt: String(row.created_at),
  };
}

function mapItem(row: ItemRow, revealMarks = false): CampusItem {
  const incognito = Boolean(row.incognito_finder);
  const item: CampusItem = {
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: incognito ? "Anonymous finder" : row.reporter_name || "Campus member",
    title: row.title,
    category: row.category,
    description: row.description,
    color: row.color,
    brand: row.brand,
    identifyingMarks: row.identifying_marks,
    itemType: row.item_type,
    status: row.status,
    location: row.location,
    locationZone: row.location_zone,
    photoUrl: row.photo_url,
    custodyDeskId: row.custody_desk_id,
    inCustody: Boolean(row.in_custody),
    custodyStaffId: row.custody_staff_id ?? null,
    matchScore: row.match_score === null ? null : Number(row.match_score),
    matchItemId: row.match_item_id,
    matchExplanation: row.match_explanation,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
  return revealMarks ? item : redactItemForPublic(item);
}

function mapClaim(row: {
  id: string;
  item_id: string;
  item_title: string;
  claimant_id: string;
  claimant_name: string;
  verification_note: string;
  status: ClaimStatus;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  pin_available?: boolean;
}): Claim {
  return {
    id: row.id,
    itemId: row.item_id,
    itemTitle: row.item_title,
    claimantId: row.claimant_id,
    claimantName: row.claimant_name,
    verificationNote: row.verification_note,
    status: row.status,
    reviewedBy: row.reviewed_by,
    pinAvailable: Boolean(row.pin_available),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function hashPin(claimId: string, pin: string): string {
  return createHash("sha256").update(`${claimId}:${pin}`).digest("hex");
}

function assertPhoto(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("https://") || photoUrl.startsWith("http://")) {
    throw new Error("Remote photo URLs are not accepted. Upload an image file.");
  }
  const ok =
    photoUrl.startsWith("data:image/jpeg") ||
    photoUrl.startsWith("data:image/png") ||
    photoUrl.startsWith("data:image/webp");
  if (!ok) throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  if (photoUrl.length > 700_000) throw new Error("Image is too large. Compress under 500 KB.");
  return photoUrl;
}

async function loadUser(userId: string): Promise<CampusUser | null> {
  const sql = await getSql();
  const rows = await sql<UserRow>`select * from campus_users where id = ${userId} limit 1`;
  return rows[0] ? mapUser(rows[0]) : null;
}

async function requireUser(userId: string): Promise<CampusUser> {
  const user = await loadUser(userId);
  if (!user) throw new Error("Profile not found. Finish registration first.");
  return user;
}

async function assignedAreasFor(userId: string): Promise<string[]> {
  try {
    const sql = await getSql();
    const rows = await sql<{ area: string }>`
      select area from staff_assignments where user_id = ${userId} and active = true`;
    return rows.map((row) => row.area);
  } catch {
    return [];
  }
}

async function loadStoredPermissions(userId: string): Promise<StaffPermissions | null> {
  try {
    const sql = await getSql();
    const rows = await sql<{
      can_confirm_receipt: boolean;
      can_verify_claims: boolean;
      can_complete_handover: boolean;
    }>`select can_confirm_receipt, can_verify_claims, can_complete_handover
      from staff_permissions where user_id = ${userId} limit 1`;
    const row = rows[0];
    if (!row) return null;
    return {
      canConfirmReceipt: Boolean(row.can_confirm_receipt),
      canVerifyClaims: Boolean(row.can_verify_claims),
      canCompleteHandover: Boolean(row.can_complete_handover),
    };
  } catch {
    return null;
  }
}

async function upsertStaffPermissions(
  userId: string,
  perms: StaffPermissions,
  updatedBy: string,
) {
  const sql = await getSql();
  await sql`
    insert into staff_permissions (
      user_id, can_confirm_receipt, can_verify_claims, can_complete_handover, updated_by, updated_at
    ) values (
      ${userId}, ${perms.canConfirmReceipt}, ${perms.canVerifyClaims}, ${perms.canCompleteHandover},
      ${updatedBy}, now()
    )
    on conflict (user_id) do update set
      can_confirm_receipt = excluded.can_confirm_receipt,
      can_verify_claims = excluded.can_verify_claims,
      can_complete_handover = excluded.can_complete_handover,
      updated_by = excluded.updated_by,
      updated_at = now()`;
}

async function loadStaffScope(userId: string) {
  const me = await requireUser(userId);
  if (!isStaff(me.role)) throw new Error("Staff access required");
  const areas = await assignedAreasFor(userId);
  if (areas.length === 0 && me.role === "STAFF") areas.push(me.campusZone);
  const stored = await loadStoredPermissions(userId);
  const permissions = permissionsForRole(me.role, stored);
  return {
    me,
    areas,
    permissions,
    covers(zone: string, location: string) {
      return staffCoversArea({
        role: me.role,
        assignedAreas: areas,
        homeZone: me.campusZone,
        itemZone: zone,
        itemLocation: location,
      });
    },
    can(duty: Parameters<typeof canPerformDuty>[2]) {
      return canPerformDuty(me.role, permissions, duty);
    },
  };
}

async function writeActivity(
  userId: string,
  type: string,
  message: string,
  itemId?: string | null,
  claimId?: string | null,
) {
  const sql = await getSql();
  await sql`insert into activity (id, user_id, type, item_id, claim_id, message)
    values (${randomUUID()}, ${userId}, ${type}, ${itemId ?? null}, ${claimId ?? null}, ${message})`;
}

async function writeNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  itemId?: string | null,
  claimId?: string | null,
) {
  const sql = await getSql();
  const prefs = await sql<{ smart_match_push: boolean; claim_alerts: boolean; quiet_mode: boolean }>`
    select smart_match_push, claim_alerts, quiet_mode from campus_users where id = ${userId}`;
  const p = prefs[0];
  if (p?.quiet_mode) return;
  if (type === "MATCH" && p && !p.smart_match_push) return;
  if ((type === "CLAIM" || type === "HANDOVER") && p && !p.claim_alerts) return;
  await sql`insert into notifications (id, user_id, type, title, body, item_id, claim_id)
    values (${randomUUID()}, ${userId}, ${type}, ${title}, ${body}, ${itemId ?? null}, ${claimId ?? null})`;
}

async function runSmartMatch(newItem: CampusItem) {
  const sql = await getSql();
  const otherType = oppositeType(newItem.itemType);
  const candidates = await sql<ItemRow>`
    select i.*, u.display_name as reporter_name, u.incognito_finder
    from items i
    join campus_users u on u.id = i.reporter_id
    where i.item_type = ${otherType}
      and i.reporter_id <> ${newItem.reporterId}
      and i.status not in ('RETURNED', 'REJECTED', 'HANDED_OVER')`;
  let best: { item: CampusItem; score: number; explanation: string } | null = null;
  for (const row of candidates) {
    const item = mapItem(row);
    const result = scoreMatch(newItem, item);
    if (!shouldSurfaceMatch(result)) continue;
    if (!best || result.score > best.score) {
      best = { item, score: result.score, explanation: result.explanation };
    }
  }
  if (!best) return null;
  await sql`update items set match_score = ${best.score}, match_item_id = ${best.item.id},
    match_explanation = ${best.explanation}, status = case when status = 'SEARCHING' then 'MATCHED' else status end,
    updated_at = now() where id = ${newItem.id}`;
  await sql`update items set match_score = ${best.score}, match_item_id = ${newItem.id},
    match_explanation = ${best.explanation}, status = case when status = 'SEARCHING' then 'MATCHED' else status end,
    updated_at = now() where id = ${best.item.id}`;
  const body = `${best.explanation} Compare “${newItem.title}” with “${best.item.title}”.`;
  await writeNotification(newItem.reporterId, "MATCH", "Possible match found", body, newItem.id);
  await writeNotification(best.item.reporterId, "MATCH", "Possible match found", body, best.item.id);
  await writeActivity(newItem.reporterId, "MATCH", `Smart Match ${best.score}% against ${best.item.title}`, newItem.id);
  return best;
}

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string; studentId?: string; phone?: string; email?: string; campusZone?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await loadUser(context.userId);
    const email = (data.email ?? existing?.email ?? "").trim();
    const displayName = (data.displayName ?? existing?.displayName ?? "").trim();
    const studentId = (data.studentId ?? existing?.studentId ?? "").trim();
    const phone = (data.phone ?? existing?.phone ?? "").trim();
    const campusZone = (data.campusZone ?? existing?.campusZone ?? "Main Campus").trim();
    if (!existing) {
      await sql`insert into campus_users (id, email, display_name, student_id, phone, campus_zone, role)
        values (${context.userId}, ${email || "unknown@campus"}, ${displayName || "Campus member"}, ${studentId}, ${phone}, ${campusZone}, ${DEFAULT_NEW_USER_ROLE})`;
      await writeActivity(context.userId, "PROFILE", "Joined Campus Lost & Found");
    } else {
      await sql`update campus_users set
        email = ${email || existing.email},
        display_name = ${displayName || existing.displayName},
        student_id = ${studentId || existing.studentId},
        phone = ${phone || existing.phone},
        campus_zone = ${campusZone},
        last_login_at = now()
        where id = ${context.userId}`;
    }
    return requireUser(context.userId);
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      await ensureCampusOperators();
    } catch {
      /* operator seed is best-effort; never block the signed-in profile */
    }
    const sql = await getSql();
    let existing = await loadUser(context.userId);
    if (!existing) {
      await sql`insert into campus_users (id, email, display_name, role)
        values (${context.userId}, ${"unknown@campus"}, ${"Campus member"}, ${DEFAULT_NEW_USER_ROLE})
        on conflict (id) do nothing`;
      existing = await loadUser(context.userId);
    }
    if (!existing) throw new Error("Profile not found. Finish registration first.");
    await sql`update campus_users set last_login_at = now() where id = ${context.userId}`;
    const assignedAreas = await assignedAreasFor(context.userId);
    const stored = await loadStoredPermissions(context.userId);
    return {
      ...existing,
      assignedAreas,
      permissions: permissionsForRole(existing.role, stored),
    };
  });

export const updateMySettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    phone?: string;
    campusZone?: string;
    incognitoFinder?: boolean;
    concealResidence?: boolean;
    smartMatchPush?: boolean;
    claimAlerts?: boolean;
    quietMode?: boolean;
    theme?: "light" | "dark" | "system";
    displayName?: string;
    studentId?: string;
  }) => input)
  .handler(async ({ context, data }) => {
    const current = await requireUser(context.userId);
    const sql = await getSql();
    await sql`update campus_users set
      phone = ${data.phone ?? current.phone},
      campus_zone = ${data.campusZone ?? current.campusZone},
      incognito_finder = ${data.incognitoFinder ?? current.incognitoFinder},
      conceal_residence = ${data.concealResidence ?? current.concealResidence},
      smart_match_push = ${data.smartMatchPush ?? current.smartMatchPush},
      claim_alerts = ${data.claimAlerts ?? current.claimAlerts},
      quiet_mode = ${data.quietMode ?? current.quietMode},
      theme = ${data.theme ?? current.theme},
      display_name = ${data.displayName ?? current.displayName},
      student_id = ${data.studentId ?? current.studentId}
      where id = ${context.userId}`;
    return requireUser(context.userId);
  });

export const listDesks = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<Desk & { is_open: boolean; vault_count: number; locker_note: string | null; staff_name: string | null; staff_role: string | null; is_high_value: boolean; is_24_hours: boolean; detail_notes: string | null }>`
    select * from desks order by name`;
  return rows.map((d) => ({
    id: d.id,
    name: d.name,
    location: d.location,
    hours: d.hours,
    isOpen: Boolean(d.is_open ?? d.isOpen),
    tag: d.tag,
    vaultCount: Number(d.vault_count ?? d.vaultCount),
    lockerNote: d.locker_note ?? d.lockerNote,
    staffName: d.staff_name ?? d.staffName,
    staffRole: d.staff_role ?? d.staffRole,
    isHighValue: Boolean(d.is_high_value ?? d.isHighValue),
    is24Hours: Boolean(d.is_24_hours ?? d.is24Hours),
    detailNotes: d.detail_notes ?? d.detailNotes,
  })) satisfies Desk[];
});

export const listPublicItems = createServerFn({ method: "GET" })
  .validator((input?: { query?: string; category?: string; type?: ItemType | "ALL"; location?: string }) => input ?? {})
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      order by i.created_at desc`;
    return filterItems(rows.map((row) => mapItem(row)), {
      query: data.query,
      category: data.category,
      type: data.type,
      location: data.location,
    });
  });

export const getItem = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      where i.id = ${id}
      limit 1`;
    if (!rows[0]) throw new Error("Item not found");
    return mapItem(rows[0]);
  });

export const getManagedItem = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const me = await requireUser(context.userId);
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      where i.id = ${id}
      limit 1`;
    if (!rows[0]) throw new Error("Item not found");
    const reveal = rows[0].reporter_id === me.id || isStaff(me.role);
    return mapItem(rows[0], reveal);
  });

export const listMyItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      where i.reporter_id = ${context.userId}
      order by i.created_at desc`;
    return rows.map((row) => mapItem(row, true));
  });

export const reportItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    title: string;
    category: string;
    description: string;
    color: string;
    brand: string;
    identifyingMarks: string;
    itemType: ItemType;
    location: string;
    locationZone: string;
    photoUrl?: string | null;
    custodyDeskId?: string | null;
  }) => {
    if (!input.title?.trim()) throw new Error("Item name is required");
    if (!input.location?.trim()) throw new Error("Campus location is required");
    if (input.itemType !== "LOST" && input.itemType !== "FOUND") throw new Error("Invalid report type");
    return input;
  })
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    const sql = await getSql();
    const id = randomUUID();
    const status: ItemStatus = data.itemType === "LOST" ? "SEARCHING" : "UNDER_REVIEW";
    const photoUrl = assertPhoto(data.photoUrl);
    const photoPath = photoUrl ? `item-photos/${context.userId}/${id}/photo` : null;
    let custodyDeskId = data.custodyDeskId ?? null;
    if (data.itemType === "FOUND" && !custodyDeskId) {
      const desks = await sql<{ id: string }>`
        select id from desks
        where location = ${data.locationZone} or name ilike ${"%" + data.locationZone + "%"}
        order by name
        limit 1`;
      custodyDeskId = desks[0]?.id ?? null;
    }
    await sql`insert into items (
      id, reporter_id, title, category, description, color, brand, identifying_marks,
      item_type, status, location, location_zone, photo_url, photo_path, custody_desk_id, in_custody
    ) values (
      ${id}, ${context.userId}, ${data.title.trim()}, ${data.category}, ${data.description.trim()},
      ${data.color.trim()}, ${data.brand.trim()}, ${data.identifyingMarks.trim()},
      ${data.itemType}, ${status}, ${data.location.trim()}, ${data.locationZone},
      ${photoUrl}, ${photoPath}, ${custodyDeskId}, ${false}
    )`;
    const created = await getItem({ data: id });
    await writeActivity(
      context.userId,
      "REPORT",
      `Reported ${data.itemType === "LOST" ? "lost" : "found"} item “${data.title.trim()}”`,
      id,
    );
    await writeNotification(
      context.userId,
      "REPORT",
      data.itemType === "LOST" ? "Lost report filed" : "Found report filed",
      data.itemType === "FOUND"
        ? `Hand “${data.title.trim()}” to ${data.locationZone} staff so it can enter official custody.`
        : `Your report for “${data.title.trim()}” is now in the campus registry.`,
      id,
    );
    if (data.itemType === "FOUND") {
      const areaStaff = await sql<{ user_id: string }>`
        select distinct user_id from staff_assignments
        where active = true and (area = ${data.locationZone} or area = ${data.location.trim()})
          and user_id <> ${context.userId}`;
      for (const staff of areaStaff) {
        await writeNotification(
          staff.user_id,
          "STAFF",
          "Item waiting for receipt",
          `A found item at ${data.locationZone} needs physical confirmation: “${data.title.trim()}”.`,
          id,
        );
      }
    }
    const match = await runSmartMatch(created);
    const latest = await getItem({ data: id });
    return { item: latest, match, reporter: me.displayName };
  });

export const matchesForItem = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const item = await getItem({ data: id });
    const others = await listPublicItems({ data: { type: oppositeType(item.itemType) } });
    return others
      .filter((o) => o.id !== item.id && o.reporterId !== item.reporterId)
      .map((o) => ({ item: o, match: scoreMatch(item, o) }))
      .filter((row) => row.match.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 8);
  });

export const submitClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { itemId: string; note: string }) => {
    if (!input.itemId) throw new Error("Item is required");
    if ((input.note ?? "").trim().length < 8) {
      throw new Error("Describe unique details only the owner would know.");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    const item = await getItem({ data: data.itemId });
    if (item.reporterId === context.userId) throw new Error("You cannot claim an item you reported.");
    if (item.itemType === "FOUND" && !item.inCustody) {
      throw new Error("This item is not in staff custody yet. Area staff must confirm physical receipt first.");
    }
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from claims where item_id = ${item.id} and claimant_id = ${context.userId}
        and status not in ('REJECTED', 'COMPLETED')`;
    if (existing[0]) throw new Error("You already have an open claim on this item.");
    const id = randomUUID();
    await sql`insert into claims (id, item_id, claimant_id, verification_note, status)
      values (${id}, ${item.id}, ${context.userId}, ${data.note.trim()}, ${"SUBMITTED"})`;
    await sql`update items set status = ${"CLAIM_PENDING"}, updated_at = now() where id = ${item.id}`;
    await writeActivity(context.userId, "CLAIM", `Submitted a claim for “${item.title}”`, item.id, id);
    await writeNotification(item.reporterId, "CLAIM", "New ownership claim", `${me.displayName} submitted a claim for “${item.title}”.`, item.id, id);
    await writeNotification(context.userId, "CLAIM", "Claim submitted", "Staff will review your claim. You will be notified of the decision.", item.id, id);
    const areaStaff = await sql<{ user_id: string }>`
      select distinct user_id from staff_assignments
      where active = true and (area = ${item.locationZone} or area = ${item.location})
        and user_id <> ${context.userId}`;
    for (const staff of areaStaff) {
      await writeNotification(
        staff.user_id,
        "CLAIM",
        "Claim waiting in your area",
        `A claim for “${item.title}” needs verification at ${item.locationZone}.`,
        item.id,
        id,
      );
    }
    const rows = await sql<{
      id: string; item_id: string; item_title: string; claimant_id: string; claimant_name: string;
      verification_note: string; status: ClaimStatus; reviewed_by: string | null; created_at: string; updated_at: string;
    }>`select c.*, i.title as item_title, u.display_name as claimant_name
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.id = ${id}`;
    return mapClaim(rows[0]!);
  });

export const listMyClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string; item_id: string; item_title: string; claimant_id: string; claimant_name: string;
      verification_note: string; status: ClaimStatus; reviewed_by: string | null; created_at: string; updated_at: string;
      pin_available: boolean;
    }>`select c.*, i.title as item_title, u.display_name as claimant_name,
      exists(select 1 from handovers h where h.claim_id = c.id and h.pin_once is not null) as pin_available
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.claimant_id = ${context.userId}
      order by c.created_at desc`;
    return rows.map(mapClaim);
  });

export const listMyActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ActivityEvent & { item_id: string | null; claim_id: string | null; created_at: string; user_id: string }>`
      select * from activity where user_id = ${context.userId} order by created_at desc limit 80`;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      itemId: r.item_id,
      claimId: r.claim_id,
      message: r.message,
      createdAt: String(r.created_at),
    })) satisfies ActivityEvent[];
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string; user_id: string; type: string; title: string; body: string;
      item_id: string | null; claim_id: string | null; read: boolean; created_at: string;
    }>`select * from notifications where user_id = ${context.userId} order by created_at desc limit 80`;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      body: r.body,
      itemId: r.item_id,
      claimId: r.claim_id,
      read: Boolean(r.read),
      createdAt: String(r.created_at),
    })) satisfies CampusNotification[];
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set read = true where user_id = ${context.userId}`;
    return { ok: true };
  });

export const listStaffClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const scope = await loadStaffScope(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string; item_id: string; item_title: string; claimant_id: string; claimant_name: string;
      verification_note: string; status: ClaimStatus; reviewed_by: string | null; created_at: string; updated_at: string;
      pin_available: boolean; location_zone: string; location: string;
    }>`select c.*, i.title as item_title, i.location, i.location_zone, u.display_name as claimant_name,
      exists(select 1 from handovers h where h.claim_id = c.id and h.pin_once is not null) as pin_available
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.status not in ('COMPLETED', 'REJECTED')
      order by c.created_at asc`;
    return rows
      .filter((row) => scope.covers(row.location_zone, row.location))
      .map(mapClaim);
  });

export const listStaffInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const scope = await loadStaffScope(context.userId);
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      where i.item_type = 'FOUND' and i.in_custody = false
        and i.status not in ('RETURNED', 'REJECTED', 'HANDED_OVER')
      order by i.created_at asc`;
    return rows
      .map((row) => mapItem(row, true))
      .filter((item) => scope.covers(item.locationZone, item.location));
  });

export const confirmReceipt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { itemId: string }) => input)
  .handler(async ({ context, data }) => {
    const scope = await loadStaffScope(context.userId);
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i join campus_users u on u.id = i.reporter_id
      where i.id = ${data.itemId} limit 1`;
    const row = rows[0];
    if (!row) throw new Error("Item not found");
    if (row.item_type !== "FOUND") throw new Error("Only found items enter physical custody.");
    if (!scope.covers(row.location_zone, row.location)) {
      throw new Error("This item belongs to another campus area.");
    }
    if (!scope.can("RECEIPT")) {
      throw new Error("An administrator has not granted you receipt permission.");
    }
    if (row.in_custody) throw new Error("Staff already confirmed receipt.");
    await sql`update items set
      in_custody = true,
      custody_staff_id = ${context.userId},
      custody_confirmed_at = now(),
      updated_at = now()
      where id = ${data.itemId}`;
    await writeActivity(
      context.userId,
      "STAFF",
      `Confirmed physical receipt of “${row.title}” at ${row.location_zone}`,
      data.itemId,
    );
    await writeNotification(
      row.reporter_id,
      "STAFF",
      "Item in custody",
      `Area staff confirmed receipt of “${row.title}”. It is now in official campus custody.`,
      data.itemId,
    );
    return { ok: true };
  });

export const reviewClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { claimId: string; action: "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "HANDOVER_PENDING" | "COMPLETED"; pin?: string }) => input)
  .handler(async ({ context, data }) => {
    const scope = await loadStaffScope(context.userId);
    const me = scope.me;
    const sql = await getSql();
    const rows = await sql<{
      id: string; item_id: string; claimant_id: string; status: ClaimStatus; reporter_id: string; title: string;
      location: string; location_zone: string;
    }>`select c.id, c.item_id, c.claimant_id, c.status, i.reporter_id, i.title, i.location, i.location_zone
      from claims c join items i on i.id = c.item_id where c.id = ${data.claimId} limit 1`;
    const claim = rows[0];
    if (!claim) throw new Error("Claim not found");
    if (!scope.covers(claim.location_zone, claim.location)) {
      throw new Error("This claim belongs to another campus area.");
    }
    const duty = dutyForClaimAction(data.action);
    if (duty && !scope.can(duty)) {
      throw new Error("An administrator has not granted you that staff permission.");
    }
    if (!actorCanApply(me.role, claim.status, data.action, {
      actorId: context.userId,
      claimantId: claim.claimant_id,
      itemReporterId: claim.reporter_id,
    })) {
      throw new Error("That claim update is not allowed.");
    }

    let issuedPin: string | null = null;
    await sql`update claims set status = ${data.action}, reviewed_by = ${context.userId}, reviewed_at = now(), updated_at = now() where id = ${claim.id}`;

    if (data.action === "VERIFIED") {
      await sql`update items set status = ${"READY_FOR_PICKUP"}, updated_at = now() where id = ${claim.item_id}`;
      await writeNotification(claim.claimant_id, "CLAIM", "Claim verified", `Staff verified your claim for “${claim.title}”. Handover can now be scheduled.`, claim.item_id, claim.id);
    }
    if (data.action === "REJECTED") {
      await sql`update items set status = ${"UNDER_REVIEW"}, updated_at = now() where id = ${claim.item_id}`;
      await sql`update campus_users set false_claims = false_claims + 1 where id = ${claim.claimant_id}`;
      await writeNotification(claim.claimant_id, "CLAIM", "Claim rejected", `Your claim for “${claim.title}” was not verified.`, claim.item_id, claim.id);
    }
    if (data.action === "HANDOVER_PENDING") {
      issuedPin = String(randomInt(100000, 1000000));
      const pinHash = hashPin(claim.id, issuedPin);
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await sql`insert into handovers (id, claim_id, item_id, pin_hash, pin_once, pin_revealed, status, expires_at)
        values (${randomUUID()}, ${claim.id}, ${claim.item_id}, ${pinHash}, ${issuedPin}, ${false}, ${"PENDING"}, ${expires})`;
      await writeNotification(
        claim.claimant_id,
        "HANDOVER",
        "Pickup PIN ready",
        `Open Activity to reveal your one-time PIN, then show it at a custody desk within 24 hours.`,
        claim.item_id,
        claim.id,
      );
    }
    if (data.action === "COMPLETED") {
      const pending = await sql<{ id: string; pin_hash: string }>`
        select id, pin_hash from handovers where claim_id = ${claim.id} and status = 'PENDING' order by created_at desc limit 1`;
      const handover = pending[0];
      if (handover) {
        const pin = (data.pin ?? "").replace(/\s/g, "");
        if (!pin || hashPin(claim.id, pin) !== handover.pin_hash) {
          throw new Error("Handover PIN does not match.");
        }
        await sql`update handovers set status = ${"COMPLETED"}, completed_at = now(), completed_by_staff_id = ${context.userId} where id = ${handover.id}`;
      }
      await sql`update items set status = ${"RETURNED"}, updated_at = now() where id = ${claim.item_id}`;
      await sql`update campus_users set items_returned = items_returned + 1, karma_points = karma_points + 50 where id = ${claim.reporter_id}`;
      await sql`update campus_users set recovered_items = recovered_items + 1, karma_points = karma_points + 25 where id = ${claim.claimant_id}`;
      await writeNotification(claim.claimant_id, "HANDOVER", "Item returned", `Handover for “${claim.title}” is complete.`, claim.item_id, claim.id);
      await writeNotification(claim.reporter_id, "HANDOVER", "Item returned", `“${claim.title}” was marked returned at a custody desk.`, claim.item_id, claim.id);
    }

    await writeActivity(context.userId, "STAFF", `Claim ${claim.id} → ${data.action}`, claim.item_id, claim.id);
    return { ok: true, pin: issuedPin };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const me = await requireUser(context.userId);
    if (!isAdmin(me.role)) throw new Error("Admin access required");
    const sql = await getSql();
    const rows = await sql<UserRow>`select * from campus_users order by created_at desc`;
    const assignments = await sql<{ user_id: string; area: string }>`
      select user_id, area from staff_assignments where active = true`;
    const areas = new Map<string, string[]>();
    for (const row of assignments) {
      const list = areas.get(row.user_id) ?? [];
      list.push(row.area);
      areas.set(row.user_id, list);
    }
    const permRows = await sql<{
      user_id: string;
      can_confirm_receipt: boolean;
      can_verify_claims: boolean;
      can_complete_handover: boolean;
    }>`select user_id, can_confirm_receipt, can_verify_claims, can_complete_handover from staff_permissions`;
    const perms = new Map(permRows.map((row) => [row.user_id, {
      canConfirmReceipt: Boolean(row.can_confirm_receipt),
      canVerifyClaims: Boolean(row.can_verify_claims),
      canCompleteHandover: Boolean(row.can_complete_handover),
    }]));
    return rows.map((row) => {
      const user = mapUser(row);
      return {
        ...user,
        assignedAreas: areas.get(row.id) ?? [],
        permissions: permissionsForRole(user.role, perms.get(row.id)),
      };
    });
  });

export const listAdminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const me = await requireUser(context.userId);
    if (!isAdmin(me.role)) throw new Error("Admin access required");
    const sql = await getSql();
    const counts = await sql<{
      users: number; staff: number; admins: number; open_claims: number; awaiting: number; desks: number;
    }>`select
      (select count(*)::int from campus_users) as users,
      (select count(*)::int from campus_users where role = 'STAFF') as staff,
      (select count(*)::int from campus_users where role = 'ADMIN') as admins,
      (select count(*)::int from claims where status not in ('COMPLETED', 'REJECTED')) as open_claims,
      (select count(*)::int from items where item_type = 'FOUND' and in_custody = false
        and status not in ('RETURNED', 'REJECTED', 'HANDED_OVER')) as awaiting,
      (select count(*)::int from desks) as desks`;
    return counts[0] ?? { users: 0, staff: 0, admins: 0, open_claims: 0, awaiting: 0, desks: 0 };
  });

export const assignRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; role: Role; campusZone?: string }) => input)
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    const sql = await getSql();
    const targetRows = await sql<UserRow>`select * from campus_users where id = ${data.userId} limit 1`;
    const target = targetRows[0];
    if (!target) throw new Error("User not found");
    const admins = await sql<{ n: number }>`select count(*)::int as n from campus_users where role = 'ADMIN'`;
    const decision = evaluateRoleAssignment({
      actorId: context.userId,
      actorRole: me.role,
      targetId: data.userId,
      targetRole: target.role,
      nextRole: data.role,
      campusZone: data.campusZone ?? target.campus_zone,
      adminCount: Number(admins[0]?.n ?? 0),
    });
    if (!decision.ok) throw new Error(decision.reason);

    await sql`update campus_users set
      role = ${decision.nextRole},
      campus_zone = ${decision.campusZone ?? target.campus_zone}
      where id = ${data.userId}`;

    if (decision.nextRole === "STAFF" && decision.campusZone) {
      await sql`update staff_assignments set active = false, revoked_at = now()
        where user_id = ${data.userId} and active = true`;
      await sql`insert into staff_assignments (id, user_id, area, duty, active, assigned_by)
        values (${randomUUID()}, ${data.userId}, ${decision.campusZone}, ${"PRIMARY"}, ${true}, ${context.userId})`;
      await upsertStaffPermissions(data.userId, FULL_STAFF_PERMISSIONS, context.userId);
    }
    if (decision.nextRole === "ADMIN") {
      await upsertStaffPermissions(data.userId, FULL_STAFF_PERMISSIONS, context.userId);
    }
    if (decision.nextRole === "STUDENT") {
      await sql`update staff_assignments set active = false, revoked_at = now()
        where user_id = ${data.userId} and active = true`;
      await sql`delete from staff_permissions where user_id = ${data.userId}`;
    }

    await writeActivity(context.userId, "ADMIN", decision.summary, null, null);
    await writeNotification(
      data.userId,
      "ADMIN",
      "Campus role updated",
      decision.summary,
    );
    return { ok: true, role: decision.nextRole, campusZone: decision.campusZone, summary: decision.summary };
  });

export const setStaffPermissions = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    userId: string;
    canConfirmReceipt: boolean;
    canVerifyClaims: boolean;
    canCompleteHandover: boolean;
  }) => input)
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    if (!isAdmin(me.role)) throw new Error("Admin access required");
    if (data.userId === context.userId) throw new Error("Admin already has full control. You cannot limit your own permissions.");
    const target = await loadUser(data.userId);
    if (!target) throw new Error("User not found");
    if (target.role !== "STAFF") {
      throw new Error("Permissions can only be set on Staff. Admin already has full control.");
    }
    const perms: StaffPermissions = {
      canConfirmReceipt: Boolean(data.canConfirmReceipt),
      canVerifyClaims: Boolean(data.canVerifyClaims),
      canCompleteHandover: Boolean(data.canCompleteHandover),
    };
    await upsertStaffPermissions(data.userId, perms, context.userId);
    await writeActivity(
      context.userId,
      "ADMIN",
      `Set staff permissions for ${target.displayName || target.email}: receipt ${perms.canConfirmReceipt}, verify ${perms.canVerifyClaims}, handover ${perms.canCompleteHandover}`,
    );
    await writeNotification(
      data.userId,
      "ADMIN",
      "Staff permissions updated",
      "An administrator changed what you can do at your area desk.",
    );
    return { ok: true, permissions: perms };
  });

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const admins = await sql<{ n: number }>`select count(*)::int as n from campus_users where role = 'ADMIN'`;
    if (Number(admins[0]?.n ?? 0) > 0) {
      throw new Error("A campus administrator already exists.");
    }
    await requireUser(context.userId);
    await sql`update campus_users set role = ${"ADMIN"} where id = ${context.userId}`;
    await writeActivity(context.userId, "ADMIN", "Initialized the first campus administrator");
    return requireUser(context.userId);
  });

export const adminCount = createServerFn({ method: "GET" }).handler(async () => {
  await ensureCampusOperators();
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from campus_users where role = 'ADMIN'`;
  return { count: Number(rows[0]?.n ?? 0) };
});

export const listCampusOperators = createServerFn({ method: "GET" }).handler(async () => {
  await ensureCampusOperators();
  return CAMPUS_OPERATORS.map((op) => ({
    role: op.role,
    email: op.email,
    password: op.password,
    label: op.name,
    zone: op.zone,
  }));
});

export const revealHandoverPin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { claimId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: string; pin_once: string | null }>`
      select h.id, h.pin_once
      from handovers h
      join claims c on c.id = h.claim_id
      where c.id = ${data.claimId}
        and c.claimant_id = ${context.userId}
        and h.status = 'PENDING'
      order by h.created_at desc
      limit 1`;
    const row = rows[0];
    if (!row) throw new Error("No pickup PIN is waiting for this claim.");
    if (!row.pin_once) throw new Error("This PIN was already shown. Ask staff at the custody desk.");
    await sql`update handovers set pin_once = null, pin_revealed = true where id = ${row.id}`;
    return { pin: row.pin_once };
  });

export const upsertDesk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; name: string; location: string; hours: string }) => {
    if (!input.name?.trim() || !input.location?.trim()) throw new Error("Desk name and location are required.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    if (!isAdmin(me.role)) throw new Error("Admin access required");
    const sql = await getSql();
    const id = data.id?.trim() || randomUUID();
    await sql`
      insert into desks (id, name, location, hours, is_open)
      values (${id}, ${data.name.trim()}, ${data.location.trim()}, ${data.hours.trim() || "Open"}, ${true})
      on conflict (id) do update set
        name = excluded.name,
        location = excluded.location,
        hours = excluded.hours`;
    await writeActivity(context.userId, "ADMIN", `Saved custody desk ${data.name.trim()}`);
    return { ok: true, id };
  });

export const deleteDesk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    if (!isAdmin(me.role)) throw new Error("Admin access required");
    const sql = await getSql();
    await sql`update items set custody_desk_id = null where custody_desk_id = ${data.id}`;
    await sql`delete from desks where id = ${data.id}`;
    await writeActivity(context.userId, "ADMIN", `Removed custody desk ${data.id}`);
    return { ok: true };
  });

