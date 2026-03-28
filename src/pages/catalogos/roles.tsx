import { useEffect } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getRolesList } from "@/services/roles.service";
import { formatDateTime } from "@/utils/date";
import type { RoleListItem } from "@/types/roles.types";

const SEARCH_DEBOUNCE_MS = 300;

export default function Roles() {
  const router = useRouter();

  const list = usePaginatedList<RoleListItem>({
    queryKey: ["roles"],
    queryFn: getRolesList,
    initialPage: 0,
    initialRowsPerPage: 10,
  });

  const { setSearch } = list;
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    list.search,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCreateRole = () => {
    router.push("/catalogos/roles/nuevo");
  };

  const handleEditRole = (role: RoleListItem) => {
    router.push(`/catalogos/roles/${role.id}`);
  };

  const columns: Column<RoleListItem>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      maxSize: "xs",
      idPadding: 4,
    },
    {
      id: "name",
      label: "Nombre",
      size: "xl",
    },
    {
      id: "updatedAt",
      label: "Últ. Actualización",
      size: "xl",
      format: (value) => formatDateTime(value as string | null | undefined),
    },
  ];

  const actions: RowAction<RoleListItem>[] = [
    {
      id: "edit",
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: handleEditRole,
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Roles" />
        <TabFilters
          tabs={[]}
          activeTab={''}
          onTabChange={() => { }}
          showSearch
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar"
          actions={[
            {
              label: "Nuevo",
              onClick: handleCreateRole,
              variant: "contained",
              color: "primary",
            }
          ]}
        />
        <TableCrud
          columns={columns}
          rows={list.data}
          actions={actions}
          loading={list.isLoading}
          rowKey="id"
          page={list.page}
          rowsPerPage={list.rowsPerPage}
          totalRows={list.total}
          onPageChange={list.setPage}
          onRowsPerPageChange={list.setRowsPerPage}
          onRowClick={handleEditRole}
          emptyMessage="No hay roles registrados"
        />
      </Stack>
    </MainLayout>
  );
}
