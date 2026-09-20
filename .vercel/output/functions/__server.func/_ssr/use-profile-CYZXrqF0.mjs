import { n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { o as getMyProfile } from "./api-C23it4D-.mjs";
import { t as useCurrentUserState } from "./use-current-user-Q8r4NahO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-profile-CYZXrqF0.js
function useCampusProfile() {
	const { user, isPending } = useCurrentUserState();
	const query = useQuery({
		queryKey: ["campus-profile", user?.id],
		queryFn: () => getMyProfile(),
		enabled: Boolean(user)
	});
	return {
		user,
		isPending: isPending || Boolean(user) && query.isPending,
		profile: query.data ?? null,
		refresh: query.refetch
	};
}
//#endregion
export { useCampusProfile as t };
