import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Plus, r as Store } from "../_libs/lucide-react.mjs";
import { c as listDesks, f as listPublicItems } from "./api-C23it4D-.mjs";
import { n as Card } from "./ui-BZdJ-JUd.mjs";
import { t as useCampusProfile } from "./use-profile-CYZXrqF0.mjs";
import { t as ItemCard } from "./item-card-CNWp060k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-BufOMmio.js
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	const { user, profile } = useCampusProfile();
	const items = useQuery({
		queryKey: ["items"],
		queryFn: () => listPublicItems({ data: {} })
	});
	const desks = useQuery({
		queryKey: ["desks"],
		queryFn: () => listDesks()
	});
	const feed = items.data ?? [];
	const urgent = feed.find((i) => i.matchScore && i.matchScore >= 55);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: user ? `Hello, ${profile?.displayName || user.displayName || "there"}` : "Campus registry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Lost & found recovery network"
				})] }), profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-sm bg-teal/15 px-2 py-1 text-xs font-semibold text-teal",
					children: [profile.karmaPoints, " karma"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium text-muted",
					children: "Guest"
				})]
			}),
			urgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/items/$itemId",
				params: { itemId: urgent.id },
				className: "block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "bg-[#0B1C30] p-4 text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px] font-bold uppercase tracking-wider text-teal",
							children: [
								"Smart Match · ",
								urgent.matchScore,
								"%"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-semibold",
							children: urgent.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-300",
							children: urgent.matchExplanation
						})
					]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/report",
					className: "rounded-lg border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-sm bg-teal/15 text-teal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-semibold",
							children: "Report item"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Lost or found"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/desks",
					className: "rounded-lg border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-sm bg-surface-2 text-teal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-semibold",
							children: "Custody desks"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [desks.data?.length ?? 4, " verified hubs"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-semibold tracking-widest text-muted",
					children: "RECENT RECOVERIES"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					className: "text-xs font-semibold text-teal",
					children: "Search"
				})]
			}), items.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-lg bg-surface" }) : feed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5 text-sm text-muted",
				children: "No reports yet. Be the first to file a lost or found item."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: feed.slice(0, 8).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, { item }, item.id))
			})] })
		]
	});
}
//#endregion
export { HomePage as component };
