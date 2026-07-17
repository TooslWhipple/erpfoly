import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { ImagePlus, Settings2, X } from "lucide-react";
import { SideModal, FormSelect, FormTextField, StatusChip } from "@/components";
import { createServiceOrder } from "@/data/atencion-cliente.mockData";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type {
  InvoiceArticle,
  InvoiceDetail,
} from "@/types/atencion-cliente.types";
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

const MAX_EVIDENCE_FILES = 4;

export interface CreateServiceOrderModalProps {
  open: boolean;
  invoice: InvoiceDetail;
  initialArticleId?: string;
  onClose: () => void;
  onSuccess?: () => void;
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
    setComplaint("");
    setObservations("");
    setEvidence((prev) => {
      revokeEvidenceUrls(prev);
      return [];
    });
    setSubmitting(false);
  }, [initialArticleId, invoice.articles, revokeEvidenceUrls]);

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
      await createServiceOrder({
        invoiceId: invoice.id,
        articleId: selectedArticle.id,
        quantity: Number(quantity),
        serialNumber: serialNumber.trim(),
        complaint: complaint.trim(),
        observations: observations.trim(),
        evidenceFiles: evidence.map((item) => item.file),
      });
      showSuccess("La orden de servicio se creó correctamente.");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[CreateServiceOrderModal] Error creating order:", error);
      showError("No se pudo crear la orden de servicio. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentTypeLabel =
    invoice.paymentType === "credito" ? "Crédito" : "Contado";

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      disableClose={submitting}
      maxWidth="md"
      title="Crear Órden de Servicio"
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Crear órden
        </Button>
      }
      headerContent={
        <ModalMetaRow>
          <ModalInvoiceLink>Factura: {invoice.invoiceNumber}</ModalInvoiceLink>
          <Typography variant="body2" color="text.secondary">
            {invoice.purchaseDate}
          </Typography>
          <StatusChip
            label={paymentTypeLabel}
            variant="info"
            size="small"
            startIcon={<Settings2 size={12} />}
          />
        </ModalMetaRow>
      }
      contentSx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Stack spacing={2.5} sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}>
        <InfoGrid>
          <InfoField>
            <InfoLabel>Cliente</InfoLabel>
            <InfoValue>{invoice.customerName}</InfoValue>
          </InfoField>
          <InfoField>
            <InfoLabel>Teléfono</InfoLabel>
            <InfoValue>{invoice.customerPhone}</InfoValue>
          </InfoField>
        </InfoGrid>

        <InfoField>
          <InfoLabel>Dirección</InfoLabel>
          <InfoValue>{invoice.customerAddress}</InfoValue>
        </InfoField>

        <Stack spacing={0.5}>
          <FormSelect
            label="Artículo"
            options={articleOptions}
            value={articleId}
            onChange={(event) => setArticleId(String(event.target.value))}
            disabled={submitting}
            required
          />
          {selectedArticle && (
            <ArticleMetaInfo>
              <Typography variant="body2" color="text.secondary">
                Proveedor: {selectedArticle.supplier ?? "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Forma de entrega: {selectedArticle.deliveryMethod ?? "—"}
              </Typography>
            </ArticleMetaInfo>
          )}
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
                  disabled={submitting}
                  aria-label="Eliminar evidencia"
                >
                  <X size={12} />
                </EvidenceRemoveButton>
              </EvidenceThumb>
            ))}
            {evidence.length < MAX_EVIDENCE_FILES && (
              <EvidenceAddButton
                type="button"
                onClick={handleAddEvidenceClick}
                disabled={submitting}
                aria-label="Agregar evidencia"
              >
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
