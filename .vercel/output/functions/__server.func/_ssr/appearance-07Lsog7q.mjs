import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as useTheme } from "./router-DX3_sVHl.mjs";
import { y as updateMySettings } from "./api-C23it4D-.mjs";
import { t as cn } from "./cn-DQNzQ3cQ.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { n as Card } from "./ui-BZdJ-JUd.mjs";
import { t as useCampusProfile } from "./use-profile-CYZXrqF0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/appearance-07Lsog7q.js
var import_jsx_runtime = require_jsx_runtime();
function AppearancePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/appearance",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceBody, {})
	});
}
function AppearanceBody() {
	const { theme, setTheme } = useTheme();
	const { refresh } = useCampusProfile();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Appearance"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Centralized theme tokens only. Arbitrary background tints are disabled so text contrast stays readable."
			}),
			[
				{
					id: "light",
					label: "Light",
					note: "Paper surfaces, ink text"
				},
				{
					id: "dark",
					label: "Dark",
					note: "Navy campus night mode"
				},
				{
					id: "system",
					label: "System",
					note: "Follow the device setting"
				}
			].map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full text-left",
				onClick: async () => {
					setTheme(opt.id);
					await updateMySettings({ data: { theme: opt.id } });
					await refresh();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: cn("p-4", theme === opt.id && "border-teal"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: opt.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: opt.note
					})]
				})
			}, opt.id))
		]
	});
}
//#endregion
export { AppearancePage as component };
