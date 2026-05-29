import { useRouter } from "next/router";
import {
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from "@mui/material";
import { ExternalLink, X } from "lucide-react";
import numeral from "numeral";
import dayjs from "@/lib/dayjs";
import type { LiquidationRuleActivityEntry } from "@/types/liquidaciones.types";
import {
  ActivityTableBodyRow,
  ActivityTableHeadRow,
  ActivityTableWrapper,
  ArticleCell,
  ArticleName,
  ArticleThumbnail,
  CloseButton,
  DialogContent,
  ModalHeader,
  StateMessage,
} from "./LiquidationRuleActivityModal.styles";

// ============================================================================
// TYPES
// ============================================================================

export interface LiquidationRuleActivityModalProps {
  open: boolean;
  onClose: () => void;
  totalModified: number;
  entries: LiquidationRuleActivityEntry[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPrice(value: number): string {
  return numeral(value).format("$0,0.00");
}

function formatActivityDate(isoDate: string): string {
  const date = dayjs(isoDate);
  if (!date.isValid()) {
    return "—";
  }
  const month = date.format("MMMM");
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${date.format("D")} ${capitalizedMonth}, ${date.format("YYYY")}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LiquidationRuleActivityModal({
  open,
  onClose,
  totalModified,
  entries,
  loading = false,
  error = false,
  onRetry,
}: LiquidationRuleActivityModalProps) {
  const router = useRouter();

  const handleClose = (_event: object, reason: string) => {
    if ((reason === "backdropClick" || reason === "escapeKeyDown") && !loading) {
      onClose();
    }
  };

  const handleOpenProduct = (productId: string) => {
    void router.push(`/catalogos/productos/${productId}`);
  };

  const description =
    totalModified === 1
      ? "El precio de 1 artículo ha sido modificado por ésta automatización."
      : `El precio de ${totalModified} artículos ha sido modificado por ésta automatización.`;

  const showEmpty = !loading && !error && entries.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent>
        <ModalHeader>
          <CloseButton onClick={onClose} disabled={loading} size="small" aria-label="Cerrar">
            <X size={16} />
          </CloseButton>
          <Stack spacing={0.5}>
            <Typography variant="h5" component="h2">
              Actividad
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Stack>
        </ModalHeader>

        {loading && (
          <StateMessage>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Cargando actividad...
            </Typography>
          </StateMessage>
        )}

        {error && !loading && (
          <StateMessage>
            <Typography variant="body2" color="error">
              No se pudo cargar la actividad. Intenta de nuevo.
            </Typography>
            {onRetry && (
              <Button variant="outlined" size="small" onClick={onRetry}>
                Reintentar
              </Button>
            )}
          </StateMessage>
        )}

        {showEmpty && (
          <StateMessage>
            <Typography variant="body2" color="text.secondary">
              Esta automatización aún no ha modificado precios.
            </Typography>
          </StateMessage>
        )}

        {!loading && !error && entries.length > 0 && (
          <ActivityTableWrapper>
            <Table stickyHeader size="small">
              <TableHead>
                <ActivityTableHeadRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Artículo</TableCell>
                  <TableCell align="right">Último precio</TableCell>
                  <TableCell align="right">Nuevo precio</TableCell>
                  <TableCell align="right" width={48} />
                </ActivityTableHeadRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => (
                  <ActivityTableBodyRow key={entry.id}>
                    <TableCell>{formatActivityDate(entry.date)}</TableCell>
                    <TableCell>
                      <ArticleCell>
                        <ArticleThumbnail
                          sx={
                            entry.imageUrl
                              ? { backgroundImage: `url(${entry.imageUrl})` }
                              : undefined
                          }
                        />
                        <ArticleName title={entry.productName}>{entry.productName}</ArticleName>
                      </ArticleCell>
                    </TableCell>
                    <TableCell align="right">{formatPrice(entry.previousPrice)}</TableCell>
                    <TableCell align="right">{formatPrice(entry.newPrice)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label={`Ver artículo ${entry.productName}`}
                        onClick={() => handleOpenProduct(entry.productId)}
                      >
                        <ExternalLink size={18} />
                      </IconButton>
                    </TableCell>
                  </ActivityTableBodyRow>
                ))}
              </TableBody>
            </Table>
          </ActivityTableWrapper>
        )}
      </DialogContent>
    </Dialog>
  );
}
