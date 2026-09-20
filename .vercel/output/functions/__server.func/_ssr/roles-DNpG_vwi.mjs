//#region node_modules/.nitro/vite/services/ssr/assets/roles-DNpG_vwi.js
function isStaff(role) {
	return role === "STAFF" || role === "ADMIN";
}
function isAdmin(role) {
	return role === "ADMIN";
}
/** Client-supplied role values are ignored. New accounts are always STUDENT. */
var DEFAULT_NEW_USER_ROLE = "STUDENT";
//#endregion
export { isAdmin as n, isStaff as r, DEFAULT_NEW_USER_ROLE as t };
