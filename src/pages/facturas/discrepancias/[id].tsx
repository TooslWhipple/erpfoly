import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Skeleton, Stack } from "@mui/material";
import {
  InvoiceSelectorModal,
  DiscrepancyDetailHeader,
  DiscrepancyInvoicesSection,
} from "@/components";
import {
  discrepancyInvoiceToSelectable,
} from "@/components/MerchandiseReceptionDiscrepancies";
import {
  addInvoicesToMerchandiseReceptionDiscrepancy,
  getMerchandiseReceptionDiscrepancyDetail,
} from "@/services/merchandise-reception-discrepancies.service";
import type { SelectableInvoice } from "@/types/invoice-selector.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { MERCHANDISE_RECEPTION_DISCREPANCIES_UPDATE } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";

export default function MerchandiseReceptionDiscrepancyDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(MERCHANDISE_RECEPTION_DISCREPANCIES_UPDATE);

  const discrepancyId =
    typeof router.query.id === "string" ? router.query.id : "";

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["merchandise-reception-discrepancy", discrepancyId],
    queryFn: async () => {
      const result =
        await getMerchandiseReceptionDiscrepancyDetail(discrepancyId);
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error("No se encontró la discrepancia");
      return result.data;
    },
    enabled: Boolean(discrepancyId),
  });

  useEffect(() => {
    if (isError) {
      showError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el detalle de la discrepancia",
      );
    }
  }, [error, isError, showError]);

  const addInvoicesMutation = useMutation({
    mutationFn: async (selected: SelectableInvoice[]) => {
      const result = await addInvoicesToMerchandiseReceptionDiscrepancy(
        discrepancyId,
        selected.map((invoice) => invoice.id),
      );
      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? "No se pudieron agregar las facturas");
      }
      return result.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["merchandise-reception-discrepancy", discrepancyId],
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: ["merchandise-reception-discrepancies"],
      });
      setInvoiceModalOpen(false);
      showSuccess("Facturas agregadas correctamente");
    },
    onError: (mutationError: Error) => {
      showError(mutationError.message);
    },
  });

  const breadcrumbItems = useMemo(
    () => [
      {
        label: "Recepción de mercancía",
        href: "/facturas/discrepancias",
      },
      {
        label: detail?.supplierName ?? "Proveedor",
      },
      {
        label: detail?.receptionId ?? discrepancyId,
      },
    ],
    [detail?.receptionId, detail?.supplierName, discrepancyId],
  );

  const handleBack = useCallback(() => {
    void router.push("/facturas/discrepancias");
  }, [router]);

  const availableInvoices = useMemo(
    () =>
      (detail?.availableInvoices ?? []).map(discrepancyInvoiceToSelectable),
    [detail?.availableInvoices],
  );

  if (!router.isReady || isLoading) {
    return (
      <Stack spacing={{ xs: 2, md: 3 }} sx={{ width: "100%" }}>
        <Skeleton variant="rounded" height={40} sx={{ width: { xs: "100%", md: "45%" } }} />
        <Skeleton variant="rounded" height={96} sx={{ maxWidth: { md: 608 } }} />
        <Skeleton variant="rounded" height={280} />
      </Stack>
    );
  }

  if (isError && !detail) {
    return (
      <Stack spacing={2}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "No se pudo cargar el detalle"}
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          Volver a discrepancias
        </Button>
      </Stack>
    );
  }

  if (!detail) {
    return (
      <Alert severity="info">No se encontró la discrepancia solicitada.</Alert>
    );
  }

  return (
    <Stack spacing={{ xs: 2, md: 3 }} sx={{ width: "100%", minWidth: 0 }}>
      <DiscrepancyDetailHeader
        breadcrumbItems={breadcrumbItems}
        originName={detail.originName}
        originDate={detail.originDate}
        branchName={detail.branchName}
        deliveryDate={detail.deliveryDate}
        onBack={handleBack}
      />

      <DiscrepancyInvoicesSection
        invoices={detail.invoices}
        summary={detail.billingSummary}
        canAddInvoice={canUpdate}
        onAddInvoice={() => setInvoiceModalOpen(true)}
      />

      <InvoiceSelectorModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        availableInvoices={availableInvoices}
        linkedInvoiceIds={detail.invoices.map((invoice) => invoice.id)}
        loading={addInvoicesMutation.isPending}
        onConfirm={async (selected) => {
          await addInvoicesMutation.mutateAsync(selected);
        }}
      />
    </Stack>
  );
}
