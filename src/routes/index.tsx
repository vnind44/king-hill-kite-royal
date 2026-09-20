import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ShieldIcon } from "@/components/campus/shell";
import { ItemGlyph } from "@/components/campus/item-card";
import { useEffect } from "react";

export const Route = createFileRoute("/")({ component: Welcome });

const preview = [
  { title: "Room keys", place: "Student Center", kind: "key", rotate: "-rotate-6", z: "z-20" },
  { title: "Student ID", place: "Administration Block", kind: "id", rotate: "rotate-2", z: "z-30" },
  { title: "Black backpack", place: "Library", kind: "bag", rotate: "rotate-6", z: "z-10" },
];

function Welcome() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) navigate({ to: "/home" });
  }, [isPending, user, navigate]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-hidden bg-[#0F172A] px-6 pb-10 pt-8 text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgb(45_212_191/0.12),transparent_60%)]" />
      <header className="relative flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-teal text-slate-950">
          <ShieldIcon />
        </span>
        <p className="text-lg font-semibold tracking-tight">Campus Lost & Found</p>
      </header>

      <div className="relative mx-auto mt-8 h-48 w-full max-w-sm">
        {preview.map((card, i) => (
          <div
            key={card.title}
            className={`absolute left-1/2 w-[86%] -translate-x-1/2 rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3 shadow-[0_18px_50px_rgb(2_6_23/0.45)] ${card.rotate} ${card.z}`}
            style={{ top: `${i * 36}px` }}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-teal/15 text-teal">
                <ItemGlyph kind={card.kind} />
              </span>
              <div>
                <p className="font-semibold">{card.title}</p>
                <p className="text-sm text-slate-400">{card.place}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-auto">
        <h1 className="font-display text-[2.1rem] leading-[1.05] tracking-[-0.03em] sm:text-[2.35rem]">
          Lose it here.
          <br />
          Get it back here.
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-400">
          Report, search and reclaim belongings across campus.
        </p>
        <Link
          to="/login"
          className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-teal text-sm font-semibold text-slate-950"
        >
          Sign in with campus email
        </Link>
        <Link
          to="/register"
          className="mt-3 flex min-h-11 items-center justify-center text-sm font-medium text-teal"
        >
          Create an account
        </Link>
        <Link
          to="/home"
          className="mt-1 flex min-h-11 items-center justify-center text-sm font-medium text-teal"
        >
          Browse as guest
        </Link>
      </div>
    </main>
  );
}
