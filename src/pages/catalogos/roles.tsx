import { useRouter } from "next/router";
import { InputAdornment } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import {
  HeaderContainer,
  ControlsContainer,
  SearchInput,
  CreateButton,
  SearchIconStyled,
} from "@/styles/catalogos/catalogos.styledComponents";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getRolesList } from "@/services/roles.service";
import type { RoleListItem } from "@/types/roles.types";

// ============================================================================
// HELPERS
// ============================================================================

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;

  return `${dayName} ${day} de ${month}. ${hour12}:${minutes} ${ampm}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Roles() {
  const router = useRouter();

  const list = usePaginatedList<RoleListItem>({
    queryKey: ["roles"],
    queryFn: getRolesList,
    initialPage: 0,
    initialRowsPerPage: 10,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    list.setSearch(event.target.value);
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
      format: (value) => (value ? formatDateTime(value as string) : "—"),
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
      <HeaderContainer>
        <Title title="Roles" />
        <ControlsContainer>
          <SearchInput
            size="small"
            placeholder="Buscar"
            value={list.search}
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
            onClick={handleCreateRole}
          >
            Nuevo
          </CreateButton>
        </ControlsContainer>
      </HeaderContainer>

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
    </MainLayout>
  );
}
