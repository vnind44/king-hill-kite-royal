import type { CampusItem, ItemStatus, ItemType } from "./types";

export type ItemDto = {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  title: string;
  category: string;
  description?: string;
  color?: string;
  brand?: string;
  identifying_marks?: string;
  item_type: ItemType;
  status: ItemStatus;
  location: string;
  location_zone?: string;
  photo_url?: string | null;
  custody_desk_id?: string | null;
  in_custody?: boolean;
  match_score?: number | null;
  match_item_id?: string | null;
  match_explanation?: string | null;
  created_at: string;
  updated_at?: string;
  incognito_finder?: boolean;
};

export function itemFromDto(row: ItemDto): CampusItem {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.incognito_finder ? "Anonymous finder" : row.reporter_name || "Campus member",
    title: row.title,
    category: row.category,
    description: row.description ?? "",
    color: row.color ?? "",
    brand: row.brand ?? "",
    identifyingMarks: row.identifying_marks ?? "",
    itemType: row.item_type,
    status: row.status,
    location: row.location,
    locationZone: row.location_zone ?? "Main Campus",
    photoUrl: row.photo_url ?? null,
    custodyDeskId: row.custody_desk_id ?? null,
    inCustody: Boolean(row.in_custody),
    matchScore: row.match_score ?? null,
    matchItemId: row.match_item_id ?? null,
    matchExplanation: row.match_explanation ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export function redactItemForPublic(item: CampusItem): CampusItem {
  return { ...item, identifyingMarks: "" };
}

export function filterItems(
  items: CampusItem[],
  opts: { query?: string; category?: string; type?: ItemType | "ALL"; location?: string },
): CampusItem[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return items.filter((item) => {
    if (opts.type && opts.type !== "ALL" && item.itemType !== opts.type) return false;
    if (opts.category && opts.category !== "All" && item.category !== opts.category) return false;
    if (opts.location && opts.location !== "All" && item.locationZone !== opts.location && item.location !== opts.location) {
      return false;
    }
    if (!q) return true;
    const hay = `${item.title} ${item.description} ${item.location} ${item.locationZone} ${item.color} ${item.brand} ${item.category}`.toLowerCase();
    return hay.includes(q);
  });
}

export function shouldSendNotification(
  prefs: { quietMode: boolean; smartMatchPush: boolean; claimAlerts: boolean },
  type: string,
): boolean {
  if (prefs.quietMode) return false;
  if (type === "MATCH") return prefs.smartMatchPush;
  if (type === "CLAIM" || type === "HANDOVER") return prefs.claimAlerts;
  return true;
}
