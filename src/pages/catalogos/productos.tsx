import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Alert, Chip, Stack } from "@mui/material";
import {
  Block as BlockIcon,
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
  setProductEndOfLife,
  getProducts,
  type ProductListItem,
} from "@/services/productos.service";
import { DISCONTINUED_CHIP_LABEL } from "@/lib/product-end-of-life";
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

type ProductStatusTab = "all" | "active" | "inactive" | "discontinued";
type ProductConfirmAction =
  | "delete"
  | "restore"
  | "discontinue"
  | "clearDiscontinued";

const STATUS_TABS: { value: ProductStatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "discontinued", label: "Descontinuados" },
];

const CONFIRM_COPY: Record<
  ProductConfirmAction,
  {
    title: string;
    confirmLabel: string;
    type: "primary" | "error";
    success: string;
    description: (name: string) => string;
  }
> = {
  delete: {
    title: "Desactivar artículo",
    confirmLabel: "Desactivar",
    type: "error",
    success: "Artículo desactivado correctamente.",
    description: (name) =>
      `¿Deseas desactivar el artículo "${name}"? Dejará de aparecer en el catálogo activo.`,
  },
  restore: {
    title: "Reactivar artículo",
    confirmLabel: "Reactivar",
    type: "primary",
    success: "Artículo reactivado correctamente.",
    description: (name) => `¿Deseas reactivar el artículo "${name}"?`,
  },
  discontinue: {
    title: "Descontinuar artículo",
    confirmLabel: "Descontinuar",
    type: "error",
    success: "Artículo descontinuado. Ya no se pedirá al proveedor.",
    description: (name) =>
      `¿Deseas descontinuar "${name}"? Se imprime con etiqueta roja, en caja se avisa que no volverá a recibirse y no se podrá pedir al proveedor. Se sigue vendiendo.`,
  },
  clearDiscontinued: {
    title: "Quitar descontinuación",
    confirmLabel: "Quitar",
    type: "primary",
    success: "El artículo ya no está descontinuado.",
    description: (name) =>
      `¿Deseas quitar la descontinuación de "${name}"? Volverá a poder pedirse al proveedor. La etiqueta roja de liquidación, si la tiene, se queda.`,
  },
};

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
    if (activeTab === "discontinued") {
      return { status: "DISCONTINUED" as const };
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
    | {
        open: true;
        product: ProductListItem;
        action: ProductConfirmAction;
      }
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
    (product: ProductListItem, action: ProductConfirmAction) => {
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
        : action === "restore"
          ? await restoreProduct(product.id)
          : await setProductEndOfLife(
              product.id,
              action === "discontinue",
            );
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(CONFIRM_COPY[action].success);
    refetch();
  }, [confirmState, refetch, showError, showSuccess]);
  const columns = useMemo<Column<ProductListItem>[]>(
    () => [
      {
        id: "code",
        label: "Código",
        type: "text",
        size: "md",
      },
      {
        id: "name",
        label: "Nombre",
        size: "xl",
        truncate: true,
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
        id: "department",
        label: "Departamento",
        size: "md"
      },
      {
        id: "line",
        label: "Línea",
        size: "lg"

      },
      {
        id: "supplier",
        label: "Proveedor",
        size: "xl"
      },
      {
        id: "isDiscontinued",
        label: "Etiqueta",
        size: "lg",
        format: (_value, row) =>
          row.isDiscontinued ? (
            <Chip size="small" color="error" label={DISCONTINUED_CHIP_LABEL} />
          ) : null,
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
        id: "discontinue",
        label: "Descontinuar",
        icon: <BlockIcon fontSize="small" />,
        onClick: (row) => openConfirm(row, "discontinue"),
        color: "error",
        permission: CATALOG_PRODUCTS_UPDATE,
        hidden: (row) => row.status === "INACTIVE" || Boolean(row.isDiscontinued),
      },
      {
        id: "clear-discontinued",
        label: "Quitar descontinuación",
        icon: <RestoreIcon fontSize="small" />,
        onClick: (row) => openConfirm(row, "clearDiscontinued"),
        permission: CATALOG_PRODUCTS_UPDATE,
        hidden: (row) => row.status === "INACTIVE" || !row.isDiscontinued,
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
              : activeTab === "discontinued"
                ? "No hay artículos descontinuados"
                : "No hay artículos registrados"
        }
      />

      <ConfirmModal
        open={confirmState.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        loading={confirmLoading}
        title={
          confirmState.open
            ? CONFIRM_COPY[confirmState.action].title
            : "Desactivar artículo"
        }
        description={
          confirmState.open
            ? CONFIRM_COPY[confirmState.action].description(
                confirmState.product.name,
              )
            : ""
        }
        confirmLabel={
          confirmState.open
            ? CONFIRM_COPY[confirmState.action].confirmLabel
            : "Desactivar"
        }
        cancelLabel="Cancelar"
        type={
          confirmState.open
            ? CONFIRM_COPY[confirmState.action].type
            : "error"
        }
      />
    </Stack>
  );
}
