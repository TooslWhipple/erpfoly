import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface User {
  id: number;
  name: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/users");
      return data;
    },
  });
}
