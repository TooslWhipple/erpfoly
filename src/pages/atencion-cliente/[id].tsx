import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Skeleton, IconButton, Typography } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import numeral from "numeral";
import { MainLayout, Breadcrumbs, Tabs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { InvoiceDetail } from "@/types/atencion-cliente.types";
import { getInvoiceDetail } from "@/data/atencion-cliente.mockData";
import {
    DetailPageContainer,
    HeaderSection,
    TitleSection,
    InvoiceTitle,
    InvoiceNumber,
    PurchaseDate,
    HeaderRightSection,
    StatusChip,
    MoreOptionsButton,
    FinancialSummary,
    FinancialItem,
    FinancialLabel,
    FinancialValue,
    PaymentIndicator,
    PaymentDots,
    PaymentDot,
    PaymentText,
    TabsContainer,
    TabContent,
    EmptyState,
    ArticlesList,
    ArticleCard,
    ArticleHeader,
    ArticleInfo,
    ArticleCode,
    ArticleDescription,
    ArticleStatusChip,
    ArticleDetails,
    ArticleDetailItem,
    ArticleDetailLabel,
    ArticleDetailValue,
    ContentLayout,
    MainContent,
    SummaryPanel,
    SummaryCard,
    SummaryTitle,
    SummaryRow,
    SummaryLabel,
    SummaryValue,
    SummaryTotalRow,
    SummaryTotalLabel,
    SummaryTotalValue,
} from "@/styles/atencion-cliente.styles";

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
    return numeral(value).format("$0,0.00");
}

function getStatusLabel(status: "activo" | "cancelado" | "pagado"): string {
    const labels = {
        activo: "Activo",
        cancelado: "Cancelado",
        pagado: "Pagado",
    };
    return labels[status];
}

function getArticleStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        entregado: "Entregado",
        reparacion: "Reparación",
        pendiente: "Pendiente",
        cancelado: "Cancelado",
    };
    return labels[status] || status;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvoiceDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("actividad");

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

    const handleMoreOptions = () => {
        console.log("[InvoiceDetail] More options clicked");
        // TODO: Open menu with options
    };

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Clientes", href: "/clientes" },
        { label: invoice?.customerName || "...", href: `/clientes/${invoice?.customerId}` },
        { label: invoice?.customerId || "..." },
    ];

    // Tabs configuration
    const tabs = [
        { value: "actividad", label: "Actividad" },
        { value: "articulos", label: "Artículos" },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/atencion-cliente")} />
                <DetailPageContainer>
                    <HeaderSection>
                        <TitleSection>
                            <Skeleton variant="text" width={200} height={32} />
                            <Skeleton variant="text" width={300} height={48} />
                            <Skeleton variant="text" width={200} height={20} />
                        </TitleSection>
                    </HeaderSection>
                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mt: 3 }} />
                </DetailPageContainer>
            </MainLayout>
        );
    }

    if (!invoice) {
        return (
            <MainLayout>
                <Typography>Factura no encontrada</Typography>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/atencion-cliente")} />

            <DetailPageContainer>
                <HeaderSection>
                    <TitleSection>
                        <InvoiceTitle>Factura</InvoiceTitle>
                        <InvoiceNumber>{invoice.invoiceNumber}</InvoiceNumber>
                        <PurchaseDate>Comprado el {invoice.purchaseDate}</PurchaseDate>
                    </TitleSection>

                    <HeaderRightSection>
                        <StatusChip
                            label={getStatusLabel(invoice.status)}
                            statusType={invoice.status}
                            size="small"
                        />
                        <MoreOptionsButton onClick={handleMoreOptions} size="small">
                            <MoreVertIcon fontSize="small" />
                        </MoreOptionsButton>
                    </HeaderRightSection>
                </HeaderSection>

                <FinancialSummary>
                    <FinancialItem>
                        <FinancialLabel>Costo inicial</FinancialLabel>
                        <FinancialValue>{formatCurrency(invoice.initialCost)}</FinancialValue>
                    </FinancialItem>
                    <FinancialItem>
                        <FinancialLabel>Total abonos</FinancialLabel>
                        <FinancialValue>{formatCurrency(invoice.totalPayments)}</FinancialValue>
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
                        <FinancialValue>{formatCurrency(invoice.nextPayment)}</FinancialValue>
                    </FinancialItem>

                    <PaymentIndicator>
                        <PaymentDots>
                            {Array.from({ length: invoice.totalPaymentsCount }).map((_, index) => (
                                <PaymentDot key={index} active={index < invoice.currentPayment} />
                            ))}
                        </PaymentDots>
                        <PaymentText>
                            {invoice.currentPayment} de {invoice.totalPaymentsCount} pagos
                        </PaymentText>
                    </PaymentIndicator>
                </FinancialSummary>

                <TabsContainer>
                    <Tabs
                        tabs={tabs}
                        value={activeTab}
                        onChange={(value) => setActiveTab(value)}
                        withBorder={true}
                    />
                </TabsContainer>

                <ContentLayout>
                    <MainContent>
                        <TabContent>
                            {activeTab === "actividad" && (
                                <>
                                    {invoice.activities.length === 0 ? (
                                        <EmptyState>No hay actividad reciente</EmptyState>
                                    ) : (
                                        <Box>
                                            {/* TODO: Render activities when available */}
                                            {invoice.activities.map((activity) => (
                                                <Box key={activity.id}>{activity.description}</Box>
                                            ))}
                                        </Box>
                                    )}
                                </>
                            )}

                            {activeTab === "articulos" && (
                                <ArticlesList>
                                    {invoice.articles.map((article) => (
                                        <ArticleCard key={article.id}>
                                            <ArticleHeader>
                                                <ArticleInfo>
                                                    <ArticleCode>{article.code}</ArticleCode>
                                                    <ArticleDescription>{article.description}</ArticleDescription>
                                                </ArticleInfo>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <ArticleStatusChip
                                                        label={getArticleStatusLabel(article.status)}
                                                        statusType={article.status}
                                                        size="small"
                                                    />
                                                    <IconButton size="small" sx={{ color: "#71717A" }}>
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </ArticleHeader>

                                            <ArticleDetails>
                                                <ArticleDetailItem>
                                                    <ArticleDetailLabel>Precio</ArticleDetailLabel>
                                                    <ArticleDetailValue>{formatCurrency(article.price)}</ArticleDetailValue>
                                                </ArticleDetailItem>
                                                <ArticleDetailItem>
                                                    <ArticleDetailLabel>Promociones</ArticleDetailLabel>
                                                    <ArticleDetailValue>{formatCurrency(article.promotions)}</ArticleDetailValue>
                                                </ArticleDetailItem>
                                                <ArticleDetailItem>
                                                    <ArticleDetailLabel>Total</ArticleDetailLabel>
                                                    <ArticleDetailValue>{formatCurrency(article.total)}</ArticleDetailValue>
                                                </ArticleDetailItem>
                                                <ArticleDetailItem>
                                                    <ArticleDetailLabel>Puntos</ArticleDetailLabel>
                                                    <ArticleDetailValue>{article.points}</ArticleDetailValue>
                                                </ArticleDetailItem>
                                            </ArticleDetails>
                                        </ArticleCard>
                                    ))}
                                </ArticlesList>
                            )}
                        </TabContent>
                    </MainContent>

                    <SummaryPanel>
                        <SummaryCard>
                            <SummaryTitle>Resumen</SummaryTitle>
                            <SummaryRow>
                                <SummaryLabel>Subtotal sin IVA</SummaryLabel>
                                <SummaryValue>{formatCurrency(invoice.summary.subtotalWithoutTax)}</SummaryValue>
                            </SummaryRow>
                            <SummaryRow>
                                <SummaryLabel>IVA</SummaryLabel>
                                <SummaryValue>{formatCurrency(invoice.summary.tax)}</SummaryValue>
                            </SummaryRow>
                            <SummaryRow>
                                <SummaryLabel>Importe con IVA</SummaryLabel>
                                <SummaryValue>{formatCurrency(invoice.summary.amountWithTax)}</SummaryValue>
                            </SummaryRow>
                            <SummaryRow>
                                <SummaryLabel>Impuesto Suntuario</SummaryLabel>
                                <SummaryValue>{formatCurrency(invoice.summary.luxuryTax)}</SummaryValue>
                            </SummaryRow>
                            <SummaryTotalRow>
                                <SummaryTotalLabel>Total</SummaryTotalLabel>
                                <SummaryTotalValue>{formatCurrency(invoice.summary.total)}</SummaryTotalValue>
                            </SummaryTotalRow>
                        </SummaryCard>
                    </SummaryPanel>
                </ContentLayout>
            </DetailPageContainer>
        </MainLayout>
    );
}
