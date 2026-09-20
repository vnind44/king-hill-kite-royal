import { createFileRoute, Link } from "@tanstack/react-router";
import { signOut } from "@/lib/auth/client";
import { adminCount, bootstrapAdmin } from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card } from "@/components/campus/ui";
import { isAdmin, isStaff } from "@/lib/campus/roles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <AuthGate next="/profile">
      <ProfileBody />
    </AuthGate>
  );
}

function ProfileBody() {
  const { profile, refresh } = useCampusProfile();
  const qc = useQueryClient();
  const admins = useQuery({ queryKey: ["admin-count"], queryFn: () => adminCount() });
  const [error, setError] = useState<string | null>(null);

  if (!profile) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal">{profile.role}</p>
        <h1 className="font-display text-3xl">{profile.displayName || "Campus member"}</h1>
        <p className="text-sm text-muted">{profile.email}</p>
        <p className="text-xs text-muted">ID {profile.studentId || "not set"}</p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <Stat label="Karma" value={String(profile.karmaPoints)} />
          <Stat label="Trust" value={`${profile.trustScore}%`} />
          <Stat label="Returned" value={String(profile.itemsReturned)} />
          <Stat label="Recovered" value={String(profile.recoveredItems)} />
        </div>
      </Card>

      <Link to="/appearance" className="block">
        <Card className="p-4">
          <p className="font-semibold">Appearance</p>
          <p className="text-xs text-muted">Light, dark, or system</p>
        </Card>
      </Link>
      <Link to="/preferences" className="block">
        <Card className="p-4">
          <p className="font-semibold">Notifications</p>
          <p className="text-xs text-muted">Smart Match, claims, quiet mode</p>
        </Card>
      </Link>
      <Link to="/privacy" className="block">
        <Card className="p-4">
          <p className="font-semibold">Privacy & contact</p>
          <p className="text-xs text-muted">Incognito finder, student ID, phone</p>
        </Card>
      </Link>
      <Link to="/desks" className="block">
        <Card className="p-4">
          <p className="font-semibold">Custody desks</p>
          <p className="text-xs text-muted">Campus handover hubs</p>
        </Card>
      </Link>
      {isStaff(profile.role) ? (
        <Link to="/staff" className="block">
          <Card className="p-4">
            <p className="font-semibold">Staff dashboard</p>
            <p className="text-xs text-muted">Verify claims and complete handovers</p>
          </Card>
        </Link>
      ) : null}
      {isAdmin(profile.role) ? (
        <Link to="/admin" className="block">
          <Card className="p-4">
            <p className="font-semibold">Admin dashboard</p>
            <p className="text-xs text-muted">Roles and campus operators</p>
          </Card>
        </Link>
      ) : null}

      {admins.data?.count === 0 ? (
        <Card className="p-4">
          <p className="text-sm">
            No campus administrator exists yet. The first trusted operator can initialize admin from the
            server — the client cannot set role=ADMIN by itself.
          </p>
          <Button
            type="button"
            className="mt-3 w-full"
            onClick={async () => {
              setError(null);
              try {
                await bootstrapAdmin();
                await refresh();
                await qc.invalidateQueries({ queryKey: ["admin-count"] });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not initialize admin.");
              }
            }}
          >
            Initialize first administrator
          </Button>
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </Card>
      ) : null}

      <Button
        type="button"
        variant="danger"
        className="w-full"
        data-testid="sign_out_btn"
        onClick={() => {
          void signOut("/");
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-surface-2 py-2">
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
