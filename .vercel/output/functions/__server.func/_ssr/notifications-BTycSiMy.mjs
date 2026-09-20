import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as listMyNotifications, m as markNotificationsRead } from "./api-C23it4D-.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { n as Card, t as Button } from "./ui-BZdJ-JUd.mjs";
import { t as timeAgo } from "./format-DRsKPkrJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-BTycSiMy.js
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/notifications",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsBody, {})
	});
}
function NotificationsBody() {
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listMyNotifications()
	});
	const mark = useMutation({
		mutationFn: () => markNotificationsRead(),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Notifications"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				onClick: () => mark.mutate(),
				children: "Mark read"
			})]
		}), (list.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "No notifications yet."
		}) : (list.data ?? []).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold uppercase tracking-wide text-teal",
					children: n.type
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: n.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: n.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeAgo(n.createdAt) }), n.itemId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/items/$itemId",
						params: { itemId: n.itemId },
						className: "font-semibold text-teal",
						children: "Open item"
					}) : null]
				})
			]
		}, n.id))]
	});
}
//#endregion
export { NotificationsPage as component };
