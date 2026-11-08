export type InternalPayableCategoryConfiguration =
  | "PROVEEDORES"
  | "VIATICOS"
  | "CARGOS_DEUDORES_DIVERSOS"
  | "SOLICITUD_GASTOS"
  | "CAJA_CHICA_REVOLVENTE";

export const INTERNAL_PAYABLE_CATEGORY_CONFIG_LABELS: Record<
  InternalPayableCategoryConfiguration,
  string
> = {
  PROVEEDORES: "Proveedores",
  VIATICOS: "Viáticos",
  CARGOS_DEUDORES_DIVERSOS: "Cargos a deudores diversos",
  SOLICITUD_GASTOS: "Solicitud de gastos",
  CAJA_CHICA_REVOLVENTE: "Caja chica (Revolvente)",
};

export const INTERNAL_PAYABLE_CATEGORY_CONFIG_OPTIONS: Array<{
  value: InternalPayableCategoryConfiguration;
  label: string;
}> = [
  { value: "PROVEEDORES", label: "Proveedores" },
  { value: "VIATICOS", label: "Viáticos" },
  { value: "CARGOS_DEUDORES_DIVERSOS", label: "Cargos a deudores diversos" },
  { value: "SOLICITUD_GASTOS", label: "Solicitud de gastos" },
  { value: "CAJA_CHICA_REVOLVENTE", label: "Caja chica (Revolvente)" },
];

export interface InternalPayableCategoryListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  configuration: InternalPayableCategoryConfiguration;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateInternalPayableCategoryPayload {
  code: string;
  name: string;
  description?: string;
  configuration: InternalPayableCategoryConfiguration;
  status?: "ACTIVE" | "INACTIVE";
}

export type UpdateInternalPayableCategoryPayload =
  Partial<CreateInternalPayableCategoryPayload>;

export interface ListInternalPayableCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  configuration?: InternalPayableCategoryConfiguration;
}

