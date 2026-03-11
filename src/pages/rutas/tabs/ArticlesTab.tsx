import { IconButton } from "@mui/material";
import { GripVertical, MoreVertical } from "lucide-react";
import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components/TableCrud";
import type { RouteArticle } from "@/types/rutas.types";
import { colors } from "@/styles/theme";

const ARTICLE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const ARTICLE_STATUS_VARIANTS: Record<string, "pending" | "success" | "default"> = {
  pending: "pending",
  delivered: "success",
  cancelled: "default",
};

const COLUMNS: DataTableColumn<RouteArticle>[] = [
  {
    id: "drag",
    label: "",
    format: () => <GripVertical size={16} color={colors.text.secondary} />,
  },
  { id: "invoiceNumber", label: "Factura" },
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    chipLabelMap: ARTICLE_STATUS_LABELS,
    chipVariantMap: ARTICLE_STATUS_VARIANTS,
  },
  { id: "articleName", label: "Artículo" },
  { id: "zone", label: "Zona" },
  { id: "address", label: "Dirección" },
  {
    id: "menu",
    label: "",
    format: () => (
      <IconButton size="small">
        <MoreVertical size={18} />
      </IconButton>
    ),
  },
];

export interface ArticlesTabProps {
  articles: RouteArticle[];
}

export function ArticlesTab({ articles }: ArticlesTabProps) {
  return (
    <DataTable<RouteArticle>
      columns={COLUMNS}
      rows={articles}
      rowKey="id"
      emptyMessage="No hay artículos en esta ruta."
    />
  );
}
