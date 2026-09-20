import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listDesks, listMyItems, listPublicItems } from "@/lib/campus/api";
import { ItemCard } from "@/components/campus/item-card";
import { Card, ChipRow, Input } from "@/components/campus/ui";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { CAMPUS_ZONES } from "@/lib/campus/types";
import { filterItems } from "@/lib/campus/mapping";
import { cn } from "@/lib/campus/cn";
import { isAdmin, isStaff } from "@/lib/campus/roles";
import { Plus, Search, Store } from "lucide-react";

export const Route = createFileRoute("/_app/home")({ component: HomePage });

function HomePage() {
  const { user, profile } = useCampusProfile();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [location, setLocation] = useState("All");
  const items = useQuery({ queryKey: ["items"], queryFn: () => listPublicItems({ data: {} }) });
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  const mine = useQuery({
    queryKey: ["my-items", user?.id],
    queryFn: () => listMyItems(),
    enabled: Boolean(user),
  });
  const feed = useMemo(
    () => filterItems(items.data ?? [], { query, type, location, category: "All" }),
    [items.data, query, type, location],
  );
  const urgent = feed.find((i) => i.matchScore && i.matchScore >= 55);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">
            {user ? `Hello, ${profile?.displayName || user.displayName || "there"}` : "Campus registry"}
          </h1>
          <p className="mt-1 text-sm text-muted">Lost & found recovery network</p>
        </div>
        {profile ? (
          <span className="rounded-sm bg-teal/15 px-2 py-1 text-xs font-semibold text-teal">
            {profile.karmaPoints} karma
          </span>
        ) : (
          <span className="text-xs font-medium text-muted">Guest</span>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          className="pl-10"
          placeholder="Search keys, backpacks, IDs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="home_search_input"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", "LOST", "FOUND"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "min-h-11 rounded-full px-3.5 text-xs font-semibold",
              type === t ? "bg-fg text-bg" : "bg-surface-2 text-muted",
            )}
          >
            {t === "ALL" ? "All" : t === "LOST" ? "Lost" : t === "FOUND" ? "Found" : t}
          </button>
        ))}
      </div>

      {profile && isStaff(profile.role) ? (
        <Link to="/staff" className="block">
          <Card className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Your desk</p>
              <p className="font-semibold">{profile.assignedAreas?.[0] || profile.campusZone} staff</p>
            </div>
            <span className="text-sm font-semibold text-teal">Open</span>
          </Card>
        </Link>
      ) : null}
      {profile && isAdmin(profile.role) ? (
        <Link to="/admin" className="block">
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Admin</p>
            <p className="font-semibold">Assign roles and area staff</p>
          </Card>
        </Link>
      ) : null}

      {urgent ? (
        <Link to="/items/$itemId" params={{ itemId: urgent.id }} className="block">
          <Card className="bg-welcome p-4 text-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal">
              Smart Match · {urgent.matchScore}%
            </p>
            <p className="mt-1 font-semibold">{urgent.title}</p>
            <p className="text-xs text-slate-300">{urgent.matchExplanation}</p>
          </Card>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/report" className="rounded-lg border border-border bg-card p-4">
          <span className="grid size-8 place-items-center rounded-sm bg-teal/15 text-teal">
            <Plus className="size-4" />
          </span>
          <p className="mt-3 text-sm font-semibold">Report item</p>
          <p className="text-xs text-muted">Lost or found</p>
        </Link>
        <Link to="/desks" className="rounded-lg border border-border bg-card p-4">
          <span className="grid size-8 place-items-center rounded-sm bg-surface-2 text-teal">
            <Store className="size-4" />
          </span>
          <p className="mt-3 text-sm font-semibold">Custody desks</p>
          <p className="text-xs text-muted">{desks.data?.length ?? 4} verified hubs</p>
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted">CAMPUS ZONES</h2>
        <ChipRow
          values={["All", ...CAMPUS_ZONES]}
          selected={location}
          onSelect={setLocation}
        />
      </section>

      {user && (mine.data ?? []).length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-muted">YOUR REPORTS</h2>
          <div className="space-y-3">
            {(mine.data ?? []).slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted">RECENT RECOVERIES</h2>
          <Link to="/search" className="text-xs font-semibold text-teal">
            Search
          </Link>
        </div>
        {items.isPending ? (
          <div className="h-32 animate-pulse rounded-lg bg-surface" />
        ) : feed.length === 0 ? (
          <Card className="p-5 text-sm text-muted">
            No reports in this filter. Try All, or file the first lost or found item.
          </Card>
        ) : (
          <div className="space-y-3">
            {feed.slice(0, 8).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
