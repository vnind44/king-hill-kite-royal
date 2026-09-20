import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { c as listDesks } from "./api-C23it4D-.mjs";
import { n as Card } from "./ui-BZdJ-JUd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desks-UccfTWpl.js
var import_jsx_runtime = require_jsx_runtime();
function DesksPage() {
	const desks = useQuery({
		queryKey: ["desks"],
		queryFn: () => listDesks()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Custody desks"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Leave or pick up items at staffed campus desks with logged receipts."
		})] }), (desks.data ?? []).map((desk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-wide text-teal",
						children: desk.isOpen ? "Open" : "Closed"
					}), desk.tag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: desk.tag
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-semibold",
					children: desk.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: desk.location
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs",
					children: desk.hours
				}),
				desk.lockerNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: desk.lockerNote
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: desk.detailNotes
				})
			]
		}, desk.id))]
	});
}
//#endregion
export { DesksPage as component };
