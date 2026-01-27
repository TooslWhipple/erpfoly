import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Skeleton } from "@mui/material";
import {
    Edit as EditIcon,
    Download as DownloadIcon,
    OpenInNew as OpenInNewIcon,
    Public as PublicIcon,
} from "@mui/icons-material";
import numeral from "numeral";
import { MainLayout, Breadcrumbs } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
    PageContainer,
    MainContent,
    SidePanel,
    HeaderSection,
    TitleSection,
    TitleRow,
    PageTitle,
    DateText,
    ActionsSection,
    ActionButton,
    StatusChip,
    SummaryCard,
    SummaryRow,
    SummaryLabel,
    SummaryValue,
    TotalRow,
    TotalLabel,
    TotalValue,
    ItemsList,
    ItemCard,
    ItemHeader,
    ItemImage,
    ItemInfo,
    ItemCode,
    ItemName,
    ItemPriceRow,
    PriceColumn,
    PriceLabel,
    PriceValue,
    ComparisonRow,
    InternetPriceTag,
    ComparisonLink,
    OrderStatus,
} from "@/styles/pedidos/styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PriceComparison {
    store: string;
    price: number;
    url?: string;
}

interface OrderItem {
    id: number;
    code: string;
    name: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    total: number;
    averageInternetPrice?: number;
    priceComparisons?: PriceComparison[];
}

interface OrderDetail {
    id: number;
    folio: string;
    supplier: string;
    createdAt: string;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    total: number;
    items: OrderItem[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_ORDER: OrderDetail = {
    id: 239392,
    folio: "239392",
    supplier: "Mabe S.A. de C.V.",
    createdAt: "15 de Julio, 2025",
    status: "received",
    subtotal: 291449.40,
    tax: 35901.56,
    total: 327400.96,
    items: [
        {
            id: 1,
            code: "04ET-123456",
            name: "Secadora Whirlpool 18 kg Carga Superior Blanca Eléctrica",
            unitPrice: 9349.00,
            quantity: 12,
            total: 112188.00,
            averageInternetPrice: 20944.45,
            priceComparisons: [
                { store: "Liverpool", price: 21898.50, url: "#" },
                { store: "Walmart", price: 19990.40, url: "#" },
            ],
        },
        {
            id: 2,
            code: "04ET-123456",
            name: "Secadora Whirlpool 26 kg Carga Superior Blanca",
            unitPrice: 15122.50,
            quantity: 8,
            total: 120980.00,
            averageInternetPrice: 26890.50,
            priceComparisons: [
                { store: "Liverpool", price: 26890.50, url: "#" },
                { store: "Walmart", price: 26890.50, url: "#" },
                { store: "Coppel", price: 26890.50, url: "#" },
            ],
        },
    ],
};

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getOrderDetail(id: string): Promise<OrderDetail> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...DUMMY_ORDER, id: parseInt(id), folio: id };
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
    return numeral(value).format("$0,0.00");
}

function getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        pending: "Por recibir",
        in_progress: "En curso",
        received: "Recibido",
    };
    return labels[status];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PedidoDetalle() {
    const router = useRouter();
    const { id } = router.query;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && typeof id === "string") {
            loadOrder(id);
        }
    }, [id]);

    const loadOrder = async (orderId: string) => {
        setLoading(true);
        try {
            const data = await getOrderDetail(orderId);
            setOrder(data);
        } catch (err) {
            console.error("[PedidoDetalle] Error loading order:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/pedidos/${id}/editar`);
    };

    const handleDownloadPdf = () => {
        console.log("[PedidoDetalle] Download PDF");
    };

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { label: "Pedidos", href: "/pedidos" },
        { label: order?.supplier || "...", href: "/pedidos" },
        { label: `Pedido ${order?.folio || "..."}` },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/pedidos")} />
                <HeaderSection>
                    <TitleSection>
                        <Skeleton variant="text" width={200} height={40} />
                        <Skeleton variant="text" width={150} height={20} />
                    </TitleSection>
                </HeaderSection>
                <PageContainer>
                    <MainContent>
                        {[1, 2].map((i) => (
                            <ItemCard key={i}>
                                <Skeleton variant="rectangular" height={120} />
                            </ItemCard>
                        ))}
                    </MainContent>
                    <SidePanel>
                        <Skeleton variant="rectangular" height={150} />
                    </SidePanel>
                </PageContainer>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <Typography>Pedido no encontrado</Typography>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Breadcrumbs items={breadcrumbs} showBackButton onBack={() => router.push("/pedidos")} />

            <HeaderSection>
                <TitleSection>
                    <TitleRow>
                        <PageTitle>Pedido {order.folio}</PageTitle>
                        <StatusChip
                            label={getStatusLabel(order.status)}
                            statusType={order.status}
                            size="small"
                        />
                    </TitleRow>
                    <DateText>Fecha de alta: {order.createdAt}</DateText>
                </TitleSection>

                <ActionsSection>
                    <ActionButton
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                    >
                        Editar
                    </ActionButton>
                    <ActionButton
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadPdf}
                    >
                        Descargar PDF
                    </ActionButton>
                </ActionsSection>
            </HeaderSection>

            <PageContainer>
                <MainContent>
                    <ItemsList>
                        {order.items.map((item) => (
                            <ItemCard key={item.id}>
                                <ItemHeader>
                                    <ItemImage />
                                    <ItemInfo>
                                        <ItemCode>{item.code}</ItemCode>
                                        <ItemName>{item.name}</ItemName>
                                    </ItemInfo>
                                </ItemHeader>

                                <ItemPriceRow>
                                    <PriceColumn>
                                        <PriceLabel>Precio unitario</PriceLabel>
                                        <PriceValue>{formatCurrency(item.unitPrice)}</PriceValue>
                                    </PriceColumn>
                                    <PriceColumn>
                                        <PriceLabel>Cantidad</PriceLabel>
                                        <PriceValue>{item.quantity}</PriceValue>
                                    </PriceColumn>
                                    <PriceColumn>
                                        <PriceLabel>Total</PriceLabel>
                                        <PriceValue>{formatCurrency(item.total)}</PriceValue>
                                    </PriceColumn>
                                </ItemPriceRow>

                                {(item.averageInternetPrice || item.priceComparisons) && (
                                    <ComparisonRow>
                                        {item.averageInternetPrice && (
                                            <InternetPriceTag>
                                                <PublicIcon sx={{ fontSize: 16 }} />
                                                Precio en internet prom: {formatCurrency(item.averageInternetPrice)}
                                            </InternetPriceTag>
                                        )}
                                        {item.priceComparisons?.map((comp, idx) => (
                                            <ComparisonLink key={idx} onClick={() => comp.url && window.open(comp.url, "_blank")}>
                                                {comp.store}: {formatCurrency(comp.price)}
                                                <OpenInNewIcon sx={{ fontSize: 14 }} />
                                            </ComparisonLink>
                                        ))}
                                    </ComparisonRow>
                                )}
                            </ItemCard>
                        ))}
                    </ItemsList>
                </MainContent>

                <SidePanel>
                    <SummaryCard>
                        <SummaryRow>
                            <SummaryLabel>Subtotal</SummaryLabel>
                            <SummaryValue>{formatCurrency(order.subtotal)}</SummaryValue>
                        </SummaryRow>
                        <SummaryRow>
                            <SummaryLabel>IVA</SummaryLabel>
                            <SummaryValue>{formatCurrency(order.tax)}</SummaryValue>
                        </SummaryRow>
                        <TotalRow>
                            <TotalLabel>Total:</TotalLabel>
                            <TotalValue>{formatCurrency(order.total)}</TotalValue>
                        </TotalRow>
                    </SummaryCard>
                </SidePanel>
            </PageContainer>
        </MainLayout>
    );
}
