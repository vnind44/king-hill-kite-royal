import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as reportItem } from "./api-C23it4D-.mjs";
import { t as cn } from "./cn-DQNzQ3cQ.mjs";
import { n as AuthGate } from "./shell-CEaVRLBo.mjs";
import { i as Input, o as Textarea, r as Field, t as Button } from "./ui-BZdJ-JUd.mjs";
import { n as CATEGORIES, t as CAMPUS_ZONES } from "./types-CicgtuRe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report-fZgwE9W1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {
		next: "/report",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportForm, {})
	});
}
function ReportForm() {
	const navigate = useNavigate();
	const [type, setType] = (0, import_react.useState)("LOST");
	const [title, setTitle] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Electronics");
	const [location, setLocation] = (0, import_react.useState)("");
	const [zone, setZone] = (0, import_react.useState)(CAMPUS_ZONES[0]);
	const [color, setColor] = (0, import_react.useState)("");
	const [brand, setBrand] = (0, import_react.useState)("");
	const [marks, setMarks] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [photoUrl, setPhotoUrl] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	function onFile(file) {
		if (!file) return;
		if (![
			"image/jpeg",
			"image/png",
			"image/webp"
		].includes(file.type)) {
			setError("Use JPEG, PNG, or WebP.");
			return;
		}
		if (file.size > 5242880) {
			setError("Image must be under 5 MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
				canvas.width = Math.round(img.width * scale);
				canvas.height = Math.round(img.height * scale);
				const ctx = canvas.getContext("2d");
				if (!ctx) return;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				const data = canvas.toDataURL("image/jpeg", .72);
				if (data.length > 7e5) {
					setError("Compressed image is still too large. Try a simpler photo.");
					return;
				}
				setPhotoUrl(data);
				setError(null);
			};
			img.src = String(reader.result);
		};
		reader.readAsDataURL(file);
	}
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const result = await reportItem({ data: {
				title,
				category,
				description,
				color,
				brand,
				identifyingMarks: marks,
				itemType: type,
				location,
				locationZone: zone,
				photoUrl
			} });
			navigate({
				to: "/items/$itemId",
				params: { itemId: result.item.id }
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not submit the report.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-4",
		onSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Report an item"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Lost or found reports enter the campus registry immediately."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: ["LOST", "FOUND"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setType(t),
					className: cn("min-h-11 rounded-md text-sm font-semibold", type === t ? "bg-fg text-bg" : "bg-surface-2 text-muted"),
					children: t === "LOST" ? "I lost something" : "I found something"
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Item name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					required: true,
					value: title,
					onChange: (e) => setTitle(e.target.value),
					"data-testid": "report_title_input"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Category",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm",
					value: category,
					onChange: (e) => setCategory(e.target.value),
					children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Campus location",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					required: true,
					value: location,
					onChange: (e) => setLocation(e.target.value),
					"data-testid": "report_location_input"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Zone",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm",
					value: zone,
					onChange: (e) => setZone(e.target.value),
					children: CAMPUS_ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: z }, z))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Color",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: color,
						onChange: (e) => setColor(e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Brand",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: brand,
						onChange: (e) => setBrand(e.target.value)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Identifying marks",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: marks,
					onChange: (e) => setMarks(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Details",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: description,
					onChange: (e) => setDescription(e.target.value),
					"data-testid": "report_desc_input"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Photo",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/jpeg,image/png,image/webp",
					onChange: (e) => onFile(e.target.files?.[0])
				})
			}),
			photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photoUrl,
				alt: "Preview",
				className: "h-32 w-full rounded-md object-cover"
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				disabled: busy,
				"data-testid": "submit_report_btn",
				children: busy ? "Submitting…" : "Submit report"
			})
		]
	});
}
//#endregion
export { ReportPage as component };
