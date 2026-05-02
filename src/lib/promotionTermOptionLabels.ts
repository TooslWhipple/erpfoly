import type {
  PromotionFormPurchaseTypeEntry,
  SavePromotionPayload,
} from "@/services/promociones.service";

/**
 * Builds display strings for selected term options (same wording as ConfigurationTab checkboxes).
 */
export function buildSelectedTermOptionLabels(
  purchaseTypeCode: string | undefined,
  purchaseType: PromotionFormPurchaseTypeEntry | undefined,
  creditTermIds: number[],
  layawayTermIds: number[]
): Pick<SavePromotionPayload, "creditTermOptionLabels" | "layawayTermOptionLabels"> {
  const options = purchaseType?.options ?? [];

  if (purchaseTypeCode === "CREDITO" && creditTermIds.length > 0) {
    const labels = creditTermIds
      .map((id) => {
        const opt = options.find((o) => o.id === id);
        return opt != null ? `${opt.label} meses` : null;
      })
      .filter((x): x is string => x != null && x.length > 0);
    return {
      creditTermOptionLabels: labels.length > 0 ? labels : undefined,
    };
  }

  if (purchaseTypeCode === "APARTADO" && layawayTermIds.length > 0) {
    const labels = layawayTermIds
      .map((id) => {
        const opt = options.find((o) => o.id === id);
        return opt != null ? `${opt.label} días` : null;
      })
      .filter((x): x is string => x != null && x.length > 0);
    return {
      layawayTermOptionLabels: labels.length > 0 ? labels : undefined,
    };
  }

  return {};
}
