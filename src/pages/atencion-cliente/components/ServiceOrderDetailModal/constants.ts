import type { TabOption } from "@/components/TabFilters";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { ServiceOrderStatus } from "@/types/atencion-cliente.types";

export const SERVICE_ORDER_TABS: TabOption[] = [
  { label: "Queja", value: "queja" },
  { label: "Indicaciones", value: "indicaciones" },
  { label: "Solución", value: "solucion" },
];

export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  por_realizar: "Por realizar",
  listo_para_entregar: "Listo para entregar",
  finalizada: "Finalizada",
};

export const SERVICE_ORDER_STATUS_VARIANTS: Record<
  ServiceOrderStatus,
  StatusChipVariant
> = {
  por_realizar: "pending",
  listo_para_entregar: "info",
  finalizada: "success",
};

export const SERVICE_ORDER_STATUSES: ServiceOrderStatus[] = [
  "por_realizar",
  "listo_para_entregar",
  "finalizada",
];

export const MAX_EVIDENCE_FILES = 4;

const ServiceOrderDetailConstantsPage = () => null;

export default ServiceOrderDetailConstantsPage;
