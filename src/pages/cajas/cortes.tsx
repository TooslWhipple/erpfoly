import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { CashRegisterClosingsTable } from "@/components/CashRegister";
import { PrinterSetupDialog } from "@/components/printing";
import { InlineMobileMenuButton } from "@/components/Layout";
import { PageHeader, PageShell } from "@/components/SaleBuilder/styles";
import { CashRegisterPageContent } from "@/styles/cajas.styles";
import { useCashRegisterSession } from "@/hooks/useCashRegisterSession";
import { useCashRegisterClosings } from "@/hooks/useCashRegisterClosings";
import {
  useLabelPrinter,
  PrinterNotConfiguredError,
} from "@/hooks/printing/useLabelPrinter";
import { getApiErrorMessage } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export default function CajasCortesPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const { cashRegister, isLoading: sessionLoading } = useCashRegisterSession();
  const {
    rows,
    total,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    isLoading,
    isFetching,
  } = useCashRegisterClosings({
    enabled: Boolean(cashRegister),
  });
  const {
    printerProfile,
    acknowledgePrinterSetup,
    printFinalCutTicket,
  } = useLabelPrinter();
  const [printingClosingId, setPrintingClosingId] = useState<number | null>(
    null,
  );
  const [printerSetupOpen, setPrinterSetupOpen] = useState(false);
  const [pendingPrintId, setPendingPrintId] = useState<number | null>(null);

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: cashRegister?.name ?? "Cajas", href: "/cajas" },
      { label: "Cortes" },
    ],
    [cashRegister?.name],
  );

  const handleBack = () => {
    router.push("/cajas");
  };

  const printTicket = useCallback(
    async (closingId: number) => {
      try {
        setPrintingClosingId(closingId);
        await printFinalCutTicket(closingId);
      } catch (err) {
        if (err instanceof PrinterNotConfiguredError) {
          setPendingPrintId(closingId);
          setPrinterSetupOpen(true);
          return;
        }
        showError(getApiErrorMessage(err, "No se pudo imprimir el ticket"));
      } finally {
        setPrintingClosingId(null);
      }
    },
    [printFinalCutTicket, showError],
  );

  const handlePrinterSetupConfirm = () => {
    acknowledgePrinterSetup();
    setPrinterSetupOpen(false);
    const id = pendingPrintId;
    setPendingPrintId(null);
    if (id != null) {
      void printTicket(id);
    }
  };

  if (sessionLoading) {
    return (
      <PageShell
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <PageHeader>
          <InlineMobileMenuButton />
        </PageHeader>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <Typography variant="body1">Cargando...</Typography>
        </Stack>
      </PageShell>
    );
  }

  if (!cashRegister) {
    return (
      <PageShell
        sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <PageHeader>
          <InlineMobileMenuButton />
        </PageHeader>
        <Stack flex={1} justifyContent="center" alignItems="center" px={2}>
          <Typography variant="h6" color="text.secondary">
            No tienes una caja asignada
          </Typography>
        </Stack>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          minWidth={0}
          flex="1 1 auto"
        >
          <InlineMobileMenuButton />
          <Breadcrumbs
            items={breadcrumbs}
            showBackButton
            onBack={handleBack}
          />
        </Stack>
      </PageHeader>

      <CashRegisterPageContent>
        <CashRegisterClosingsTable
          rows={rows}
          loading={isLoading || isFetching}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={total}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          printingClosingId={printingClosingId}
          onPrint={(id) => void printTicket(id)}
        />
      </CashRegisterPageContent>

      <PrinterSetupDialog
        open={printerSetupOpen}
        onClose={() => {
          setPrinterSetupOpen(false);
          setPendingPrintId(null);
        }}
        onConfirm={handlePrinterSetupConfirm}
        printerProfile={printerProfile}
      />
    </PageShell>
  );
}
