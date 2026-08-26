import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { Breadcrumbs, Title, TableCrud } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { SharedDelinquencyClientModal } from "@/components/Delinquency";
import { getDelinquencySharedListById } from "@/services/delinquency-shared-list.service";
import { unwrapOrThrow } from "@/lib/axios";
import type { DelinquencySharedListClientSnapshot } from "@/types/delinquency-shared-list.types";
import { formatDate } from "@/utils/date";

const DATE_FORMAT = "D [de] MMMM, YYYY";

const DELINQUENCY_CHIP_LABELS: Record<string, string> = {
  "1_day": "1 día",
  "1_week": "1 semana",
  "1_month": "1 mes",
  "2_months": "2 meses",
};

const DELINQUENCY_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  "1_day": "default",
  "1_week": "error",
  "1_month": "error",
  "2_months": "error",
};

export default function DelinquencySharedListDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const listId =
    typeof router.query.id === "string" && Number.isFinite(Number(router.query.id))
      ? Number(router.query.id)
      : null;

  const [selectedListClientId, setSelectedListClientId] = useState<number | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const listQuery = useQuery({
    queryKey: ["clients", "delinquency", "shared-list", listId],
    enabled: listId != null,
    queryFn: async () => {
      const result = await getDelinquencySharedListById(listId as number);
      return unwrapOrThrow(result);
    },
  });

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Morosidad", href: "/clientes/morosidad" },
      { label: listQuery.data?.name ?? "Lista compartida" },
    ],
    [listQuery.data?.name],
  );

  const openClientDetail = useCallback((row: DelinquencySharedListClientSnapshot) => {
    setSelectedListClientId(row.id);
    setModalOpen(true);
  }, []);

  const columns: Column<DelinquencySharedListClientSnapshot>[] = useMemo(
    () => [
      {
        id: "fullName",
        label: "CLIENTE",
        size: "xl",
      },
      {
        id: "phone",
        label: "TELÉFONO",
        size: "md",
        format: (value) => (value ? String(value) : "—"),
      },
      {
        id: "email",
        label: "EMAIL",
        size: "lg",
        format: (value) => (value ? String(value) : "—"),
      },
      {
        id: "lastPaymentDate",
        label: "ÚLTIMO PAGO",
        size: "md",
        format: (value) => (value ? formatDate(value, DATE_FORMAT) : "—"),
      },
      {
        id: "delinquencyPeriod",
        label: "MOROSIDAD",
        size: "sm",
        type: "chip",
        align: "center",
        chipLabelMap: DELINQUENCY_CHIP_LABELS,
        chipVariantMap: DELINQUENCY_CHIP_VARIANTS,
      },
      {
        id: "totalDebtAmount",
        label: "DEUDA ACTUAL",
        type: "currency",
        size: "md",
        align: "right",
      },
      {
        id: "negotiatedDebtAmount",
        label: "NEGOCIACIÓN",
        size: "md",
        align: "right",
        format: (value) =>
          value != null && typeof value === "number"
            ? new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(value)
            : "—",
      },
    ],
    [],
  );

  const actions: RowAction<DelinquencySharedListClientSnapshot>[] = useMemo(
    () => [
      {
        id: "view-detail",
        label: "Ver detalle",
        onClick: (row) => openClientDetail(row),
      },
    ],
    [openClientDetail],
  );

  if (!router.isReady || listId == null) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (listQuery.isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (listQuery.isError || !listQuery.data) {
    return (
      <Stack spacing={2}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={() => void router.push("/clientes/morosidad")}
        />
        <Typography color="error">
          {listQuery.error instanceof Error
            ? listQuery.error.message
            : "No se pudo cargar la lista compartida"}
        </Typography>
      </Stack>
    );
  }

  const list = listQuery.data;

  return (
    <Stack spacing={3}>
      <Breadcrumbs
        items={breadcrumbs}
        showBackButton
        onBack={() => void router.push("/clientes/morosidad")}
      />

      <Stack spacing={0.5}>
        <Title title={list.name} />
        <Typography variant="body2" color="text.secondary">
          {list.clientCount.toLocaleString("es-MX")} clientes compartidos
        </Typography>
      </Stack>

      <TableCrud
        columns={columns}
        rows={list.clients}
        rowKey="id"
        hidePagination
        actions={actions}
        onRowClick={openClientDetail}
        emptyMessage="No hay clientes en esta lista"
      />

      <SharedDelinquencyClientModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedListClientId(null);
        }}
        mode="internal"
        listId={list.id}
        listClientId={selectedListClientId}
        onNegotiationSuccess={() => {
          void queryClient.invalidateQueries({
            queryKey: ["clients", "delinquency", "shared-list", listId],
          });
        }}
      />
    </Stack>
  );
}
