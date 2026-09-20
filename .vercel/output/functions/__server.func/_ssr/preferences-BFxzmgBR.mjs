import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as updateMySettings } from "./api-C23it4D-.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { t as Button } from "./ui-BZdJ-JUd.mjs";
import { t as useCampusProfile } from "./use-profile-CYZXrqF0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preferences-BFxzmgBR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PreferencesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/preferences",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferencesBody, {})
	});
}
function PreferencesBody() {
	const { profile, refresh } = useCampusProfile();
	const [smart, setSmart] = (0, import_react.useState)(true);
	const [claims, setClaims] = (0, import_react.useState)(true);
	const [quiet, setQuiet] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		setSmart(profile.smartMatchPush);
		setClaims(profile.claimAlerts);
		setQuiet(profile.quietMode);
	}, [profile]);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-surface" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-4",
		onSubmit: async (e) => {
			e.preventDefault();
			await updateMySettings({ data: {
				smartMatchPush: smart,
				claimAlerts: claims,
				quietMode: quiet
			} });
			await refresh();
			setSaved(true);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Notification preferences"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "Smart Match alerts",
				checked: smart,
				onChange: setSmart
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "Claim status alerts",
				checked: claims,
				onChange: setClaims
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "Quiet mode",
				checked: quiet,
				onChange: setQuiet
			}),
			saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-teal",
				children: "Saved."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: "Save preferences"
			})
		]
	});
}
function Toggle({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-11 items-center justify-between rounded-lg border border-border bg-card px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked,
			onChange: (e) => onChange(e.target.checked)
		})]
	});
}
//#endregion
export { PreferencesPage as component };
