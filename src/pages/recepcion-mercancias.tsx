import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Edit as EditIcon } from "@mui/icons-material";
import {
  Title,
  TabFilters,
  TableCrud,
  ReceptionOrdersModal,
} from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import { StatusChip } from "@/styles/recepcion-mercancias.styles";
import type {
  MerchandiseReception,
  ReceptionStatus,
} from "@/types/recepcion-mercancias.types";
import {
  MERCHANDISE_RECEPTION_CREATE,
  MERCHANDISE_RECEPTION_READ,
} from "@/lib/permissions";
import { Stack } from "@mui/material";
import {
  getReceptions as fetchReceptions,
  type GetReceptionsParams,
  type ReceptionListItem,
} from "@/services/recepcion-mercancias.service";

interface GetReceptionsResponse {
  data: ReceptionListItem[];
  total: number;
  page: number;
  limit: number;
}

function receptionListItemToUi(item: ReceptionListItem): MerchandiseReception {
  return {
    id: item.id,
    warehouse: item.warehouse,
    orderNumber: item.orderNumber,
    date: item.date,
    supplier: item.supplier,
    status: normalizeReceptionStatus(item.status),
    printedLabelsCount: item.printedLabelsCount,
    supplierId: item.supplierId,
    branchId: item.branchId,
    costeoId: item.costeoId,
    invoices: [],
  };
}

function normalizeReceptionStatus(
  status: ReceptionListItem["status"],
): ReceptionStatus {
  switch (status) {
    case "draft":
    case "cancelled":
      return "pre_captured";
    case "in_costing":
      return "captured";
    case "pre_captured":
    case "costed":
      return status;
    default:
      return "pre_captured";
  }
}

function toApiStatusFilter(
  status: "all" | ReceptionStatus,
): "all" | ReceptionListItem["status"] {
  if (status === "all") return "all";
  if (status === "captured") return "in_costing";
  return status;
}

// ============================================================================
// HELPERS
// ============================================================================

function getStatusLabel(status: ReceptionStatus): string {
  const labels: Record<ReceptionStatus, string> = {
    pre_captured: "Precapturado",
    captured: "Capturado",
    costed: "Costeado",
  };
  return labels[status];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RecepcionMercancias() {
  const router = useRouter();

  // State
  const [receptions, setReceptions] = useState<MerchandiseReception[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tab options
  const tabs: TabOption[] = [
    {
      label: "Todos",
      value: "all",
    },
    {
      label: "Capturados",
      value: "captured",
    },
    {
      label: "Costeados",
      value: "costed",
    },
  ];

  // Get status filter from tab
  const getStatusFilter = useCallback((): "all" | ReceptionStatus => {
    return activeTab as "all" | ReceptionStatus;
  }, [activeTab]);

  // Fetch receptions
  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const statusFilter = toApiStatusFilter(getStatusFilter());
      const params: GetReceptionsParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchValue,
        status: statusFilter,
      };
      const response = await fetchReceptions(params);
      if (response.error) {
        console.error("[RecepcionMercancias] Error fetching:", response.error);
        setReceptions([]);
        setTotalRows(0);
        return;
      }
      const payload: GetReceptionsResponse = {
        data: response.data?.rows ?? [],
        total: response.data?.total ?? 0,
        page: response.data?.page ?? page + 1,
        limit: response.data?.limit ?? rowsPerPage,
      };
      setReceptions(payload.data.map(receptionListItemToUi));
      setTotalRows(payload.total);
    } catch (err) {
      console.error("[RecepcionMercancias] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchValue, getStatusFilter]);
  useEffect(() => {
    fetchPage();
  }, [fetchPage]);
  useEffect(() => {
    setPage(0);
  }, [searchValue, activeTab]);

  // Event handlers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };
  const handleCreate = () => {
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    if (!submitting) {
      setModalOpen(false);
    }
  };
  const handleConfirmOrders = async (supplierId: number, supplierName: string) => {
    setSubmitting(true);
    try {
      setModalOpen(false);
      const params = new URLSearchParams({ supplierId: String(supplierId) });
      if (supplierName) {
        params.set("supplierName", supplierName);
      }
      router.push(`/recepcion-mercancias/nuevo?${params.toString()}`);
    } catch (err) {
      console.error("[RecepcionMercancias] Error creating receptions:", err);
    } finally {
      setSubmitting(false);
    }
  };
  const handleViewReception = (reception: MerchandiseReception) => {
    router.push(`/recepcion-mercancias/${reception.id}`);
  };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Table columns
  const columns: Column<MerchandiseReception>[] = [
    {
      id: "warehouse",
      label: "Almacén",
      size: "md",
    },
    {
      id: "orderNumber",
      label: "Pedido",
      size: "sm",
    },
    {
      id: "date",
      label: "Fecha",
      size: "lg",
    },
    {
      id: "supplier",
      label: "Proveedor",
      size: "xl",
      truncate: true,
    },
    {
      id: "status",
      label: "Estatus",
      size: "md",
      format: (value) => (
        <StatusChip
          label={getStatusLabel(value as ReceptionStatus)}
          size="small"
          statusType={value as ReceptionStatus}
        />
      ),
    },
  ];

  // Row actions
  const actions: RowAction<MerchandiseReception>[] = [
    {
      id: "view",
      label: "Ver detalle",
      icon: <EditIcon fontSize="small" />,
      onClick: handleViewReception,
      permission: MERCHANDISE_RECEPTION_READ,
    },
  ];
  return (
    <Stack direction="column" spacing={3}>
      <Title title="Recepción de mercancía" />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        actions={[
          {
            label: "Nuevo",
            onClick: handleCreate,
            variant: "contained",
            color: "primary",
            permission: MERCHANDISE_RECEPTION_CREATE,
          },
        ]}
      />

      <TableCrud
        columns={columns}
        rows={receptions}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleViewReception}
        emptyMessage="No hay recepciones de mercancía"
      />

      <ReceptionOrdersModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmOrders}
        loading={submitting}
      />
    </Stack>
  );
}
