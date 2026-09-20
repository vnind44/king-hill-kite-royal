import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { updateMySettings } from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { AuthGate } from "@/components/campus/shell";
import { Button } from "@/components/campus/ui";

export const Route = createFileRoute("/_app/preferences")({ component: PreferencesPage });

function PreferencesPage() {
  return (
    <AuthGate next="/preferences">
      <PreferencesBody />
    </AuthGate>
  );
}

function PreferencesBody() {
  const { profile, refresh } = useCampusProfile();
  const [smart, setSmart] = useState(true);
  const [claims, setClaims] = useState(true);
  const [quiet, setQuiet] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSmart(profile.smartMatchPush);
    setClaims(profile.claimAlerts);
    setQuiet(profile.quietMode);
  }, [profile]);

  if (!profile) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await updateMySettings({
          data: { smartMatchPush: smart, claimAlerts: claims, quietMode: quiet },
        });
        await refresh();
        setSaved(true);
      }}
    >
      <h1 className="font-display text-3xl">Notification preferences</h1>
      <Toggle label="Smart Match alerts" checked={smart} onChange={setSmart} />
      <Toggle label="Claim status alerts" checked={claims} onChange={setClaims} />
      <Toggle label="Quiet mode" checked={quiet} onChange={setQuiet} />
      {saved ? <p className="text-sm text-teal">Saved.</p> : null}
      <Button type="submit" className="w-full">
        Save preferences
      </Button>
    </form>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between rounded-lg border border-border bg-card px-4">
      <span className="text-sm font-medium">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
