import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ShieldIcon, PageNav } from "@/components/campus/shell";
import { ItemGlyph } from "@/components/campus/item-card";
import { LOGIN_ROLES, PORTALS, type LoginRole } from "@/lib/campus/portals";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Welcome });

const PREVIEW_CARDS = [
  { id: "keys", title: "Room keys", place: "Student Center", kind: "key", role: "student" },
  { id: "bag", title: "Library desk", place: "Staff custody", kind: "bag", role: "staff" },
  { id: "id", title: "Student ID", place: "Administration Block", kind: "id", role: "admin" },
] as const;

type CardId = (typeof PREVIEW_CARDS)[number]["id"];
type Slot = "left" | "front" | "right";

const SLOT_POSE: Record<Slot, { transform: string; opacity: number }> = {
  left: {
    transform: "translate3d(-108%, 1.5rem, 0) rotate(-7deg) scale(0.94)",
    opacity: 0.8,
  },
  front: {
    transform: "translate3d(-50%, 0, 0) rotate(0deg) scale(1)",
    opacity: 1,
  },
  right: {
    transform: "translate3d(4%, 1.75rem, 0) rotate(7deg) scale(0.94)",
    opacity: 0.8,
  },
};

function Welcome() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Record<Slot, CardId>>({
    left: "keys",
    front: "bag",
    right: "id",
  });

  useEffect(() => {
    if (!isPending && user) navigate({ to: "/home" });
  }, [isPending, user, navigate]);

  function bringToFront(id: CardId) {
    setSlots((current) => {
      if (current.front === id) return current;
      if (current.left === id) {
        return { left: current.front, front: id, right: current.right };
      }
      return { left: current.left, front: id, right: current.front };
    });
  }

  function openRole(role: LoginRole) {
    const card = PREVIEW_CARDS.find((c) => c.role === role);
    if (card && slots.front !== card.id) bringToFront(card.id);
    navigate({ to: "/login", search: { role } });
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden bg-welcome px-6 pb-10 pt-8 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgb(45_212_191/0.14),transparent_58%)]" />
      <div className="relative z-20 -ml-2">
        <PageNav variant="welcome" />
      </div>
      <header className="relative -mt-2 flex flex-col items-center text-center">
        <span className="grid size-11 place-items-center rounded-md bg-teal text-slate-950">
          <ShieldIcon />
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Campus Lost & Found</h1>
      </header>

      <div className="relative flex flex-1 flex-col justify-center">
        <div className="relative mx-auto h-52 w-full max-w-sm">
          {PREVIEW_CARDS.map((card) => {
            const slot: Slot =
              slots.front === card.id ? "front" : slots.left === card.id ? "left" : "right";
            return (
              <PreviewCard
                key={card.id}
                title={card.title}
                place={card.place}
                kind={card.kind}
                slot={slot}
                onSelect={() => openRole(card.role)}
              />
            );
          })}
        </div>

        <div className="relative z-40 mx-auto mt-6 grid w-full max-w-sm grid-cols-3 gap-2">
          {LOGIN_ROLES.map((role) => {
            const active = PREVIEW_CARDS.find((c) => c.id === slots.front)?.role === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => openRole(role)}
                aria-pressed={active}
                data-testid={`welcome_tap_${role}`}
                className={`min-h-11 rounded-full px-2 text-sm font-bold transition-colors duration-200 ${
                  active ? "bg-teal text-slate-950" : "bg-white/8 text-slate-200"
                }`}
              >
                {PORTALS[role].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-8 text-center">
        <p className="font-display text-[2.15rem] leading-[1.05] tracking-[-0.03em] sm:text-[2.4rem]">
          Lose it here.
          <br />
          Get it back here.
        </p>
        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-slate-400">
          Choose Student, Staff, or Admin. Each role opens its own sign-in.
        </p>
        <Link
          to="/register"
          data-testid="welcome_sign_up_btn"
          className="mt-6 flex min-h-11 items-center justify-center text-sm font-medium text-teal"
        >
          Create a student account
        </Link>
        <Link
          to="/home"
          data-testid="browse_as_guest_btn"
          className="flex min-h-11 items-center justify-center text-sm font-medium text-slate-300"
        >
          Browse as guest
        </Link>
      </div>
    </main>
  );
}

function PreviewCard({
  title,
  place,
  kind,
  slot,
  onSelect,
}: {
  title: string;
  place: string;
  kind: string;
  slot: Slot;
  onSelect: () => void;
}) {
  const isFront = slot === "front";
  const pose = SLOT_POSE[slot];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isFront}
      aria-label={`Show ${title} from ${place}`}
      data-testid={`welcome_card_${place.toLowerCase().replace(/\s+/g, "_")}`}
      className={`welcome-fan-card rounded-xl border border-white/10 bg-welcome-card px-4 py-3 text-left ${isFront ? "is-front" : ""}`}
      style={{ transform: pose.transform, opacity: pose.opacity }}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-welcome-well text-teal">
          <ItemGlyph kind={kind} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          <p className="truncate text-sm text-slate-400">{place}</p>
        </div>
      </div>
    </button>
  );
}
