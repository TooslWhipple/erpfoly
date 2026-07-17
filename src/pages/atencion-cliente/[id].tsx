import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { IconButton, Menu, MenuItem, Skeleton, Stack, Typography } from "@mui/material";
import { MoreVertical } from "lucide-react";
import numeral from "numeral";
import { Breadcrumbs, StatusChip, TabFilters } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { StatusChipVariant } from "@/components/StatusChip";
import type {
  InvoiceDetail,
  InvoiceStatus,
} from "@/types/atencion-cliente.types";
import { getInvoiceDetail } from "@/data/atencion-cliente.mockData";
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
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articulos");
  const [headerMenuAnchor, setHeaderMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  useEffect(() => {
    if (id && typeof id === "string") {
      loadInvoice(id);
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

  const handleBack = () => {
    router.push("/atencion-cliente");
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
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        spacing={2}
      >
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
          <IconButton
            size="small"
            aria-label="Opciones de la factura"
            onClick={(event) => setHeaderMenuAnchor(event.currentTarget)}
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
            <MenuItem disabled>Más opciones próximamente</MenuItem>
          </Menu>
        </HeaderRightSection>
      </Stack>

      <HeaderSection>
        <TitleSection>
          <InvoiceNumber>Factura {invoice.invoiceNumber}</InvoiceNumber>
          <PurchaseDate>Comprado el {invoice.purchaseDate}</PurchaseDate>
        </TitleSection>
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
            <InvoiceArticlesTab invoice={invoice} />
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
    </DetailPageContainer>
  );
}
