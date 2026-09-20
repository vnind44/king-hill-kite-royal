import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Plus, c as Clock, i as Search, l as Bell, s as House, t as UserRound } from "../_libs/lucide-react.mjs";
import { d as listMyNotifications } from "./api-C23it4D-.mjs";
import { t as useCurrentUserState } from "./use-current-user-Q8r4NahO.mjs";
import { t as cn } from "./cn-DQNzQ3cQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-CEaVRLBo.js
var import_jsx_runtime = require_jsx_runtime();
var tabs = [
	{
		to: "/home",
		label: "Home",
		icon: House,
		test: "tab_home"
	},
	{
		to: "/search",
		label: "Search",
		icon: Search,
		test: "tab_search"
	},
	{
		to: "/report",
		label: "Report",
		icon: Plus,
		test: "tab_report_fab",
		fab: true
	},
	{
		to: "/activity",
		label: "Activity",
		icon: Clock,
		test: "tab_activity"
	},
	{
		to: "/profile",
		label: "Profile",
		icon: UserRound,
		test: "tab_profile"
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, isPending } = useCurrentUserState();
	const unread = (useQuery({
		queryKey: ["notifications", user?.id],
		queryFn: () => listMyNotifications(),
		enabled: Boolean(user)
	}).data ?? []).filter((n) => !n.read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-screen max-w-lg flex-col bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-8 place-items-center rounded-sm bg-teal text-slate-950",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldIcon, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold leading-none",
						children: "Campus Lost & Found"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[11px] text-muted",
						children: "Main Campus"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/notifications",
					"data-testid": "notifications_bell_btn",
					className: "relative grid size-10 place-items-center rounded-sm text-muted hover:text-fg",
					"aria-label": "Notifications",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 size-2 rounded-full bg-teal" }) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 px-4 pb-28 pt-4",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-border bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative flex items-end justify-around",
					children: tabs.map((tab) => {
						const active = pathname === tab.to || pathname.startsWith(`${tab.to}/`);
						if (tab.fab) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: tab.to,
							"data-testid": tab.test,
							className: "-mt-5 grid size-14 place-items-center rounded-full bg-teal text-slate-950 shadow-[var(--shadow-card)]",
							"aria-label": "Report item",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-7" })
						}, tab.to);
						const Icon = tab.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: tab.to,
							"data-testid": tab.test,
							className: cn("flex min-w-14 flex-col items-center gap-1 px-2 py-1 text-[11px]", active ? "font-semibold text-teal" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), tab.label]
						}, tab.to);
					})
				})
			}),
			!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: "Browsing as guest"
			}) : null
		]
	});
}
function ShieldIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		fill: "currentColor",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4zm0 6.5a2.2 2.2 0 0 1 1.1 4.1V16h-2.2v-3.4A2.2 2.2 0 0 1 12 8.5z" })
	});
}
function AuthGate({ next, children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-surface" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card p-5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Sign in required"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Guests can browse the registry. Reporting, claims, and activity need a campus account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				search: { next },
				className: "mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-teal text-sm font-semibold text-slate-950",
				children: "Sign in with campus email"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { AuthGate as n, ShieldIcon as r, AppShell as t };
