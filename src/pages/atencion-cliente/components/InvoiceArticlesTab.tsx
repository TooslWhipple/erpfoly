import { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Stack } from "@mui/material";
import { Ban, FileText, MoreVertical, Wrench } from "lucide-react";
import numeral from "numeral";
import { ConfirmModal, StatusChip } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import { cancelInvoiceArticle } from "@/data/atencion-cliente.mockData";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  ArticleStatus,
  InvoiceArticle,
  InvoiceDetail,
} from "@/types/atencion-cliente.types";
import {
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

const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  entregado: "Entregado",
  reparacion: "Reparación",
  pendiente: "Pendiente",
  cancelado: "Cancelado",
};

const ARTICLE_STATUS_VARIANTS: Record<ArticleStatus, StatusChipVariant> = {
  entregado: "success",
  reparacion: "pending",
  pendiente: "info",
  cancelado: "error",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export interface InvoiceArticlesTabProps {
  invoice: InvoiceDetail;
}

export function InvoiceArticlesTab({ invoice }: InvoiceArticlesTabProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuArticle, setMenuArticle] = useState<InvoiceArticle | null>(null);
  const [serviceOrderOpen, setServiceOrderOpen] = useState(false);
  const [serviceOrderArticleId, setServiceOrderArticleId] = useState<
    string | undefined
  >();
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

  const handleOpenServiceOrder = (article: InvoiceArticle) => {
    handleCloseMenu();
    setServiceOrderArticleId(article.id);
    setServiceOrderOpen(true);
  };

  const handleCloseServiceOrder = () => {
    setServiceOrderOpen(false);
    setServiceOrderArticleId(undefined);
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
    } catch (error) {
      console.error("[InvoiceArticlesTab] Error canceling article:", error);
      showError("No se pudo cancelar el artículo. Intenta de nuevo.");
    } finally {
      setCancelLoading(false);
    }
  };

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
              {article.status === "reparacion" && (
                <ServiceOrderButton
                  startIcon={<Wrench size={14} />}
                  onClick={() => handleOpenServiceOrder(article)}
                >
                  Órden de servicio
                </ServiceOrderButton>
              )}
            </ArticleLeft>

            <Stack direction="row" alignItems="flex-start" spacing={1}>
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
          onClick={() => menuArticle && handleOpenServiceOrder(menuArticle)}
        >
          <ListItemIcon>
            <FileText size={16} />
          </ListItemIcon>
          <ListItemText>Generar órden de servicio</ListItemText>
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
        open={serviceOrderOpen}
        invoice={invoice}
        initialArticleId={serviceOrderArticleId}
        onClose={handleCloseServiceOrder}
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
