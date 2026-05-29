import dayjs from "@/lib/dayjs";
import type { AutomatedCollectionMessageDeliveryStatus } from "@/services/automated-collection.service";
import type { StatusChipVariant } from "@/components/StatusChip";

export function formatAutomatedCollectionActivityDate(isoDate: string): string {
  const date = dayjs(isoDate);
  if (!date.isValid()) {
    return "—";
  }
  const month = date.format("MMMM");
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${date.format("D")} ${capitalizedMonth}, ${date.format("YYYY")} ${date.format("h:mm a")}`;
}

export function getMessageDeliveryStatusLabel(
  status: AutomatedCollectionMessageDeliveryStatus
): string {
  const labels: Record<AutomatedCollectionMessageDeliveryStatus, string> = {
    SUCCESS: "Exitoso",
    FAILED: "Fallido",
    PENDING: "Pendiente",
  };
  return labels[status];
}

export function getMessageDeliveryStatusVariant(
  status: AutomatedCollectionMessageDeliveryStatus
): StatusChipVariant {
  const variants: Record<AutomatedCollectionMessageDeliveryStatus, StatusChipVariant> = {
    SUCCESS: "success",
    FAILED: "error",
    PENDING: "warning",
  };
  return variants[status];
}
