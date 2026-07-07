import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { checkUsernameAvailability } from "@/services/users.service";

const DEBOUNCE_MS = 400;
const STALE_TIME_MS = 60_000;

export function useUsernameAvailability(
  username: string,
  options?: { excludeUserId?: number | null; enabled?: boolean },
) {
  const debouncedUsername = useDebouncedValue(username.trim(), DEBOUNCE_MS);
  const excludeUserId = options?.excludeUserId ?? undefined;
  const enabled =
    (options?.enabled ?? true) && debouncedUsername.length >= 1;

  const query = useQuery({
    queryKey: ["users", "check-username", debouncedUsername, excludeUserId],
    queryFn: async () => {
      const result = await checkUsernameAvailability(
        debouncedUsername,
        excludeUserId ?? undefined,
      );
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data?.exists ?? false;
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return {
    exists: query.data === true,
    isChecking: query.isFetching,
    debouncedUsername,
  };
}
