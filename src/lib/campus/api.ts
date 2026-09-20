import { createServerFn } from "@tanstack/react-start";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { actorCanApply } from "./claim-machine";
import { DEFAULT_NEW_USER_ROLE, isAdmin, isStaff } from "./roles";
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

function mapItem(row: ItemRow): CampusItem {
  const incognito = Boolean(row.incognito_finder);
  return {
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
    matchScore: row.match_score === null ? null : Number(row.match_score),
    matchItemId: row.match_item_id,
    matchExplanation: row.match_explanation,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
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
    const sql = await getSql();
    const existing = await loadUser(context.userId);
    if (existing) {
      await sql`update campus_users set last_login_at = now() where id = ${context.userId}`;
      return existing;
    }
    await sql`insert into campus_users (id, email, display_name, role)
      values (${context.userId}, ${"unknown@campus"}, ${"Campus member"}, ${DEFAULT_NEW_USER_ROLE})
      on conflict (id) do nothing`;
    return requireUser(context.userId);
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
  .validator((input?: { query?: string; category?: string; type?: ItemType | "ALL" }) => input ?? {})
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      order by i.created_at desc`;
    const q = (data.query ?? "").trim().toLowerCase();
    const category = data.category ?? "All";
    const type = data.type ?? "ALL";
    return rows
      .map(mapItem)
      .filter((item) => {
        if (type !== "ALL" && item.itemType !== type) return false;
        if (category !== "All" && item.category !== category) return false;
        if (!q) return true;
        const hay = `${item.title} ${item.description} ${item.location} ${item.color} ${item.brand}`.toLowerCase();
        return hay.includes(q);
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
    await sql`insert into items (
      id, reporter_id, title, category, description, color, brand, identifying_marks,
      item_type, status, location, location_zone, photo_url, photo_path, custody_desk_id
    ) values (
      ${id}, ${context.userId}, ${data.title.trim()}, ${data.category}, ${data.description.trim()},
      ${data.color.trim()}, ${data.brand.trim()}, ${data.identifyingMarks.trim()},
      ${data.itemType}, ${status}, ${data.location.trim()}, ${data.locationZone},
      ${photoUrl}, ${photoPath}, ${data.custodyDeskId ?? null}
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
      `Your report for “${data.title.trim()}” is now in the campus registry.`,
      id,
    );
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
    return input;
  })
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    const item = await getItem({ data: data.itemId });
    if (item.reporterId === context.userId) throw new Error("You cannot claim an item you reported.");
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
    }>`select c.*, i.title as item_title, u.display_name as claimant_name
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
    const me = await requireUser(context.userId);
    if (!isStaff(me.role)) throw new Error("Staff access required");
    const sql = await getSql();
    const rows = await sql<{
      id: string; item_id: string; item_title: string; claimant_id: string; claimant_name: string;
      verification_note: string; status: ClaimStatus; reviewed_by: string | null; created_at: string; updated_at: string;
    }>`select c.*, i.title as item_title, u.display_name as claimant_name
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.status not in ('COMPLETED', 'REJECTED')
      order by c.created_at asc`;
    return rows.map(mapClaim);
  });

export const reviewClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { claimId: string; action: "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "HANDOVER_PENDING" | "COMPLETED"; pin?: string }) => input)
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string; item_id: string; claimant_id: string; status: ClaimStatus; reporter_id: string; title: string;
    }>`select c.id, c.item_id, c.claimant_id, c.status, i.reporter_id, i.title
      from claims c join items i on i.id = c.item_id where c.id = ${data.claimId} limit 1`;
    const claim = rows[0];
    if (!claim) throw new Error("Claim not found");
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
      await sql`insert into handovers (id, claim_id, item_id, pin_hash, status, expires_at)
        values (${randomUUID()}, ${claim.id}, ${claim.item_id}, ${pinHash}, ${"PENDING"}, ${expires})`;
      await writeNotification(
        claim.claimant_id,
        "HANDOVER",
        "Pickup PIN ready",
        `Your one-time handover PIN is ${issuedPin}. Show this at a custody desk within 24 hours.`,
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
    return rows.map(mapUser);
  });

export const assignRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; role: Role }) => input)
  .handler(async ({ context, data }) => {
    const me = await requireUser(context.userId);
    if (!isAdmin(me.role)) throw new Error("Admin access required");
    if (data.userId === context.userId) throw new Error("You cannot change your own role.");
    if (data.role !== "STUDENT" && data.role !== "STAFF" && data.role !== "ADMIN") {
      throw new Error("Invalid role");
    }
    const sql = await getSql();
    const updated = await sql`update campus_users set role = ${data.role} where id = ${data.userId} returning id`;
    if (!updated[0]) throw new Error("User not found");
    await writeActivity(context.userId, "ADMIN", `Set role of ${data.userId} to ${data.role}`);
    return { ok: true };
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
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from campus_users where role = 'ADMIN'`;
  return { count: Number(rows[0]?.n ?? 0) };
});
