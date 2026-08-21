import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Alert, Stack } from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Restore as RestoreIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Title, TableCrud, TabFilters, ConfirmModal } from "@/components";
import type {
  Column,
  RowAction,
  StatusChipVariant,
} from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  deleteProduct,
  restoreProduct,
  getProducts,
  type ProductListItem,
} from "@/services/productos.service";
import {
  CATALOG_PRODUCTS_CREATE,
  CATALOG_PRODUCTS_DELETE,
  CATALOG_PRODUCTS_READ,
  CATALOG_PRODUCTS_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

const PRODUCT_STATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const PRODUCT_STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type ProductStatusTab = "all" | "active" | "inactive";

const STATUS_TABS: { value: ProductStatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export default function Productos() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [activeTab, setActiveTab] = useState<ProductStatusTab>("all");
  const listExtraParams = useMemo(() => {
    if (activeTab === "active") {
      return { status: "ACTIVE" as const };
    }
    if (activeTab === "inactive") {
      return { status: "INACTIVE" as const };
    }
    return { includeInactive: true };
  }, [activeTab]);
  const {
    data: products,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage: handleRowsPerPageChange,
    setSearch,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = usePaginatedList<ProductListItem>({
    queryKey: ["products", "list"],
    queryFn: getProducts,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });
  useEffect(() => {
    setPage(0);
  }, [activeTab, setPage]);
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);
  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | { open: true; product: ProductListItem; action: "delete" | "restore" }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
    },
    [setSearchInput],
  );
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as ProductStatusTab);
  }, []);
  const handleCreateProduct = useCallback(() => {
    router.push("/catalogos/productos/nuevo");
  }, [router]);
  const handleOpenProduct = useCallback(
    (product: ProductListItem) => {
      router.push(`/catalogos/productos/${product.id}`);
    },
    [router],
  );
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage],
  );
  const openConfirm = useCallback(
    (product: ProductListItem, action: "delete" | "restore") => {
      setConfirmState({ open: true, product, action });
    },
    [],
  );
  const closeConfirm = useCallback(() => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  }, [confirmLoading]);
  const handleConfirmAction = useCallback(async () => {
    if (!confirmState.open) return;
    const { product, action } = confirmState;
    setConfirmLoading(true);
    const result =
      action === "delete"
        ? await deleteProduct(product.id)
        : await restoreProduct(product.id);
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      action === "delete"
        ? "Artículo desactivado correctamente."
        : "Artículo reactivado correctamente.",
    );
    refetch();
  }, [confirmState, refetch, showError, showSuccess]);
  const columns = useMemo<Column<ProductListItem>[]>(
    () => [
      {
        id: "id",
        label: "ID",
        type: "id",
        size: "sm",
        maxSize: "xs",
        idPadding: 5,
      },
      {
        id: "code",
        label: "Código",
        type: "text",
        size: "sm",
      },
      {
        id: "status",
        label: "Estatus",
        type: "chip",
        size: "sm",
        chipLabelMap: PRODUCT_STATUS_CHIP_LABELS,
        chipVariantMap: PRODUCT_STATUS_CHIP_VARIANTS,
      },
      {
        id: "name",
        label: "Nombre",
        size: "xl",
        truncate: true,
      },
      {
        id: "department",
        label: "Departamento",
        size: "lg",
      },
      {
        id: "line",
        label: "Línea",
        size: "lg",
      },
      {
        id: "supplier",
        label: "Proveedor",
        size: "lg",
      },
    ],
    [],
  );
  const actions = useMemo<RowAction<ProductListItem>[]>(
    () => [
      {
        id: "view",
        label: "Ver detalle",
        icon: <VisibilityIcon fontSize="small" />,
        onClick: handleOpenProduct,
        permission: CATALOG_PRODUCTS_READ,
        hidden: (row) => row.status === "INACTIVE",
      },
      {
        id: "edit",
        label: "Editar",
        icon: <EditIcon fontSize="small" />,
        onClick: handleOpenProduct,
        permission: CATALOG_PRODUCTS_UPDATE,
        hidden: (row) => row.status === "INACTIVE",
      },
      {
        id: "delete",
        label: "Desactivar",
        icon: <DeleteIcon fontSize="small" />,
        onClick: (row) => openConfirm(row, "delete"),
        color: "error",
        permission: CATALOG_PRODUCTS_DELETE,
        hidden: (row) => row.status === "INACTIVE",
      },
      {
        id: "restore",
        label: "Reactivar",
        icon: <RestoreIcon fontSize="small" />,
        onClick: (row) => openConfirm(row, "restore"),
        permission: CATALOG_PRODUCTS_DELETE,
        hidden: (row) => row.status !== "INACTIVE",
      },
    ],
    [handleOpenProduct, openConfirm],
  );
  return (
    <Stack direction="column" spacing={3}>
      <Title title="Catálogo de artículos" />
      <TabFilters
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        actions={[
          {
            label: "Nuevo",
            onClick: handleCreateProduct,
            variant: "contained",
            color: "primary",
            showIcon: true,
            permission: CATALOG_PRODUCTS_CREATE,
          },
        ]}
      />

      {isError && (
        <Alert severity="error">
          {error?.message || "No se pudo cargar el catálogo de artículos."}
        </Alert>
      )}

      <TableCrud
        columns={columns}
        rows={products}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={(product) => {
          if (product.status === "INACTIVE") return;
          handleOpenProduct(product);
        }}
        emptyMessage={
          activeTab === "inactive"
            ? "No hay artículos inactivos"
            : activeTab === "active"
              ? "No hay artículos activos"
              : "No hay artículos registrados"
        }
      />

      <ConfirmModal
        open={confirmState.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        loading={confirmLoading}
        title={
          confirmState.open && confirmState.action === "restore"
            ? "Reactivar artículo"
            : "Desactivar artículo"
        }
        description={
          confirmState.open
            ? confirmState.action === "restore"
              ? `¿Deseas reactivar el artículo "${confirmState.product.name}"?`
              : `¿Deseas desactivar el artículo "${confirmState.product.name}"? Dejará de aparecer en el catálogo activo.`
            : ""
        }
        confirmLabel={
          confirmState.open && confirmState.action === "restore"
            ? "Reactivar"
            : "Desactivar"
        }
        cancelLabel="Cancelar"
        type={
          confirmState.open && confirmState.action === "restore"
            ? "primary"
            : "error"
        }
      />
    </Stack>
  );
}
