import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { CircleDotDashed, ImagePlus, Settings2, X } from "lucide-react";
import { SideModal, FormSelect, FormTextField, StatusChip } from "@/components";
import { createServiceOrder } from "@/services/service-orders.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  InvoiceArticle,
  InvoiceDetail,
  ServiceOrder,
} from "@/types/atencion-cliente.types";
import { paymentTypeLabel } from "@/types/atencion-cliente.types";
import {
  ArticleMetaInfo,
  EvidenceAddButton,
  EvidenceRemoveButton,
  EvidenceRow,
  EvidenceThumb,
  InfoField,
  InfoGrid,
  InfoLabel,
  InfoValue,
  ModalInvoiceLink,
  ModalMetaRow,
} from "@/styles/atencion-cliente.styles";
import { theme } from "@/styles/theme";

const MAX_EVIDENCE_FILES = 4;

export interface CreateServiceOrderModalProps {
  open: boolean;
  invoice: InvoiceDetail;
  initialArticleId?: string;
  /** Prefills the complaint field when opening (e.g. cancel-article flow). */
  defaultComplaint?: string;
  onClose: () => void;
  onSuccess?: (order: ServiceOrder) => void;
}

interface EvidencePreview {
  id: string;
  file: File;
  url: string;
}

export function CreateServiceOrderModal({
  open,
  invoice,
  initialArticleId,
  defaultComplaint,
  onClose,
  onSuccess,
}: CreateServiceOrderModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [articleId, setArticleId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [serialNumber, setSerialNumber] = useState("");
  const [complaint, setComplaint] = useState("");
  const [observations, setObservations] = useState("");
  const [evidence, setEvidence] = useState<EvidencePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const articleOptions = useMemo(
    () =>
      invoice.articles.map((article) => ({
        value: article.id,
        label: article.description,
      })),
    [invoice.articles],
  );

  const selectedArticle: InvoiceArticle | undefined = useMemo(
    () => invoice.articles.find((article) => article.id === articleId),
    [invoice.articles, articleId],
  );

  const evidenceRef = useRef<EvidencePreview[]>([]);
  evidenceRef.current = evidence;

  const revokeEvidenceUrls = useCallback((items: EvidencePreview[]) => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);

  const resetForm = useCallback(() => {
    setArticleId(initialArticleId ?? invoice.articles[0]?.id ?? "");
    const article =
      invoice.articles.find((item) => item.id === initialArticleId) ??
      invoice.articles[0];
    setQuantity(String(article?.quantity ?? 1));
    setSerialNumber(article?.serialNumber ?? "");
    setComplaint(defaultComplaint ?? "");
    setObservations("");
    setEvidence((prev) => {
      revokeEvidenceUrls(prev);
      return [];
    });
    setSubmitting(false);
  }, [
    defaultComplaint,
    initialArticleId,
    invoice.articles,
    revokeEvidenceUrls,
  ]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    return () => {
      revokeEvidenceUrls(evidenceRef.current);
    };
  }, [revokeEvidenceUrls]);

  useEffect(() => {
    if (!selectedArticle) return;
    setQuantity(String(selectedArticle.quantity ?? 1));
    setSerialNumber(selectedArticle.serialNumber ?? "");
  }, [selectedArticle]);

  const canSubmit =
    Boolean(articleId) &&
    Number(quantity) > 0 &&
    complaint.trim().length > 0 &&
    !submitting;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleAddEvidenceClick = () => {
    fileInputRef.current?.click();
  };

  const handleEvidenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setEvidence((prev) => {
      const remaining = MAX_EVIDENCE_FILES - prev.length;
      const nextFiles = files.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...nextFiles];
    });
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedArticle) return;

    setSubmitting(true);
    try {
      const order = await createServiceOrder({
        invoiceId: invoice.id,
        articleId: selectedArticle.id,
        quantity: Number(quantity),
        serialNumber: serialNumber.trim(),
        complaint: complaint.trim(),
        observations: observations.trim(),
        evidenceFiles: evidence.map((item) => item.file),
      });
      showSuccess("Orden de servicio registrada");
      onSuccess?.(order);
      onClose();
    } catch (error) {
      console.error("[CreateServiceOrderModal] Error creating order:", error);
      showError("No se pudo crear la orden de servicio. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentTypeLabelText = paymentTypeLabel(invoice.paymentType);

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      disableClose={submitting}
      maxWidth="md"
      title="Crear Órden de Servicio"
      headerActionsPosition="top"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ whiteSpace: "nowrap" }}
          disabled={!canSubmit}>
          {(submitting) ? <CircularProgress size={16} color="inherit" /> : 'Crear órden'}
        </Button>
      }
      headerContent={
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem sx={{ height: "12px", alignSelf: "center" }} />}>
          <Typography variant="body1" color="primary">Factura: {invoice.invoiceNumber}</Typography>
          <Typography variant="body2" color="text.secondary">{invoice.purchaseDate}</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CircleDotDashed size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">{paymentTypeLabelText}</Typography>
          </Stack>
        </Stack>
      }
      contentSx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Stack spacing={2.5} sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Stack flex={1}>
            <Typography variant="body2" color="text.secondary">Cliente</Typography>
            <Typography variant="body1">{invoice.customerName}</Typography>
          </Stack>
          <Stack flex={1}>
            <InfoLabel>Teléfono</InfoLabel>
            <InfoValue>{invoice.customerPhone}</InfoValue>
          </Stack>
        </Stack>

        <Stack>
          <Typography variant="body2" color="text.secondary">Dirección</Typography>
          <Typography variant="body1">{invoice.customerAddress}</Typography>
        </Stack>

        <Stack spacing={0.5}>
          <FormSelect
            label="Artículo"
            options={articleOptions}
            value={articleId}
            onChange={(event) => setArticleId(String(event.target.value))}
            disabled={submitting}
            required
          />
          {
            selectedArticle &&
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" color="text.secondary">Proveedor: {selectedArticle.supplier}</Typography>
              <Typography variant="body2" color="text.secondary">Forma de entrega: {selectedArticle.deliveryMethod}</Typography>
            </Stack>
          }
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormTextField
              label="Cantidad"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              disabled={submitting}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormTextField
              label="Número de serie"
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              disabled={submitting}
            />
          </Grid>
        </Grid>

        <FormTextField
          label="Queja"
          value={complaint}
          onChange={(event) => setComplaint(event.target.value)}
          disabled={submitting}
          multiline
          minRows={3}
          placeholder="Ingrese"
          required
        />

        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Evidencia
          </Typography>
          <EvidenceRow>
            {evidence.map((item) => (
              <EvidenceThumb key={item.id}>
                <img src={item.url} alt={item.file.name} />
                <EvidenceRemoveButton
                  size="small"
                  onClick={() => handleRemoveEvidence(item.id)}
                  disabled={submitting}>
                  <X size={12} />
                </EvidenceRemoveButton>
              </EvidenceThumb>
            ))}
            {evidence.length < MAX_EVIDENCE_FILES && (
              <EvidenceAddButton
                type="button"
                onClick={handleAddEvidenceClick}
                disabled={submitting}>
                <ImagePlus size={22} strokeWidth={1.75} />
              </EvidenceAddButton>
            )}
          </EvidenceRow>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleEvidenceChange}
          />
        </Stack>

        <FormTextField
          label="Observaciones"
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
          disabled={submitting}
          multiline
          minRows={3}
          placeholder="Ingrese"
        />
      </Stack>
    </SideModal>
  );
}

const CreateServiceOrderModalPage = () => null;

export default CreateServiceOrderModalPage;
