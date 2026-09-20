import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Field, Input } from "@/components/campus/ui";
import { PageNav } from "@/components/campus/shell";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: "/reset-password",
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(payload.message || "Password reset email is not configured in this environment.");
      } else {
        setMessage("If that email is registered, reset instructions have been sent.");
      }
    } catch {
      setError("Password reset is unavailable until email delivery is configured.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
      <div className="-ml-2">
        <PageNav />
      </div>
      <h1 className="mt-4 font-display text-4xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted">Enter the campus email on your account.</p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Field label="Campus email">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-teal">{message}</p> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <Link to="/login" className="mt-6 text-sm font-medium text-teal">
        Back to sign in
      </Link>
    </main>
  );
}
