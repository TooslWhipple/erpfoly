import { Divider, Stack, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components";
import type { DataTableColumn, StatusChipVariant } from "@/components";
import { BackButton } from "@/components/Breadcrumbs/Breadcrumbs.styles";
import { CashRegisterSearchBar } from "./CashRegisterSearchBar";
import type { ClientSearchResult, ClientSearchResultsProps } from "./types";
import type { SaleListItem, SalePaymentType } from "@/types/ventas.types";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";

const PAYMENT_STATUS_LABELS: Record<ClientSearchResult["paymentStatus"], string> = {
  overdue: "Retrasado",
  current: "Al corriente",
};

const PAYMENT_STATUS_VARIANTS: Record<ClientSearchResult["paymentStatus"], StatusChipVariant> = {
  overdue: "error",
  current: "default",
};

const SALE_PAYMENT_TYPE_LABELS: Record<SalePaymentType, string> = {
  CREDIT: "Crédito",
  CASH: "Contado",
  LAYAWAY: "Apartado",
};

const saleColumns: DataTableColumn<SaleListItem>[] = [
  {
    id: "folio",
    label: "Folio",
    type: "text",
  },
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    chipLabelMap: SALE_STATUS_CHIP_LABELS,
    chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
  },
  {
    id: "clientName",
    label: "Cliente",
    type: "text",
    format: (value) => (value == null || value === "" ? "—" : String(value)),
  },
  {
    id: "paymentType",
    label: "Tipo",
    type: "text",
    format: (value) =>
      SALE_PAYMENT_TYPE_LABELS[value as SalePaymentType] ?? String(value),
  },
];

const columns: DataTableColumn<ClientSearchResult>[] = [
  {
    id: "id",
    label: "ID",
    type: "id",
    idPadding: 4,
  },
  {
    id: "fullName",
    label: "Nombre",
    type: "text",
  },
  {
    id: "phone",
    label: "Teléfono",
    type: "text",
  },
  {
    id: "email",
    label: "Correo electrónico",
    type: "text",
  },
  {
    id: "paymentStatus",
    label: "Estatus",
    type: "chip",
    chipLabelMap: PAYMENT_STATUS_LABELS,
    chipVariantMap: PAYMENT_STATUS_VARIANTS,
  },
  {
    id: "address",
    label: "Dirección",
    type: "text",
    format: (value) => {
      const address = String(value ?? "");
      if (address.length <= 48) return address;
      return `${address.slice(0, 48)}...`;
    },
  },
];

export function ClientSearchResults({
  cashRegisterName,
  searchQuery,
  results,
  saleResults,
  isSearching = false,
  onSearchQueryChange,
  onSearch,
  onBack,
  onRowClick,
  onSaleRowClick,
  mode,
  onModeChange,
}: ClientSearchResultsProps) {
  const resultCount = mode === "ventas" ? saleResults.length : results.length;
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <BackButton onClick={onBack} size="small">
          <ArrowLeft size={20} />
        </BackButton>
        <Typography variant="h4">{cashRegisterName}</Typography>
      </Stack>

      <Divider />

      <CashRegisterSearchBar
        searchQuery={searchQuery}
        isSearching={isSearching}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
        mode={mode}
        onModeChange={onModeChange}
      />

      <Typography variant="body2" color="text.secondary">{resultCount} {resultCount === 1 ? "resultado" : "resultados"}</Typography>

      {mode === "ventas" ? (
        <DataTable
          columns={saleColumns}
          rows={saleResults}
          rowKey="id"
          loading={isSearching}
          onRowClick={onSaleRowClick}
          emptyMessage="No se encontraron ventas pendientes de cobro"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={results}
          rowKey="id"
          loading={isSearching}
          onRowClick={onRowClick}
          emptyMessage="No se encontraron clientes"
        />
      )}
    </Stack>
  );
}
