import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as listMyActivity, u as listMyClaims } from "./api-C23it4D-.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { a as StatusBadge, n as Card } from "./ui-BZdJ-JUd.mjs";
import { t as timeAgo } from "./format-DRsKPkrJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-CzO3YWYt.js
var import_jsx_runtime = require_jsx_runtime();
function ActivityPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/activity",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityBody, {})
	});
}
function ActivityBody() {
	const claims = useQuery({
		queryKey: ["my-claims"],
		queryFn: () => listMyClaims()
	});
	const activity = useQuery({
		queryKey: ["my-activity"],
		queryFn: () => listMyActivity()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Your reports, claims, and handover history"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-semibold tracking-widest text-muted",
					children: "CLAIMS"
				}), (claims.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No claims yet."
				}) : (claims.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/items/$itemId",
					params: { itemId: c.itemId },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: c.itemTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: timeAgo(c.createdAt)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: c.status })]
					})
				}, c.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-semibold tracking-widest text-muted",
					children: "HISTORY"
				}), (activity.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No activity recorded yet."
				}) : (activity.data ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: e.message
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: timeAgo(e.createdAt)
					})]
				}, e.id))]
			})
		]
	});
}
//#endregion
export { ActivityPage as component };
