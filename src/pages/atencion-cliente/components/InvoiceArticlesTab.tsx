import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { Ban, Download, FileText, MoreVertical, Wrench } from "lucide-react";
import numeral from "numeral";
import { ConfirmModal, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { cancelInvoiceArticle } from "@/data/atencion-cliente.mockData";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  ArticleStatus,
  InvoiceArticle,
  InvoiceDetail,
  ServiceOrder,
} from "@/types/atencion-cliente.types";
import {
  ArticleActionsRow,
  ArticleCard,
  ArticleCode,
  ArticleDescription,
  ArticleDetailItem,
  ArticleDetailLabel,
  ArticleDetailValue,
  ArticleDetails,
  ArticleLeft,
  ArticleMetaRow,
  ArticlesList,
  ServiceOrderButton,
} from "@/styles/atencion-cliente.styles";
import { CreateServiceOrderModal } from "./CreateServiceOrderModal";
import { ServiceOrderDetailModal } from "./ServiceOrderDetailModal";

const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  entregado: "Entregado",
  reparacion: "Reparación",
  pendiente: "Pendiente",
  cancelado: "Cancelado",
  esperando_recuperacion: "Esperando recuperación",
  recuperado: "Recuperado",
};

const ARTICLE_STATUS_VARIANTS: Record<ArticleStatus, StatusChipVariant> = {
  entregado: "success",
  reparacion: "pending",
  pendiente: "info",
  cancelado: "error",
  esperando_recuperacion: "pending",
  recuperado: "success",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export interface InvoiceArticlesTabProps {
  invoice: InvoiceDetail;
  onRefresh?: () => void;
  onRequestCancelInvoice?: () => void;
}

export function InvoiceArticlesTab({
  invoice,
  onRefresh,
  onRequestCancelInvoice,
}: InvoiceArticlesTabProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuArticle, setMenuArticle] = useState<InvoiceArticle | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createArticleId, setCreateArticleId] = useState<string | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [cancelArticle, setCancelArticle] = useState<InvoiceArticle | null>(
    null,
  );
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    article: InvoiceArticle,
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuArticle(article);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuArticle(null);
  };

  const handleOpenCreate = (article: InvoiceArticle) => {
    handleCloseMenu();
    setCreateArticleId(article.id);
    setCreateOpen(true);
  };

  const handleOpenDetail = (article: InvoiceArticle) => {
    handleCloseMenu();
    if (!article.serviceOrderId) {
      handleOpenCreate(article);
      return;
    }
    setDetailOrderId(article.serviceOrderId);
    setDetailOpen(true);
  };

  const handleServiceOrderClick = (article: InvoiceArticle) => {
    if (article.serviceOrderId) {
      handleOpenDetail(article);
    } else {
      handleOpenCreate(article);
    }
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setCreateArticleId(undefined);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailOrderId(null);
  };

  const handleCreateSuccess = (order: ServiceOrder) => {
    onRefresh?.();
    setDetailOrderId(order.id);
    setDetailOpen(true);
  };

  const handleRequestCancel = (article: InvoiceArticle) => {
    handleCloseMenu();
    setCancelArticle(article);
  };

  const handleConfirmCancel = async () => {
    if (!cancelArticle) return;
    setCancelLoading(true);
    try {
      await cancelInvoiceArticle(cancelArticle.id);
      showSuccess("El artículo se canceló correctamente.");
      setCancelArticle(null);
      onRefresh?.();
    } catch (error) {
      console.error("[InvoiceArticlesTab] Error canceling article:", error);
      showError("No se pudo cancelar el artículo. Intenta de nuevo.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRecoverySheet = () => {
    showSuccess("La hoja de recuperación estará disponible próximamente.");
  };

  const showServiceOrderButton = (article: InvoiceArticle) =>
    article.status === "reparacion" ||
    article.status === "esperando_recuperacion" ||
    article.status === "recuperado" ||
    Boolean(article.serviceOrderId);

  const showRecoverySheetButton = (article: InvoiceArticle) =>
    article.hasRecoveryOrder ||
    article.status === "esperando_recuperacion" ||
    article.status === "recuperado";

  return (
    <>
      <ArticlesList>
        {invoice.articles.map((article) => (
          <ArticleCard key={article.id}>
            <ArticleLeft>
              <ArticleMetaRow>
                <ArticleCode>{article.code}</ArticleCode>
                <StatusChip
                  label={ARTICLE_STATUS_LABELS[article.status]}
                  variant={ARTICLE_STATUS_VARIANTS[article.status]}
                  size="small"
                />
              </ArticleMetaRow>
              <ArticleDescription>{article.description}</ArticleDescription>
              {(showServiceOrderButton(article) ||
                showRecoverySheetButton(article)) && (
                <ArticleActionsRow>
                  {showRecoverySheetButton(article) && (
                    <ServiceOrderButton
                      startIcon={<Download size={14} />}
                      onClick={handleRecoverySheet}
                    >
                      Hoja de recuperación
                    </ServiceOrderButton>
                  )}
                  {showServiceOrderButton(article) && (
                    <ServiceOrderButton
                      startIcon={<Wrench size={14} />}
                      onClick={() => handleServiceOrderClick(article)}
                    >
                      Órden de servicio
                    </ServiceOrderButton>
                  )}
                </ArticleActionsRow>
              )}
            </ArticleLeft>

            <Stack
              direction="row"
              alignItems="flex-start"
              spacing={1}
              sx={{
                flexShrink: 0,
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "space-between", md: "flex-end" },
              }}
            >
              <ArticleDetails>
                <ArticleDetailItem>
                  <ArticleDetailLabel>Precio</ArticleDetailLabel>
                  <ArticleDetailValue>
                    {formatCurrency(article.price)}
                  </ArticleDetailValue>
                </ArticleDetailItem>
                <ArticleDetailItem>
                  <ArticleDetailLabel>Promociones</ArticleDetailLabel>
                  <ArticleDetailValue>
                    {formatCurrency(article.promotions)}
                  </ArticleDetailValue>
                </ArticleDetailItem>
                <ArticleDetailItem>
                  <ArticleDetailLabel>Total</ArticleDetailLabel>
                  <ArticleDetailValue>
                    {formatCurrency(article.total)}
                  </ArticleDetailValue>
                </ArticleDetailItem>
                <ArticleDetailItem>
                  <ArticleDetailLabel>Puntos</ArticleDetailLabel>
                  <ArticleDetailValue>{article.points}</ArticleDetailValue>
                </ArticleDetailItem>
              </ArticleDetails>

              <IconButton
                size="small"
                aria-label="Opciones del artículo"
                onClick={(event) => handleOpenMenu(event, article)}
                sx={{ flexShrink: 0 }}
              >
                <MoreVertical size={18} />
              </IconButton>
            </Stack>
          </ArticleCard>
        ))}
      </ArticlesList>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => menuArticle && handleServiceOrderClick(menuArticle)}
        >
          <ListItemIcon>
            <FileText size={16} />
          </ListItemIcon>
          <ListItemText>
            {menuArticle?.serviceOrderId
              ? "Ver órden de servicio"
              : "Generar órden de servicio"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => menuArticle && handleRequestCancel(menuArticle)}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <Ban size={16} />
          </ListItemIcon>
          <ListItemText>Cancelar artículo</ListItemText>
        </MenuItem>
      </Menu>

      <CreateServiceOrderModal
        open={createOpen}
        invoice={invoice}
        initialArticleId={createArticleId}
        onClose={handleCloseCreate}
        onSuccess={handleCreateSuccess}
      />

      <ServiceOrderDetailModal
        open={detailOpen}
        serviceOrderId={detailOrderId}
        invoice={invoice}
        onClose={handleCloseDetail}
        onSuccess={onRefresh}
        onRequestCancelInvoice={onRequestCancelInvoice}
      />

      <ConfirmModal
        open={Boolean(cancelArticle)}
        onClose={() => !cancelLoading && setCancelArticle(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar artículo"
        itemName={cancelArticle?.description}
        confirmLabel="Cancelar artículo"
        type="error"
        loading={cancelLoading}
      />
    </>
  );
}

const InvoiceArticlesTabPage = () => null;

export default InvoiceArticlesTabPage;
