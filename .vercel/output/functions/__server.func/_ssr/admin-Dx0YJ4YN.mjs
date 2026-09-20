import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as assignRole, s as listAdminUsers } from "./api-C23it4D-.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { n as Card, t as Button } from "./ui-BZdJ-JUd.mjs";
import { n as isAdmin } from "./roles-DNpG_vwi.mjs";
import { t as useCampusProfile } from "./use-profile-CYZXrqF0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Dx0YJ4YN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/admin",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBody, {})
	});
}
function AdminBody() {
	const { user, profile, isPending } = useCampusProfile();
	const qc = useQueryClient();
	const users = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => listAdminUsers()
	});
	const [error, setError] = (0, import_react.useState)(null);
	const mutate = useMutation({
		mutationFn: (input) => assignRole({ data: input }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
		onError: (err) => setError(err instanceof Error ? err.message : "Role update failed")
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-surface" });
	if (!profile || !isAdmin(profile.role)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: "Admin access required."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Admin dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Assign STAFF or ADMIN to other users. You cannot change your own role."
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			(users.data ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: u.displayName || u.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							u.email,
							" · ",
							u.role
						]
					}),
					u.id === user?.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "This is you. Self-promotion is blocked."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2",
						children: [
							"STUDENT",
							"STAFF",
							"ADMIN"
						].map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: u.role === role ? "primary" : "secondary",
							onClick: () => {
								setError(null);
								mutate.mutate({
									userId: u.id,
									role
								});
							},
							children: role
						}, role))
					})
				]
			}, u.id))
		]
	});
}
//#endregion
export { AdminPage as component };
