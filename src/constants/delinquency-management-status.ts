import type { DelinquencyManagementStatus } from "@/types/delinquency-shared-list.types";

export const DELINQUENCY_MANAGEMENT_STATUS_LABELS: Record<
  DelinquencyManagementStatus,
  string
> = {
  SIN_GESTION: "Sin gestión",
  CONTACTADO: "Contactado",
  PROMESA_DE_PAGO: "Promesa de pago",
  CONVENIO_DE_PAGO: "Convenio de pago",
  ILOCALIZABLE: "Ilocalizable",
  SE_NIEGA_A_PAGAR: "Se niega a pagar",
};

export const DELINQUENCY_MANAGEMENT_STATUS_OPTIONS = (
  Object.keys(DELINQUENCY_MANAGEMENT_STATUS_LABELS) as DelinquencyManagementStatus[]
).map((value) => ({ value, label: DELINQUENCY_MANAGEMENT_STATUS_LABELS[value] }));
