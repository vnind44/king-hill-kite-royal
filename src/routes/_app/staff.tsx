import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { confirmReceipt, listStaffClaims, listStaffInbox, reviewClaim } from "@/lib/campus/api";
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
  const inbox = useQuery({ queryKey: ["staff-inbox"], queryFn: () => listStaffInbox() });
  const [pin, setPin] = useState("");
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
  const receive = useMutation({
    mutationFn: (itemId: string) => confirmReceipt({ data: { itemId } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["staff-inbox"] });
      await qc.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not confirm receipt."),
  });

  if (isPending) return <div className="h-40 animate-pulse rounded-lg bg-surface" />;
  if (!profile || !isStaff(profile.role)) {
    return (
      <Card className="p-5">
        <p className="font-semibold">Staff access required</p>
        <p className="mt-2 text-sm text-muted">
          Area custody is a server-assigned STAFF role. Student accounts cannot open this desk.
        </p>
        <Link
          to="/login"
          search={{ role: "staff" }}
          className="mt-4 flex min-h-11 items-center justify-center rounded-md bg-teal text-sm font-semibold text-slate-950"
        >
          Sign in as Library staff
        </Link>
      </Card>
    );
  }

  const areas = profile.assignedAreas?.length ? profile.assignedAreas : [profile.campusZone];
  const canReceipt = profile.permissions?.canConfirmReceipt !== false;
  const canVerify = profile.permissions?.canVerifyClaims !== false;
  const canHandover = profile.permissions?.canCompleteHandover !== false;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal">{profile.role}</p>
        <h1 className="font-display text-3xl">Staff desk</h1>
        <p className="text-sm text-muted">
          Confirm physical receipt, verify ownership, then complete handover. You only see items in{" "}
          {areas.join(", ")}.
        </p>
      </div>
      {issued ? (
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-teal">Handover PIN issued</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-teal">{issued}</p>
          <p className="text-xs text-muted">Shown once here. Copy it now — it is not stored in notifications.</p>
          <Button
            type="button"
            className="mt-3 w-full"
            data-testid="copy_pin_button"
            onClick={async () => {
              await navigator.clipboard.writeText(issued);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy PIN"}
          </Button>
        </Card>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-muted">AWAITING PHYSICAL RECEIPT</h2>
        {inbox.isPending ? (
          <div className="h-24 animate-pulse rounded-lg bg-surface" />
        ) : (inbox.data ?? []).length === 0 ? (
          <Card className="p-4 text-sm text-muted">No items waiting at your desk.</Card>
        ) : (
          (inbox.data ?? []).map((item) => (
            <Card key={item.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.locationZone} · {item.category}
                  </p>
                </div>
                <StatusBadge status="awaiting receipt" />
              </div>
              {item.identifyingMarks ? (
                <p className="text-xs text-teal">Marks: {item.identifyingMarks}</p>
              ) : null}
              <Button
                type="button"
                className="w-full"
                disabled={!canReceipt}
                onClick={() => {
                  setError(null);
                  receive.mutate(item.id);
                }}
              >
                {canReceipt ? "Confirm I have the item" : "Receipt permission off"}
              </Button>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-muted">CLAIMS TO VERIFY</h2>
        {(claims.data ?? []).length === 0 ? (
          <Card className="p-4 text-sm text-muted">No open claims in your area.</Card>
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
                {nextStatuses(claim.status)
                  .filter((action) => {
                    if (action === "UNDER_REVIEW" || action === "VERIFIED" || action === "REJECTED") return canVerify;
                    if (action === "HANDOVER_PENDING" || action === "COMPLETED") return canHandover;
                    return true;
                  })
                  .map((action) => (
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
      </section>
    </div>
  );
}
