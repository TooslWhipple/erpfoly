import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Ban, MoreVertical } from "lucide-react";
import numeral from "numeral";
import { Breadcrumbs, ConfirmModal, StatusChip, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { StatusChipVariant } from "@/components/StatusChip";
import type {
  InvoiceDetail,
  InvoiceStatus,
} from "@/types/atencion-cliente.types";
import { canCancelInvoice } from "@/types/atencion-cliente.types";
import {
  cancelInvoice,
  getInvoiceDetail,
} from "@/data/atencion-cliente.mockData";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { InvoiceArticlesTab } from "./components";
import {
  DetailPageContainer,
  EmptyState,
  FinancialItem,
  FinancialLabel,
  FinancialSummary,
  FinancialValue,
  HeaderRightSection,
  HeaderSection,
  InvoiceNumber,
  MainContent,
  PaymentDot,
  PaymentDots,
  PaymentIndicator,
  PaymentText,
  PurchaseDate,
  SummaryCard,
  SummaryLabel,
  SummaryPanel,
  SummaryRow,
  SummaryTitle,
  SummaryTotalLabel,
  SummaryTotalRow,
  SummaryTotalValue,
  SummaryValue,
  TitleSection,
  ContentLayout,
  TopBar,
} from "@/styles/atencion-cliente.styles";

const INVOICE_TABS = [
  { value: "actividad", label: "Actividad" },
  { value: "articulos", label: "Artículos" },
];

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  activo: "Activo",
  cancelado: "Cancelado",
  pagado: "Pagado",
};

const STATUS_VARIANTS: Record<InvoiceStatus, StatusChipVariant> = {
  activo: "success",
  cancelado: "error",
  pagado: "info",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articulos");
  const [headerMenuAnchor, setHeaderMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [cancelInvoiceOpen, setCancelInvoiceOpen] = useState(false);
  const [cancelInvoiceLoading, setCancelInvoiceLoading] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      void loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const data = await getInvoiceDetail(invoiceId);
      setInvoice(data);
    } catch (err) {
      console.error("[InvoiceDetail] Error loading invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: "Atención al cliente", href: "/atencion-cliente" },
      { label: invoice?.customerName || "..." },
      { label: invoice?.customerId || "..." },
    ],
    [invoice?.customerId, invoice?.customerName],
  );

  const invoiceCancellable = invoice
    ? canCancelInvoice(invoice.articles)
    : false;

  const handleBack = () => {
    router.push("/atencion-cliente");
  };

  const handleOpenCancelInvoice = () => {
    setHeaderMenuAnchor(null);
    setCancelInvoiceOpen(true);
  };

  const handleConfirmCancelInvoice = async () => {
    if (!invoice) return;
    setCancelInvoiceLoading(true);
    try {
      await cancelInvoice(invoice.id);
      showSuccess("La factura se canceló correctamente.");
      setCancelInvoiceOpen(false);
      await loadInvoice(invoice.id);
    } catch (error) {
      console.error("[InvoiceDetail] Error canceling invoice:", error);
      showError(
        error instanceof Error
          ? error.message
          : "No se pudo cancelar la factura.",
      );
    } finally {
      setCancelInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width="50%" height={32} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  if (!invoice) {
    return (
      <Stack spacing={3}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={handleBack}
        />
        <Typography>Factura no encontrada</Typography>
      </Stack>
    );
  }

  return (
    <DetailPageContainer>
      <TopBar>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={handleBack}
        />
        <HeaderRightSection>
          <StatusChip
            label={STATUS_LABELS[invoice.status]}
            variant={STATUS_VARIANTS[invoice.status]}
            size="small"
          />
        </HeaderRightSection>
      </TopBar>

      <HeaderSection>
        <TitleSection>
          <InvoiceNumber>Factura {invoice.invoiceNumber}</InvoiceNumber>
          <PurchaseDate>Comprado el {invoice.purchaseDate}</PurchaseDate>
        </TitleSection>
        <IconButton
          size="small"
          aria-label="Opciones de la factura"
          onClick={(event) => setHeaderMenuAnchor(event.currentTarget)}
          disabled={invoice.status === "cancelado"}
        >
          <MoreVertical size={18} />
        </IconButton>
        <Menu
          anchorEl={headerMenuAnchor}
          open={Boolean(headerMenuAnchor)}
          onClose={() => setHeaderMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Tooltip
            title={
              invoiceCancellable
                ? ""
                : "Cancela todos los artículos primero"
            }
            placement="left"
          >
            <span>
              <MenuItem
                onClick={handleOpenCancelInvoice}
                disabled={!invoiceCancellable}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <Ban size={16} />
                </ListItemIcon>
                <ListItemText>Cancelar factura</ListItemText>
              </MenuItem>
            </span>
          </Tooltip>
        </Menu>
      </HeaderSection>

      <FinancialSummary>
        <FinancialItem>
          <FinancialLabel>Costo inicial</FinancialLabel>
          <FinancialValue>{formatCurrency(invoice.initialCost)}</FinancialValue>
        </FinancialItem>
        <FinancialItem>
          <FinancialLabel>Total abonos</FinancialLabel>
          <FinancialValue>
            {formatCurrency(invoice.totalPayments)}
          </FinancialValue>
        </FinancialItem>
        <FinancialItem>
          <FinancialLabel>Resta</FinancialLabel>
          <FinancialValue>{formatCurrency(invoice.remaining)}</FinancialValue>
        </FinancialItem>
        <FinancialItem>
          <FinancialLabel>Fecha de pago</FinancialLabel>
          <FinancialValue>{invoice.paymentDate}</FinancialValue>
        </FinancialItem>
        <FinancialItem>
          <FinancialLabel>Próx. Pago</FinancialLabel>
          <FinancialValue>
            {formatCurrency(invoice.nextPayment)}
          </FinancialValue>
        </FinancialItem>

        <PaymentIndicator>
          <PaymentDots>
            {Array.from({ length: invoice.totalPaymentsCount }).map(
              (_, index) => (
                <PaymentDot
                  key={index}
                  active={index < invoice.currentPayment}
                />
              ),
            )}
          </PaymentDots>
          <PaymentText>
            {invoice.currentPayment} de {invoice.totalPaymentsCount} pagos
          </PaymentText>
        </PaymentIndicator>
      </FinancialSummary>

      <TabFilters
        tabs={INVOICE_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ContentLayout>
        <MainContent>
          {activeTab === "actividad" && (
            <>
              {invoice.activities.length === 0 ? (
                <EmptyState>No hay actividad reciente</EmptyState>
              ) : (
                <Stack spacing={1.5}>
                  {invoice.activities.map((activity) => (
                    <EmptyState key={activity.id}>
                      {activity.description}
                    </EmptyState>
                  ))}
                </Stack>
              )}
            </>
          )}

          {activeTab === "articulos" && (
            <InvoiceArticlesTab
              invoice={invoice}
              onRefresh={() => {
                if (typeof id === "string") {
                  void loadInvoice(id);
                }
              }}
              onRequestCancelInvoice={handleOpenCancelInvoice}
            />
          )}
        </MainContent>

        <SummaryPanel>
          <SummaryCard>
            <SummaryTitle>Resumen</SummaryTitle>
            <SummaryRow>
              <SummaryLabel>Subtotal sin IVA</SummaryLabel>
              <SummaryValue>
                {formatCurrency(invoice.summary.subtotalWithoutTax)}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>IVA</SummaryLabel>
              <SummaryValue>
                {formatCurrency(invoice.summary.tax)}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Importe con IVA</SummaryLabel>
              <SummaryValue>
                {formatCurrency(invoice.summary.amountWithTax)}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Impuesto Suntuario</SummaryLabel>
              <SummaryValue>
                {formatCurrency(invoice.summary.luxuryTax)}
              </SummaryValue>
            </SummaryRow>
            <SummaryTotalRow>
              <SummaryTotalLabel>Total</SummaryTotalLabel>
              <SummaryTotalValue>
                {formatCurrency(invoice.summary.total)}
              </SummaryTotalValue>
            </SummaryTotalRow>
          </SummaryCard>
        </SummaryPanel>
      </ContentLayout>

      <ConfirmModal
        open={cancelInvoiceOpen}
        onClose={() => !cancelInvoiceLoading && setCancelInvoiceOpen(false)}
        onConfirm={handleConfirmCancelInvoice}
        title="Cancelar factura"
        itemName={`Factura ${invoice.invoiceNumber}`}
        confirmLabel="Cancelar factura"
        type="error"
        loading={cancelInvoiceLoading}
      />
    </DetailPageContainer>
  );
}
