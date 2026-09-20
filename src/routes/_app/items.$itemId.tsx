import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { confirmReceipt, getItem, getManagedItem, listDesks, matchesForItem, submitClaim } from "@/lib/campus/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { isStaff } from "@/lib/campus/roles";
import { staffCoversArea } from "@/lib/campus/role-assignment";
import { Button, Card, StatusBadge, Textarea } from "@/components/campus/ui";
import { timeAgo } from "@/lib/campus/format";

export const Route = createFileRoute("/_app/items/$itemId")({ component: ItemDetail });

function ItemDetail() {
  const { itemId } = Route.useParams();
  const { user } = useCurrentUserState();
  const { profile } = useCampusProfile();
  const qc = useQueryClient();
  const itemQ = useQuery({ queryKey: ["item", itemId], queryFn: () => getItem({ data: itemId }) });
  const managedQ = useQuery({
    queryKey: ["managed-item", itemId, user?.id],
    queryFn: () => getManagedItem({ data: itemId }),
    enabled: Boolean(user),
  });
  const matchesQ = useQuery({ queryKey: ["matches", itemId], queryFn: () => matchesForItem({ data: itemId }) });
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pinMsg, setPinMsg] = useState<string | null>(null);
  const item = managedQ.data ?? itemQ.data;
  const desk = desks.data?.find((d) => d.id === item?.custodyDeskId);
  const canReceive =
    Boolean(item) &&
    item!.itemType === "FOUND" &&
    !item!.inCustody &&
    profile &&
    isStaff(profile.role) &&
    staffCoversArea({
      role: profile.role,
      assignedAreas: profile.assignedAreas ?? [],
      homeZone: profile.campusZone,
      itemZone: item!.locationZone,
      itemLocation: item!.location,
    });

  async function claim() {
    setError(null);
    try {
      await submitClaim({ data: { itemId, note } });
      setPinMsg("Claim submitted. Staff will review it.");
      await qc.invalidateQueries({ queryKey: ["item", itemId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit claim.");
    }
  }

  async function receive() {
    setError(null);
    try {
      await confirmReceipt({ data: { itemId } });
      setPinMsg("Physical receipt confirmed. Item is in official custody.");
      await qc.invalidateQueries({ queryKey: ["managed-item", itemId, user?.id] });
      await qc.invalidateQueries({ queryKey: ["item", itemId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm receipt.");
    }
  }

  if (itemQ.isPending) return <div className="h-48 animate-pulse rounded-lg bg-surface" />;
  if (!item) return <p className="text-sm text-danger">Item not found.</p>;

  const claimBlocked = item.itemType === "FOUND" && !item.inCustody;

  return (
    <div className="space-y-4">
      <div>
        <StatusBadge status={`${item.itemType} · ${item.status}`} />
        <h1 className="mt-2 font-display text-3xl">{item.title}</h1>
        <p className="text-sm text-muted">
          {item.location} · {timeAgo(item.createdAt)}
        </p>
      </div>
      {item.photoUrl ? <img src={item.photoUrl} alt="" className="h-52 w-full rounded-lg object-cover" /> : null}
      <Card className="space-y-2 p-4 text-sm">
        <Row label="Category" value={item.category} />
        <Row label="Color" value={item.color || "—"} />
        <Row label="Brand" value={item.brand || "—"} />
        <Row label="Reported by" value={item.reporterName} />
        <Row
          label="Custody"
          value={
            item.itemType === "LOST"
              ? "Owner still searching"
              : item.inCustody
                ? desk?.name || "In area staff custody"
                : "Awaiting physical receipt"
          }
        />
        {desk ? <Row label="Custody desk" value={desk.name} /> : null}
        <p className="pt-2 text-muted">{item.description || "No extra details."}</p>
        {item.identifyingMarks ? (
          <p className="text-xs text-teal">Private marks: {item.identifyingMarks}</p>
        ) : (
          <p className="text-xs text-muted">Identifying marks are hidden. Claimants prove ownership in the claim note.</p>
        )}
        {item.matchScore ? (
          <p className="font-medium text-teal">
            {item.matchScore}% Smart Match — {item.matchExplanation}
          </p>
        ) : null}
      </Card>

      {canReceive ? (
        <Card className="space-y-3 p-4">
          <h2 className="font-semibold">Physical receipt</h2>
          <p className="text-sm text-muted">
            The finder must hand this item to you in person. Confirm only after you have it.
          </p>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {pinMsg ? <p className="text-sm text-teal">{pinMsg}</p> : null}
          <Button type="button" className="w-full" onClick={receive}>
            Confirm I have the item
          </Button>
        </Card>
      ) : null}

      <section>
        <h2 className="text-xs font-semibold tracking-widest text-muted">SMART MATCH</h2>
        <div className="mt-2 space-y-2">
          {(matchesQ.data ?? []).length === 0 ? (
            <p className="text-sm text-muted">
              No strong matches yet. Scores are calculated from category, name, color, location, brand, and details.
            </p>
          ) : (
            (matchesQ.data ?? []).map((row) => (
              <Link key={row.item.id} to="/items/$itemId" params={{ itemId: row.item.id }} className="block">
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{row.item.title}</p>
                    <span className="text-sm font-bold text-teal">{row.match.score}%</span>
                  </div>
                  <p className="text-xs text-muted">{row.match.explanation}</p>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {user && user.id !== item.reporterId && !claimBlocked ? (
        <Card className="space-y-3 p-4">
          <h2 className="font-semibold">Claim this item</h2>
          <p className="text-xs text-muted">
            Describe unique details only the owner would know. Staff review claims — you cannot approve your own.
          </p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Unique marks, serial, when you lost it…"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {pinMsg ? <p className="text-sm text-teal">{pinMsg}</p> : null}
          <Button type="button" className="w-full" onClick={claim} data-testid="claim_item_btn">
            Submit claim
          </Button>
        </Card>
      ) : user && claimBlocked ? (
        <Card className="p-4 text-sm text-muted">
          This found item is waiting for area staff to confirm physical receipt. Claims open after it is in official
          custody.
        </Card>
      ) : !user ? (
        <Link to="/login" search={{ next: `/items/${itemId}` }} className="block">
          <Button type="button" className="w-full">
            Sign in to claim
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
