import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth/client";
import { updateMySettings } from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card, Field, Input } from "@/components/campus/ui";
import { isAdmin, isStaff } from "@/lib/campus/roles";
import { CAMPUS_ZONES } from "@/lib/campus/types";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <AuthGate next="/profile">
      <ProfileBody />
    </AuthGate>
  );
}

function ProfileBody() {
  const { profile, refresh, error: loadError } = useCampusProfile();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState(CAMPUS_ZONES[0]);
  const [incognito, setIncognito] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.displayName);
    setStudentId(profile.studentId);
    setPhone(profile.phone);
    setZone(profile.campusZone || CAMPUS_ZONES[0]);
    setIncognito(profile.incognitoFinder);
  }, [profile]);

  if (loadError && !profile) {
    return (
      <Card className="space-y-3 p-4">
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="text-sm text-danger">{loadError.message}</p>
        <Button type="button" className="w-full" onClick={() => void refresh()}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!profile) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;

  const permissions = profile.permissions;
  const areas = profile.assignedAreas ?? [];

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateMySettings({
        data: {
          displayName: name.trim(),
          studentId: studentId.trim(),
          phone: phone.trim(),
          campusZone: zone,
          incognitoFinder: incognito,
        },
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSave}>
      <Card className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal">{profile.role}</p>
        <h1 className="font-display text-3xl">{profile.displayName || "Campus member"}</h1>
        <p className="text-sm text-muted">{profile.email}</p>
        {isStaff(profile.role) ? (
          <p className="mt-1 text-sm text-muted">
            {areas.length ? `Desk areas: ${areas.join(", ")}` : `Home zone: ${profile.campusZone}`}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">{profile.campusZone}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <Stat label="Karma" value={String(profile.karmaPoints)} />
          <Stat label="Trust" value={`${profile.trustScore}%`} />
          <Stat label="Returned" value={String(profile.itemsReturned)} />
          <Stat label="Recovered" value={String(profile.recoveredItems)} />
        </div>
      </Card>

      {isStaff(profile.role) && permissions ? (
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-teal">Desk permissions</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>{permissions.canConfirmReceipt ? "Can confirm receipt" : "Cannot confirm receipt"}</li>
            <li>{permissions.canVerifyClaims ? "Can verify claims" : "Cannot verify claims"}</li>
            <li>{permissions.canCompleteHandover ? "Can complete handover" : "Cannot complete handover"}</li>
          </ul>
        </Card>
      ) : null}

      <Card className="space-y-3 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal">Identity</p>
        <Field label="Display name">
          <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="profile_name_input" />
        </Field>
        <Field label="Student ID">
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} data-testid="profile_student_id_input" />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="profile_phone_input" />
        </Field>
        <Field label="Campus zone">
          <select
            className="min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            data-testid="profile_zone_select"
          >
            {CAMPUS_ZONES.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </Field>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={incognito} onChange={(e) => setIncognito(e.target.checked)} />
          Incognito finder — hide my name on found-item cards
        </label>
        {saved ? <p className="text-sm text-teal">Saved.</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy} data-testid="profile_save_btn">
          {busy ? "Saving…" : "Save profile"}
        </Button>
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
            <p className="font-semibold">Staff desk</p>
            <p className="text-xs text-muted">
              Confirm receipt and verify claims
              {areas.length ? ` · ${areas.join(", ")}` : ""}
            </p>
          </Card>
        </Link>
      ) : null}
      {isAdmin(profile.role) ? (
        <Link to="/admin" className="block">
          <Card className="p-4">
            <p className="font-semibold">Control panel</p>
            <p className="text-xs text-muted">Assign staff, permissions, and desks</p>
          </Card>
        </Link>
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
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-surface-2 py-2">
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
