import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/services/users.service";
import { unwrapOrThrow } from "@/lib/axios";

export interface User {
  id: number;
  name: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await getUsers({});
      const response = unwrapOrThrow(result);
      return response.data as User[];
    },
  });
}
