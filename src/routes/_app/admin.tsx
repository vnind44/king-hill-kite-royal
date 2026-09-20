import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignRole,
  deleteDesk,
  listAdminOverview,
  listAdminUsers,
  listDesks,
  setStaffPermissions,
  upsertDesk,
} from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { isAdmin } from "@/lib/campus/roles";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card, Field, Input } from "@/components/campus/ui";
import { CAMPUS_ZONES, type Role } from "@/lib/campus/types";
import { useState } from "react";
import { cn } from "@/lib/campus/cn";

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
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => listAdminOverview() });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [zones, setZones] = useState<Record<string, string>>({});
  const [deskName, setDeskName] = useState("");
  const [deskLocation, setDeskLocation] = useState("");
  const [deskHours, setDeskHours] = useState("Open · 9:00 AM – 5:00 PM");

  const mutate = useMutation({
    mutationFn: (input: { userId: string; role: Role; campusZone?: string }) => assignRole({ data: input }),
    onSuccess: (res) => {
      setInfo(res.summary);
      setError(null);
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Role update failed"),
  });
  const perms = useMutation({
    mutationFn: (input: {
      userId: string;
      canConfirmReceipt: boolean;
      canVerifyClaims: boolean;
      canCompleteHandover: boolean;
    }) => setStaffPermissions({ data: input }),
    onSuccess: () => {
      setInfo("Staff permissions updated.");
      setError(null);
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not update permissions."),
  });
  const saveDesk = useMutation({
    mutationFn: () => upsertDesk({ data: { name: deskName, location: deskLocation, hours: deskHours } }),
    onSuccess: async () => {
      setDeskName("");
      setDeskLocation("");
      await qc.invalidateQueries({ queryKey: ["desks"] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not save desk."),
  });
  const removeDesk = useMutation({
    mutationFn: (id: string) => deleteDesk({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["desks"] });
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not remove desk."),
  });

  if (isPending) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;
  if (!profile || !isAdmin(profile.role)) {
    return (
      <Card className="p-5">
        <p className="font-semibold">Admin access required</p>
        <p className="mt-2 text-sm text-muted">
          The control panel is a server-side ADMIN operation. The client cannot grant it.
        </p>
        <Link
          to="/login"
          search={{ role: "admin" }}
          className="mt-4 flex min-h-11 items-center justify-center rounded-md bg-teal text-sm font-semibold text-slate-950"
        >
          Sign in as campus admin
        </Link>
      </Card>
    );
  }

  const stats = overview.data;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Full campus control</p>
        <h1 className="font-display text-3xl">Control panel</h1>
        <p className="text-sm text-muted">
          Assign staff, set desk permissions, and manage custody hubs. You cannot change your own role.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Users" value={stats?.users} />
        <Stat label="Staff" value={stats?.staff} />
        <Stat label="Admins" value={stats?.admins} />
        <Stat label="Open claims" value={stats?.open_claims} />
        <Stat label="Awaiting receipt" value={stats?.awaiting} />
        <Stat label="Desks" value={stats?.desks} />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {info ? <p className="text-sm text-teal">{info}</p> : null}

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Assign staff</h2>
        {(users.data ?? []).map((u) => {
          const zone = zones[u.id] || u.assignedAreas?.[0] || u.campusZone;
          const flags = u.permissions;
          return (
            <Card key={u.id} className="space-y-3 p-4">
              <div>
                <p className="font-semibold">{u.displayName || u.email}</p>
                <p className="text-xs text-muted">
                  {u.email} · {u.role}
                  {u.assignedAreas && u.assignedAreas.length > 0 ? ` · ${u.assignedAreas.join(", ")}` : ""}
                </p>
              </div>
              {u.id === user?.id ? (
                <p className="text-xs text-muted">This is you. Full control is locked to your admin account.</p>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Area</p>
                  <div className="flex flex-wrap gap-2">
                    {CAMPUS_ZONES.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setZones((current) => ({ ...current, [u.id]: area }))}
                        className={cn(
                          "min-h-11 rounded-full px-3 text-xs font-semibold",
                          zone === area ? "bg-teal text-slate-950" : "bg-surface-2 text-muted",
                        )}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Role</p>
                  <div className="flex gap-2">
                    {(["STUDENT", "STAFF", "ADMIN"] as const).map((role) => (
                      <Button
                        key={role}
                        type="button"
                        variant={u.role === role ? "primary" : "secondary"}
                        onClick={() => {
                          setError(null);
                          mutate.mutate({ userId: u.id, role, campusZone: zone });
                        }}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                  {u.role === "STAFF" && flags ? (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Desk permissions</p>
                      <div className="grid grid-cols-1 gap-2">
                        <PermissionToggle
                          label="Confirm physical receipt"
                          active={flags.canConfirmReceipt}
                          onToggle={() =>
                            perms.mutate({
                              userId: u.id,
                              canConfirmReceipt: !flags.canConfirmReceipt,
                              canVerifyClaims: flags.canVerifyClaims,
                              canCompleteHandover: flags.canCompleteHandover,
                            })
                          }
                        />
                        <PermissionToggle
                          label="Verify ownership claims"
                          active={flags.canVerifyClaims}
                          onToggle={() =>
                            perms.mutate({
                              userId: u.id,
                              canConfirmReceipt: flags.canConfirmReceipt,
                              canVerifyClaims: !flags.canVerifyClaims,
                              canCompleteHandover: flags.canCompleteHandover,
                            })
                          }
                        />
                        <PermissionToggle
                          label="Complete handover"
                          active={flags.canCompleteHandover}
                          onToggle={() =>
                            perms.mutate({
                              userId: u.id,
                              canConfirmReceipt: flags.canConfirmReceipt,
                              canVerifyClaims: flags.canVerifyClaims,
                              canCompleteHandover: !flags.canCompleteHandover,
                            })
                          }
                        />
                      </div>
                    </>
                  ) : u.role === "ADMIN" ? (
                    <p className="text-xs text-teal">Admin has every permission on every area desk.</p>
                  ) : null}
                </>
              )}
            </Card>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Custody desks</h2>
        <Card className="space-y-3 p-4">
          <Field label="Desk name">
            <Input value={deskName} onChange={(e) => setDeskName(e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={deskLocation} onChange={(e) => setDeskLocation(e.target.value)} />
          </Field>
          <Field label="Hours">
            <Input value={deskHours} onChange={(e) => setDeskHours(e.target.value)} />
          </Field>
          <Button type="button" className="w-full" onClick={() => saveDesk.mutate()}>
            Add desk
          </Button>
        </Card>
        {(desks.data ?? []).map((desk) => (
          <Card key={desk.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{desk.name}</p>
              <p className="text-xs text-muted">
                {desk.location} · {desk.hours}
              </p>
            </div>
            <Button type="button" variant="danger" onClick={() => removeDesk.mutate(desk.id)}>
              Remove
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{value ?? "—"}</p>
    </Card>
  );
}

function PermissionToggle({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex min-h-11 items-center justify-between rounded-md px-3 text-left text-sm font-semibold",
        active ? "bg-teal/15 text-teal" : "bg-surface-2 text-muted",
      )}
    >
      <span>{label}</span>
      <span>{active ? "On" : "Off"}</span>
    </button>
  );
}
