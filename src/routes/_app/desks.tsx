import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listDesks } from "@/lib/campus/api";
import { Card } from "@/components/campus/ui";

export const Route = createFileRoute("/_app/desks")({ component: DesksPage });

function DesksPage() {
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">Custody desks</h1>
        <p className="text-sm text-muted">Leave or pick up items at staffed campus desks with logged receipts.</p>
      </div>
      {(desks.data ?? []).map((desk) => (
        <Card key={desk.id} className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-teal">{desk.isOpen ? "Open" : "Closed"}</p>
            {desk.tag ? <span className="text-xs text-muted">{desk.tag}</span> : null}
          </div>
          <h2 className="mt-1 font-semibold">{desk.name}</h2>
          <p className="text-sm text-muted">{desk.location}</p>
          <p className="mt-2 text-xs">{desk.hours}</p>
          {desk.lockerNote ? <p className="text-xs text-muted">{desk.lockerNote}</p> : null}
          <p className="mt-3 text-sm">{desk.detailNotes}</p>
        </Card>
      ))}
    </div>
  );
}
