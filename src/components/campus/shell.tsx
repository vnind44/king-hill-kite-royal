import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Bell, Home, Plus, Search, UserRound, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listMyNotifications } from "@/lib/campus/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCampusProfile } from "@/lib/campus/use-profile";
import { isAdmin, isStaff } from "@/lib/campus/roles";
import { cn } from "@/lib/campus/cn";

const tabs: {
  to: "/home" | "/search" | "/report" | "/activity" | "/profile";
  label: string;
  icon: typeof Home;
  test: string;
  fab?: boolean;
}[] = [
  { to: "/home", label: "Home", icon: Home, test: "tab_home" },
  { to: "/search", label: "Search", icon: Search, test: "tab_search" },
  { to: "/report", label: "Report", icon: Plus, test: "tab_report_fab", fab: true },
  { to: "/activity", label: "Activity", icon: Clock, test: "tab_activity" },
  { to: "/profile", label: "Profile", icon: UserRound, test: "tab_profile" },
];

function profileLabel(name?: string | null) {
  return name ? `${name} · Main Campus` : "Main Campus";
}

export function PageNav({ variant = "app" }: { variant?: "app" | "welcome" }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tone = variant === "welcome" ? "text-slate-100 hover:text-white" : "text-muted hover:text-fg";

  function goBack() {
    if (pathname === "/") {
      void router.navigate({ to: "/home" });
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
      return;
    }
    void router.navigate({ to: "/home" });
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={goBack}
        aria-label="Back"
        data-testid="nav_back_btn"
        className={cn("grid size-11 place-items-center rounded-sm", tone)}
      >
        <ArrowLeft className="size-5" />
      </button>
      <Link
        to="/home"
        aria-label="Home"
        data-testid="nav_home_btn"
        className={cn(
          "grid size-11 place-items-center rounded-sm",
          pathname === "/home" ? "text-teal" : tone,
        )}
      >
        <Home className="size-5" />
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const { profile } = useCampusProfile();
  const notifs = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => listMyNotifications(),
    enabled: Boolean(user),
  });
  const unread = (notifs.data ?? []).filter((n) => !n.read).length;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-bg/90 px-2 py-2 backdrop-blur">
        <div className="flex min-w-0 items-center gap-1">
          <PageNav />
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-none">Campus Lost & Found</p>
            <p className="mt-1 truncate text-[11px] text-muted">
              {user
                ? profile && isStaff(profile.role)
                  ? `${profile.assignedAreas?.[0] || profile.campusZone} desk`
                  : profileLabel(user.displayName)
                : isPending
                  ? "Main Campus"
                  : "Guest · Main Campus"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {profile && isStaff(profile.role) ? (
            <Link
              to="/staff"
              className="rounded-full px-3 py-2 text-xs font-semibold text-teal"
            >
              Desk
            </Link>
          ) : null}
          {profile && isAdmin(profile.role) ? (
            <Link
              to="/admin"
              className="rounded-full px-3 py-2 text-xs font-semibold text-teal"
            >
              Admin
            </Link>
          ) : null}
          <Link
            to="/notifications"
            data-testid="notifications_bell_btn"
            className="relative grid size-10 place-items-center rounded-sm text-muted hover:text-fg"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-teal" />
            ) : null}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-border bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="relative flex items-end justify-around">
          {tabs.map((tab) => {
            const active = pathname === tab.to || pathname.startsWith(`${tab.to}/`);
            if (tab.fab) {
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  data-testid={tab.test}
                  className="-mt-5 grid size-14 place-items-center rounded-full bg-teal text-slate-950 shadow-[var(--shadow-card)]"
                  aria-label="Report item"
                >
                  <Plus className="size-7" />
                </Link>
              );
            }
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                data-testid={tab.test}
                className={cn(
                  "flex min-w-14 flex-col items-center gap-1 px-2 py-1 text-[11px]",
                  active ? "font-semibold text-teal" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {!isPending && !user ? (
        <p className="sr-only">Browsing as guest</p>
      ) : null}
    </div>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4zm0 6.5a2.2 2.2 0 0 1 1.1 4.1V16h-2.2v-3.4A2.2 2.2 0 0 1 12 8.5z" />
    </svg>
  );
}

export function AuthGate({
  next,
  children,
}: {
  next: string;
  children: React.ReactNode;
}) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-40 animate-pulse rounded-lg bg-surface" />;
  }
  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-center">
        <h2 className="font-display text-2xl">Sign in required</h2>
        <p className="mt-2 text-sm text-muted">
          Guests can browse the registry. Reporting, claims, and activity need a campus account.
        </p>
        <Link
          to="/login"
          search={{
            next,
            role: next === "/staff" ? "staff" : next === "/admin" ? "admin" : "student",
          }}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-teal text-sm font-semibold text-slate-950"
        >
          Sign in with campus email
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
