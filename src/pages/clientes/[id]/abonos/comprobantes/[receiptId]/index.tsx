import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Stack, Typography } from "@mui/material";
import { Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { PaymentSuccessView } from "../../../../abonos/components";
import { ReceiptStage } from "@/styles/clientes/abonos.styles";
import { ErrorState } from "@/styles/clientes/detalle.styles";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { downloadBlob, printPdfBlob } from "@/lib/printing";
import {
  downloadClientPaymentReceiptById,
  getClientPaymentReceipt,
} from "@/services/sale-credit.service";
import { getClientDetail } from "@/services/clients.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { ClientPaymentResult } from "@/types/clientPayment.types";

export default function ClientPaymentReceiptPage() {
  const router = useRouter();
  const showError = useSnackbarStore((s) => s.showError);
  const [isDownloading, setIsDownloading] = useState(false);
  const clientId = typeof router.query.id === "string" ? Number(router.query.id) : null;
  const receiptId =
    typeof router.query.receiptId === "string" ? Number(router.query.receiptId) : null;
  const fromCashRegister = router.query.from === "cajas";
  const cashRegisterName =
    typeof router.query.caja === "string" ? decodeURIComponent(router.query.caja) : "Caja";

  const receiptQuery = useQuery({
    queryKey: ["sale-credits", "receipt", clientId, receiptId],
    enabled: router.isReady && clientId != null && receiptId != null,
    queryFn: async () => {
      const result = await getClientPaymentReceipt(clientId as number, receiptId as number);
      return unwrapOrThrow(result);
    },
  });

  const clientQuery = useQuery({
    queryKey: ["clients", "detail", clientId],
    enabled: router.isReady && clientId != null,
    queryFn: async () => unwrapOrThrow(await getClientDetail(clientId as number)),
  });

  const handleBack = () => {
    if (fromCashRegister) {
      void router.push("/cajas");
      return;
    }
    if (clientId) {
      void router.push(`/clientes/${clientId}`);
      return;
    }
    void router.push("/clientes");
  };

  const downloadPdf = async () => {
    if (!clientId || !receiptId || !receiptQuery.data) {
      throw new Error("No se pudo descargar el comprobante");
    }
    const blob = await downloadClientPaymentReceiptById(clientId, receiptId);
    return { blob, filename: `comprobante-${receiptQuery.data.folio}.pdf` };
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await downloadPdf();
      downloadBlob(blob, filename);
    } catch (error) {
      showError(getApiErrorMessage(error) || "No se pudo descargar el comprobante");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    setIsDownloading(true);
    try {
      const { blob } = await downloadPdf();
      await printPdfBlob(blob);
    } catch (error) {
      showError(getApiErrorMessage(error) || "No se pudo imprimir el comprobante");
    } finally {
      setIsDownloading(false);
    }
  };

  const clientName = clientQuery.data?.fullName ?? receiptQuery.data?.clientName ?? "...";
  const breadcrumbs: BreadcrumbItem[] = fromCashRegister
    ? [
      { label: cashRegisterName, href: "/cajas" },
      { label: "Clientes", href: "/clientes" },
      { label: clientName, href: clientId ? `/clientes/${clientId}` : undefined },
      { label: "Comprobante" },
    ]
    : [
      { label: "Clientes", href: "/clientes" },
      { label: clientName, href: clientId ? `/clientes/${clientId}` : undefined },
      {
        label: "Abono",
        href: clientId ? `/clientes/${clientId}/abonos` : undefined,
      },
      { label: receiptQuery.data?.folio ?? "Comprobante" },
    ];

  if (!router.isReady || receiptQuery.isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  if (receiptQuery.isError || !receiptQuery.data || !clientId || !receiptId) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
        <ErrorState>
          <Typography>
            {receiptQuery.error
              ? getApiErrorMessage(receiptQuery.error)
              : "No se encontró el comprobante"}
          </Typography>
          <Button variant="outlined" onClick={handleBack}>
            Volver
          </Button>
        </ErrorState>
      </Stack>
    );
  }

  const receipt = receiptQuery.data;
  const result: ClientPaymentResult = {
    id: String(receipt.id),
    receiptId: receipt.id,
    folio: receipt.folio,
    clientName: receipt.clientName,
    totalAmount: receipt.totalAmount,
    dateLabel: receipt.dateLabel,
    allocations: receipt.allocations,
    clientPhone: receipt.clientPhone,
    paidInstallments: receipt.paidInstallments,
    totalInstallments: receipt.totalInstallments,
    creditsAffectedCount: receipt.creditsAffectedCount,
    receiptUrl: "",
    paymentIds: receipt.payment_ids,
  };

  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbs} showBackButton onBack={handleBack} />
      <Stack width="100%" alignItems='center'>
        <ReceiptStage>
          <PaymentSuccessView
            result={result}
            onDownloadReceipt={() => void handleDownload()}
            onPrintReceipt={() => void handlePrint()}
            isDownloadingReceipt={isDownloading}
          />
        </ReceiptStage>
      </Stack>
    </Stack>
  );
}
