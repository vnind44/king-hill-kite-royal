import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listDesks, listPublicItems } from "@/lib/campus/api";
import { ItemCard } from "@/components/campus/item-card";
import { Card } from "@/components/campus/ui";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { Plus, Store } from "lucide-react";

export const Route = createFileRoute("/_app/home")({ component: HomePage });

function HomePage() {
  const { user, profile } = useCampusProfile();
  const items = useQuery({ queryKey: ["items"], queryFn: () => listPublicItems({ data: {} }) });
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  const feed = items.data ?? [];
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

      {urgent ? (
        <Link to="/items/$itemId" params={{ itemId: urgent.id }} className="block">
          <Card className="bg-[#0B1C30] p-4 text-white">
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
            No reports yet. Be the first to file a lost or found item.
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
