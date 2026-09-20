import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listMyActivity, listMyClaims, listMyItems, revealHandoverPin } from "@/lib/campus/api";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card, StatusBadge } from "@/components/campus/ui";
import { timeAgo } from "@/lib/campus/format";
import { ItemCard } from "@/components/campus/item-card";

export const Route = createFileRoute("/_app/activity")({ component: ActivityPage });

function ActivityPage() {
  return (
    <AuthGate next="/activity">
      <ActivityBody />
    </AuthGate>
  );
}

function ActivityBody() {
  const qc = useQueryClient();
  const claims = useQuery({ queryKey: ["my-claims"], queryFn: () => listMyClaims() });
  const activity = useQuery({ queryKey: ["my-activity"], queryFn: () => listMyActivity() });
  const reports = useQuery({ queryKey: ["my-items"], queryFn: () => listMyItems() });
  const [pin, setPin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reveal = useMutation({
    mutationFn: (claimId: string) => revealHandoverPin({ data: { claimId } }),
    onSuccess: async (res) => {
      setPin(res.pin);
      await qc.invalidateQueries({ queryKey: ["my-claims"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not reveal PIN."),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl">Activity</h1>
        <p className="text-sm text-muted">Your reports, claims, and handover history</p>
      </div>
      {pin ? (
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-teal">Pickup PIN</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-teal">{pin}</p>
          <p className="text-xs text-muted">Shown once. Copy it now and take it to a custody desk.</p>
        </Card>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted">CLAIMS</h2>
        {(claims.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">No claims yet.</p>
        ) : (
          (claims.data ?? []).map((c) => (
            <Card key={c.id} className="space-y-2 p-3">
              <Link to="/items/$itemId" params={{ itemId: c.itemId }} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.itemTitle}</p>
                  <p className="text-xs text-muted">{timeAgo(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
              {c.pinAvailable ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setError(null);
                    reveal.mutate(c.id);
                  }}
                >
                  Reveal pickup PIN once
                </Button>
              ) : null}
            </Card>
          ))
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted">YOUR REPORTS</h2>
        {(reports.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">You have not filed a report yet.</p>
        ) : (
          (reports.data ?? []).map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted">HISTORY</h2>
        {(activity.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">No activity recorded yet.</p>
        ) : (
          (activity.data ?? []).map((e) => (
            <Card key={e.id} className="p-3">
              <p className="text-sm">{e.message}</p>
              <p className="text-xs text-muted">{timeAgo(e.createdAt)}</p>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
