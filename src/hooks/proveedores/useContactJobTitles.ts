import { useQuery } from "@tanstack/react-query";
import { getContactJobTitles } from "@/services/suppliers.service";
import { unwrapOrThrow } from "@/lib/axios";
import type { ContactJobTitleOption } from "@/services/suppliers.service";

const STALE_TIME_MS = 10 * 60 * 1000;

export function useContactJobTitles() {
    return useQuery({
        queryKey: ["catalog", "contact-job-titles"],
        queryFn: async (): Promise<ContactJobTitleOption[]> => {
            const result = await getContactJobTitles();
            return unwrapOrThrow(result);
        },
        staleTime: STALE_TIME_MS,
    });
}
