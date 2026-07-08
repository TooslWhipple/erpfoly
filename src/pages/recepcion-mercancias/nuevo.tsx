import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Stack, Typography, Button, LinearProgress, Table, TableBody, TableHead, TableRow, TableCell } from "@mui/material";
import { Breadcrumbs } from "@/components";
import { NumberInput } from "@/components/Folypuntos";
import type { ReceptionArticle } from "@/types/recepcion-mercancias.types";
import { SendToCostingModal } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import { formatDate } from "@/utils/date";
import {
    PageContainer,
    HeaderSection,
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
    ContentSection,
    SectionTitle,
    SectionDescription,
    TableContainer,
    StyledTableHead,
    StyledTableRow,
    StyledTableCell,
    ArticleNameCell,
} from "@/styles/recepcion-mercancias/nuevo.styles";

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_ARTICLES: ReceptionArticle[] = [
    {
        id: "1",
        name: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
        sku: "04ET-123456",
        orderNumber: "19722",
        quantity: 6,
        received: 0,
    },
    {
        id: "2",
        name: "Secadora Mabe 20kg SMG26N5MNBABO Gris",
        sku: "04ET-123457",
        orderNumber: "19722",
        quantity: 4,
        received: 0,
    },
    {
        id: "3",
        name: "Lavadora Mabe 18kg LMA78120WBABO",
        sku: "04ET-789012",
        orderNumber: "19988",
        quantity: 12,
        received: 0,
    },
    {
        id: "4",
        name: "Refrigerador Mabe 19 pies RMS1951XMXX",
        sku: "04ET-345678",
        orderNumber: "19988",
        quantity: 3,
        received: 0,
    },
    {
        id: "5",
        name: "Estufa Mabe 6 quemadores EM7660CFIS",
        sku: "04ET-234567",
        orderNumber: "19988",
        quantity: 6,
        received: 0,
    },
    {
        id: "6",
        name: "Lavavajillas Mabe 14 servicios MLV1460SS",
        sku: "04ET-456789",
        orderNumber: "19988",
        quantity: 4,
        received: 0,
    },
    {
        id: "7",
        name: "Horno Empotrable Mabe HM5050EI",
        sku: "04ET-567890",
        orderNumber: "19988",
        quantity: 4,
        received: 0,
    },
    {
        id: "8",
        name: "Campana Extractora Mabe CME6020IS",
        sku: "04ET-678901",
        orderNumber: "19988",
        quantity: 8,
        received: 0,
    },
];

// ============================================================================
// HELPERS
// ============================================================================

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
    // Each received article needs a label
    return getTotalArticles(articles);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NuevaRecepcion() {
    const router = useRouter();
    const [articles, setArticles] = useState<ReceptionArticle[]>(DUMMY_ARTICLES);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Get order IDs from query params
    useEffect(() => {
        const orderIds = router.query.orderIds;
        if (orderIds && typeof orderIds === "string") {
            // TODO: Fetch articles based on selected orders
            // For now, we use dummy data
        }
    }, [router.query]);

    // Handle quantity change
    const handleQuantityChange = (articleId: string, newQuantity: number) => {
        setArticles((prev) =>
            prev.map((article) =>
                article.id === articleId
                    ? { ...article, received: Math.min(newQuantity, article.quantity) }
                    : article
            )
        );
    };

    // Handle save and print labels
    const handleSaveAndPrint = async () => {
        setLoading(true);
        try {
            // TODO: Implement API call to save reception
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setModalOpen(false);
            router.push("/recepcion-mercancias");
        } catch (err) {
            console.error("[NuevaRecepcion] Error saving:", err);
        } finally {
            setLoading(false);
        }
    };

    const progress = calculateProgress(articles);
    const totalArticles = getTotalArticles(articles);
    const totalLabels = getTotalLabels(articles);

    // Mock supplier and date data
    const supplierName = "Mabe -Norage S.A. de C.V.-";
    const orderDate = "2025-06-01";
    const deliveryDate = "2025-06-08";
    const branch = "Sucursal Matriz";

    return (
        <>
            <PageContainer>
                <Breadcrumbs
                    items={[
                        { label: "Recepción de mercancía", href: "/recepcion-mercancias" },
                        { label: "Nuevo" },
                    ]}
                    showBackButton={false}
                />

                <HeaderSection>
                    <SupplierInfo>
                        <SupplierName>{supplierName}</SupplierName>
                        <SupplierDate>{formatDate(orderDate, "dateLong")}</SupplierDate>
                    </SupplierInfo>

                    <BranchInfo>
                        <BranchName>{branch}</BranchName>
                        <DeliveryDate>Entrega: {formatDate(deliveryDate, "dateLong")}</DeliveryDate>
                    </BranchInfo>

                    <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={() => setModalOpen(true)}
                        disabled={totalArticles === 0}
                    >
                        Guardar e imprimir etiquetas
                    </ActionButton>
                </HeaderSection>

                <ProgressSection>
                    <ProgressBarContainer>
                        <StyledProgressBar variant="determinate" value={progress} />
                    </ProgressBarContainer>
                </ProgressSection>

                <ContentSection>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Box>
                            <SectionTitle>Artículos recibidos</SectionTitle>
                            <SectionDescription>
                                Confirma la cantidad de artículos recibidos.
                            </SectionDescription>
                        </Box>
                    </Stack>

                    {/* Table */}
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
                                                onChange={(value) => handleQuantityChange(article.id, value)}
                                                min={0}
                                                max={article.quantity}
                                                step={1}
                                                width={80}
                                                size="small"
                                            />
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </ContentSection>

                <SendToCostingModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleSaveAndPrint}
                    totalArticles={totalArticles}
                    totalLabels={totalLabels}
                    loading={loading}
                />
            </PageContainer>
        </>
    );
}
