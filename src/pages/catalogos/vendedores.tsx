import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Alert, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Title,
  TableCrud,
  TabFilters,
  ModalFormZod,
  FormAutocomplete,
  ChipGroup,
} from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import {
  defineFormFields,
  type SchemaInputFromFields,
  type SchemaOutputFromFields,
} from "@/forms";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { getSellers } from "@/services/sellers.service";
import {
  assignCashRegisterToSeller,
  getCashRegistersCatalog,
} from "@/services/cash-registers-catalog.service";
import type { SellerListItem } from "@/types/sellers.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { CATALOG_SELLERS_UPDATE } from "@/lib/permissions";

const CASH_REGISTERS_STALE_TIME_MS = 5 * 60 * 1000;
const NONE_VALUE = "__none__";

type AssignCashRegisterFormShape = {
  cashRegisterId: string;
};

const assignCashRegisterFormFields = defineFormFields<AssignCashRegisterFormShape>()([
  {
    name: "cashRegisterId",
    schema: z.string().min(1, "Selecciona una caja"),
    label: "Caja",
    type: "text",
    placeholder: "Buscar caja",
  },
] as const);

type AssignCashRegisterFormOutput = SchemaOutputFromFields<
  typeof assignCashRegisterFormFields
>;

export default function VendedoresPage() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [rows, setRows] = useState<SellerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [listVersion, setListVersion] = useState(0);

  const [assignState, setAssignState] = useState<
    { open: false } | { open: true; seller: SellerListItem }
  >({ open: false });
  const [assignSaving, setAssignSaving] = useState(false);

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
    [page, rowsPerPage, searchValue, listVersion],
  );

  const cashRegistersQuery = useQuery({
    queryKey: ["catalog", "cash-registers"],
    queryFn: getCashRegistersCatalog,
    staleTime: CASH_REGISTERS_STALE_TIME_MS,
    enabled: assignState.open,
  });

  const seller = assignState.open ? assignState.seller : null;
  const sellerBranchIds = seller?.branchIds ?? [];
  const sellerBranchNames = (seller?.branches ?? []).map((branch) => branch.name);

  const cashRegisterOptions = useMemo(() => {
    const catalog = cashRegistersQuery.data ?? [];
    const sellerBranchIdSet = new Set(sellerBranchIds);

    const sameBranch = catalog.filter((item) => sellerBranchIdSet.has(item.branchId));

    const available =
      seller?.cashRegisterId != null
        ? sameBranch.filter((item) => item.id === seller.cashRegisterId)
        : sameBranch.filter((item) => item.userId == null);

    return [
      { value: NONE_VALUE, label: "Sin caja" },
      ...available.map((item) => ({
        value: String(item.id),
        label: `${item.name} (${item.branchName})`,
      })),
    ];
  }, [cashRegistersQuery.data, seller?.cashRegisterId, sellerBranchIds]);

  const assignDefaultValues = useMemo<
    SchemaInputFromFields<typeof assignCashRegisterFormFields>
  >(
    () => ({
      cashRegisterId: seller?.cashRegisterId ? String(seller.cashRegisterId) : NONE_VALUE,
    }),
    [seller?.cashRegisterId],
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

  const handleOpenAssign = (row: SellerListItem) => {
    setAssignState({ open: true, seller: row });
  };

  const handleCloseAssign = () => {
    if (assignSaving) return;
    setAssignState({ open: false });
  };

  const handleAssignSubmit = async (value: AssignCashRegisterFormOutput) => {
    if (!seller) return;

    const selectedId =
      value.cashRegisterId === NONE_VALUE ? null : Number(value.cashRegisterId);
    const currentId = seller.cashRegisterId;

    if (selectedId === currentId) {
      setAssignState({ open: false });
      return;
    }

    if (currentId != null && selectedId != null && selectedId !== currentId) {
      showError(
        "El vendedor ya tiene una caja asignada. Desasígnala primero con «Sin caja».",
      );
      return;
    }

    if (selectedId != null && seller.branchIds.length === 0) {
      showError("El vendedor no tiene una sucursal asignada");
      return;
    }

    setAssignSaving(true);

    if (selectedId == null && currentId != null) {
      const result = await assignCashRegisterToSeller(currentId, {
        user_id: null,
      });
      setAssignSaving(false);
      if (result.error) {
        showError(result.error.message);
        return;
      }
      setAssignState({ open: false });
      showSuccess("Caja desasignada correctamente");
      setListVersion((v) => v + 1);
      return;
    }

    if (selectedId != null) {
      const result = await assignCashRegisterToSeller(selectedId, {
        user_id: seller.id,
      });
      setAssignSaving(false);
      if (result.error) {
        showError(result.error.message);
        return;
      }
      setAssignState({ open: false });
      showSuccess("Caja asignada correctamente");
      setListVersion((v) => v + 1);
      return;
    }

    setAssignSaving(false);
    setAssignState({ open: false });
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
      id: "branches",
      label: "Sucursales",
      type: "chipGroup",
      chipGroupKey: "name",
      chipGroupMaxVisible: 2,
      size: "xl",
    },
    {
      id: "cashRegisterName",
      label: "Caja",
      size: "md",
      format: (value) => (
        <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>
          {(value as string | null) ?? "Sin asignar"}
        </Typography>
      ),
    },
  ];

  const actions: RowAction<SellerListItem>[] = [
    {
      id: "assign-cash-register",
      label: "Asignar caja",
      onClick: handleOpenAssign,
      permission: CATALOG_SELLERS_UPDATE,
    },
  ];

  const noBranchHelper =
    sellerBranchIds.length === 0
      ? "El vendedor no tiene sucursal; no hay cajas disponibles para asignar."
      : cashRegisterOptions.length <= 1
        ? "No hay cajas libres en las sucursales del vendedor."
        : undefined;

  return (
    <>
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
        />
        <TableCrud
          columns={columns}
          rows={rows}
          actions={actions}
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

      <ModalFormZod
        key={
          assignState.open
            ? `assign-${assignState.seller.id}-${assignState.seller.cashRegisterId ?? "none"}`
            : "assign-closed"
        }
        open={assignState.open}
        onClose={handleCloseAssign}
        title={seller ? `Asignar caja — ${seller.fullName}` : "Asignar caja"}
        fields={assignCashRegisterFormFields}
        defaultValues={assignDefaultValues}
        onSubmit={handleAssignSubmit}
        loading={assignSaving || cashRegistersQuery.isPending}
        confirmLabel="Guardar"
        maxWidth="sm"
        fullWidth
        validateOn="submit"
        allowInvalidSubmit
        customFieldLayout
      >
        {({ form }) => (
          <Stack spacing={2} sx={{ pt: 1 }}>
            {sellerBranchNames.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Sucursales del vendedor:
                </Typography>
                <ChipGroup items={sellerBranchNames} maxVisible={6} />
              </Stack>
            )}
            <form.Field name="cashRegisterId">
              {(field) => {
                const fieldValue =
                  typeof field.state.value === "string" ||
                  typeof field.state.value === "number"
                    ? field.state.value
                    : "";
                const hasError = !field.state.meta.isValid;
                const errorMessage = Array.isArray(field.state.meta.errors)
                  ? (field.state.meta.errors as string[]).join(", ")
                  : field.state.meta.errors != null
                    ? String(field.state.meta.errors)
                    : undefined;
                return (
                  <FormAutocomplete
                    label="Caja"
                    placeholder="Buscar caja"
                    options={cashRegisterOptions}
                    value={fieldValue}
                    onChange={(next) => field.handleChange(next)}
                    onBlur={field.handleBlur}
                    error={hasError}
                    helperText={hasError ? errorMessage : noBranchHelper}
                    disabled={assignSaving || cashRegistersQuery.isPending}
                    noOptionsText="Sin cajas en las sucursales del vendedor"
                  />
                );
              }}
            </form.Field>
          </Stack>
        )}
      </ModalFormZod>
    </>
  );
}
