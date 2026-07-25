import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  IconButton,
  Stack,
  TableBody,
  TableRow,
  Typography,
} from "@mui/material";
import { CircleMinus, Plus } from "lucide-react";
import numeral from "numeral";
import { Breadcrumbs, InvoiceSelectorModal, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { NumberInput } from "@/components/Folypuntos";
import { SendToCostingModal } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import type { ReceptionConfirmVariant } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import type { SelectableInvoice } from "@/types/invoice-selector.types";
import type {
  ReceptionArticle,
  ReceptionDetailStatus,
  ReceptionInvoice,
} from "@/types/recepcion-mercancias.types";
import { formatDate } from "@/utils/date";
import { selectableToReceptionInvoice } from "./receptionInvoiceAdapter";
import { useReceptionAvailableInvoices } from "./useReceptionAvailableInvoices";
import {
  createReception,
  getPendingArticlesBySupplier,
  getReceptionById,
  sendReceptionToCosting,
  updateReception,
  type PendingArticleApi,
  type ReceptionDetail,
  type ReceptionDetailItem,
  type ReceptionDetailInvoice,
} from "@/services/recepcion-mercancias.service";
import {
  PageContainer,
  PageHeader,
  HeaderActions,
  HeaderSection,
  TransferInfo,
  SupplierInfo,
  SupplierName,
  SupplierDate,
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
  AddInvoiceButton,
  InvoiceCard,
  InvoiceCardInfo,
  InvoiceCardId,
  InvoiceCardDate,
  InvoiceCardAmount,
  InvoiceTotalCard,
  InvoiceAmountAlert,
  Table,
} from "@/styles/recepcion-mercancias/index.styles";

type ActivePanel = "invoices" | "confirm" | null;

export interface ReceptionFormProps {
  mode: "create" | "edit";
  supplierId?: number;
  supplierName?: string;
  receptionId?: number;
  onSaved?: (receptionId: number) => void;
}

function pendingArticleToReceptionArticle(
  item: PendingArticleApi,
): ReceptionArticle {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    orderId: item.orderId,
    orderNumber: item.orderNumber,
    quantity: item.quantity,
    received: item.received,
    branchName: item.branchName,
    branchId: item.branchId,
    scheduledDeliveryDate: item.scheduledDeliveryDate,
  };
}

function detailItemToReceptionArticle(
  item: ReceptionDetailItem,
): ReceptionArticle {
  return {
    id: `reception-item-${item.id}`,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    orderId: item.orderId,
    orderNumber: item.orderNumber,
    quantity: item.quantity,
    received: item.received,
    branchName: item.branchName ?? undefined,
    branchId: undefined,
    scheduledDeliveryDate: item.scheduledDeliveryDate,
  };
}

function detailInvoiceToReceptionInvoice(
  inv: ReceptionDetailInvoice,
): ReceptionInvoice {
  return {
    id: `costeo-invoice-${inv.id}`,
    fiscalFolio: inv.externalId,
    date: inv.date,
    amount: inv.amount,
    paymentType: inv.type,
  };
}

function getTotalArticles(articles: ReceptionArticle[]): number {
  return articles.reduce((sum, article) => sum + article.received, 0);
}

function getTotalLabels(articles: ReceptionArticle[]): number {
  return getTotalArticles(articles);
}

function getInvoicesTotal(invoices: ReceptionInvoice[]): number {
  return invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
}

function hasQuantityMismatch(articles: ReceptionArticle[]): boolean {
  return articles.some((article) => article.received !== article.quantity);
}

function getStatusChip(status: ReceptionDetailStatus): {
  label: string;
  variant: StatusChipVariant;
} | null {
  switch (status) {
    case "pre_captured":
      return { label: "Precapturado", variant: "success" };
    case "in_costing":
      return { label: "En costeo", variant: "info" };
    case "costed":
      return { label: "Costeado", variant: "success" };
    default:
      return null;
  }
}

function getPrimaryActionLabel(
  status: ReceptionDetailStatus,
  extraLabels: number,
): string {
  switch (status) {
    case "draft":
      return "Guardar e imprimir etiquetas";
    case "pre_captured":
      return extraLabels > 0 ? "Reimprimir etiquetas" : "Enviar a costeo";
    case "in_costing":
    case "costed":
      return "Guardar cambios";
    default:
      return "Guardar";
  }
}

function resolveConfirmVariant(
  status: ReceptionDetailStatus,
  extraLabels: number,
): ReceptionConfirmVariant {
  if (status === "pre_captured" && extraLabels > 0) {
    return "save_extra_labels";
  }
  if (status === "pre_captured") {
    return "send_to_costing";
  }
  if (extraLabels > 0) {
    return "save_extra_labels";
  }
  return "save_labels";
}

function mapReceptionDetailStatus(
  status: ReceptionDetail["status"],
): ReceptionDetailStatus {
  switch (status) {
    case "draft":
      return "draft";
    case "pre_captured":
    case "in_costing":
    case "costed":
      return status;
    case "cancelled":
    default:
      return "draft";
  }
}

export function ReceptionForm({
  mode,
  supplierId,
  supplierName: supplierNameProp,
  receptionId,
  onSaved,
}: ReceptionFormProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<ReceptionArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<ReceptionInvoice[]>([]);
  const [status, setStatus] = useState<ReceptionDetailStatus>("draft");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [printProgress, setPrintProgress] = useState<number | null>(null);
  const [baselineLabels, setBaselineLabels] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentReceptionId, setCurrentReceptionId] = useState<number | null>(
    receptionId ?? null,
  );
  const [supplierNameFromReception, setSupplierNameFromReception] = useState("");

  const totalArticles = getTotalArticles(articles);
  const totalLabels = getTotalLabels(articles);
  const extraLabels = Math.max(0, totalLabels - baselineLabels);
  const invoicesTotal = getInvoicesTotal(invoices);
  const invoicesExceedCost = invoices.length > 0 && invoicesTotal > totalLabels;
  const quantityMismatch = hasQuantityMismatch(articles);
  const statusChip = getStatusChip(status);
  const canEditQuantities = status === "draft" || status === "pre_captured";
  const canManageInvoices = status === "draft" || status === "pre_captured";
  const confirmVariant = resolveConfirmVariant(status, extraLabels);
  const primaryDisabled =
    (status === "draft" && totalArticles === 0) ||
    status === "in_costing" ||
    status === "costed";

  const linkedInvoiceIds = useMemo(
    () => invoices.map((invoice) => invoice.id),
    [invoices],
  );

  const { availableInvoices: receptionAvailableInvoices, loading: loadingAvailableInvoices }
    = useReceptionAvailableInvoices();

  const supplierName =
    supplierNameProp ||
    supplierNameFromReception ||
    (articles.length > 0 ? "" : "Cargando proveedor...");
  const branch = articles.find((a) => a.branchName)?.branchName ?? "Bodega";
  const scheduledDeliveryDates = articles
    .map((a) => a.scheduledDeliveryDate)
    .filter((date): date is string => Boolean(date))
    .sort();
  const deliveryDate = scheduledDeliveryDates[0] ?? null;
  const orderDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!router.isReady) return;

    let cancelled = false;
    setLoadingArticles(true);
    setArticlesError(null);

    if (currentReceptionId != null) {
      getReceptionById(currentReceptionId)
        .then((result) => {
          if (cancelled) return;
          if (result.error || !result.data) {
            setArticlesError(
              result.error?.message ?? "No se pudo cargar la recepción",
            );
            setArticles([]);
            return;
          }
          const detail = result.data;
          setArticles(detail.items.map(detailItemToReceptionArticle));
          setInvoices(detail.invoices.map(detailInvoiceToReceptionInvoice));
          setStatus(mapReceptionDetailStatus(detail.status));
          setBaselineLabels(
            detail.printedLabelsCount > 0 ? detail.printedLabelsCount : totalLabelsOf(detail.items),
          );
          setSupplierNameFromReception(detail.supplier);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("[ReceptionForm] Error loading reception:", err);
          setArticlesError(
            err instanceof Error ? err.message : "Error al cargar la recepción",
          );
          setArticles([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingArticles(false);
        });
    } else if (supplierId != null && !Number.isNaN(supplierId)) {
      getPendingArticlesBySupplier(supplierId)
        .then((result) => {
          if (cancelled) return;
          if (result.error) {
            setArticlesError(result.error.message);
            setArticles([]);
            return;
          }
          setArticles((result.data ?? []).map(pendingArticleToReceptionArticle));
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("[ReceptionForm] Error fetching articles:", err);
          setArticlesError(
            err instanceof Error ? err.message : "Error al cargar artículos",
          );
          setArticles([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingArticles(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [router.isReady, currentReceptionId, supplierId]);

  const handleQuantityChange = (articleId: string, newQuantity: number) => {
    if (!canEditQuantities) return;
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
              ...article,
              received: Math.max(0, newQuantity),
            }
          : article,
      ),
    );
  };

  const handleOpenPrimaryAction = () => {
    if (status === "in_costing" || status === "costed") return;
    setActivePanel("confirm");
  };

  const simulatePrintProgress = async () => {
    setPrintProgress(0);
    for (let value = 8; value <= 100; value += 12) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      setPrintProgress(Math.min(value, 100));
    }
    setPrintProgress(null);
  };

  const buildSavePayload = () => ({
    printed_labels_count: totalLabels,
    items: articles.map((article) => ({
      order_id: article.orderId ?? 0,
      order_item_id:
        article.id.startsWith("reception-item-")
          ? Number(article.id.replace("reception-item-", ""))
          : Number(article.id.replace("order-item-", "")),
      product_id: article.productId ?? 0,
      quantity: article.quantity,
      received: article.received,
    })),
  });

  const handleConfirmAction = async (_reason?: string) => {
    if (articles.length === 0) {
      setSubmitError("No hay artículos para guardar");
      return;
    }

    setConfirmLoading(true);
    setSubmitError(null);
    try {
      if (status === "draft" || (status === "pre_captured" && extraLabels > 0)) {
        const payload = buildSavePayload();
        const result =
          currentReceptionId != null
            ? await updateReception(currentReceptionId, payload)
            : await createReception({
                ...payload,
                supplier_id: supplierId ?? 0,
                branch_id: articles[0]?.branchId ?? 0,
                order_date: orderDate,
              });
        if (result.error || !result.data) {
          setSubmitError(result.error?.message ?? "Error al guardar");
          return;
        }
        const detail = result.data;
        setCurrentReceptionId(detail.id);
        setStatus("pre_captured");
        setBaselineLabels(detail.printedLabelsCount || totalLabels);
        setActivePanel(null);
        await simulatePrintProgress();
        if (mode === "edit" && onSaved) {
          onSaved(detail.id);
        }
        return;
      }

      if (status === "pre_captured") {
        if (currentReceptionId == null) {
          setSubmitError("No se identificó la recepción");
          return;
        }
        const payload = {
          items: articles.map((article) => ({
            product_id: article.productId ?? 0,
            quantity: article.quantity,
            received: article.received,
          })),
          invoices: invoices.map((invoice) => ({
            supplier_invoice_id: Number(invoice.id.replace(/\D/g, "")) || 0,
            amount: invoice.amount,
          })),
        };
        const result = await sendReceptionToCosting(currentReceptionId, payload);
        if (result.error) {
          setSubmitError(result.error.message);
          return;
        }
        setStatus("in_costing");
        setActivePanel(null);
        if (result.data?.costeoId) {
          router.push(`/costeos/${result.data.costeoId}`);
        }
        return;
      }
    } catch (err) {
      console.error("[ReceptionForm] Error confirming action:", err);
      setSubmitError(
        err instanceof Error ? err.message : "Error al procesar la acción",
      );
    } finally {
      setConfirmLoading(false);
      setPrintProgress(null);
    }
  };

  const handleAddInvoices = async (selected: SelectableInvoice[]) => {
    setInvoices((prev) => [...prev, ...selected.map(selectableToReceptionInvoice)]);
    setActivePanel(null);
  };

  const handleRemoveInvoice = (invoiceId: string) => {
    if (!canManageInvoices) return;
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
  };

  return (
    <PageContainer>
      <PageHeader>
        <Breadcrumbs
          items={[
            {
              label: "Recepción de mercancía",
              href: "/recepcion-mercancias",
            },
            {
              label: mode === "edit" ? `Editar #${currentReceptionId ?? ""}` : "Nuevo",
            },
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
            variant="contained"
            color="primary"
            onClick={handleOpenPrimaryAction}
            disabled={primaryDisabled}
          >
            {getPrimaryActionLabel(status, extraLabels)}
          </ActionButton>
        </HeaderActions>
      </PageHeader>

      <HeaderSection>
        <TransferInfo>
          <SupplierInfo>
            <SupplierName>{supplierName}</SupplierName>
            <SupplierDate>{formatDate(orderDate, "dateLong")}</SupplierDate>
          </SupplierInfo>
          <BranchInfo>
            <BranchName>{branch}</BranchName>
            {deliveryDate && (
              <DeliveryDate>
                Entrega: {formatDate(deliveryDate, "dateLong")}
              </DeliveryDate>
            )}
          </BranchInfo>
        </TransferInfo>
      </HeaderSection>

      {submitError && (
        <Typography variant="body2" color="error">
          {submitError}
        </Typography>
      )}

      <ContentLayout>
        <Stack spacing={2} flex="1 1 0">
          <Stack>
            <Typography variant="h6">Artículos recibidos</Typography>
            <Typography variant="body2" color="text.secondary">
              Confirma la cantidad de artículos recibidos.
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
                {loadingArticles ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Cargando artículos...
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : articlesError ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5} align="center">
                      <Typography variant="body2" color="error">
                        {articlesError}
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : articles.length === 0 ? (
                  <StyledTableRow>
                    <StyledTableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Este proveedor no tiene artículos pendientes por recibir
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ) : (
                  articles.map((article) => (
                    <StyledTableRow key={article.id}>
                      <ArticleNameCell>{article.name}</ArticleNameCell>
                      <StyledTableCell>{article.sku}</StyledTableCell>
                      <StyledTableCell>{article.orderNumber}</StyledTableCell>
                      <StyledTableCell>{article.quantity}</StyledTableCell>
                      <StyledTableCell>
                        <NumberInput
                          value={article.received}
                          onChange={(value) =>
                            handleQuantityChange(article.id, value)
                          }
                          min={0}
                          step={1}
                          width={80}
                          size="small"
                          disabled={!canEditQuantities}
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Stack spacing={2} flex="0 1 320px">
          <Stack direction="row" spacing={2}>
            <Stack>
              <Typography variant="h6">Facturas</Typography>
              <Typography variant="body2" color="text.secondary">
                Facturas pertenecientes a esta mercancía.
              </Typography>
            </Stack>
            {canManageInvoices && (
              <AddInvoiceButton onClick={() => setActivePanel("invoices")}>
                <Plus size={18} />
              </AddInvoiceButton>
            )}
          </Stack>

          {invoices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no vinculas ninguna factura a esta recepción de mercancía
            </Typography>
          ) : (
            <Stack spacing={1}>
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice.id}>
                  {canManageInvoices && (
                    <IconButton
                      onClick={() => handleRemoveInvoice(invoice.id)}
                    >
                      <CircleMinus size={16} />
                    </IconButton>
                  )}
                  <InvoiceCardInfo>
                    <InvoiceCardId>ID: {invoice.fiscalFolio}</InvoiceCardId>
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

              {invoicesExceedCost && (
                <InvoiceAmountAlert severity="warning" icon={false}>
                  <Typography variant="body2">
                    El monto total de las facturas es mayor al costo total de los
                    artículos
                  </Typography>
                </InvoiceAmountAlert>
              )}
            </Stack>
          )}
        </Stack>
      </ContentLayout>

      <InvoiceSelectorModal
        open={activePanel === "invoices"}
        onClose={() => setActivePanel(null)}
        onConfirm={handleAddInvoices}
        availableInvoices={receptionAvailableInvoices}
        linkedInvoiceIds={linkedInvoiceIds}
        loading={loadingAvailableInvoices}
      />

      <SendToCostingModal
        open={activePanel === "confirm"}
        onClose={() => {
          if (printProgress == null) {
            setActivePanel(null);
          }
        }}
        onConfirm={handleConfirmAction}
        variant={confirmVariant}
        totalArticles={totalArticles}
        totalLabels={totalLabels}
        extraLabels={extraLabels}
        hasQuantityMismatch={quantityMismatch}
        loading={confirmLoading && printProgress == null}
        printProgress={printProgress}
      />
    </PageContainer>
  );
}

function totalLabelsOf(items: ReceptionDetailItem[]): number {
  return items.reduce((sum, item) => sum + item.received, 0);
}
