import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { CampusItem } from "@/lib/campus/types";
import { timeAgo } from "@/lib/campus/format";
import { Card, StatusBadge } from "./ui";

function glyph(item: CampusItem) {
  const cat = item.category.toLowerCase();
  if (cat.includes("key")) return "key";
  if (cat.includes("id") || cat.includes("card")) return "id";
  if (cat.includes("bag")) return "bag";
  if (cat.includes("electron")) return "chip";
  return "box";
}

export function ItemGlyph({ kind }: { kind: string }) {
  const path =
    kind === "key"
      ? "M8 14a4 4 0 1 1 4-4h8v2h-2v2h-2v2h-4a4 4 0 0 1-4-2z"
      : kind === "id"
        ? "M4 6h16v12H4z M8 10h4 M8 14h8"
        : kind === "bag"
          ? "M8 8h8l1 12H7L8 8z M10 8V6h4v2"
          : "M6 8h12v10H6z";
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ItemCard({ item }: { item: CampusItem }) {
  return (
    <Link to="/items/$itemId" params={{ itemId: item.id }} className="block">
      <Card className="flex items-center gap-3 p-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-sm bg-teal/15 text-teal">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="" className="size-12 rounded-sm object-cover" />
          ) : (
            <ItemGlyph kind={glyph(item)} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{item.title}</p>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
            <MapPin className="size-3" />
            {item.location}
            <span className="text-border">·</span>
            {timeAgo(item.createdAt)}
          </p>
          {item.matchScore ? (
            <p className="mt-1 text-xs font-medium text-teal">{item.matchScore}% Smart Match</p>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
