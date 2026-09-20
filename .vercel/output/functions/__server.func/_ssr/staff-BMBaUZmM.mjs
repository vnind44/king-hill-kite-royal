import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { _ as reviewClaim, p as listStaffClaims } from "./api-C23it4D-.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { a as StatusBadge, i as Input, n as Card, t as Button } from "./ui-BZdJ-JUd.mjs";
import { r as isStaff } from "./roles-DNpG_vwi.mjs";
import { t as useCampusProfile } from "./use-profile-CYZXrqF0.mjs";
import { n as nextStatuses } from "./claim-machine-C0n5ftYC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff-BMBaUZmM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StaffPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/staff",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffBody, {})
	});
}
function StaffBody() {
	const { profile, isPending } = useCampusProfile();
	const qc = useQueryClient();
	const claims = useQuery({
		queryKey: ["staff-claims"],
		queryFn: () => listStaffClaims()
	});
	const [pin, setPin] = (0, import_react.useState)("");
	const [issued, setIssued] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const mutate = useMutation({
		mutationFn: (input) => reviewClaim({ data: input }),
		onSuccess: async (res) => {
			if (res.pin) setIssued(res.pin);
			await qc.invalidateQueries({ queryKey: ["staff-claims"] });
		},
		onError: (err) => setError(err instanceof Error ? err.message : "Update failed")
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-surface" });
	if (!profile || !isStaff(profile.role)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: "Staff access required."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Staff dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Verify claims and complete protected handovers. Status is computed on the server."
			})] }),
			issued ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-wide text-teal",
						children: "Handover PIN issued"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-teal",
						"data-testid": "copy_pin_button",
						children: issued
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Shown once here and sent to the claimant. Expires in 24 hours."
					})
				]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			(claims.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No open claims."
			}) : (claims.data ?? []).map((claim) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: claim.itemTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: claim.status })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["Claimant ", claim.claimantName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: claim.verificationNote || "No note attached."
					}),
					claim.status === "HANDOVER_PENDING" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Enter claimant PIN",
						value: pin,
						onChange: (e) => setPin(e.target.value)
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: nextStatuses(claim.status).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: action === "REJECTED" ? "danger" : "secondary",
							onClick: () => {
								setError(null);
								mutate.mutate({
									claimId: claim.id,
									action,
									pin: action === "COMPLETED" ? pin : void 0
								});
							},
							children: action.replaceAll("_", " ")
						}, action))
					})
				]
			}, claim.id))
		]
	});
}
//#endregion
export { StaffPage as component };
