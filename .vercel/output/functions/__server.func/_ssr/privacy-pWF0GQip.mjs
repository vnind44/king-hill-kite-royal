import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as updateMySettings } from "./api-C23it4D-.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { i as Input, r as Field, t as Button } from "./ui-BZdJ-JUd.mjs";
import { t as useCampusProfile } from "./use-profile-CYZXrqF0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-pWF0GQip.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PrivacyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/privacy",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacyBody, {})
	});
}
function PrivacyBody() {
	const { profile, refresh } = useCampusProfile();
	const [name, setName] = (0, import_react.useState)("");
	const [studentId, setStudentId] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [incognito, setIncognito] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		setName(profile.displayName);
		setStudentId(profile.studentId);
		setPhone(profile.phone);
		setIncognito(profile.incognitoFinder);
	}, [profile]);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-surface" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-4",
		onSubmit: async (e) => {
			e.preventDefault();
			await updateMySettings({ data: {
				displayName: name,
				studentId,
				phone,
				incognitoFinder: incognito
			} });
			await refresh();
			setSaved(true);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Privacy & contact"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Display name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Student ID",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: studentId,
					onChange: (e) => setStudentId(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Phone",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: phone,
					onChange: (e) => setPhone(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: incognito,
					onChange: (e) => setIncognito(e.target.checked)
				}), "Incognito finder — hide your name on found-item cards"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Role, karma, and trust score cannot be edited here."
			}),
			saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-teal",
				children: "Saved."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				children: "Save contact"
			})
		]
	});
}
//#endregion
export { PrivacyPage as component };
