import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPublicItems } from "@/lib/campus/api";
import { CAMPUS_ZONES, CATEGORIES } from "@/lib/campus/types";
import { filterItems } from "@/lib/campus/mapping";
import { ItemCard } from "@/components/campus/item-card";
import { ChipRow, Input } from "@/components/campus/ui";

type SearchParams = { location?: string };

export const Route = createFileRoute("/_app/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    location: typeof s.location === "string" ? s.location : undefined,
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [location, setLocation] = useState(search.location || "All");
  const items = useQuery({ queryKey: ["items"], queryFn: () => listPublicItems({ data: {} }) });
  const filtered = useMemo(
    () => filterItems(items.data ?? [], { query, category, type, location }),
    [items.data, query, category, type, location],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">Search</h1>
        <p className="text-sm text-muted">Live recovered items and custody registry</p>
      </div>
      <Input
        placeholder="Search keys, backpacks, IDs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        data-testid="search_feed_input"
      />
      <ChipRow
        values={["ALL", "LOST", "FOUND"]}
        selected={type}
        onSelect={(v) => setType(v as typeof type)}
        label={(v) => (v === "ALL" ? "All" : v === "LOST" ? "Lost" : "Found")}
      />
      <ChipRow values={["All", ...CATEGORIES]} selected={category} onSelect={setCategory} />
      <ChipRow values={["All", ...CAMPUS_ZONES]} selected={location} onSelect={setLocation} />
      <p className="text-xs font-semibold tracking-widest text-muted">{filtered.length} ITEMS FOUND</p>
      {items.isPending ? (
        <div className="h-40 animate-pulse rounded-lg bg-surface" />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">No matching items. Try another term, zone, or category.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
