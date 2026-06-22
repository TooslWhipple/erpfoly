import { Divider, Stack, Typography } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components";
import type { DataTableColumn, StatusChipVariant } from "@/components";
import { BackButton } from "@/components/Breadcrumbs/Breadcrumbs.styles";
import { CashRegisterSearchBar } from "./CashRegisterSearchBar";
import type { ClientSearchResult, ClientSearchResultsProps } from "./types";

const PAYMENT_STATUS_LABELS: Record<ClientSearchResult["paymentStatus"], string> = {
  overdue: "Retrasado",
  current: "Al corriente",
};

const PAYMENT_STATUS_VARIANTS: Record<ClientSearchResult["paymentStatus"], StatusChipVariant> = {
  overdue: "error",
  current: "default",
};

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
  isSearching = false,
  onSearchQueryChange,
  onSearch,
  onBack,
  onRowClick,
}: ClientSearchResultsProps) {
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
      />

      <Typography variant="body2" color="text.secondary">{results.length} {results.length === 1 ? "resultado" : "resultados"}</Typography>

      <DataTable
        columns={columns}
        rows={results}
        rowKey="id"
        loading={isSearching}
        onRowClick={onRowClick}
        emptyMessage="No se encontraron clientes"
      />
    </Stack>
  );
}
