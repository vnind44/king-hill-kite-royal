import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listDesks, reportItem } from "@/lib/campus/api";
import { CAMPUS_ZONES, CATEGORIES, ITEM_COLORS, type ItemType } from "@/lib/campus/types";
import { AuthGate } from "@/components/campus/shell";
import { Button, Field, Input, Textarea } from "@/components/campus/ui";
import { cn } from "@/lib/campus/cn";

export const Route = createFileRoute("/_app/report")({ component: ReportPage });

function ReportPage() {
  return (
    <AuthGate next="/report">
      <ReportForm />
    </AuthGate>
  );
}

function ReportForm() {
  const navigate = useNavigate();
  const desks = useQuery({ queryKey: ["desks"], queryFn: () => listDesks() });
  const [type, setType] = useState<ItemType>("LOST");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Electronics");
  const [zone, setZone] = useState<string>(CAMPUS_ZONES[0]);
  const [locationDetail, setLocationDetail] = useState("");
  const [color, setColor] = useState("Black");
  const [brand, setBrand] = useState("");
  const [marks, setMarks] = useState("");
  const [description, setDescription] = useState("");
  const [deskId, setDeskId] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const match = (desks.data ?? []).find(
      (d) => d.location === zone || d.name.toLowerCase().includes(zone.toLowerCase()),
    );
    if (match) setDeskId(match.id);
  }, [zone, desks.data]);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.72);
        if (data.length > 700_000) {
          setError("Compressed image is still too large. Try a simpler photo.");
          return;
        }
        setPhotoUrl(data);
        setError(null);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await reportItem({
        data: {
          title,
          category,
          description,
          color,
          brand,
          identifyingMarks: marks,
          itemType: type,
          location: locationDetail.trim() || zone,
          locationZone: zone,
          photoUrl,
          custodyDeskId: type === "FOUND" ? deskId || null : null,
        },
      });
      navigate({ to: "/items/$itemId", params: { itemId: result.item.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the report.");
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <h1 className="font-display text-3xl">Report an item</h1>
        <p className="text-sm text-muted">
          {type === "FOUND"
            ? "After you report a found item, take it to that area’s staff. Claims open only after they confirm receipt."
            : "Lost reports enter the campus registry immediately for Smart Match."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["LOST", "FOUND"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "min-h-11 rounded-md text-sm font-semibold",
              type === t ? "bg-fg text-bg" : "bg-surface-2 text-muted",
            )}
          >
            {t === "LOST" ? "I lost something" : "I found something"}
          </button>
        ))}
      </div>
      <Field label="Item name">
        <Input required value={title} onChange={(e) => setTitle(e.target.value)} data-testid="report_title_input" />
      </Field>
      <Field label="Category">
        <select
          className="min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Campus zone">
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
      <Field label="More specific location">
        <Input
          value={locationDetail}
          onChange={(e) => setLocationDetail(e.target.value)}
          placeholder="Library 2nd floor, east tables"
          data-testid="report_location_input"
        />
      </Field>
      {type === "FOUND" ? (
        <Field label="Turned in at">
          <select
            className="min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm"
            value={deskId}
            onChange={(e) => setDeskId(e.target.value)}
          >
            <option value="">Not at a desk yet</option>
            {(desks.data ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Color">
        <div className="flex flex-wrap gap-2">
          {ITEM_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "min-h-11 rounded-full px-3 text-xs font-medium",
                color === c ? "bg-fg text-bg" : "bg-surface-2 text-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Brand">
        <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
      </Field>
      <Field label="Identifying marks (kept private)">
        <Input
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          placeholder="Serial, initials, unique wear"
        />
      </Field>
      <Field label="Details">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} data-testid="report_desc_input" />
      </Field>
      <Field label="Photo">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </Field>
      {photoUrl ? <img src={photoUrl} alt="Preview" className="h-32 w-full rounded-md object-cover" /> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy} data-testid="submit_report_btn">
        {busy ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
