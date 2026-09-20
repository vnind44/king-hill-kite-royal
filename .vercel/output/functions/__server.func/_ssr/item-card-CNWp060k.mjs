import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as MapPin } from "../_libs/lucide-react.mjs";
import { a as StatusBadge, n as Card } from "./ui-BZdJ-JUd.mjs";
import { t as timeAgo } from "./format-DRsKPkrJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/item-card-CNWp060k.js
var import_jsx_runtime = require_jsx_runtime();
function glyph(item) {
	const cat = item.category.toLowerCase();
	if (cat.includes("key")) return "key";
	if (cat.includes("id") || cat.includes("card")) return "id";
	if (cat.includes("bag")) return "bag";
	if (cat.includes("electron")) return "chip";
	return "box";
}
function ItemGlyph({ kind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-5",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: kind === "key" ? "M8 14a4 4 0 1 1 4-4h8v2h-2v2h-2v2h-4a4 4 0 0 1-4-2z" : kind === "id" ? "M4 6h16v12H4z M8 10h4 M8 14h8" : kind === "bag" ? "M8 8h8l1 12H7L8 8z M10 8V6h4v2" : "M6 8h12v10H6z",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
function ItemCard({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/items/$itemId",
		params: { itemId: item.id },
		className: "block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex items-center gap-3 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-12 shrink-0 place-items-center rounded-sm bg-teal/15 text-teal",
				children: item.photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.photoUrl,
					alt: "",
					className: "size-12 rounded-sm object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemGlyph, { kind: glyph(item) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: item.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: item.status })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 flex items-center gap-1 truncate text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3" }),
							item.location,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-border",
								children: "·"
							}),
							timeAgo(item.createdAt)
						]
					}),
					item.matchScore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs font-medium text-teal",
						children: [item.matchScore, "% Smart Match"]
					}) : null
				]
			})]
		})
	});
}
//#endregion
export { ItemGlyph as n, ItemCard as t };
