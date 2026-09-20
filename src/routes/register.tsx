import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { ensureProfile } from "@/lib/campus/api";
import { CAMPUS_ZONES } from "@/lib/campus/types";
import { Button, Field, Input } from "@/components/campus/ui";
import { ShieldIcon } from "@/components/campus/shell";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zone, setZone] = useState<string>(CAMPUS_ZONES[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await authClient.signUp.email({
      email: email.trim(),
      password,
      name: fullName.trim(),
    });
    setBusy(false);
    if (result.error) {
      setError(result.error.message || "Could not create the account.");
      return;
    }
    try {
      await ensureProfile({
        data: {
          displayName: fullName.trim(),
          studentId: studentId.trim(),
          email: email.trim(),
          campusZone: zone,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account created, but profile setup failed.");
      return;
    }
    navigate({ to: "/home" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-teal text-slate-950">
          <ShieldIcon />
        </span>
        <p className="font-semibold">Campus Lost & Found</p>
      </header>
      <h1 className="mt-10 font-display text-4xl leading-tight">Create student account</h1>
      <p className="mt-2 text-sm text-muted">New accounts start as Student. Staff and admin roles are assigned by administrators only.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Field label="Full name">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Student ID">
          <Input required value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </Field>
        <Field label="Campus email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Primary campus zone">
          <select
            className="min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            {CAMPUS_ZONES.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-teal">
          Sign in
        </Link>
      </p>
    </main>
  );
}
