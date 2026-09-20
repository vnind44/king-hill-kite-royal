import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listStaffClaims, reviewClaim } from "@/lib/campus/api";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { isStaff } from "@/lib/campus/roles";
import { AuthGate } from "@/components/campus/shell";
import { Button, Card, Input, StatusBadge } from "@/components/campus/ui";
import { nextStatuses } from "@/lib/campus/claim-machine";
import type { ClaimStatus } from "@/lib/campus/types";

type StaffAction = Exclude<ClaimStatus, "SUBMITTED">;

export const Route = createFileRoute("/_app/staff")({ component: StaffPage });

function StaffPage() {
  return (
    <AuthGate next="/staff">
      <StaffBody />
    </AuthGate>
  );
}

function StaffBody() {
  const { profile, isPending } = useCampusProfile();
  const qc = useQueryClient();
  const claims = useQuery({ queryKey: ["staff-claims"], queryFn: () => listStaffClaims() });
  const [pin, setPin] = useState("");
  const [issued, setIssued] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mutate = useMutation({
    mutationFn: (input: { claimId: string; action: StaffAction; pin?: string }) =>
      reviewClaim({ data: input }),
    onSuccess: async (res) => {
      if (res.pin) setIssued(res.pin);
      await qc.invalidateQueries({ queryKey: ["staff-claims"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Update failed"),
  });

  if (isPending) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;
  if (!profile || !isStaff(profile.role)) {
    return <p className="text-sm text-danger">Staff access required.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">Staff dashboard</h1>
        <p className="text-sm text-muted">Verify claims and complete protected handovers. Status is computed on the server.</p>
      </div>
      {issued ? (
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-teal">Handover PIN issued</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-teal" data-testid="copy_pin_button">
            {issued}
          </p>
          <p className="text-xs text-muted">Shown once here and sent to the claimant. Expires in 24 hours.</p>
        </Card>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {(claims.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">No open claims.</p>
      ) : (
        (claims.data ?? []).map((claim) => (
          <Card key={claim.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{claim.itemTitle}</p>
              <StatusBadge status={claim.status} />
            </div>
            <p className="text-sm text-muted">Claimant {claim.claimantName}</p>
            <p className="text-sm">{claim.verificationNote || "No note attached."}</p>
            {claim.status === "HANDOVER_PENDING" ? (
              <Input placeholder="Enter claimant PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {nextStatuses(claim.status).map((action) => (
                <Button
                  key={action}
                  type="button"
                  variant={action === "REJECTED" ? "danger" : "secondary"}
                  onClick={() => {
                    setError(null);
                    mutate.mutate({
                      claimId: claim.id,
                      action: action as StaffAction,
                      pin: action === "COMPLETED" ? pin : undefined,
                    });
                  }}
                >
                  {action.replaceAll("_", " ")}
                </Button>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
