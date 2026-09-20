import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyNotifications, markNotificationsRead } from "@/lib/campus/api";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card } from "@/components/campus/ui";
import { timeAgo } from "@/lib/campus/format";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  return (
    <AuthGate next="/notifications">
      <NotificationsBody />
    </AuthGate>
  );
}

function NotificationsBody() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["notifications"], queryFn: () => listMyNotifications() });
  const mark = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Notifications</h1>
        <Button type="button" variant="ghost" onClick={() => mark.mutate()}>
          Mark read
        </Button>
      </div>
      {(list.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">No notifications yet.</p>
      ) : (
        (list.data ?? []).map((n) => (
          <Card key={n.id} className={n.read ? "p-4" : "border-teal/40 p-4"}>
            <p className="text-xs font-bold uppercase tracking-wide text-teal">{n.type}</p>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>{timeAgo(n.createdAt)}</span>
              {n.itemId ? (
                <Link to="/items/$itemId" params={{ itemId: n.itemId }} className="font-semibold text-teal">
                  Open item
                </Link>
              ) : null}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
