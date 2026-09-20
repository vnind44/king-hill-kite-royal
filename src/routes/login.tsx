import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { ensureProfile } from "@/lib/campus/api";
import { Button, Field, Input } from "@/components/campus/ui";
import { ShieldIcon } from "@/components/campus/shell";

type Search = { next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" ? s.next : "/home",
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message || "Could not sign in.");
      return;
    }
    try {
      await ensureProfile({ data: { email: email.trim() } });
    } catch {
      /* profile created on first authenticated call */
    }
    navigate({ to: next || "/home" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-teal text-slate-950">
          <ShieldIcon />
        </span>
        <p className="font-semibold">Campus Lost & Found</p>
      </header>
      <h1 className="mt-10 font-display text-4xl leading-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Sign in with your campus email to report and reclaim items.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Field label="Campus email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input_campus_id"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="input_campus_password"
          />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-teal">
            Forgot password?
          </Link>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy} data-testid="sign_in_submit_btn">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {authEnabled ? (
        <div className="mt-6 space-y-2">
          {GROK_PROVIDERS.filter((p) => p.idp === "google").map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: next || "/home" })}
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : null}

      <p className="mt-8 text-center text-sm text-muted">
        New here?{" "}
        <Link to="/register" className="font-semibold text-teal" data-testid="create_account_link">
          Create an account
        </Link>
      </p>
      <Link to="/home" className="mt-4 text-center text-sm text-muted">
        Browse as guest
      </Link>
    </main>
  );
}
