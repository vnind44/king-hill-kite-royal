import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "./api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function useCampusProfile() {
  const { user, isPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["campus-profile", user?.id],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
  });
  return { user, isPending: isPending || (Boolean(user) && query.isPending), profile: query.data ?? null, refresh: query.refetch };
}
