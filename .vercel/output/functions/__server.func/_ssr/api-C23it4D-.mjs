import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-B4bfOtuz.mjs";
import { a as createSsrRpc } from "./router-DX3_sVHl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-C23it4D-.js
var ensureProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("f26b52ec4e31ed1afea17bd919da0e9902f3916d82a3cab7c3aa20df47372c4f"));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("253204862c982539299876ed4eaf46e6ff3f7c3d8dc7aee0cc75c2765212af96"));
var updateMySettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("43b51b7e7d30d4b7c246a9417340d704d43014d9e4eedce6250e83363014fa55"));
var listDesks = createServerFn({ method: "GET" }).handler(createSsrRpc("ee50df6f771f2a0ba2075451aacf74a222e1084725f1d2f0d2d69f09e3eafc00"));
var listPublicItems = createServerFn({ method: "GET" }).validator((input) => input ?? {}).handler(createSsrRpc("9826527d796252d0ec53c52718771bdc41759dfe4dbb93dc3355be0bf2f36664"));
var getItem = createServerFn({ method: "GET" }).validator((id) => id).handler(createSsrRpc("1d01127f4ed8788c94b681c1fb29b08c6cc2e2e0a504b530f33bb5b13447c33f"));
var reportItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.title?.trim()) throw new Error("Item name is required");
	if (!input.location?.trim()) throw new Error("Campus location is required");
	if (input.itemType !== "LOST" && input.itemType !== "FOUND") throw new Error("Invalid report type");
	return input;
}).handler(createSsrRpc("c42951da9c25bf3dd501a57213348db27964ba18ef66fbbb368a08e168b6f733"));
var matchesForItem = createServerFn({ method: "GET" }).validator((id) => id).handler(createSsrRpc("d3fecbac500ec703c1c88e53a038622150b808d9fc97841ccb7bc9c013dcf212"));
var submitClaim = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.itemId) throw new Error("Item is required");
	return input;
}).handler(createSsrRpc("5f9b13d0c966081949dfb7998c5172d91c5c2c68db0ca3b676884efcb8be84ad"));
var listMyClaims = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("788bb7063eac551a64cec759e06803008a5bb26598ae5ac53948c0f826dcc58a"));
var listMyActivity = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2d89d8bea121f7fbc49304b45d673403f7e97884d21496aa7edc2719ca228d85"));
var listMyNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1269e5dc605faeffdefd4091ccde3b92879b5df57ed6ca469b0a7c5e49649d81"));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("1db05e86dbe590e13614448f339973c83e6090f036f52ebd13421c98be117b66"));
var listStaffClaims = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("43c6f241258065ac9bcd88814f92737df7d8c6ffe3b506b9d7c51c53c424368b"));
var reviewClaim = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c9333ebf5c0f69544d9695734e38fbae5ecc689b1220b1f96f9951bfcabc9d92"));
var listAdminUsers = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b5abd5b609b33c4a44bb6e3ec43c48e86da1805064a42c35f4472b9429304e50"));
var assignRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("874739aad5453d484dbb974da3526a925192038521b7c4a6e601929c2c97a010"));
var bootstrapAdmin = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("d0e3d4190a047acb9f531a32e2995ccd93b5a8ae769263a7f07d3e9a4c44a62e"));
var adminCount = createServerFn({ method: "GET" }).handler(createSsrRpc("6ceb53c6e9327b5293a87897ecfd4f2fc4aa0da6c0aa1b11bb1a8bda5cb5e11c"));
//#endregion
export { reviewClaim as _, getItem as a, listDesks as c, listMyNotifications as d, listPublicItems as f, reportItem as g, matchesForItem as h, ensureProfile as i, listMyActivity as l, markNotificationsRead as m, assignRole as n, getMyProfile as o, listStaffClaims as p, bootstrapAdmin as r, listAdminUsers as s, adminCount as t, listMyClaims as u, submitClaim as v, updateMySettings as y };
