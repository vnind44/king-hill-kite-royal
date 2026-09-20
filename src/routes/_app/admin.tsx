import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignRole, listAdminUsers } from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { isAdmin } from "@/lib/campus/roles";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card } from "@/components/campus/ui";
import type { Role } from "@/lib/campus/types";
import { useState } from "react";

export const Route = createFileRoute("/_app/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <AuthGate next="/admin">
      <AdminBody />
    </AuthGate>
  );
}

function AdminBody() {
  const { user, profile, isPending } = useCampusProfile();
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => listAdminUsers() });
  const [error, setError] = useState<string | null>(null);
  const mutate = useMutation({
    mutationFn: (input: { userId: string; role: Role }) => assignRole({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err) => setError(err instanceof Error ? err.message : "Role update failed"),
  });

  if (isPending) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;
  if (!profile || !isAdmin(profile.role)) return <p className="text-sm text-danger">Admin access required.</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">Admin dashboard</h1>
        <p className="text-sm text-muted">Assign STAFF or ADMIN to other users. You cannot change your own role.</p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {(users.data ?? []).map((u) => (
        <Card key={u.id} className="p-4">
          <p className="font-semibold">{u.displayName || u.email}</p>
          <p className="text-xs text-muted">{u.email} · {u.role}</p>
          {u.id === user?.id ? (
            <p className="mt-2 text-xs text-muted">This is you. Self-promotion is blocked.</p>
          ) : (
            <div className="mt-3 flex gap-2">
              {(["STUDENT", "STAFF", "ADMIN"] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={u.role === role ? "primary" : "secondary"}
                  onClick={() => {
                    setError(null);
                    mutate.mutate({ userId: u.id, role });
                  }}
                >
                  {role}
                </Button>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
