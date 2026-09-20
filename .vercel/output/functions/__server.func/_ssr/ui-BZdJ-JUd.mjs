import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./cn-DQNzQ3cQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-BZdJ-JUd.js
var import_jsx_runtime = require_jsx_runtime();
function Button({ variant = "primary", className, ...props }) {
	const styles = {
		primary: "bg-teal text-slate-950 hover:bg-teal-press disabled:opacity-50",
		secondary: "bg-surface-2 text-fg border border-border hover:border-muted/40",
		ghost: "bg-transparent text-muted hover:text-fg",
		danger: "bg-danger/15 text-danger hover:bg-danger/25"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors duration-150", styles, className),
		...props
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-fg",
			children: label
		}), children]
	});
}
var fieldClass = "min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted/80";
function Input(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(fieldClass, props.className),
		...props
	});
}
function Textarea(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn(fieldClass, "min-h-24 py-2", props.className),
		...props
	});
}
function Card({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-lg border border-border bg-card shadow-[var(--shadow-card)]", className),
		children
	});
}
function StatusBadge({ status }) {
	const tone = status.includes("READY") || status === "VERIFIED" || status === "COMPLETED" || status === "RETURNED" ? "bg-teal/15 text-teal" : status.includes("MATCH") || status === "HANDOVER_PENDING" ? "bg-accent/15 text-accent" : status === "REJECTED" ? "bg-danger/15 text-danger" : "bg-surface-2 text-muted";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase", tone),
		children: status.replaceAll("_", " ")
	});
}
//#endregion
export { StatusBadge as a, Input as i, Card as n, Textarea as o, Field as r, Button as t };
