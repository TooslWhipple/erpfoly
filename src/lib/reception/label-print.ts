import type { ReceptionConfirmVariant } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import type { LabelPrintMode } from "@/lib/printing";

export function getReceptionLabelCounts(
  items: { received: number }[],
  printedLabelsCount: number,
): { totalLabels: number; extraLabels: number } {
  const totalLabels = items.reduce((sum, item) => sum + item.received, 0);
  const extraLabels = Math.max(0, totalLabels - printedLabelsCount);
  return { totalLabels, extraLabels };
}

export function resolveReceptionPrintParams(
  printedLabelsCount: number,
  totalLabels: number,
): {
  mode: LabelPrintMode;
  skip: number;
  variant: ReceptionConfirmVariant;
} {
  const extraLabels = Math.max(0, totalLabels - printedLabelsCount);
  return extraLabels > 0
    ? {
        mode: "extra",
        skip: printedLabelsCount,
        variant: "save_extra_labels",
      }
    : {
        mode: "all",
        skip: 0,
        variant: "save_labels",
      };
}
