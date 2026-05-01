import { get, post, patch, unwrapOrThrow, type ApiResult } from "@/lib/axios";

const BASE = "/promotions";

/** Quita capas `{ success: true, data }` si la respuesta llegó aún envuelta. */
function unwrapSuccessEnvelope(raw: unknown): unknown {
	let current: unknown = raw;
	while (
		current !== null &&
		typeof current === "object" &&
		!Array.isArray(current) &&
		"data" in current &&
		"success" in current &&
		(current as Record<string, unknown>).success === true
	) {
		const next = (current as { data: unknown }).data;
		if (next === current || next === undefined) break;
		current = next;
	}
	return current;
}

export interface PromotionFormTermOption {
	id: number;
	label: number;
}

export interface PromotionFormPurchaseTypeEntry {
	id: number;
	label: string;
	code: string;
	optionLabel?: string;
	options?: PromotionFormTermOption[];
}

export interface PromotionFormCustomerLevelEntry {
	id: number;
	label: string;
	level_number: number;
}

export interface PromotionFormConfiguration {
	purchaseTypes: PromotionFormPurchaseTypeEntry[];
	customerLevels: PromotionFormCustomerLevelEntry[];
}

export interface PromotionDetail {
	id: number;
	name: string;
	discount_rate: number;
	start_date: string;
	end_date: string | null;
	purchase_type_id: number | null;
	credit_term_ids: number[];
	layaway_term_ids: number[];
	customer_level_down_payments: Array<{
		customer_level_id: number;
		percentage: number;
	}>;
	product_ids: number[];
	products: Array<{
		id: number;
		department_id: number;
		line_id: number;
	}>;
	branch_ids: number[];
	supplier_ids: number[];
}

export interface SavePromotionPayload {
	name: string;
	discount_rate: number;
	start_date: string;
	end_date?: string | null;
	purchase_type_id?: number | null;
	credit_term_ids?: number[];
	layaway_term_ids?: number[];
	customer_level_down_payments?: Array<{
		customer_level_id: number;
		percentage: number;
	}>;
	product_ids?: number[];
	branch_ids?: number[];
	supplier_ids?: number[];
}

function recordUnknown(v: unknown): Record<string, unknown> {
	return v !== null && typeof v === "object" && !Array.isArray(v)
		? (v as Record<string, unknown>)
		: {};
}

function normalizeTermOption(raw: unknown): PromotionFormTermOption | null {
	const o = recordUnknown(raw);
	const id = Number(o.id);
	const label = Number(o.label ?? o.months ?? o.days);
	if (!Number.isFinite(id) || !Number.isFinite(label)) return null;
	return { id, label };
}

function normalizePurchaseTypeEntry(raw: unknown): PromotionFormPurchaseTypeEntry | null {
	const o = recordUnknown(raw);
	const id = Number(o.id);
	const label = String(o.label ?? o.name ?? "").trim();
	const code = String(o.code ?? "").trim();
	if (!Number.isFinite(id) || !label) return null;

	const optionsRaw = o.options ?? o.credit_options ?? o.layaway_options;
	let options: PromotionFormTermOption[] | undefined;
	if (Array.isArray(optionsRaw)) {
		const mapped = optionsRaw
			.map(normalizeTermOption)
			.filter((x): x is PromotionFormTermOption => x != null);
		options = mapped.length > 0 ? mapped : undefined;
	}

	const optionLabel =
		o.optionLabel != null
			? String(o.optionLabel)
			: o.option_label != null
				? String(o.option_label)
				: undefined;

	return { id, label, code, optionLabel, options };
}

function normalizeCustomerLevelEntry(raw: unknown): PromotionFormCustomerLevelEntry | null {
	const o = recordUnknown(raw);
	const id = Number(o.id);
	const label = String(o.label ?? o.name ?? "").trim();
	const level_number = Number(o.level_number ?? o.levelNumber ?? 0);
	if (!Number.isFinite(id) || !label) return null;
	return { id, label, level_number: Number.isFinite(level_number) ? level_number : 0 };
}

/** Normaliza respuesta de configuración (camelCase / snake_case / envelope residual). */
export function normalizePromotionFormConfiguration(raw: unknown): PromotionFormConfiguration {
	const o = recordUnknown(unwrapSuccessEnvelope(raw));
	const purchaseTypesRaw = o.purchaseTypes ?? o.purchase_types;
	const customerLevelsRaw = o.customerLevels ?? o.customer_levels;

	const purchaseTypes = Array.isArray(purchaseTypesRaw)
		? purchaseTypesRaw
				.map(normalizePurchaseTypeEntry)
				.filter((x): x is PromotionFormPurchaseTypeEntry => x != null)
		: [];

	const customerLevels = Array.isArray(customerLevelsRaw)
		? customerLevelsRaw
				.map(normalizeCustomerLevelEntry)
				.filter((x): x is PromotionFormCustomerLevelEntry => x != null)
		: [];

	return { purchaseTypes, customerLevels };
}

export async function getPromotionFormConfiguration(): Promise<PromotionFormConfiguration> {
	const result = await get<unknown>(`${BASE}/configuration`);
	return normalizePromotionFormConfiguration(unwrapOrThrow(result));
}

export async function getPromotionById(id: number): Promise<PromotionDetail> {
	return unwrapOrThrow(await get<PromotionDetail>(`${BASE}/${id}`));
}

export async function createPromotion(
	payload: SavePromotionPayload
): Promise<ApiResult<PromotionDetail>> {
	return post<PromotionDetail>(BASE, payload);
}

export async function updatePromotion(
	id: number,
	payload: SavePromotionPayload
): Promise<ApiResult<PromotionDetail>> {
	return patch<PromotionDetail>(`${BASE}/${id}`, payload);
}
