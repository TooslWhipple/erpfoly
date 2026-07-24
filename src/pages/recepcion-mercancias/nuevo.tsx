import { useMemo, useState } from "react";
import {
  IconButton,
  Stack,
  TableBody,
  TableRow,
  Typography,
} from "@mui/material";
import { CircleMinus, Plus } from "lucide-react";
import numeral from "numeral";
import { Breadcrumbs, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { NumberInput } from "@/components/Folypuntos";
import { SendToCostingModal } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import type { ReceptionConfirmVariant } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import { AddInvoicesModal } from "@/components/ReceptionOrdersModal/AddInvoicesModal";
import type {
  ReceptionArticle,
  ReceptionDetailStatus,
  ReceptionInvoice,
} from "@/types/recepcion-mercancias.types";
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
  AddInvoiceButton,
  InvoiceCard,
  InvoiceCardInfo,
  InvoiceCardId,
  InvoiceCardDate,
  InvoiceCardAmount,
  InvoiceTotalCard,
  InvoiceAmountAlert,
  Table
} from "@/styles/recepcion-mercancias/nuevo.styles";

type ActivePanel = "invoices" | "confirm" | null;

const DUMMY_ARTICLES: ReceptionArticle[] = [
  {
    id: "1",
    name: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
    sku: "04ET-123456",
    orderNumber: "19722",
    quantity: 6,
    received: 0,
    unitCost: 13106.78,
  },
  {
    id: "2",
    name: "Secadora Mabe 20kg SMG26N5MNBABO Gris",
    sku: "04ET-123457",
    orderNumber: "19722",
    quantity: 4,
    received: 0,
    unitCost: 13106.78,
  },
  {
    id: "3",
    name: "Lavadora Mabe 18kg LMA78120WBABO",
    sku: "04ET-789012",
    orderNumber: "19988",
    quantity: 12,
    received: 0,
    unitCost: 9800,
  },
  {
    id: "4",
    name: "Refrigerador Mabe 19 pies RMS1951XMXX",
    sku: "04ET-345678",
    orderNumber: "19988",
    quantity: 3,
    received: 0,
    unitCost: 18500,
  },
  {
    id: "5",
    name: "Estufa Mabe 6 quemadores EM7660CFIS",
    sku: "04ET-234567",
    orderNumber: "19988",
    quantity: 6,
    received: 0,
    unitCost: 7200,
  },
  {
    id: "6",
    name: "Lavavajillas Mabe 14 servicios MLV1460SS",
    sku: "04ET-456789",
    orderNumber: "19988",
    quantity: 4,
    received: 0,
    unitCost: 8900,
  },
  {
    id: "7",
    name: "Horno Empotrable Mabe HM5050EI",
    sku: "04ET-567890",
    orderNumber: "19988",
    quantity: 4,
    received: 0,
    unitCost: 6500,
  },
  {
    id: "8",
    name: "Campana Extractora Mabe CME6020IS",
    sku: "04ET-678901",
    orderNumber: "19988",
    quantity: 8,
    received: 0,
    unitCost: 4100,
  },
];

function calculateProgress(articles: ReceptionArticle[]): number {
  if (articles.length === 0) return 0;
  const totalQuantity = articles.reduce((sum, article) => sum + article.quantity, 0);
  const totalReceived = articles.reduce((sum, article) => sum + article.received, 0);
  if (totalQuantity === 0) return 0;
  return Math.round((totalReceived / totalQuantity) * 100);
}

function getTotalArticles(articles: ReceptionArticle[]): number {
  return articles.reduce((sum, article) => sum + article.received, 0);
}

function getTotalLabels(articles: ReceptionArticle[]): number {
  return getTotalArticles(articles);
}

function getArticlesCostTotal(articles: ReceptionArticle[]): number {
  return articles.reduce(
    (sum, article) => sum + article.received * (article.unitCost ?? 0),
    0,
  );
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
      return extraLabels > 0 ? "Guardar cambios" : "Enviar a costeo";
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

export default function NuevaRecepcion() {
  const [articles, setArticles] = useState<ReceptionArticle[]>(DUMMY_ARTICLES);
  const [invoices, setInvoices] = useState<ReceptionInvoice[]>([]);
  const [status, setStatus] = useState<ReceptionDetailStatus>("draft");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [printProgress, setPrintProgress] = useState<number | null>(null);
  const [baselineLabels, setBaselineLabels] = useState(0);

  const progress = calculateProgress(articles);
  const totalArticles = getTotalArticles(articles);
  const totalLabels = getTotalLabels(articles);
  const extraLabels = Math.max(0, totalLabels - baselineLabels);
  const articlesCost = getArticlesCostTotal(articles);
  const invoicesTotal = getInvoicesTotal(invoices);
  const invoicesExceedCost = invoices.length > 0 && invoicesTotal > articlesCost;
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

  const supplierName = "Mirage - Norage S.A. de C.V.";
  const orderDate = "2025-06-01";
  const deliveryDate = "2025-06-08";
  const branch = "Bodega Sucursal Matriz";

  const handleQuantityChange = (articleId: string, newQuantity: number) => {
    if (!canEditQuantities) return;
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
            ...article,
            received: Math.min(Math.max(0, newQuantity), article.quantity),
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

  const handleConfirmAction = async (_reason?: string) => {
    setConfirmLoading(true);
    try {
      if (status === "draft" || (status === "pre_captured" && extraLabels > 0)) {
        await simulatePrintProgress();
        setBaselineLabels(totalLabels);
        setStatus("pre_captured");
        setActivePanel(null);
        return;
      }

      if (status === "pre_captured") {
        await new Promise((resolve) => setTimeout(resolve, 700));
        setStatus("in_costing");
        setActivePanel(null);
        return;
      }
    } catch (err) {
      console.error("[NuevaRecepcion] Error confirming action:", err);
    } finally {
      setConfirmLoading(false);
      setPrintProgress(null);
    }
  };

  const handleAddInvoices = async (selected: ReceptionInvoice[]) => {
    setInvoices((prev) => [...prev, ...selected]);
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
              label: "Nuevo",
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
            <DeliveryDate>
              Entrega: {formatDate(deliveryDate, "dateLong")}
            </DeliveryDate>
          </BranchInfo>
        </TransferInfo>
      </HeaderSection>

      <ProgressSection>
        <ProgressBarContainer>
          <StyledProgressBar variant="determinate" value={progress} />
        </ProgressBarContainer>
      </ProgressSection>

      <ContentLayout>
        <Stack spacing={2} flex="1 1 0">
          <Stack>
            <Typography variant="h6">Artículos recibidos</Typography>
            <Typography variant="body2" color="text.secondary">Confirma la cantidad de artículos recibidos.</Typography>
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
                {articles.map((article) => (
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
                        max={article.quantity}
                        step={1}
                        width={80}
                        size="small"
                        disabled={!canEditQuantities}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Stack spacing={2} flex="0 1 320px">
          <Stack direction="row" spacing={2}>
            <Stack>
              <Typography variant="h6">Facturas</Typography>
              <Typography variant="body2" color="text.secondary">Facturas pertenecientes a esta mercancía.</Typography>
            </Stack>
            {
              canManageInvoices && (
                <AddInvoiceButton
                  onClick={() => setActivePanel("invoices")}>
                  <Plus size={18} />
                </AddInvoiceButton>
              )
            }
          </Stack>

          {
            invoices.length === 0 ?
              <Typography variant="body2" color="text.secondary">Aún no vinculas ninguna factura a esta recepción de mercancía</Typography>
              :
              <Stack spacing={1}>
                {
                  invoices.map((invoice) => (
                    <InvoiceCard key={invoice.id}>
                      {
                        canManageInvoices &&
                        <IconButton
                          onClick={() => handleRemoveInvoice(invoice.id)}>
                          <CircleMinus size={16} />
                        </IconButton>
                      }
                      <InvoiceCardInfo>
                        <InvoiceCardId>ID: {invoice.fiscalFolio}</InvoiceCardId>
                        <InvoiceCardDate>{invoice.date}</InvoiceCardDate>
                      </InvoiceCardInfo>
                      <InvoiceCardAmount>
                        {numeral(invoice.amount).format("$0,0.00")}
                      </InvoiceCardAmount>
                    </InvoiceCard>
                  ))
                }

                <InvoiceTotalCard>
                  <Typography variant="body1" fontWeight={500}>Total</Typography>
                  <Typography variant="subtitle1">{numeral(invoicesTotal).format("$0,0.00")}</Typography>
                </InvoiceTotalCard>

                {
                  invoicesExceedCost &&
                  <InvoiceAmountAlert severity="warning" icon={false}>
                    <Typography variant="body2">
                      El monto total de las facturas es mayor al costo total de los artículos
                    </Typography>
                  </InvoiceAmountAlert>
                }
              </Stack>
          }
        </Stack>
      </ContentLayout>

      <AddInvoicesModal
        open={activePanel === "invoices"}
        onClose={() => setActivePanel(null)}
        onConfirm={handleAddInvoices}
        linkedInvoiceIds={linkedInvoiceIds}
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
