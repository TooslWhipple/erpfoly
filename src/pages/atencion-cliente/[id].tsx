import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Divider,
  Grid,
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
import { Breadcrumbs, StatusChip, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { StatusChipVariant } from "@/components/StatusChip";
import {
  paymentTypeLabel,
  type InvoiceDetail,
  type InvoiceStatus,
} from "@/types/atencion-cliente.types";
import { getInvoiceDetail } from "@/services/customer-support.service";
import { CancelPurchaseModal } from "@/pages/clientes/compras/components";
import { usePermissions } from "@/hooks/usePermissions";
import { CUSTOMER_SUPPORT_INVOICES_DELETE } from "@/lib/permissions";
import type { SaleCancelBlockReason } from "@/types/cancelPurchase.types";
import { InvoiceActivityTab, InvoiceArticlesTab } from "./components";
import {
  MenuIconButton,
  MainContent,
  PaymentDot,
  PaymentDots,
  PaymentIndicator,
  SummaryCard,
  SummaryPanel,
  SummaryTotalRow,
  ContentLayout,
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
  const { hasPermission } = usePermissions();
  const canCancelSale = hasPermission(CUSTOMER_SUPPORT_INVOICES_DELETE);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articulos");
  const [headerMenuAnchor, setHeaderMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [cancelInvoiceOpen, setCancelInvoiceOpen] = useState(false);

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
      setInvoice(null);
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

  const invoiceCancellable = Boolean(invoice?.canCancel);
  const cancelTooltip = invoice?.cancelBlockReason
    ? invoice.cancelBlockReason === "IN_ROUTE"
      ? "No es posible cancelar: la mercancía va en ruta"
      : invoice.cancelBlockReason === "DELIVERED"
        ? "No es posible cancelar: ya fue entregada"
        : "No es posible cancelar esta factura"
    : invoiceCancellable
      ? ""
      : "No se puede cancelar esta factura";

  const handleBack = () => {
    router.push("/atencion-cliente");
  };

  const handleOpenCancelInvoice = () => {
    setHeaderMenuAnchor(null);
    setCancelInvoiceOpen(true);
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

  const isCreditSale = invoice.paymentType === "credito";

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Breadcrumbs
          items={breadcrumbs}
          showBackButton
          onBack={handleBack}
        />
        <StatusChip
          label={STATUS_LABELS[invoice.status]}
          variant={STATUS_VARIANTS[invoice.status]}
          size="small"
        />
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Factura</Typography>
          <Typography variant="h5">{invoice.invoiceNumber}</Typography>
          <Typography variant="body2" color="text.secondary">Comprado el {invoice.purchaseDate}</Typography>
        </Stack>
        <MenuIconButton
          size="small"
          aria-label="Opciones de la factura"
          onClick={(event) => setHeaderMenuAnchor(event.currentTarget)}
          disabled={invoice.status === "cancelado"}>
          <MoreVertical size={18} />
        </MenuIconButton>
        <Menu
          anchorEl={headerMenuAnchor}
          open={Boolean(headerMenuAnchor)}
          onClose={() => setHeaderMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}>
          <Tooltip
            title={cancelTooltip}
            placement="left">
            <span>
              <MenuItem
                onClick={handleOpenCancelInvoice}
                disabled={!invoiceCancellable || !canCancelSale}
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
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Grid container spacing={3} flexWrap="wrap">
          <Grid size={{ xs: 'auto' }}>
            <Typography variant="body2" color="text.secondary">Tipo de venta</Typography>
            <Typography variant="body1">{paymentTypeLabel(invoice.paymentType)}</Typography>
          </Grid>
          <Grid size={{ xs: 'auto' }}>
            <Typography variant="body2" color="text.secondary">Costo inicial</Typography>
            <Typography variant="body1">{formatCurrency(invoice.initialCost)}</Typography>
          </Grid>
          <Grid size={{ xs: 'auto' }}>
            <Typography variant="body2" color="text.secondary">Total abonos</Typography>
            <Typography variant="body1">{formatCurrency(invoice.totalPayments)}</Typography>
          </Grid>
          {isCreditSale ? (
            <>
              <Grid size={{ xs: 'auto' }}>
                <Typography variant="body2" color="text.secondary">Resta</Typography>
                <Typography variant="body1">{formatCurrency(invoice.remaining)}</Typography>
              </Grid>
              <Grid size={{ xs: 'auto' }}>
                <Typography variant="body2" color="text.secondary">Fecha de pago</Typography>
                <Typography variant="body1">{invoice.paymentDate}</Typography>
              </Grid>
              <Grid size={{ xs: 'auto' }}>
                <Typography variant="body2" color="text.secondary">Próx. Pago</Typography>
                <Typography variant="body1">{formatCurrency(invoice.nextPayment)}</Typography>
              </Grid>
            </>
          ) : null}
        </Grid>
        {isCreditSale ? (
          <PaymentIndicator>
            <PaymentDots>
              {
                Array.from({ length: invoice.totalPaymentsCount }).map(
                  (_, index) => (
                    <PaymentDot
                      key={index}
                      active={index < invoice.currentPayment}
                    />
                  )
                )
              }
            </PaymentDots>
            <Typography variant="body2" color="text.secondary">{invoice.currentPayment} de {invoice.totalPaymentsCount} pagos</Typography>
          </PaymentIndicator>
        ) : null}
      </Stack>

      <Divider />


      <TabFilters
        tabs={INVOICE_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ContentLayout>
        <MainContent>
          {
            activeTab === "actividad" &&
            <InvoiceActivityTab activities={invoice.activities} />
          }

          {
            activeTab === "articulos" &&
            <InvoiceArticlesTab
              invoice={invoice}
              onRefresh={() => {
                if (typeof id === "string") {
                  void loadInvoice(id);
                }
              }}
              onRequestCancelInvoice={handleOpenCancelInvoice}
            />
          }
        </MainContent>

        <SummaryPanel>
          <SummaryCard>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Resumen</Typography>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={500}>Subtotal sin IVA</Typography>
              <Typography variant="body1">{formatCurrency(invoice.summary.subtotalWithoutTax)}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={500}>IVA</Typography>
              <Typography variant="body1">{formatCurrency(invoice.summary.tax)}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={500}>Importe con IVA</Typography>
              <Typography variant="body1">{formatCurrency(invoice.summary.amountWithTax)}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={500}>Impuesto Suntuario</Typography>
              <Typography variant="body1">{formatCurrency(invoice.summary.luxuryTax)}</Typography>
            </Stack>
            <SummaryTotalRow>
              <Typography variant="body1" fontWeight={600}>Total</Typography>
              <Typography variant="body1" fontWeight={600}>{formatCurrency(invoice.summary.total)}</Typography>
            </SummaryTotalRow>
          </SummaryCard>
        </SummaryPanel>
      </ContentLayout>

      {invoice.customerId ? (
        <CancelPurchaseModal
          open={cancelInvoiceOpen}
          clientId={Number(invoice.customerId)}
          saleId={Number(invoice.id)}
          totalPaid={invoice.totalPayments}
          blockReason={
            (invoice.cancelBlockReason as SaleCancelBlockReason | null) ?? null
          }
          onClose={() => setCancelInvoiceOpen(false)}
          onSuccess={() => {
            setCancelInvoiceOpen(false);
            void loadInvoice(invoice.id);
          }}
        />
      ) : null}
    </Stack>
  );
}
