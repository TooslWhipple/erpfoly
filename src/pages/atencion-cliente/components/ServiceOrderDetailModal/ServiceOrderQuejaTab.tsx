import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { ImagePlus, X } from "lucide-react";
import { FormSelect, FormTextField } from "@/components";
import type { InvoiceArticle, ServiceOrderQueja } from "@/types/atencion-cliente.types";
import {
  ArticleMetaInfo,
  EvidenceAddButton,
  EvidenceRemoveButton,
  EvidenceRow,
  EvidenceThumb,
} from "@/styles/atencion-cliente.styles";
import { MAX_EVIDENCE_FILES } from "./constants";

export interface ServiceOrderQuejaTabProps {
  queja: ServiceOrderQueja;
  articles: InvoiceArticle[];
  disabled?: boolean;
  onChange: (patch: Partial<ServiceOrderQueja>) => void;
}

interface EvidencePreview {
  id: string;
  url: string;
  file?: File;
  isExisting?: boolean;
}

export function ServiceOrderQuejaTab({
  queja,
  articles,
  disabled = false,
  onChange,
}: ServiceOrderQuejaTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localEvidence, setLocalEvidence] = useState<EvidencePreview[]>([]);
  const evidenceRef = useRef<EvidencePreview[]>([]);
  evidenceRef.current = localEvidence;

  useEffect(() => {
    setLocalEvidence(
      queja.evidenceUrls.map((url, index) => ({
        id: `existing-${index}-${url}`,
        url,
        isExisting: true,
      })),
    );
  }, [queja.evidenceUrls]);

  const revokeBlobUrls = useCallback((items: EvidencePreview[]) => {
    items.forEach((item) => {
      if (item.file) URL.revokeObjectURL(item.url);
    });
  }, []);

  useEffect(() => {
    return () => {
      revokeBlobUrls(evidenceRef.current);
    };
  }, [revokeBlobUrls]);

  const articleOptions = useMemo(
    () =>
      articles.map((article) => ({
        value: article.id,
        label: article.description,
      })),
    [articles],
  );

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === queja.articleId),
    [articles, queja.articleId],
  );

  const syncEvidenceUrls = (items: EvidencePreview[]) => {
    onChange({ evidenceUrls: items.map((item) => item.url) });
  };

  const handleAddEvidenceClick = () => {
    fileInputRef.current?.click();
  };

  const handleEvidenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setLocalEvidence((prev) => {
      const remaining = MAX_EVIDENCE_FILES - prev.length;
      const nextFiles = files.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        url: URL.createObjectURL(file),
      }));
      const next = [...prev, ...nextFiles];
      syncEvidenceUrls(next);
      return next;
    });
  };

  const handleRemoveEvidence = (id: string) => {
    setLocalEvidence((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.file) URL.revokeObjectURL(target.url);
      const next = prev.filter((item) => item.id !== id);
      syncEvidenceUrls(next);
      return next;
    });
  };

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <FormSelect
          label="Artículo"
          options={articleOptions}
          value={queja.articleId}
          onChange={(event) => {
            const nextId = String(event.target.value);
            const article = articles.find((item) => item.id === nextId);
            onChange({
              articleId: nextId,
              quantity: article?.quantity ?? queja.quantity,
              serialNumber: article?.serialNumber ?? queja.serialNumber,
            });
          }}
          disabled={disabled}
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
            value={String(queja.quantity)}
            onChange={(event) =>
              onChange({ quantity: Number(event.target.value) || 0 })
            }
            disabled={disabled}
            inputProps={{ min: 1 }}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <FormTextField
            label="Número de serie"
            value={queja.serialNumber}
            onChange={(event) => onChange({ serialNumber: event.target.value })}
            disabled={disabled}
          />
        </Grid>
      </Grid>

      <FormTextField
        label="Queja"
        value={queja.complaint}
        onChange={(event) => onChange({ complaint: event.target.value })}
        disabled={disabled}
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
          {localEvidence.map((item) => (
            <EvidenceThumb key={item.id}>
              <img src={item.url} alt="Evidencia" />
              <EvidenceRemoveButton
                size="small"
                onClick={() => handleRemoveEvidence(item.id)}
                disabled={disabled}
                aria-label="Eliminar evidencia"
              >
                <X size={12} />
              </EvidenceRemoveButton>
            </EvidenceThumb>
          ))}
          {localEvidence.length < MAX_EVIDENCE_FILES && (
            <EvidenceAddButton
              type="button"
              onClick={handleAddEvidenceClick}
              disabled={disabled}
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
        value={queja.observations}
        onChange={(event) => onChange({ observations: event.target.value })}
        disabled={disabled}
        multiline
        minRows={3}
        placeholder="Ingrese"
      />
    </Stack>
  );
}

const ServiceOrderQuejaTabPage = () => null;

export default ServiceOrderQuejaTabPage;
