import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { ensureProfile, getMyProfile, listCampusOperators } from "@/lib/campus/api";
import { operatorForRole } from "@/lib/campus/operators";
import { completeEmailAuth } from "@/lib/campus/session";
import { LOGIN_ROLES, PORTALS, canEnterPortal, parseLoginRole, type LoginRole } from "@/lib/campus/portals";
import { Button, Card, Field, Input } from "@/components/campus/ui";
import { PageNav, ShieldIcon } from "@/components/campus/shell";

type Search = { role?: LoginRole; next?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    role: parseLoginRole(s.role, s.next),
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: Login,
});

function Login() {
  const search = Route.useSearch();
  const role = search.role ?? "student";
  const portal = PORTALS[role];
  const next = search.next && search.next.startsWith("/") ? search.next : portal.next;
  const navigate = useNavigate();
  const operator = operatorForRole(role);
  const [email, setEmail] = useState(operator?.email ?? "");
  const [password, setPassword] = useState(operator?.password ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEmail(operator?.email ?? "");
    setPassword(operator?.password ?? "");
    setError(null);
    void listCampusOperators().catch(() => undefined);
  }, [role, operator?.email, operator?.password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await listCampusOperators();
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      await completeEmailAuth(result);
      try {
        await ensureProfile({ data: { email: email.trim() } });
      } catch {
        /* profile is created on the next authenticated call */
      }
      const profile = await getMyProfile();
      const destination =
        canEnterPortal(profile.role, role)
          ? next
          : profile.role === "ADMIN"
            ? "/admin"
            : profile.role === "STAFF"
              ? "/staff"
              : "/home";
      if (destination === "/staff" || destination === "/admin" || destination === "/home") {
        navigate({ to: destination });
      } else {
        window.location.assign(destination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
      <div className="-ml-2">
        <PageNav />
      </div>
      <header className="mt-2 flex flex-col items-center text-center">
        <span className="grid size-10 place-items-center rounded-md bg-teal text-slate-950">
          <ShieldIcon />
        </span>
        <p className="mt-3 text-3xl font-bold tracking-tight">Campus Lost & Found</p>
      </header>

      <div className="mt-8 grid grid-cols-3 gap-2">
        {LOGIN_ROLES.map((id) => (
          <Link
            key={id}
            to="/login"
            search={{ role: id, next: PORTALS[id].next }}
            data-testid={`login_tab_${id}`}
            className={`flex min-h-11 items-center justify-center rounded-full text-sm font-bold ${
              role === id ? "bg-teal text-slate-950" : "bg-surface-2 text-muted"
            }`}
          >
            {PORTALS[id].label}
          </Link>
        ))}
      </div>

      <h1 className="mt-8 font-display text-4xl leading-tight">{portal.title}</h1>
      <p className="mt-2 text-sm text-muted">{portal.hint}</p>

      <Card className="mt-6 space-y-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">
          {role === "admin" ? "Full campus control" : `${portal.label} permissions`}
        </p>
        <ul className="space-y-1 text-sm text-muted">
          {portal.permissions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      {operator ? (
        <Card className="mt-4 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal">{operator.role} account</p>
          <p className="mt-1 font-semibold">{operator.name}</p>
          <p className="text-sm text-muted">{operator.zone}</p>
          <p className="mt-2 text-sm">{operator.email}</p>
          <p className="font-mono text-sm">{operator.password}</p>
        </Card>
      ) : null}

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
          {busy ? "Signing in…" : `Sign in as ${portal.label}`}
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
              onClick={() => signIn(p.providerId, { callbackURL: portal.next })}
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : null}

      {role === "student" ? (
        <p className="mt-8 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-teal" data-testid="create_account_link">
            Create a student account
          </Link>
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-muted">
          Staff and Admin roles are assigned by campus administration only. Google sign-in creates a student
          account unless an admin has already assigned you.
        </p>
      )}
      <Link to="/home" className="mt-4 text-center text-sm text-muted">
        Browse as guest
      </Link>
    </main>
  );
}
