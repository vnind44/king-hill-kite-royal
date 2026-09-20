import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as ensureProfile } from "./api-C23it4D-.mjs";
import { t as authClient } from "./client-B40BzJxt.mjs";
import { r as ShieldIcon } from "./shell-CEaVRLBo.mjs";
import { i as Input, r as Field, t as Button } from "./ui-BZdJ-JUd.mjs";
import { t as CAMPUS_ZONES } from "./types-CicgtuRe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-B1bvb24R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Register() {
	const navigate = useNavigate();
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [studentId, setStudentId] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [zone, setZone] = (0, import_react.useState)(CAMPUS_ZONES[0]);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		setBusy(true);
		setError(null);
		const result = await authClient.signUp.email({
			email: email.trim(),
			password,
			name: fullName.trim()
		});
		setBusy(false);
		if (result.error) {
			setError(result.error.message || "Could not create the account.");
			return;
		}
		try {
			await ensureProfile({ data: {
				displayName: fullName.trim(),
				studentId: studentId.trim(),
				email: email.trim(),
				campusZone: zone
			} });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Account created, but profile setup failed.");
			return;
		}
		navigate({ to: "/home" });
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
				children: "Create student account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "New accounts start as Student. Staff and admin roles are assigned by administrators only."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-8 space-y-4",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: fullName,
							onChange: (e) => setFullName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Student ID",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: studentId,
							onChange: (e) => setStudentId(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Campus email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							required: true,
							minLength: 8,
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Primary campus zone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm",
							value: zone,
							onChange: (e) => setZone(e.target.value),
							children: CAMPUS_ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: z }, z))
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
						children: busy ? "Creating account…" : "Create account"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-center text-sm text-muted",
				children: [
					"Already registered?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "font-semibold text-teal",
						children: "Sign in"
					})
				]
			})
		]
	});
}
//#endregion
export { Register as component };
