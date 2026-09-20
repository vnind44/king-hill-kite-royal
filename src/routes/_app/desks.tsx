import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listDesks } from "@/lib/campus/api";
import { Card } from "@/components/campus/ui";
import { cn } from "@/lib/campus/cn";

export const Route = createFileRoute("/_app/desks")({ component: DesksPage });

const layout = [
  { id: "library", col: "col-start-1", row: "row-start-1" },
  { id: "student-center", col: "col-start-2", row: "row-start-1" },
  { id: "admin-block", col: "col-start-1", row: "row-start-2" },
  { id: "security", col: "col-start-2", row: "row-start-2" },
];

function DesksPage() {
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  const byId = Object.fromEntries((desks.data ?? []).map((d) => [d.id, d]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl">Custody desks</h1>
        <p className="text-sm text-muted">Leave or pick up items at staffed campus desks with logged receipts.</p>
      </div>
      <Card className="p-3">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted">Main Campus</p>
        <div className="grid grid-cols-2 gap-2">
          {layout.map((cell) => {
            const desk = byId[cell.id];
            return (
              <div
                key={cell.id}
                className={cn(
                  "rounded-md border border-border bg-surface-2 p-3",
                  cell.col,
                  cell.row,
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-teal">
                  {desk?.isOpen ? "Open" : "Desk"}
                </p>
                <p className="text-sm font-semibold">{desk?.name ?? cell.id}</p>
                <p className="text-xs text-muted">{desk?.hours}</p>
              </div>
            );
          })}
        </div>
      </Card>
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
