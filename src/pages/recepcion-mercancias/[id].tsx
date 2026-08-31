import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  TableBody,
  TableRow,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { Breadcrumbs } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { StatusChip } from "@/components/StatusChip";
import { SendToCostingModal } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import { PrinterSetupDialog } from "@/components/printing";
import { useLabelPrinter } from "@/hooks/printing/useLabelPrinter";
import {
  getReceptionLabelCounts,
  resolveReceptionPrintParams,
} from "@/lib/reception/label-print";
import {
  getReceptionById,
  updateReception,
  type ReceptionDetail,
} from "@/services/recepcion-mercancias.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { formatDate } from "@/utils/date";
import {
  PageContainer,
  PageHeader,
  HeaderActions,
  HeaderSection,
  TransferInfo,
  SupplierInfo,
  SupplierName,
  SupplierDate,
  ProgressSection,
  ProgressBarContainer,
  StyledProgressBar,
  BranchInfo,
  BranchName,
  DeliveryDate,
  ActionButton,
  ContentLayout,
  TableContainer,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  ArticleNameCell,
  InvoiceCard,
  InvoiceCardInfo,
  InvoiceCardId,
  InvoiceCardDate,
  InvoiceCardAmount,
  InvoiceTotalCard,
  Table,
} from "@/styles/recepcion-mercancias/index.styles";

function getStatusChip(status: string): {
  label: string;
  variant: StatusChipVariant;
} | null {
  switch (status) {
    case "draft":
      return { label: "Borrador", variant: "default" };
    case "pre_captured":
      return { label: "Precapturado", variant: "success" };
    case "in_costing":
      return { label: "En costeo", variant: "info" };
    case "costed":
      return { label: "Costeado", variant: "success" };
    case "cancelled":
      return { label: "Cancelado", variant: "warning" };
    default:
      return null;
  }
}

function isEditable(status: string): boolean {
  return status === "draft" || status === "pre_captured";
}

function calculateProgress(received: number, ordered: number): number {
  if (ordered === 0) return 0;
  return Math.round((received / ordered) * 100);
}

export default function RecepcionDetalle() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const {
    progress: printProgress,
    isConfigured,
    printerProfile,
    acknowledgePrinterSetup,
    printReceptionLabels,
  } = useLabelPrinter();
  const [reception, setReception] = useState<ReceptionDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [printerSetupOpen, setPrinterSetupOpen] = useState(false);

  const id = router.isReady ? Number(router.query.id) : null;

  const idIsValid = router.isReady && id != null && !Number.isNaN(id);

  useEffect(() => {
    if (!idIsValid) return;
    let cancelled = false;
    getReceptionById(id!)
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setError(result.error?.message ?? "Recepción no encontrada");
          setLoadState("error");
          return;
        }
        setReception(result.data);
        setLoadState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[RecepcionDetalle] Error fetching:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar la recepción",
        );
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [idIsValid, id]);

  const handleOpenPrintLabels = () => {
    if (!reception) return;
    if (!isConfigured) {
      setPrinterSetupOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const handlePrinterSetupConfirm = () => {
    acknowledgePrinterSetup();
    setPrinterSetupOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmPrint = async () => {
    if (!reception) return;

    const { totalLabels, extraLabels } = getReceptionLabelCounts(
      reception.items,
      reception.printedLabelsCount,
    );
    const { mode, skip } = resolveReceptionPrintParams(
      reception.printedLabelsCount,
      totalLabels,
    );

    setConfirmLoading(true);
    try {
      await printReceptionLabels(reception.id, {
        mode,
        skip,
      });

      if (extraLabels > 0) {
        const result = await updateReception(reception.id, {
          printed_labels_count: totalLabels,
        });
        if (result.data) {
          setReception(result.data);
        }
      }

      setConfirmOpen(false);
    } catch (printErr) {
      const message =
        printErr instanceof Error
          ? printErr.message
          : "No se pudieron imprimir las etiquetas";
      showError(message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const loading = loadState === "loading" && !reception;

  if (loading) {
    return (
      <PageContainer>
        <Stack alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (!idIsValid || error || !reception) {
    return (
      <PageContainer>
        <Stack spacing={2}>
          <Breadcrumbs
            items={[
              { label: "Recepción de mercancía", href: "/recepcion-mercancias" },
              { label: "Detalle" },
            ]}
          />
          <Alert severity="error">
            {!idIsValid
              ? "ID de recepción inválido"
              : error ?? "Recepción no encontrada"}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => router.push("/recepcion-mercancias")}
          >
            Volver al listado
          </Button>
        </Stack>
      </PageContainer>
    );
  }

  const totalOrdered = reception.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = reception.items.reduce((sum, item) => sum + item.received, 0);
  const { totalLabels, extraLabels } = getReceptionLabelCounts(
    reception.items,
    reception.printedLabelsCount,
  );
  const confirmVariant = resolveReceptionPrintParams(
    reception.printedLabelsCount,
    totalLabels,
  ).variant;
  const canPrintLabels =
    reception.status === "pre_captured" && totalReceived > 0;
  const progress = calculateProgress(totalReceived, totalOrdered);
  const invoicesTotal = reception.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const statusChip = getStatusChip(reception.status);
  const deliveryDate =
    reception.items
      .map((i) => i.scheduledDeliveryDate)
      .filter((d): d is string => Boolean(d))
      .sort()[0] ?? null;
  const canEdit = isEditable(reception.status);
  const orderDate = formatDate(reception.createdAt, "dateLong");

  return (
    <PageContainer>
      <PageHeader>
        <Breadcrumbs
          items={[
            { label: "Recepción de mercancía", href: "/recepcion-mercancias" },
            { label: `#${reception.id}` },
          ]}
        />
        <HeaderActions>
          {statusChip != null && (
            <StatusChip
              label={statusChip.label}
              variant={statusChip.variant}
              size="small"
            />
          )}
          <ActionButton
            variant="outlined"
            color="inherit"
            onClick={() => router.push("/recepcion-mercancias")}
          >
            Volver
          </ActionButton>
          {canEdit && (
            <ActionButton
              variant="outlined"
              color="primary"
              onClick={() =>
                router.push(`/recepcion-mercancias/${reception.id}/editar`)
              }
            >
              Editar
            </ActionButton>
          )}
          {canPrintLabels && (
            <ActionButton
              variant="outlined"
              color="primary"
              onClick={handleOpenPrintLabels}
              disabled={printProgress != null}
            >
              Imprimir etiquetas
            </ActionButton>
          )}
          {reception.costeo && (
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => router.push(`/costeos/${reception.costeo!.id}`)}
            >
              Ir al costeo
            </ActionButton>
          )}
        </HeaderActions>
      </PageHeader>

      <HeaderSection>
        <TransferInfo>
          <SupplierInfo>
            <SupplierName>{reception.supplier}</SupplierName>
            <SupplierDate>{orderDate}</SupplierDate>
          </SupplierInfo>
          <BranchInfo>
            <BranchName>{reception.warehouse}</BranchName>
            {deliveryDate && (
              <DeliveryDate>
                Entrega: {formatDate(deliveryDate, "dateLong")}
              </DeliveryDate>
            )}
          </BranchInfo>
        </TransferInfo>
      </HeaderSection>

      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Pedido
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {reception.orderNumber || "—"}
          </Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Etiquetas impresas
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {reception.printedLabelsCount}
          </Typography>
        </Stack>
        {reception.notes && (
          <Stack spacing={0.5} flex="1 1 240px">
            <Typography variant="caption" color="text.secondary">
              Notas
            </Typography>
            <Typography variant="body2">{reception.notes}</Typography>
          </Stack>
        )}
      </Stack>

      <ProgressSection>
        <ProgressBarContainer>
          <StyledProgressBar variant="determinate" value={progress} />
        </ProgressBarContainer>
      </ProgressSection>

      <ContentLayout>
        <Stack spacing={2} flex="1 1 0">
          <Stack>
            <Typography variant="h6">Artículos recibidos</Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen de la recepción (solo lectura).
            </Typography>
          </Stack>
          <TableContainer>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <StyledTableCell>Nombre</StyledTableCell>
                  <StyledTableCell>SKU</StyledTableCell>
                  <StyledTableCell>Pedido</StyledTableCell>
                  <StyledTableCell>Cantidad</StyledTableCell>
                  <StyledTableCell>Recibidos</StyledTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {reception.items.length === 0 ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Esta recepción no tiene artículos
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  reception.items.map((item) => (
                    <StyledTableRow key={item.id}>
                      <ArticleNameCell>{item.name}</ArticleNameCell>
                      <StyledTableCell>{item.sku}</StyledTableCell>
                      <StyledTableCell>{item.orderNumber}</StyledTableCell>
                      <StyledTableCell>{item.quantity}</StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {item.received}
                        </Typography>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Stack spacing={2} flex="0 1 320px">
          <Stack>
            <Typography variant="h6">Facturas</Typography>
            <Typography variant="body2" color="text.secondary">
              Facturas vinculadas a esta recepción.
            </Typography>
          </Stack>

          {reception.invoices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Esta recepción aún no tiene facturas vinculadas. Se vincularán al
              enviar a costeo.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {reception.invoices.map((invoice) => (
                <InvoiceCard key={invoice.id}>
                  <InvoiceCardInfo>
                    <InvoiceCardId>ID: {invoice.externalId}</InvoiceCardId>
                    <InvoiceCardDate>{invoice.date}</InvoiceCardDate>
                  </InvoiceCardInfo>
                  <InvoiceCardAmount>
                    {numeral(invoice.amount).format("$0,0.00")}
                  </InvoiceCardAmount>
                </InvoiceCard>
              ))}

              <InvoiceTotalCard>
                <Typography variant="body1" fontWeight={500}>
                  Total
                </Typography>
                <Typography variant="subtitle1">
                  {numeral(invoicesTotal).format("$0,0.00")}
                </Typography>
              </InvoiceTotalCard>
            </Stack>
          )}
        </Stack>
      </ContentLayout>

      <SendToCostingModal
        open={confirmOpen}
        onClose={() => {
          if (printProgress == null) {
            setConfirmOpen(false);
          }
        }}
        onConfirm={handleConfirmPrint}
        variant={confirmVariant}
        totalArticles={totalReceived}
        totalLabels={totalLabels}
        extraLabels={extraLabels}
        loading={confirmLoading && printProgress == null}
        printProgress={printProgress}
        printerName={printerProfile.displayName}
      />

      <PrinterSetupDialog
        open={printerSetupOpen}
        onClose={() => setPrinterSetupOpen(false)}
        onConfirm={handlePrinterSetupConfirm}
        printerProfile={printerProfile}
      />
    </PageContainer>
  );
}
