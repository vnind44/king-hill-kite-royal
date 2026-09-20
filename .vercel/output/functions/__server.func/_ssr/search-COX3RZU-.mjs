import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { f as listPublicItems } from "./api-C23it4D-.mjs";
import { t as cn } from "./cn-DQNzQ3cQ.mjs";
import { i as Input } from "./ui-BZdJ-JUd.mjs";
import { t as ItemCard } from "./item-card-CNWp060k.mjs";
import { n as CATEGORIES } from "./types-CicgtuRe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-COX3RZU-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("All");
	const [type, setType] = (0, import_react.useState)("ALL");
	const items = useQuery({
		queryKey: ["items"],
		queryFn: () => listPublicItems({ data: {} })
	});
	const filtered = (0, import_react.useMemo)(() => {
		const list = items.data ?? [];
		const q = query.trim().toLowerCase();
		return list.filter((item) => {
			if (type !== "ALL" && item.itemType !== type) return false;
			if (category !== "All" && item.category !== category) return false;
			if (!q) return true;
			return `${item.title} ${item.description} ${item.location} ${item.color} ${item.brand}`.toLowerCase().includes(q);
		});
	}, [
		items.data,
		query,
		category,
		type
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Search"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Live recovered items and custody registry"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search keys, backpacks, IDs…",
				value: query,
				onChange: (e) => setQuery(e.target.value),
				"data-testid": "search_feed_input"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: [
					"ALL",
					"LOST",
					"FOUND"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setType(t),
					className: cn("rounded-full px-3 py-1.5 text-xs font-semibold", type === t ? "bg-fg text-bg" : "bg-surface-2 text-muted"),
					children: t === "ALL" ? "All" : t === "LOST" ? "Lost" : "Found"
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: ["All", ...CATEGORIES].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCategory(c),
					className: cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium", category === c ? "bg-fg text-bg" : "bg-surface-2 text-muted"),
					children: c
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold tracking-widest text-muted",
				children: [filtered.length, " ITEMS FOUND"]
			}),
			items.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-surface" }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No matching items. Try another term or category."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, { item }, item.id))
			})
		]
	});
}
//#endregion
export { SearchPage as component };
