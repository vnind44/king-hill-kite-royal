//#region node_modules/.nitro/vite/services/ssr/assets/format-DRsKPkrJ.js
function timeAgo(iso) {
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return "";
	const delta = Math.max(0, Date.now() - then);
	const minutes = Math.floor(delta / 6e4);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(iso).toLocaleDateString();
}
//#endregion
export { timeAgo as t };
