import { useMemo } from "react";
import { Alert, Grid, Skeleton, Stack } from "@mui/material";
import { Pencil } from "lucide-react";
import { Breadcrumbs, Title, TabFilters, DataTable } from "@/components";
import type { DataTableColumn, StatusChipVariant } from "@/components/TableCrud";
import {
  SupplierDashboardMetrics,
  SupplierDashboardMetricsSkeleton,
  SupplierDeliveriesPanel,
  SupplierDeliveriesPanelSkeleton,
  SupplierChargesTab,
  SupplierPaymentsTab,
  SupplierDamagedGoodsTab,
} from "@/components/SupplierDashboard";
import { useSupplierDashboard } from "@/hooks/proveedores/useSupplierDashboard";
import { CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";
import type { SupplierAccountStatementRow } from "@/types/supplierDashboard.types";
import { DashboardLabel } from "@/styles/catalogos/proveedores-detail.styles";

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  overdue: "Retrasado",
  paid: "Pagado",
};

const ACCOUNT_STATUS_VARIANTS: Record<string, StatusChipVariant> = {
  pending: "default",
  overdue: "error",
  paid: "success",
};

const accountStatementColumns: DataTableColumn<SupplierAccountStatementRow>[] = [
  {
    id: "periodMonth",
    label: "Estado de cuenta",
    format: (_value, row) => {
      const d = new Date(row.periodYear, row.periodMonth - 1, 1);
      return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    },
  },
  { id: "amount", label: "Monto", type: "currency" },
  { id: "payments", label: "Pagos", type: "currency" },
  { id: "balance", label: "Saldo", type: "currency" },
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    chipLabelMap: ACCOUNT_STATUS_LABELS,
    chipVariantMap: ACCOUNT_STATUS_VARIANTS,
  },
];

const ACCOUNT_STATEMENT_SKELETON_ROWS = 3;

function SupplierDashboardHeaderSkeleton() {
  return (
    <Stack spacing={0.5}>
      <Skeleton variant="text" width={100} height={16} animation="wave" />
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Skeleton variant="text" width="40%" height={40} animation="wave" />
        <Skeleton variant="rounded" width={100} height={36} animation="wave" />
      </Stack>
    </Stack>
  );
}

export default function SupplierDashboardPage() {
  const {
    routerReady,
    validId,
    dashboard,
    loading,
    error,
    activeTab,
    tabs,
    breadcrumbItems,
    handleTabChange,
    handleEdit,
  } = useSupplierDashboard();

  const tableRows = useMemo(() => {
    if (!dashboard || activeTab !== "account_statements") return [];
    return dashboard.accountStatements;
  }, [dashboard, activeTab]);

  const showContentSkeleton = !routerReady || loading;

  if (routerReady && validId === null) {
    return (
      <>
        <Stack spacing={2}>
          <Breadcrumbs items={breadcrumbItems} />
          <Alert severity="warning">Identificador de proveedor no válido.</Alert>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbItems} />

        <Stack spacing={3}>
          {
            showContentSkeleton ?
              <SupplierDashboardHeaderSkeleton />
              :
              dashboard != null && (
                <Stack spacing={0.5}>
                  <DashboardLabel>Dashboard</DashboardLabel>
                  <Title
                    title={dashboard.supplierName}
                    actions={[
                      {
                        id: "edit",
                        label: "Editar",
                        icon: <Pencil size={16} />,
                        onClick: handleEdit,
                        variant: "outlined",
                        permission: CATALOG_SUPPLIERS_UPDATE,
                      },
                    ]}
                  />
                </Stack>
              )
          }

          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
              <Stack spacing={2} sx={{ width: "100%" }}>
                {
                  showContentSkeleton ?
                    <SupplierDashboardMetricsSkeleton />
                    :
                    dashboard != null &&
                    <SupplierDashboardMetrics summary={dashboard.summary} />
                }

                <TabFilters
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />

                {activeTab === "account_statements" && (
                  <DataTable
                    columns={accountStatementColumns}
                    rows={tableRows}
                    rowKey="id"
                    loading={showContentSkeleton}
                    loadingRowCount={ACCOUNT_STATEMENT_SKELETON_ROWS}
                    emptyMessage="No hay estados de cuenta registrados"
                  />
                )}

                {activeTab === "charges" && validId != null && (
                  <SupplierChargesTab
                    supplierId={validId}
                    supplierName={dashboard?.supplierName ?? ""}
                    accountStatements={dashboard?.accountStatements ?? []}
                    contentLoading={showContentSkeleton}
                  />
                )}

                {activeTab === "payments" && validId != null && (
                  <SupplierPaymentsTab
                    supplierId={validId}
                    contentLoading={showContentSkeleton}
                  />
                )}

                {activeTab === "damaged_goods" && validId != null && (
                  <SupplierDamagedGoodsTab
                    supplierId={validId}
                    supplierName={dashboard?.supplierName ?? ""}
                    accountStatements={dashboard?.accountStatements ?? []}
                    contentLoading={showContentSkeleton}
                  />
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              {
                showContentSkeleton ?
                  <SupplierDeliveriesPanelSkeleton />
                  :
                  dashboard != null &&
                  <SupplierDeliveriesPanel
                    upcomingDeliveries={dashboard.upcomingDeliveries}
                    recentDeliveries={dashboard.recentDeliveries}
                  />
              }
            </Grid>
          </Grid>
        </Stack>
      </Stack>
    </>
  );
}
