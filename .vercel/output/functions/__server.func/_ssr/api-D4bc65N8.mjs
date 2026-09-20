import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-B4bfOtuz.mjs";
import { r as getSql } from "./db-BBawxAF2.mjs";
import { n as isAdmin, r as isStaff, t as DEFAULT_NEW_USER_ROLE } from "./roles-DNpG_vwi.mjs";
import { t as actorCanApply } from "./claim-machine-C0n5ftYC.mjs";
import { createHash, randomInt, randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/api-D4bc65N8.js
var WEIGHTS = {
	category: .25,
	title: .25,
	color: .15,
	location: .15,
	brand: .1,
	description: .1
};
var STOP = /* @__PURE__ */ new Set([
	"the",
	"and",
	"for",
	"with",
	"from",
	"that",
	"this",
	"lost",
	"found",
	"item",
	"a",
	"an",
	"of",
	"in",
	"on",
	"at"
]);
var COLOR_ALIASES = {
	navy: "blue",
	royal: "blue",
	cobalt: "blue",
	sky: "blue",
	azure: "blue",
	charcoal: "black",
	ebony: "black",
	jet: "black",
	onyx: "black",
	burgundy: "red",
	maroon: "red",
	crimson: "red",
	scarlet: "red",
	wine: "red",
	forest: "green",
	olive: "green",
	mint: "green",
	sage: "green",
	cream: "white",
	ivory: "white",
	offwhite: "white",
	beige: "tan",
	khaki: "tan",
	camel: "tan",
	gold: "yellow",
	mustard: "yellow",
	silver: "gray",
	grey: "gray",
	graphite: "gray",
	slate: "gray"
};
function normalize(value) {
	return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokens(value) {
	return new Set(normalize(value).split(" ").filter((t) => t.length > 2 && !STOP.has(t)));
}
function jaccard(a, b) {
	const left = tokens(a);
	const right = tokens(b);
	if (left.size === 0 && right.size === 0) return 0;
	let inter = 0;
	for (const t of left) if (right.has(t)) inter += 1;
	const union = (/* @__PURE__ */ new Set([...left, ...right])).size;
	return union === 0 ? 0 : inter / union;
}
function exact(a, b) {
	const left = normalize(a);
	const right = normalize(b);
	if (!left || !right) return 0;
	return left === right ? 1 : left.includes(right) || right.includes(left) ? .6 : 0;
}
function canonicalColor(value) {
	const n = normalize(value).replace(/\s/g, "");
	return COLOR_ALIASES[n] ?? n;
}
function colorScore(a, b) {
	const left = canonicalColor(a);
	const right = canonicalColor(b);
	if (!left || !right) return 0;
	return left === right ? 1 : 0;
}
function locationScore(a, b) {
	const exactHit = exact(a, b);
	if (exactHit >= 1) return 1;
	return Math.max(exactHit, jaccard(a, b));
}
/**
* Deterministic Smart Match. Compare a lost report against a found report
* (or vice versa). Callers should only pair opposite types.
*/
function scoreMatch(a, b) {
	const category = exact(a.category, b.category) === 1 ? 1 : 0;
	const title = jaccard(a.title, b.title);
	const color = colorScore(a.color ?? "", b.color ?? "");
	const location = locationScore(a.location ?? "", b.location ?? "");
	const brand = exact(a.brand ?? "", b.brand ?? "");
	const description = jaccard(`${a.description ?? ""} ${a.title}`, `${b.description ?? ""} ${b.title}`);
	const weighted = category * WEIGHTS.category + title * WEIGHTS.title + color * WEIGHTS.color + location * WEIGHTS.location + brand * WEIGHTS.brand + description * WEIGHTS.description;
	const score = Math.max(0, Math.min(100, Math.round(weighted * 100)));
	const parts = [];
	if (category) parts.push("same category");
	if (title >= .4) parts.push("similar name");
	if (color) parts.push("matching color");
	if (location >= .4) parts.push("nearby location");
	if (brand >= .6) parts.push("same brand");
	if (description >= .3) parts.push("overlapping details");
	const explanation = parts.length > 0 ? `Score ${score}% from ${parts.join(", ")}.` : `Score ${score}% — attributes did not strongly overlap.`;
	return {
		score,
		breakdown: {
			category: Math.round(category * WEIGHTS.category * 100),
			title: Math.round(title * WEIGHTS.title * 100),
			color: Math.round(color * WEIGHTS.color * 100),
			location: Math.round(location * WEIGHTS.location * 100),
			brand: Math.round(brand * WEIGHTS.brand * 100),
			description: Math.round(description * WEIGHTS.description * 100)
		},
		explanation
	};
}
function shouldSurfaceMatch(result) {
	return result.score >= 55;
}
function oppositeType(type) {
	return type === "LOST" ? "FOUND" : "LOST";
}
function mapUser(row) {
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
		createdAt: String(row.created_at)
	};
}
function mapItem(row) {
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
		updatedAt: String(row.updated_at)
	};
}
function mapClaim(row) {
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
		updatedAt: String(row.updated_at)
	};
}
function hashPin(claimId, pin) {
	return createHash("sha256").update(`${claimId}:${pin}`).digest("hex");
}
function assertPhoto(photoUrl) {
	if (!photoUrl) return null;
	if (photoUrl.startsWith("https://") || photoUrl.startsWith("http://")) throw new Error("Remote photo URLs are not accepted. Upload an image file.");
	if (!(photoUrl.startsWith("data:image/jpeg") || photoUrl.startsWith("data:image/png") || photoUrl.startsWith("data:image/webp"))) throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
	if (photoUrl.length > 7e5) throw new Error("Image is too large. Compress under 500 KB.");
	return photoUrl;
}
async function loadUser(userId) {
	const rows = await (await getSql())`select * from campus_users where id = ${userId} limit 1`;
	return rows[0] ? mapUser(rows[0]) : null;
}
async function requireUser(userId) {
	const user = await loadUser(userId);
	if (!user) throw new Error("Profile not found. Finish registration first.");
	return user;
}
async function writeActivity(userId, type, message, itemId, claimId) {
	await (await getSql())`insert into activity (id, user_id, type, item_id, claim_id, message)
    values (${randomUUID()}, ${userId}, ${type}, ${itemId ?? null}, ${claimId ?? null}, ${message})`;
}
async function writeNotification(userId, type, title, body, itemId, claimId) {
	const sql = await getSql();
	const p = (await sql`
    select smart_match_push, claim_alerts, quiet_mode from campus_users where id = ${userId}`)[0];
	if (p?.quiet_mode) return;
	if (type === "MATCH" && p && !p.smart_match_push) return;
	if ((type === "CLAIM" || type === "HANDOVER") && p && !p.claim_alerts) return;
	await sql`insert into notifications (id, user_id, type, title, body, item_id, claim_id)
    values (${randomUUID()}, ${userId}, ${type}, ${title}, ${body}, ${itemId ?? null}, ${claimId ?? null})`;
}
async function runSmartMatch(newItem) {
	const sql = await getSql();
	const candidates = await sql`
    select i.*, u.display_name as reporter_name, u.incognito_finder
    from items i
    join campus_users u on u.id = i.reporter_id
    where i.item_type = ${oppositeType(newItem.itemType)}
      and i.reporter_id <> ${newItem.reporterId}
      and i.status not in ('RETURNED', 'REJECTED', 'HANDED_OVER')`;
	let best = null;
	for (const row of candidates) {
		const item = mapItem(row);
		const result = scoreMatch(newItem, item);
		if (!shouldSurfaceMatch(result)) continue;
		if (!best || result.score > best.score) best = {
			item,
			score: result.score,
			explanation: result.explanation
		};
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
var ensureProfile_createServerFn_handler = createServerRpc({
	id: "f26b52ec4e31ed1afea17bd919da0e9902f3916d82a3cab7c3aa20df47372c4f",
	name: "ensureProfile",
	filename: "src/lib/campus/api.ts"
}, (opts) => ensureProfile.__executeServer(opts));
var ensureProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(ensureProfile_createServerFn_handler, async ({ context, data }) => {
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
	} else await sql`update campus_users set
        email = ${email || existing.email},
        display_name = ${displayName || existing.displayName},
        student_id = ${studentId || existing.studentId},
        phone = ${phone || existing.phone},
        campus_zone = ${campusZone},
        last_login_at = now()
        where id = ${context.userId}`;
	return requireUser(context.userId);
});
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "253204862c982539299876ed4eaf46e6ff3f7c3d8dc7aee0cc75c2765212af96",
	name: "getMyProfile",
	filename: "src/lib/campus/api.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyProfile_createServerFn_handler, async ({ context }) => {
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
var updateMySettings_createServerFn_handler = createServerRpc({
	id: "43b51b7e7d30d4b7c246a9417340d704d43014d9e4eedce6250e83363014fa55",
	name: "updateMySettings",
	filename: "src/lib/campus/api.ts"
}, (opts) => updateMySettings.__executeServer(opts));
var updateMySettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateMySettings_createServerFn_handler, async ({ context, data }) => {
	const current = await requireUser(context.userId);
	await (await getSql())`update campus_users set
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
var listDesks_createServerFn_handler = createServerRpc({
	id: "ee50df6f771f2a0ba2075451aacf74a222e1084725f1d2f0d2d69f09e3eafc00",
	name: "listDesks",
	filename: "src/lib/campus/api.ts"
}, (opts) => listDesks.__executeServer(opts));
var listDesks = createServerFn({ method: "GET" }).handler(listDesks_createServerFn_handler, async () => {
	return (await (await getSql())`
    select * from desks order by name`).map((d) => ({
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
		detailNotes: d.detail_notes ?? d.detailNotes
	}));
});
var listPublicItems_createServerFn_handler = createServerRpc({
	id: "9826527d796252d0ec53c52718771bdc41759dfe4dbb93dc3355be0bf2f36664",
	name: "listPublicItems",
	filename: "src/lib/campus/api.ts"
}, (opts) => listPublicItems.__executeServer(opts));
var listPublicItems = createServerFn({ method: "GET" }).validator((input) => input ?? {}).handler(listPublicItems_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      order by i.created_at desc`;
	const q = (data.query ?? "").trim().toLowerCase();
	const category = data.category ?? "All";
	const type = data.type ?? "ALL";
	return rows.map(mapItem).filter((item) => {
		if (type !== "ALL" && item.itemType !== type) return false;
		if (category !== "All" && item.category !== category) return false;
		if (!q) return true;
		return `${item.title} ${item.description} ${item.location} ${item.color} ${item.brand}`.toLowerCase().includes(q);
	});
});
var getItem_createServerFn_handler = createServerRpc({
	id: "1d01127f4ed8788c94b681c1fb29b08c6cc2e2e0a504b530f33bb5b13447c33f",
	name: "getItem",
	filename: "src/lib/campus/api.ts"
}, (opts) => getItem.__executeServer(opts));
var getItem = createServerFn({ method: "GET" }).validator((id) => id).handler(getItem_createServerFn_handler, async ({ data: id }) => {
	const rows = await (await getSql())`
      select i.*, u.display_name as reporter_name, u.incognito_finder
      from items i
      join campus_users u on u.id = i.reporter_id
      where i.id = ${id}
      limit 1`;
	if (!rows[0]) throw new Error("Item not found");
	return mapItem(rows[0]);
});
var reportItem_createServerFn_handler = createServerRpc({
	id: "c42951da9c25bf3dd501a57213348db27964ba18ef66fbbb368a08e168b6f733",
	name: "reportItem",
	filename: "src/lib/campus/api.ts"
}, (opts) => reportItem.__executeServer(opts));
var reportItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.title?.trim()) throw new Error("Item name is required");
	if (!input.location?.trim()) throw new Error("Campus location is required");
	if (input.itemType !== "LOST" && input.itemType !== "FOUND") throw new Error("Invalid report type");
	return input;
}).handler(reportItem_createServerFn_handler, async ({ context, data }) => {
	const me = await requireUser(context.userId);
	const sql = await getSql();
	const id = randomUUID();
	const status = data.itemType === "LOST" ? "SEARCHING" : "UNDER_REVIEW";
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
	await writeActivity(context.userId, "REPORT", `Reported ${data.itemType === "LOST" ? "lost" : "found"} item “${data.title.trim()}”`, id);
	await writeNotification(context.userId, "REPORT", data.itemType === "LOST" ? "Lost report filed" : "Found report filed", `Your report for “${data.title.trim()}” is now in the campus registry.`, id);
	const match = await runSmartMatch(created);
	return {
		item: await getItem({ data: id }),
		match,
		reporter: me.displayName
	};
});
var matchesForItem_createServerFn_handler = createServerRpc({
	id: "d3fecbac500ec703c1c88e53a038622150b808d9fc97841ccb7bc9c013dcf212",
	name: "matchesForItem",
	filename: "src/lib/campus/api.ts"
}, (opts) => matchesForItem.__executeServer(opts));
var matchesForItem = createServerFn({ method: "GET" }).validator((id) => id).handler(matchesForItem_createServerFn_handler, async ({ data: id }) => {
	const item = await getItem({ data: id });
	return (await listPublicItems({ data: { type: oppositeType(item.itemType) } })).filter((o) => o.id !== item.id && o.reporterId !== item.reporterId).map((o) => ({
		item: o,
		match: scoreMatch(item, o)
	})).filter((row) => row.match.score >= 55).sort((a, b) => b.match.score - a.match.score).slice(0, 8);
});
var submitClaim_createServerFn_handler = createServerRpc({
	id: "5f9b13d0c966081949dfb7998c5172d91c5c2c68db0ca3b676884efcb8be84ad",
	name: "submitClaim",
	filename: "src/lib/campus/api.ts"
}, (opts) => submitClaim.__executeServer(opts));
var submitClaim = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.itemId) throw new Error("Item is required");
	return input;
}).handler(submitClaim_createServerFn_handler, async ({ context, data }) => {
	const me = await requireUser(context.userId);
	const item = await getItem({ data: data.itemId });
	if (item.reporterId === context.userId) throw new Error("You cannot claim an item you reported.");
	const sql = await getSql();
	if ((await sql`
      select id from claims where item_id = ${item.id} and claimant_id = ${context.userId}
        and status not in ('REJECTED', 'COMPLETED')`)[0]) throw new Error("You already have an open claim on this item.");
	const id = randomUUID();
	await sql`insert into claims (id, item_id, claimant_id, verification_note, status)
      values (${id}, ${item.id}, ${context.userId}, ${data.note.trim()}, ${"SUBMITTED"})`;
	await sql`update items set status = ${"CLAIM_PENDING"}, updated_at = now() where id = ${item.id}`;
	await writeActivity(context.userId, "CLAIM", `Submitted a claim for “${item.title}”`, item.id, id);
	await writeNotification(item.reporterId, "CLAIM", "New ownership claim", `${me.displayName} submitted a claim for “${item.title}”.`, item.id, id);
	await writeNotification(context.userId, "CLAIM", "Claim submitted", "Staff will review your claim. You will be notified of the decision.", item.id, id);
	return mapClaim((await sql`select c.*, i.title as item_title, u.display_name as claimant_name
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.id = ${id}`)[0]);
});
var listMyClaims_createServerFn_handler = createServerRpc({
	id: "788bb7063eac551a64cec759e06803008a5bb26598ae5ac53948c0f826dcc58a",
	name: "listMyClaims",
	filename: "src/lib/campus/api.ts"
}, (opts) => listMyClaims.__executeServer(opts));
var listMyClaims = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyClaims_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`select c.*, i.title as item_title, u.display_name as claimant_name
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.claimant_id = ${context.userId}
      order by c.created_at desc`).map(mapClaim);
});
var listMyActivity_createServerFn_handler = createServerRpc({
	id: "2d89d8bea121f7fbc49304b45d673403f7e97884d21496aa7edc2719ca228d85",
	name: "listMyActivity",
	filename: "src/lib/campus/api.ts"
}, (opts) => listMyActivity.__executeServer(opts));
var listMyActivity = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyActivity_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select * from activity where user_id = ${context.userId} order by created_at desc limit 80`).map((r) => ({
		id: r.id,
		userId: r.user_id,
		type: r.type,
		itemId: r.item_id,
		claimId: r.claim_id,
		message: r.message,
		createdAt: String(r.created_at)
	}));
});
var listMyNotifications_createServerFn_handler = createServerRpc({
	id: "1269e5dc605faeffdefd4091ccde3b92879b5df57ed6ca469b0a7c5e49649d81",
	name: "listMyNotifications",
	filename: "src/lib/campus/api.ts"
}, (opts) => listMyNotifications.__executeServer(opts));
var listMyNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyNotifications_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`select * from notifications where user_id = ${context.userId} order by created_at desc limit 80`).map((r) => ({
		id: r.id,
		userId: r.user_id,
		type: r.type,
		title: r.title,
		body: r.body,
		itemId: r.item_id,
		claimId: r.claim_id,
		read: Boolean(r.read),
		createdAt: String(r.created_at)
	}));
});
var markNotificationsRead_createServerFn_handler = createServerRpc({
	id: "1db05e86dbe590e13614448f339973c83e6090f036f52ebd13421c98be117b66",
	name: "markNotificationsRead",
	filename: "src/lib/campus/api.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markNotificationsRead_createServerFn_handler, async ({ context }) => {
	await (await getSql())`update notifications set read = true where user_id = ${context.userId}`;
	return { ok: true };
});
var listStaffClaims_createServerFn_handler = createServerRpc({
	id: "43c6f241258065ac9bcd88814f92737df7d8c6ffe3b506b9d7c51c53c424368b",
	name: "listStaffClaims",
	filename: "src/lib/campus/api.ts"
}, (opts) => listStaffClaims.__executeServer(opts));
var listStaffClaims = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listStaffClaims_createServerFn_handler, async ({ context }) => {
	const me = await requireUser(context.userId);
	if (!isStaff(me.role)) throw new Error("Staff access required");
	return (await (await getSql())`select c.*, i.title as item_title, u.display_name as claimant_name
      from claims c join items i on i.id = c.item_id join campus_users u on u.id = c.claimant_id
      where c.status not in ('COMPLETED', 'REJECTED')
      order by c.created_at asc`).map(mapClaim);
});
var reviewClaim_createServerFn_handler = createServerRpc({
	id: "c9333ebf5c0f69544d9695734e38fbae5ecc689b1220b1f96f9951bfcabc9d92",
	name: "reviewClaim",
	filename: "src/lib/campus/api.ts"
}, (opts) => reviewClaim.__executeServer(opts));
var reviewClaim = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(reviewClaim_createServerFn_handler, async ({ context, data }) => {
	const me = await requireUser(context.userId);
	const sql = await getSql();
	const claim = (await sql`select c.id, c.item_id, c.claimant_id, c.status, i.reporter_id, i.title
      from claims c join items i on i.id = c.item_id where c.id = ${data.claimId} limit 1`)[0];
	if (!claim) throw new Error("Claim not found");
	if (!actorCanApply(me.role, claim.status, data.action, {
		actorId: context.userId,
		claimantId: claim.claimant_id,
		itemReporterId: claim.reporter_id
	})) throw new Error("That claim update is not allowed.");
	let issuedPin = null;
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
		issuedPin = String(randomInt(1e5, 1e6));
		const pinHash = hashPin(claim.id, issuedPin);
		const expires = new Date(Date.now() + 864e5).toISOString();
		await sql`insert into handovers (id, claim_id, item_id, pin_hash, status, expires_at)
        values (${randomUUID()}, ${claim.id}, ${claim.item_id}, ${pinHash}, ${"PENDING"}, ${expires})`;
		await writeNotification(claim.claimant_id, "HANDOVER", "Pickup PIN ready", `Your one-time handover PIN is ${issuedPin}. Show this at a custody desk within 24 hours.`, claim.item_id, claim.id);
	}
	if (data.action === "COMPLETED") {
		const handover = (await sql`
        select id, pin_hash from handovers where claim_id = ${claim.id} and status = 'PENDING' order by created_at desc limit 1`)[0];
		if (handover) {
			const pin = (data.pin ?? "").replace(/\s/g, "");
			if (!pin || hashPin(claim.id, pin) !== handover.pin_hash) throw new Error("Handover PIN does not match.");
			await sql`update handovers set status = ${"COMPLETED"}, completed_at = now(), completed_by_staff_id = ${context.userId} where id = ${handover.id}`;
		}
		await sql`update items set status = ${"RETURNED"}, updated_at = now() where id = ${claim.item_id}`;
		await sql`update campus_users set items_returned = items_returned + 1, karma_points = karma_points + 50 where id = ${claim.reporter_id}`;
		await sql`update campus_users set recovered_items = recovered_items + 1, karma_points = karma_points + 25 where id = ${claim.claimant_id}`;
		await writeNotification(claim.claimant_id, "HANDOVER", "Item returned", `Handover for “${claim.title}” is complete.`, claim.item_id, claim.id);
		await writeNotification(claim.reporter_id, "HANDOVER", "Item returned", `“${claim.title}” was marked returned at a custody desk.`, claim.item_id, claim.id);
	}
	await writeActivity(context.userId, "STAFF", `Claim ${claim.id} → ${data.action}`, claim.item_id, claim.id);
	return {
		ok: true,
		pin: issuedPin
	};
});
var listAdminUsers_createServerFn_handler = createServerRpc({
	id: "b5abd5b609b33c4a44bb6e3ec43c48e86da1805064a42c35f4472b9429304e50",
	name: "listAdminUsers",
	filename: "src/lib/campus/api.ts"
}, (opts) => listAdminUsers.__executeServer(opts));
var listAdminUsers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAdminUsers_createServerFn_handler, async ({ context }) => {
	const me = await requireUser(context.userId);
	if (!isAdmin(me.role)) throw new Error("Admin access required");
	return (await (await getSql())`select * from campus_users order by created_at desc`).map(mapUser);
});
var assignRole_createServerFn_handler = createServerRpc({
	id: "874739aad5453d484dbb974da3526a925192038521b7c4a6e601929c2c97a010",
	name: "assignRole",
	filename: "src/lib/campus/api.ts"
}, (opts) => assignRole.__executeServer(opts));
var assignRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(assignRole_createServerFn_handler, async ({ context, data }) => {
	const me = await requireUser(context.userId);
	if (!isAdmin(me.role)) throw new Error("Admin access required");
	if (data.userId === context.userId) throw new Error("You cannot change your own role.");
	if (data.role !== "STUDENT" && data.role !== "STAFF" && data.role !== "ADMIN") throw new Error("Invalid role");
	if (!(await (await getSql())`update campus_users set role = ${data.role} where id = ${data.userId} returning id`)[0]) throw new Error("User not found");
	await writeActivity(context.userId, "ADMIN", `Set role of ${data.userId} to ${data.role}`);
	return { ok: true };
});
var bootstrapAdmin_createServerFn_handler = createServerRpc({
	id: "d0e3d4190a047acb9f531a32e2995ccd93b5a8ae769263a7f07d3e9a4c44a62e",
	name: "bootstrapAdmin",
	filename: "src/lib/campus/api.ts"
}, (opts) => bootstrapAdmin.__executeServer(opts));
var bootstrapAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(bootstrapAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const admins = await sql`select count(*)::int as n from campus_users where role = 'ADMIN'`;
	if (Number(admins[0]?.n ?? 0) > 0) throw new Error("A campus administrator already exists.");
	await requireUser(context.userId);
	await sql`update campus_users set role = ${"ADMIN"} where id = ${context.userId}`;
	await writeActivity(context.userId, "ADMIN", "Initialized the first campus administrator");
	return requireUser(context.userId);
});
var adminCount_createServerFn_handler = createServerRpc({
	id: "6ceb53c6e9327b5293a87897ecfd4f2fc4aa0da6c0aa1b11bb1a8bda5cb5e11c",
	name: "adminCount",
	filename: "src/lib/campus/api.ts"
}, (opts) => adminCount.__executeServer(opts));
var adminCount = createServerFn({ method: "GET" }).handler(adminCount_createServerFn_handler, async () => {
	const rows = await (await getSql())`select count(*)::int as n from campus_users where role = 'ADMIN'`;
	return { count: Number(rows[0]?.n ?? 0) };
});
//#endregion
export { adminCount_createServerFn_handler, assignRole_createServerFn_handler, bootstrapAdmin_createServerFn_handler, ensureProfile_createServerFn_handler, getItem_createServerFn_handler, getMyProfile_createServerFn_handler, listAdminUsers_createServerFn_handler, listDesks_createServerFn_handler, listMyActivity_createServerFn_handler, listMyClaims_createServerFn_handler, listMyNotifications_createServerFn_handler, listPublicItems_createServerFn_handler, listStaffClaims_createServerFn_handler, markNotificationsRead_createServerFn_handler, matchesForItem_createServerFn_handler, reportItem_createServerFn_handler, reviewClaim_createServerFn_handler, submitClaim_createServerFn_handler, updateMySettings_createServerFn_handler };
