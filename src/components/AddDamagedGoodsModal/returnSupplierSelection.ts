export interface ReturnSupplierOption {
    id: number;
}

/**
 * One commercial supplier fills the field. Several keep a still-valid choice
 * and drop anything that is not in the new list, including a workshop id.
 */
export function nextReturnSupplierValue(
    current: string,
    options: ReturnSupplierOption[],
): string {
    if (options.length === 1) {
        return String(options[0].id);
    }
    if (current !== "" && options.some((option) => String(option.id) === current)) {
        return current;
    }
    return "";
}

/** Only a return disposition may send the commercial supplier id. */
export function returnSupplierIdForDisposition(
    dispositionCode: string,
    returnSupplierId: string,
): number | undefined {
    if (dispositionCode !== "RETURN_TO_SUPPLIER") {
        return undefined;
    }
    const parsed = Number.parseInt(returnSupplierId, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
        return undefined;
    }
    return parsed;
}
