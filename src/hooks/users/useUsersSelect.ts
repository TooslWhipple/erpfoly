import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/Form";
import {
  getUsers,
  type GetUsersParams,
  type UserListItem,
} from "@/services/users.service";

const SELECT_STALE_TIME_MS = 5 * 60 * 1000;
const SELECT_LIMIT = 100;

export function userSelectLabel(user: UserListItem): string {
  return (
    user.fullName?.trim() ||
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username
  );
}

export function toUserSelectOptions(users: UserListItem[]): SelectOption[] {
  return users.map((user) => ({
    value: String(user.id),
    label: userSelectLabel(user),
  }));
}

export function usersSelectQueryKey(params: {
  roleCode?: string;
  excludeRoleCodes?: string;
  limit?: number;
}) {
  return [
    "users",
    "select",
    params.roleCode ?? null,
    params.excludeRoleCodes ?? null,
    params.limit ?? SELECT_LIMIT,
  ] as const;
}

export interface UseUsersSelectOptions {
  enabled?: boolean;
  roleCode?: string;
  excludeRoleCodes?: string;
  limit?: number;
  search?: string;
}

/**
 * Cached user list for FormAutocomplete selects (same pattern as repair suppliers).
 */
export function useUsersSelect(options: UseUsersSelectOptions = {}) {
  const {
    enabled = true,
    roleCode,
    excludeRoleCodes,
    limit = SELECT_LIMIT,
    search,
  } = options;

  const params: GetUsersParams = {
    page: 1,
    limit,
    roleCode,
    excludeRoleCodes,
    search,
  };

  const query = useQuery({
    queryKey: usersSelectQueryKey(params),
    queryFn: async (): Promise<UserListItem[]> => {
      const result = await getUsers(params);
      if (result.error != null) throw new Error(result.error.message);
      return result.data?.rows ?? [];
    },
    staleTime: SELECT_STALE_TIME_MS,
    enabled,
  });

  const selectOptions = useMemo(
    () => toUserSelectOptions(query.data ?? []),
    [query.data],
  );

  return { ...query, selectOptions };
}
