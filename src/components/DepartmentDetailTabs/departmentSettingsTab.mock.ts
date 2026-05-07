import type { Column } from "@/components";

export interface PromotionMockRow {
  id: number;
  status: "active" | "inactive";
  name: string;
  promotion: string;
  endDate: string;
  products: number;
}

export const departmentSettingsPromotionMockRows: PromotionMockRow[] = [
  {
    id: 1,
    status: "active",
    name: "Mes de la línea blanca",
    promotion: "12%",
    endDate: "Octubre",
    products: 298,
  },
  {
    id: 2,
    status: "inactive",
    name: "Día de las madres",
    promotion: "30%",
    endDate: "10, Mayo de 2025",
    products: 122,
  },
];

export const departmentSettingsPromotionColumns: Column<PromotionMockRow>[] = [
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    size: "sm",
    chipLabelMap: {
      active: "Activo",
      inactive: "Inactivo",
    },
    chipVariantMap: {
      active: "success",
      inactive: "default",
    },
  },
  { id: "name", label: "Nombre", size: "xl" },
  { id: "promotion", label: "Promoción", size: "sm" },
  { id: "endDate", label: "Finalización", size: "md" },
  { id: "products", label: "Productos", type: "number", size: "sm", align: "left" },
];
