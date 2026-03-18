import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Button, Table, TableBody, TableRow, Stack } from "@mui/material";
import { MainLayout, Breadcrumbs } from "@/components";
import { NumberInput } from "@/components/Folypuntos";
import type { ReceptionArticle } from "@/types/recepcion-mercancias.types";
import { SendToCostingModal } from "@/components/ReceptionOrdersModal/SendToCostingModal";
import {
    StyledProgressBar,
    TableContainer,
    StyledTableHead,
    StyledTableRow,
    StyledTableCell,
    ArticleNameCell,
} from "@/styles/recepcion-mercancias/nuevo.styles";
import { ArrowRight } from "lucide-react";
import { colors } from "@/styles/theme";

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

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

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

export default function NuevaRecepcion() {
    const router = useRouter();
    const [articles, setArticles] = useState<ReceptionArticle[]>(DUMMY_ARTICLES);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const orderIds = router.query.orderIds;
        if (orderIds && typeof orderIds === "string") {
        }
    }, [router.query]);

    const handleQuantityChange = (articleId: string, newQuantity: number) => {
        setArticles((prev) =>
            prev.map((article) =>
                article.id === articleId
                    ? { ...article, received: Math.min(newQuantity, article.quantity) }
                    : article
            )
        );
    };

    const handleSaveAndPrint = async () => {
        setLoading(true);
        try {
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

    const supplierName = "Mabe -Norage S.A. de C.V.-";
    const orderDate = "2025-06-01";
    const deliveryDate = "2025-06-08";
    const branch = "Sucursal Matriz";

    return (
        <MainLayout>
            <Stack spacing={2}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent={{ xs: "flex-start", md: "space-between" }}>
                    <Breadcrumbs
                        items={[
                            { label: "Recepción de mercancía", href: "/recepcion-mercancias" },
                            { label: "Nuevo" },
                        ]}
                        showBackButton
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setModalOpen(true)}
                        disabled={totalArticles === 0}>
                        Guardar e imprimir etiquetas
                    </Button>
                </Stack>

                <Stack spacing={1}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        alignItems="center"
                        justifyContent="flex-start">
                        <Stack spacing={0.5}>
                            <Typography variant="h5">{supplierName}</Typography>
                            <Typography variant="body2" color="text.secondary">{formatDate(orderDate)}</Typography>
                        </Stack>
                        <ArrowRight size={18} color={colors.text.secondary} />
                        <Stack spacing={0.5}>
                            <Typography variant="h5">{branch}</Typography>
                            <Typography variant="body2" color="text.secondary">Entrega: {formatDate(deliveryDate)}</Typography>
                        </Stack>
                    </Stack>
                    <StyledProgressBar variant="determinate" value={progress} />
                </Stack>

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

                <SendToCostingModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={handleSaveAndPrint}
                    totalArticles={totalArticles}
                    totalLabels={totalLabels}
                    loading={loading}
                />
            </Stack>
        </MainLayout>
    );
}
