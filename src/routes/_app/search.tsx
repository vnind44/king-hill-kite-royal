import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPublicItems } from "@/lib/campus/api";
import { CATEGORIES } from "@/lib/campus/types";
import { ItemCard } from "@/components/campus/item-card";
import { Input } from "@/components/campus/ui";
import { cn } from "@/lib/campus/cn";

export const Route = createFileRoute("/_app/search")({ component: SearchPage });

function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const items = useQuery({ queryKey: ["items"], queryFn: () => listPublicItems({ data: {} }) });
  const filtered = useMemo(() => {
    const list = items.data ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((item) => {
      if (type !== "ALL" && item.itemType !== type) return false;
      if (category !== "All" && item.category !== category) return false;
      if (!q) return true;
      return `${item.title} ${item.description} ${item.location} ${item.color} ${item.brand}`
        .toLowerCase()
        .includes(q);
    });
  }, [items.data, query, category, type]);

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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", "LOST", "FOUND"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              type === t ? "bg-fg text-bg" : "bg-surface-2 text-muted",
            )}
          >
            {t === "ALL" ? "All" : t === "LOST" ? "Lost" : "Found"}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
              category === c ? "bg-fg text-bg" : "bg-surface-2 text-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-xs font-semibold tracking-widest text-muted">{filtered.length} ITEMS FOUND</p>
      {items.isPending ? (
        <div className="h-40 animate-pulse rounded-lg bg-surface" />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">No matching items. Try another term or category.</p>
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
