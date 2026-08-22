import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  CATALOG_VEHICLES_CREATE,
  CATALOG_VEHICLES_DELETE,
  CATALOG_VEHICLES_READ,
  CATALOG_VEHICLES_UPDATE,
} from "@/lib/permissions";
import {
  deleteVehicle,
  getVehicles,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  type Vehicle,
  type VehicleStatus,
} from "@/services/vehicles.service";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_CHIP_VARIANTS: Record<VehicleStatus, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
  MAINTENANCE: "warning",
};

type StatusTab = "all" | VehicleStatus;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ACTIVE", label: "Activos" },
  { value: "INACTIVE", label: "Inactivos" },
  { value: "MAINTENANCE", label: "Mantenimiento" },
];

export default function VehiculosPage() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const extraParams = useMemo(() => {
    const status = router.query.status;
    if (status === "ACTIVE" || status === "INACTIVE" || status === "MAINTENANCE") {
      return { status } satisfies { status: VehicleStatus };
    }
    return {} as { status?: VehicleStatus };
  }, [router.query.status]);

  const activeTab: StatusTab =
    extraParams.status != null ? extraParams.status : "all";

  const {
    data: vehicles,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<Vehicle>({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (value: string) => {
    const nextQuery = { ...router.query };
    if (value === "all") {
      delete nextQuery.status;
    } else {
      nextQuery.status = value;
    }
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
    setPage(0);
  };

  const handleOpenCreate = () => {
    void router.push("/catalogos/vehiculos/nuevo");
  };

  const handleOpenVehicle = (vehicle: Vehicle) => {
    void router.push(`/catalogos/vehiculos/${vehicle.id}`);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el vehículo con placa "${vehicle.plate}"?`,
    );
    if (!confirmed) return;

    const result = await deleteVehicle(vehicle.id);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    showSuccess("Vehículo eliminado correctamente.");
    refetch();
  };

  const columns: Column<Vehicle>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      idPadding: 2,
    },
    {
      id: "plate",
      label: "Placa",
      size: "sm",
    },
    {
      id: "brand",
      label: "Marca / modelo",
      size: "lg",
      format: (_value, row) => `${row.brand} ${row.model}`,
    },
    {
      id: "vehicleConfigKey",
      label: "Config. vehicular",
      size: "md",
      format: (value, row) => {
        if (!value) return "—";
        return row.vehicleConfigDescription
          ? `${value} — ${row.vehicleConfigDescription}`
          : String(value);
      },
    },
    {
      id: "year",
      label: "Año",
      size: "xs",
    },
    {
      id: "sctPermitTypeKey",
      label: "Permiso SCT",
      size: "md",
      format: (value) => (value ? String(value) : "—"),
    },
    {
      id: "civilLiabilityInsurer",
      label: "Aseguradora",
      size: "md",
      format: (value) => (value ? String(value) : "—"),
    },
    {
      id: "type",
      label: "Tipo",
      size: "sm",
      format: (value) => VEHICLE_TYPE_LABELS[value as Vehicle["type"]] ?? String(value),
    },
    {
      id: "status",
      label: "Estatus",
      type: "chip",
      size: "sm",
      chipLabelMap: VEHICLE_STATUS_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
    },
  ];

  const actions: RowAction<Vehicle>[] = [
    {
      id: "view",
      label: "Ver detalle",
      icon: <Eye size={16} />,
      onClick: handleOpenVehicle,
      permission: CATALOG_VEHICLES_READ,
    },
    {
      id: "edit",
      label: "Editar",
      icon: <Pencil size={16} />,
      onClick: handleOpenVehicle,
      permission: CATALOG_VEHICLES_UPDATE,
    },
    {
      id: "delete",
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      onClick: handleDelete,
      color: "error",
      permission: CATALOG_VEHICLES_DELETE,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Vehículos" />
      <TabFilters
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por placa, marca, modelo o VIN"
        actions={[
          {
            label: "Nuevo",
            onClick: handleOpenCreate,
            variant: "contained",
            color: "primary",
            showIcon: true,
            permission: CATALOG_VEHICLES_CREATE,
          },
        ]}
      />
      <TableCrud
        columns={columns}
        rows={vehicles}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next);
          setPage(0);
        }}
        onRowClick={handleOpenVehicle}
        emptyMessage="No hay vehículos registrados"
      />
    </Stack>
  );
}
