import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";

import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getProducts, type ProductListItem } from "@/services/productos.service";
import { CATALOG_PRODUCTS_CREATE, CATALOG_PRODUCTS_UPDATE } from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

const PRODUCT_STATUS_CHIP_LABELS: Record<string, string> = {
    ACTIVE: "Activo",
    DRAFT: "Borrador",
    INACTIVE: "Inactivo",
};

const PRODUCT_STATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
    ACTIVE: "success",
    DRAFT: "default",
    INACTIVE: "default",
};

export default function Productos() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");

    const listExtraParams = useMemo(() => {
        if (activeTab === "active") {
            return { status: "ACTIVE" };
        }
        if (activeTab === "draft") {
            return { status: "DRAFT" };
        }
        return {};
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

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchInput(value);
        },
        [setSearchInput],
    );

    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);
    }, []);

    const handleCreateProduct = useCallback(() => {
        router.push("/catalogos/productos/nuevo");
    }, [router]);

    const handleEditProduct = useCallback(
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
                id: "edit",
                label: "Editar",
                icon: <EditIcon fontSize="small" />,
                onClick: handleEditProduct,
                permission: CATALOG_PRODUCTS_UPDATE,
            },
        ],
        [handleEditProduct],
    );

    const tabs = useMemo(
        () => [
            { value: "all", label: "Todas" },
            { value: "active", label: "Activos" },
            { value: "draft", label: "Borradores" },
        ],
        [],
    );

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Catálogo de productos" />
                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    showSearch
                    searchValue={searchInput}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Buscar por código o nombre"
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
                    onRowClick={handleEditProduct}
                    emptyMessage="No hay productos registrados"
                />
            </Stack>
        </MainLayout>
    );
}
