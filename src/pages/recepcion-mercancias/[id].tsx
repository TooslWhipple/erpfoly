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
  canEditMerchandiseReception,
  getMerchandiseReceptionStatusPresentation,
} from "@/utils/merchandise-reception";
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
  InvoiceGuideLine,
  InvoiceGuidePanel,
  Table,
} from "@/styles/recepcion-mercancias/index.styles";

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
  const awaitingCapture =
    reception.status === "pre_authorized" && reception.items.length === 0;
  const progress = calculateProgress(totalReceived, totalOrdered);
  const invoicesTotal = reception.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const statusChip = getMerchandiseReceptionStatusPresentation(reception.status);
  const deliveryDate =
    reception.items
      .map((i) => i.scheduledDeliveryDate)
      .filter((d): d is string => Boolean(d))
      .sort()[0] ?? null;
  const canEdit = canEditMerchandiseReception(reception.status);
  const orderDate = formatDate(reception.createdAt, "dateLong");
  const goToCapture = () =>
    router.push(`/recepcion-mercancias/${reception.id}/editar`);

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
          {canEdit && (
            <ActionButton
              variant="outlined"
              color="inherit"
              onClick={goToCapture}
            >
              Editar
            </ActionButton>
          )}
          {awaitingCapture && (
            <ActionButton
              variant="contained"
              color="primary"
              onClick={goToCapture}
            >
              Continuar captura
            </ActionButton>
          )}
          {canPrintLabels && (
            <ActionButton
              variant="outlined"
              color="inherit"
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

      {awaitingCapture ? (
        <Typography variant="body2" color="text.secondary">
          Sin captura
        </Typography>
      ) : (
        <ProgressSection>
          <ProgressBarContainer>
            <StyledProgressBar variant="determinate" value={progress} />
          </ProgressBarContainer>
        </ProgressSection>
      )}

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
                        {reception.status === "pre_authorized"
                          ? "Aún no capturas cantidades. Usa Continuar captura para registrar lo recibido."
                          : "Esta recepción no tiene artículos"}
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
              {reception.status === "pre_authorized"
                ? "Este folio se abrió sin facturas vinculadas. Vuelve a abrir la recepción con las facturas del proveedor."
                : "Esta recepción no tiene facturas vinculadas."}
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

              {reception.invoices.some((invoice) => (invoice.lines ?? []).length > 0) ? (
                <InvoiceGuidePanel>
                  {reception.invoices.flatMap((invoice) =>
                    (invoice.lines ?? []).map((line, index) => (
                      <InvoiceGuideLine
                        key={`${invoice.id}-${index}-${line.issuerSku ?? line.description}`}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {invoice.externalId}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {line.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {line.issuerSku
                            ? `SKU proveedor: ${line.issuerSku}`
                            : "Sin SKU de proveedor"}
                          {" · "}
                          {line.quantity} ×{" "}
                          {numeral(line.unitPrice).format("$0,0.00")}
                        </Typography>
                      </InvoiceGuideLine>
                    )),
                  )}
                </InvoiceGuidePanel>
              ) : null}
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
