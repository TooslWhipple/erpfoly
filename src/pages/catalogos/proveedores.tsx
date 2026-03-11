import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { InputAdornment, Stack } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import {
    ControlsContainer,
    SearchInput,
    CreateButton,
    SearchIconStyled,
} from "@/styles/catalogos/catalogos.styledComponents";

interface Supplier {
    id: number;
    name: string;
}

interface GetSuppliersParams {
    page: number;
    limit: number;
    search?: string;
}

interface GetSuppliersResponse {
    data: Supplier[];
    total: number;
    page: number;
    limit: number;
}

const DUMMY_SUPPLIERS: Supplier[] = [
    { id: 1, name: "Arlix Muebles y Electrodomésticos S.A. de C.V." },
    { id: 2, name: "Mirage - Norage S.A. De C.V." },
    { id: 3, name: "Hogar Integral de Occidente S.A. de C.V." },
    { id: 4, name: "Eztra Equipos del Hogar S.A. de C.V." },
    { id: 5, name: "Equipos Domésticos Modernos S. de R.L. de C.V." },
    { id: 6, name: "Nevora Distribuidora Doméstica S.A. de C.V." },
    { id: 7, name: "Velmor Muebles y Confort S.A. de C.V." },
    { id: 8, name: "Veyra Electrodomésticos y Muebles S.A. de C.V." },
    { id: 9, name: "Mueblería del Norte S.A. de C.V." },
    { id: 10, name: "Distribuidora de Línea Blanca del Golfo S.A. de C.V." },
    { id: 11, name: "Comercializadora Hogar Plus S. de R.L. de C.V." },
    { id: 12, name: "Importadora de Muebles Premium S.A. de C.V." },
    { id: 13, name: "Electromuebles del Pacífico S.A. de C.V." },
    { id: 14, name: "Casa y Confort Distribuciones S.A. de C.V." },
    { id: 15, name: "Muebles Finos del Bajío S.A. de C.V." },
];

async function getSuppliers(params: GetSuppliersParams): Promise<GetSuppliersResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_SUPPLIERS];

    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter((s) =>
            s.name.toLowerCase().includes(searchLower)
        );
    }

    const total = filteredData.length;
    const start = params.page * params.limit;
    const end = start + params.limit;
    const paginatedData = filteredData.slice(start, end);

    return {
        data: paginatedData,
        total,
        page: params.page,
        limit: params.limit,
    };
}

export default function Proveedores() {
    const router = useRouter();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSuppliers({
                page,
                limit: rowsPerPage,
                search: searchValue,
            });
            setSuppliers(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[Proveedores] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    useEffect(() => {
        setPage(0);
    }, [searchValue]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleCreateSupplier = () => {
        router.push("/catalogos/proveedores/nuevo");
    };

    const handleEditSupplier = (supplier: Supplier) => {
        router.push(`/catalogos/proveedores/${supplier.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const columns: Column<Supplier>[] = [
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
            size: "sm"
        },
        {
            id: "email",
            label: "Email",
            size: "lg"
        },
        {
            id: "tipo",
            label: "Tipo",
            size: "sm"
        }
    ];

    const actions: RowAction<Supplier>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditSupplier,
        },
    ];

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>
                <Title title="Proveedores" />
                <ControlsContainer>
                    <SearchInput
                        size="small"
                        placeholder="Buscar"
                        value={searchValue}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIconStyled />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <CreateButton
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateSupplier}
                    >
                        Nuevo
                    </CreateButton>
                </ControlsContainer>

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
