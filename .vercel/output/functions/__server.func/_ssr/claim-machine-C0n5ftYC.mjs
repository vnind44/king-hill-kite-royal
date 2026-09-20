//#region node_modules/.nitro/vite/services/ssr/assets/claim-machine-C0n5ftYC.js
var TRANSITIONS = {
	SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
	UNDER_REVIEW: ["VERIFIED", "REJECTED"],
	VERIFIED: ["HANDOVER_PENDING", "REJECTED"],
	REJECTED: [],
	HANDOVER_PENDING: ["COMPLETED"],
	COMPLETED: []
};
function canTransition(from, to) {
	return TRANSITIONS[from]?.includes(to) ?? false;
}
function actorCanApply(role, from, to, opts) {
	if (!canTransition(from, to)) return false;
	if (opts.actorId === opts.claimantId && (to === "VERIFIED" || to === "COMPLETED")) return false;
	if (role === "STUDENT") return false;
	if (role === "STAFF" || role === "ADMIN") return true;
	return false;
}
function nextStatuses(from) {
	return [...TRANSITIONS[from] ?? []];
}
//#endregion
export { nextStatuses as n, actorCanApply as t };
