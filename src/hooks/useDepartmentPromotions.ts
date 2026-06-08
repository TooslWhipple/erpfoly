import { useMemo } from "react";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getPromotions } from "@/services/promociones.service";
import type { PromotionListItem } from "@/types/promociones.types";

interface UseDepartmentPromotionsOptions {
	departmentId: number | null;
	enabled?: boolean;
}

export function useDepartmentPromotions({
	departmentId,
	enabled = true,
}: UseDepartmentPromotionsOptions) {
	const isReady = departmentId != null && !Number.isNaN(departmentId);

	const extraParams = useMemo(
		() =>
			isReady
				? { departmentIds: [departmentId] }
				: {},
		[departmentId, isReady]
	);

	return usePaginatedList<PromotionListItem>({
		queryKey: ["promotions", "list", "department", String(departmentId ?? "")],
		queryFn: getPromotions,
		initialPage: 0,
		initialRowsPerPage: 10,
		initialSearch: "",
		extraParams,
		enabled: enabled && isReady,
	});
}
