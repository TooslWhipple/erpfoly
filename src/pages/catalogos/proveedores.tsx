import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";

import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getSuppliers } from "@/services/suppliers.service";
import type { SupplierListItem } from "@/services/suppliers.service";
import { CATALOG_SUPPLIERS_CREATE, CATALOG_SUPPLIERS_UPDATE } from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

function typeLabel(type: string | null): string {
    if (type === "national") return "Nacional";
    if (type === "foreign") return "Extranjera";
    return "—";
}

export default function Proveedores() {
    const router = useRouter();

    const {
        data: suppliers,
        total: totalRows,
        page,
        rowsPerPage,
        search: searchValue,
        setPage: handlePageChange,
        setRowsPerPage: handleRowsPerPageChange,
        setSearch,
        isLoading: loading,
    } = usePaginatedList<SupplierListItem>({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
        initialPage: 0,
        initialRowsPerPage: 10,
        initialSearch: "",
    });

    const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
        searchValue,
        SEARCH_DEBOUNCE_MS,
    );

    useEffect(() => {
        setSearch(debouncedSearch);
    }, [debouncedSearch, setSearch]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
    }, [setSearchInput]);

    const handleCreateSupplier = useCallback(() => {
        router.push("/catalogos/proveedores/nuevo");
    }, [router]);

    const handleEditSupplier = useCallback((supplier: SupplierListItem) => {
        router.push(`/catalogos/proveedores/${supplier.id}`);
    }, [router]);

    const columns = useMemo<Column<SupplierListItem>[]>(
        () => [
            {
                id: "id",
                label: "ID",
                type: "id",
                size: "sm",
                maxSize: "xs",
                idPadding: 4,
            },
            {
                id: "name",
                label: "Nombre",
                size: "xl",
            },
            {
                id: "rfc",
                label: "RFC",
                size: "sm",
                format: (val, row) => row.rfc ?? "—",
            },
            {
                id: "email",
                label: "Email",
                size: "lg",
                format: (val, row) => row.email ?? "—",
            },
            {
                id: "type",
                label: "Tipo",
                size: "sm",
                format: (val, row) => typeLabel(row.type),
            },
        ],
        [],
    );

    const actions = useMemo<RowAction<SupplierListItem>[]>(
        () => [
            {
                id: "edit",
                label: "Editar",
                icon: <EditIcon fontSize="small" />,
                onClick: handleEditSupplier,
                permission: CATALOG_SUPPLIERS_UPDATE,
            },
        ],
        [handleEditSupplier],
    );

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Proveedores" />
                <TabFilters
                    tabs={[]}
                    activeTab=""
                    onTabChange={() => { }}
                    showSearch
                    searchValue={searchInput}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Buscar"
                    actions={[
                        {
                            label: "Nuevo",
                            onClick: handleCreateSupplier,
                            variant: "contained",
                            color: "primary",
                            permission: CATALOG_SUPPLIERS_CREATE,
                        }
                    ]}
                />

                <TableCrud
                    columns={columns}
                    rows={suppliers}
                    actions={actions}
                    loading={loading}
                    rowKey="id"
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalRows={totalRows}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onRowClick={handleEditSupplier}
                    emptyMessage="No hay proveedores registrados"
                />
            </Stack>
        </MainLayout>
    );
}
