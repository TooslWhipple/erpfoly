import { useQuery } from "@tanstack/react-query";
import { getUsers, type UserListItem } from "@/services/users.service";
import { unwrapOrThrow } from "@/lib/axios";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UserListItem[]> => {
      const result = await getUsers({});
      const response = unwrapOrThrow(result);
      return response.rows;
    },
  });
}
