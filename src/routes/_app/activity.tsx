import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listMyActivity, listMyClaims } from "@/lib/campus/api";
import { AuthGate } from "@/components/campus/shell";
import { Card, StatusBadge } from "@/components/campus/ui";
import { timeAgo } from "@/lib/campus/format";

export const Route = createFileRoute("/_app/activity")({ component: ActivityPage });

function ActivityPage() {
  return (
    <AuthGate next="/activity">
      <ActivityBody />
    </AuthGate>
  );
}

function ActivityBody() {
  const claims = useQuery({ queryKey: ["my-claims"], queryFn: () => listMyClaims() });
  const activity = useQuery({ queryKey: ["my-activity"], queryFn: () => listMyActivity() });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl">Activity</h1>
        <p className="text-sm text-muted">Your reports, claims, and handover history</p>
      </div>
      <section className="space-y-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted">CLAIMS</h2>
        {(claims.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">No claims yet.</p>
        ) : (
          (claims.data ?? []).map((c) => (
            <Link key={c.id} to="/items/$itemId" params={{ itemId: c.itemId }} className="block">
              <Card className="flex items-center justify-between p-3">
                <div>
                  <p className="font-semibold">{c.itemTitle}</p>
                  <p className="text-xs text-muted">{timeAgo(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} />
              </Card>
            </Link>
          ))
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
