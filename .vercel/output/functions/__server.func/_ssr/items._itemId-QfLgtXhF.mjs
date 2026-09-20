import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$1 } from "./router-DX3_sVHl.mjs";
import { a as getItem, h as matchesForItem, v as submitClaim } from "./api-C23it4D-.mjs";
import { t as useCurrentUserState } from "./use-current-user-Q8r4NahO.mjs";
import { a as StatusBadge, n as Card, o as Textarea, t as Button } from "./ui-BZdJ-JUd.mjs";
import { t as timeAgo } from "./format-DRsKPkrJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/items._itemId-QfLgtXhF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ItemDetail() {
	const { itemId } = Route$1.useParams();
	const { user } = useCurrentUserState();
	const qc = useQueryClient();
	const itemQ = useQuery({
		queryKey: ["item", itemId],
		queryFn: () => getItem({ data: itemId })
	});
	const matchesQ = useQuery({
		queryKey: ["matches", itemId],
		queryFn: () => matchesForItem({ data: itemId })
	});
	const [note, setNote] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [pinMsg, setPinMsg] = (0, import_react.useState)(null);
	const item = itemQ.data;
	async function claim() {
		setError(null);
		try {
			await submitClaim({ data: {
				itemId,
				note
			} });
			setPinMsg("Claim submitted. Staff will review it.");
			await qc.invalidateQueries({ queryKey: ["item", itemId] });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not submit claim.");
		}
	}
	if (itemQ.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-lg bg-surface" });
	if (!item) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: "Item not found."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: `${item.itemType} · ${item.status}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl",
					children: item.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						item.location,
						" · ",
						timeAgo(item.createdAt)
					]
				})
			] }),
			item.photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: item.photoUrl,
				alt: "",
				className: "h-52 w-full rounded-lg object-cover"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-2 p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Category",
						value: item.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Color",
						value: item.color || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Brand",
						value: item.brand || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Reported by",
						value: item.reporterName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-muted",
						children: item.description || "No extra details."
					}),
					item.identifyingMarks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Marks: ", item.identifyingMarks] }) : null,
					item.matchScore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium text-teal",
						children: [
							item.matchScore,
							"% Smart Match — ",
							item.matchExplanation
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-semibold tracking-widest text-muted",
				children: "SMART MATCH"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (matchesQ.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No strong matches yet. Scores are calculated from category, name, color, location, brand, and details."
				}) : (matchesQ.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/items/$itemId",
					params: { itemId: row.item.id },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: row.item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-bold text-teal",
								children: [row.match.score, "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: row.match.explanation
						})]
					})
				}, row.item.id))
			})] }),
			user && user.id !== item.reporterId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Claim this item"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Describe why it is yours. Staff review claims — students cannot approve their own."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "Unique marks, serial, when you lost it…"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					pinMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-teal",
						children: pinMsg
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						className: "w-full",
						onClick: claim,
						children: "Submit claim"
					})
				]
			}) : !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				search: { next: `/items/${itemId}` },
				className: "block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "w-full",
					children: "Sign in to claim"
				})
			}) : null
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: value
		})]
	});
}
//#endregion
export { ItemDetail as component };
