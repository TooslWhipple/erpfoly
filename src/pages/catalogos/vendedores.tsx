import { useState } from "react";
import { useRouter } from "next/router";
import { Alert, Stack } from "@mui/material";
import { Title, TableCrud, TabFilters } from "@/components";
import type { Column } from "@/components/TableCrud";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { getSellers } from "@/services/sellers.service";
import type { SellerListItem } from "@/types/sellers.types";
import { CATALOG_SELLERS_CREATE } from "@/lib/permissions";
export default function VendedoresPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SellerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  useAsyncEffect(
    async (isCancelled) => {
      await Promise.resolve();
      if (isCancelled()) return;
      setLoading(true);
      setError(null);
      const result = await getSellers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchValue || undefined,
      });
      if (isCancelled()) return;
      if (result.error) {
        setRows([]);
        setTotalRows(0);
        setError(result.error.message);
      } else if (result.data) {
        setRows(result.data.rows);
        setTotalRows(result.data.total);
      }
      if (!isCancelled()) {
        setLoading(false);
      }
    },
    [page, rowsPerPage, searchValue],
  );
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(0);
  };
  const handleRowNavigate = (row: SellerListItem) => {
    router.push(`/catalogos/vendedores/${row.id}`);
  };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
  const columns: Column<SellerListItem>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "sm",
      idPadding: 4,
    },
    {
      id: "fullName",
      label: "Nombre",
      size: "xl",
    },
    {
      id: "cellphone",
      label: "Celular",
      size: "xl",
    },
    {
      id: "branchName",
      label: "Sucursal",
      size: "lg",
    },
  ];
  return (
    <Stack direction="column" spacing={3}>
      <Title title="Equipo de ventas" />
      {error && <Alert severity="error">{error}</Alert>}
      <TabFilters
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        showSearch
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        actions={[
          {
            label: "Nuevo",
            onClick: () => {},
            permission: CATALOG_SELLERS_CREATE,
          },
        ]}
      />
      <TableCrud
        columns={columns}
        rows={rows}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleRowNavigate}
        emptyMessage="No hay vendedores registrados"
      />
    </Stack>
  );
}
