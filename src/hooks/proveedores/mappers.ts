import type { SupplierDetail, CreateSupplierPayload } from "@/services/suppliers.service";
import type { Supplier } from "@/types/proveedores.types";
import dayjs from "@/lib/dayjs";

export type SupplierFormState = Pick<
    Supplier,
    "contacts" | "bankAccounts" | "promotions"
> & {
    name: string;
    businessName: string;
    rfc: string;
    website: string;
    email: string;
    type: Supplier["type"];
    paymentTerm: string;
    freight: Supplier["freight"];
    observations: string;
    creditAttention: string;
    creditJobTitleId: number | null;
    creditPhone: string;
};

export interface PromotionSnapshotItem {
    description: string;
    percentage: string;
    startDate: string;
    endDate: string;
}

export type PromotionSnapshot = Record<string, PromotionSnapshotItem>;

export function apiTypeToForm(type: "national" | "foreign" | null): "nacional" | "extranjera" {
    return type === "foreign" ? "extranjera" : "nacional";
}

export function formTypeToApi(type: "nacional" | "extranjera"): "national" | "foreign" {
    return type === "extranjera" ? "foreign" : "national";
}

export function apiFreightToForm(freight: "prepaid" | "collect" | null): "pagado" | "cobrar" {
    return freight === "collect" ? "cobrar" : "pagado";
}

export function formFreightToApi(freight: "pagado" | "cobrar"): "prepaid" | "collect" {
    return freight === "cobrar" ? "collect" : "prepaid";
}

const DEFAULT_CONTACTS: Supplier["contacts"] = [
    { id: "default-1", jobTitleId: null, name: "", phone: "" },
];

const DEFAULT_BANK_ACCOUNT: Supplier["bankAccounts"] = [
    { id: "default-1", bank: "", city: "", branch: "", account: "" },
];

export function getDefaultFormState(): SupplierFormState {
    return {
        name: "",
        businessName: "",
        rfc: "",
        website: "",
        email: "",
        type: "nacional",
        paymentTerm: "60",
        freight: "pagado",
        observations: "",
        contacts: [...DEFAULT_CONTACTS],
        creditAttention: "",
        creditJobTitleId: null,
        creditPhone: "",
        bankAccounts: [...DEFAULT_BANK_ACCOUNT],
        promotions: [],
    };
}

export function supplierDetailToFormState(d: SupplierDetail): SupplierFormState {
    return {
        name: d.name,
        businessName: d.businessName ?? "",
        rfc: d.rfc ?? "",
        website: d.website ?? "",
        email: d.email ?? "",
        type: apiTypeToForm(d.type),
        paymentTerm: String(d.paymentTerm ?? 60),
        freight: apiFreightToForm(d.freight),
        observations: d.observations ?? "",
        contacts:
            d.contacts.length > 0
                ? d.contacts.map((c) => ({
                      id: String(c.id),
                      jobTitleId: c.jobTitleId,
                      name: c.name,
                      phone: c.phone ?? "",
                  }))
                : [...DEFAULT_CONTACTS],
        creditAttention: d.creditData.attention ?? "",
        creditJobTitleId: d.creditData.jobTitleId,
        creditPhone: d.creditData.phone ?? "",
        bankAccounts:
            d.bankAccounts.length > 0
                ? d.bankAccounts.map((b) => ({
                      id: String(b.id),
                      bank: b.bank,
                      city: b.city ?? "",
                      branch: b.branch ?? "",
                      account: b.account,
                  }))
                : [...DEFAULT_BANK_ACCOUNT],
        promotions:
            d.promotions.length > 0
                ? d.promotions.map((p) => ({
                      id: String(p.id),
                      description: p.description,
                      percentage: String(p.percentage),
                      startDate: p.startDate,
                      endDate: p.endDate ?? "",
                  }))
                : [],
    };
}

function isExistingId(id: string): boolean {
    return /^\d+$/.test(id);
}

function normalizeDateInput(value: string): string {
    return value ? value.slice(0, 10) : "";
}

function normalizePromotionForSnapshot(promotion: Supplier["promotions"][0]): PromotionSnapshotItem {
    return {
        description: promotion.description.trim(),
        percentage: String(promotion.percentage).trim(),
        startDate: normalizeDateInput(promotion.startDate),
        endDate: normalizeDateInput(promotion.endDate),
    };
}

function hasPromotionContent(promotion: PromotionSnapshotItem): boolean {
    return promotion.description !== "" || Number(promotion.percentage) > 0;
}

function toNewPromotionPayload(promotion: PromotionSnapshotItem) {
    return {
        description: promotion.description || "Promoción",
        discountRate: Number(promotion.percentage) || 0,
        startDate: promotion.startDate || dayjs().format("YYYY-MM-DD"),
        endDate: promotion.endDate || undefined,
    };
}

interface PromotionPayloadResult {
    promotionIds: number[];
    newPromotions: Array<{
        description: string;
        discountRate: number;
        startDate: string;
        endDate?: string;
    }>;
}

function arePromotionsEqual(
    current: PromotionSnapshotItem,
    initial: PromotionSnapshotItem | undefined,
): boolean {
    if (!initial) return false;
    return (
        current.description === initial.description &&
        current.percentage === initial.percentage &&
        current.startDate === initial.startDate &&
        current.endDate === initial.endDate
    );
}

export function createPromotionSnapshot(
    promotions: SupplierFormState["promotions"],
): PromotionSnapshot {
    return promotions.reduce<PromotionSnapshot>((acc, promotion) => {
        if (isExistingId(String(promotion.id))) {
            acc[String(promotion.id)] = normalizePromotionForSnapshot(promotion);
        }
        return acc;
    }, {});
}

/**
 * Build promotion payload from form state and original snapshot.
 *
 * NOTE ABOUT BUSINESS BEHAVIOR:
 * Backend contract currently accepts only:
 * - `promotionIds`: existing promotions to keep linked
 * - `newPromotions`: brand-new promotions to create and link
 *
 * There is no "update existing promotion details in place" operation in this flow.
 * Therefore, when a linked existing promotion is edited in form, we treat it as:
 * - remove old relation (by not including its id in `promotionIds`)
 * - create a new promotion in `newPromotions` with the edited data
 */
function buildPromotionPayload(
    promotions: SupplierFormState["promotions"],
    initialPromotions: PromotionSnapshot,
): PromotionPayloadResult {
    const promotionIds: number[] = [];
    const newPromotions: PromotionPayloadResult["newPromotions"] = [];

    promotions.forEach((promotion) => {
        const id = String(promotion.id);
        const normalized = normalizePromotionForSnapshot(promotion);

        if (isExistingId(id)) {
            const initial = initialPromotions[id];
            if (arePromotionsEqual(normalized, initial)) {
                promotionIds.push(Number(id));
                return;
            }
            if (hasPromotionContent(normalized)) {
                newPromotions.push(toNewPromotionPayload(normalized));
            }
            return;
        }

        if (hasPromotionContent(normalized)) {
            newPromotions.push(toNewPromotionPayload(normalized));
        }
    });

    return { promotionIds, newPromotions };
}

export function formStateToPayload(
    state: SupplierFormState,
    initialPromotions: PromotionSnapshot = {},
): CreateSupplierPayload {
    const contactsPayload = state.contacts
        .filter((c, index) => {
            if (index === 0) return true;
            return (
                c.jobTitleId != null ||
                c.name.trim() !== "" ||
                c.phone.trim() !== ""
            );
        })
        .map((c) => {
            const existing = isExistingId(String(c.id));
            return {
                ...(existing ? { id: Number(c.id) } : {}),
                jobTitleId: c.jobTitleId as number,
                name: c.name.trim(),
                phone: c.phone.trim(),
            };
        });

    const bankAccountsPayload = state.bankAccounts
        .filter((b) => b.bank.trim() !== "" && b.account.trim() !== "")
        .map((b) => {
            const existing = isExistingId(String(b.id));
            return {
                ...(existing ? { id: Number(b.id) } : {}),
                bank: b.bank.trim(),
                city: b.city.trim() || undefined,
                branch: b.branch.trim() || undefined,
                account: b.account.trim(),
            };
        });

    const promotionPayload = buildPromotionPayload(state.promotions, initialPromotions);

    return {
        name: state.name.trim(),
        businessName: state.businessName.trim(),
        rfc: state.rfc.trim().toUpperCase(),
        website: state.website.trim() || undefined,
        email: state.email.trim() || undefined,
        type: formTypeToApi(state.type),
        paymentTerm: Number(state.paymentTerm),
        freight: formFreightToApi(state.freight),
        observations: state.observations.trim() || undefined,
        contacts: contactsPayload,
        creditData: {
            attention: state.creditAttention.trim(),
            jobTitleId: state.creditJobTitleId as number,
            phone: state.creditPhone.trim(),
        },
        bankAccounts: bankAccountsPayload,
        promotionIds:
            promotionPayload.promotionIds.length > 0 ? promotionPayload.promotionIds : undefined,
        newPromotions:
            promotionPayload.newPromotions.length > 0 ? promotionPayload.newPromotions : undefined,
    };
}
