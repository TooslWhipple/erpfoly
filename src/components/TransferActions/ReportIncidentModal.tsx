import { useState } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import { FileUpload, type UploadedFileItem } from "@/components/FileUpload";
import { FormSelect } from "@/components/Form/FormSelect";
import { FormTextField } from "@/components/Form/FormTextField";
import { FormActions, ConfirmButton } from "@/components/Form/styles";
import NumberSpinner from "@/components/NumberSpinner";
import type {
  ReportIncidentPayload,
  TransferDetail,
  TransferDiscrepancyType,
} from "@/types/transfers.types";
import { DISCREPANCY_TYPE_LABELS, getExpectedQuantity } from "@/utils/transfers";

const MAX_EVIDENCE_FILES = 5;
const MAX_EXTRA_QUANTITY = 1_000_000;

const TYPE_OPTIONS = (Object.keys(DISCREPANCY_TYPE_LABELS) as TransferDiscrepancyType[]).map(
  (type) => ({ value: type, label: DISCREPANCY_TYPE_LABELS[type] }),
);

interface DiscrepancyRow {
  type: TransferDiscrepancyType;
  quantity: number;
}

export interface ReportIncidentModalProps {
  detail: TransferDetail;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: ReportIncidentPayload) => Promise<unknown>;
}

/** El destino reporta faltantes o sobrantes por artículo, sin editar cantidades (RN-053). */
export function ReportIncidentModal({ detail, loading, onClose, onSubmit }: ReportIncidentModalProps) {
  const [rows, setRows] = useState<Record<number, DiscrepancyRow>>(() =>
    Object.fromEntries(detail.order_items.map((item) => [item.id, { type: "MISSING", quantity: 0 }])),
  );
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<UploadedFileItem[]>([]);

  const reported = detail.order_items.filter((item) => rows[item.id].quantity > 0);
  const canSubmit = reported.length > 0 && description.trim().length > 0;

  const updateRow = (id: number, patch: Partial<DiscrepancyRow>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleSubmit = () =>
    onSubmit({
      items: reported.map((item) => ({
        order_item_id: item.id,
        type: rows[item.id].type,
        quantity: rows[item.id].quantity,
      })),
      description: description.trim(),
      evidence: evidence.flatMap((entry) => (entry.file ? [entry.file] : [])),
    });

  return (
    <SideModal
      open
      onClose={onClose}
      title="Reportar diferencia"
      description="Indica por artículo lo que faltó o sobró. El traspaso queda en curso hasta que la incidencia se resuelva."
      maxWidth="sm"
      disableClose={loading}
    >
      <Stack spacing={2}>
        {detail.order_items.map((item) => {
          const row = rows[item.id];
          return (
            <Stack key={item.id} spacing={1}>
              <Typography variant="subtitle2">{item.product?.short_name ?? "Sin nombre"}</Typography>
              <Typography variant="caption" color="text.secondary">
                Enviado: {getExpectedQuantity(item)}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormSelect
                  value={row.type}
                  options={TYPE_OPTIONS}
                  onChange={(event) =>
                    updateRow(item.id, { type: event.target.value as TransferDiscrepancyType })
                  }
                />
                <NumberSpinner
                  value={row.quantity}
                  min={0}
                  max={row.type === "MISSING" ? getExpectedQuantity(item) : MAX_EXTRA_QUANTITY}
                  onChange={(quantity) => updateRow(item.id, { quantity })}
                  inputAriaLabel={`Piezas de diferencia de ${item.product?.short_name ?? "artículo"}`}
                />
              </Stack>
            </Stack>
          );
        })}
        <FormTextField
          label="Descripción"
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          minRows={3}
        />
        <FileUpload
          value={evidence}
          onChange={setEvidence}
          accept={["image/*", "application/pdf"]}
          maxFiles={MAX_EVIDENCE_FILES}
          placeholder="Subir evidencias"
        />
        <FormActions>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <ConfirmButton variant="contained" onClick={handleSubmit} disabled={loading || !canSubmit}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Reportar"}
          </ConfirmButton>
        </FormActions>
      </Stack>
    </SideModal>
  );
}
