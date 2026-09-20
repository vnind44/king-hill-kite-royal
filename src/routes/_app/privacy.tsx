import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { updateMySettings } from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { AuthGate } from "@/components/campus/shell";
import { Button, Field, Input } from "@/components/campus/ui";

export const Route = createFileRoute("/_app/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <AuthGate next="/privacy">
      <PrivacyBody />
    </AuthGate>
  );
}

function PrivacyBody() {
  const { profile, refresh } = useCampusProfile();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [incognito, setIncognito] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.displayName);
    setStudentId(profile.studentId);
    setPhone(profile.phone);
    setIncognito(profile.incognitoFinder);
  }, [profile]);

  if (!profile) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await updateMySettings({
          data: {
            displayName: name,
            studentId,
            phone,
            incognitoFinder: incognito,
          },
        });
        await refresh();
        setSaved(true);
      }}
    >
      <h1 className="font-display text-3xl">Privacy & contact</h1>
      <Field label="Display name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Student ID">
        <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={incognito} onChange={(e) => setIncognito(e.target.checked)} />
        Incognito finder — hide your name on found-item cards
      </label>
      <p className="text-xs text-muted">Role, karma, and trust score cannot be edited here.</p>
      {saved ? <p className="text-sm text-teal">Saved.</p> : null}
      <Button type="submit" className="w-full">
        Save contact
      </Button>
    </form>
  );
}
