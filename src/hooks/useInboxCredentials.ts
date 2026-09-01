import { useQuery } from "@tanstack/react-query";
import { getInboxCredentials } from "@/services/notifications.service";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * The signature is deterministic per user, so it does not need refetching
 * while the session lasts.
 */
const STALE_TIME_MS = 60 * 60 * 1000;

/**
 * Signed credentials of the notification inbox for the logged-in ERP user.
 *
 * Keyed by user id so that logging in as someone else fetches their own
 * signature instead of reusing the previous one.
 */
export function useInboxCredentials() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["notifications", "inbox-credentials", userId],
    queryFn: () => getInboxCredentials(),
    enabled: Boolean(userId),
    staleTime: STALE_TIME_MS,
  });
}
