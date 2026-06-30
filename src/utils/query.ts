import dayjs from "@/lib/dayjs";

export function parsePositiveIntParam(
	value: string | string[] | undefined
): number | null {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw == null || raw === "") return null;
	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed < 1) return null;
	return parsed;
}

export function parseDateParam(
	value: string | string[] | undefined
): Date | null {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw == null || raw === "") return null;
	const parsed = dayjs(raw, "YYYY-MM-DD", true);
	if (!parsed.isValid()) return null;
	return parsed.startOf("day").toDate();
}
