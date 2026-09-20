import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as GROK_PROVIDERS } from "./server-D7t8Czzs.mjs";
import { r as Route$15 } from "./router-DX3_sVHl.mjs";
import { i as ensureProfile } from "./api-C23it4D-.mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { r as ShieldIcon } from "./shell-CEaVRLBo.mjs";
import { i as Input, r as Field, t as Button } from "./ui-BZdJ-JUd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BK0HZmBm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { next } = Route$15.useSearch();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		const result = await authClient.signIn.email({
			email: email.trim(),
			password
		});
		setBusy(false);
		if (result.error) {
			setError(result.error.message || "Could not sign in.");
			return;
		}
		try {
			await ensureProfile({ data: { email: email.trim() } });
		} catch {}
		navigate({ to: next || "/home" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-10 place-items-center rounded-md bg-teal text-slate-950",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldIcon, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "Campus Lost & Found"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-10 font-display text-4xl leading-tight",
				children: "Welcome back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Sign in with your campus email to report and reclaim items."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 space-y-4",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Campus email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							autoComplete: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value),
							"data-testid": "input_campus_id"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							autoComplete: "current-password",
							required: true,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							"data-testid": "input_campus_password"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/forgot-password",
							className: "text-sm font-medium text-teal",
							children: "Forgot password?"
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						"data-testid": "sign_in_submit_btn",
						children: busy ? "Signing in…" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-2",
				children: GROK_PROVIDERS.filter((p) => p.idp === "google").map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "secondary",
					className: "w-full",
					onClick: () => signIn(p.providerId, { callbackURL: next || "/home" }),
					children: ["Continue with ", p.label]
				}, p.providerId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-center text-sm text-muted",
				children: [
					"New here?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/register",
						className: "font-semibold text-teal",
						"data-testid": "create_account_link",
						children: "Create an account"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/home",
				className: "mt-4 text-center text-sm text-muted",
				children: "Browse as guest"
			})
		]
	});
}
//#endregion
export { Login as component };
