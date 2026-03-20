import { useState, useEffect, useCallback } from "react";
import { Stack, Typography, Button } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import {
  Card,
  IconCircle,
  FooterActions,
} from "./styles";
import { Check, FileText, ListTodo } from "lucide-react";
import { colors } from "@/styles/theme";

export type AdditionalInfoRequestKind = "file_upload" | "form";

export interface AdditionalInfoRequestOption {
  id: string;
  label: string;
  helperText: string;
  kind: AdditionalInfoRequestKind;
}

export interface RequestAdditionalInfoModalProps {
  open: boolean;
  onClose: () => void;
  options?: AdditionalInfoRequestOption[];
  onSubmit?: (selectedOptionIds: string[]) => void;
}

const DEFAULT_OPTIONS: AdditionalInfoRequestOption[] = [
  {
    id: "income_proof",
    label: "Comprobante de Ingresos",
    helperText: "Se deberá cargar un archivo",
    kind: "file_upload",
  },
  {
    id: "employment_letter",
    label: "Carta comprobante laboral",
    helperText: "Se deberá cargar un archivo",
    kind: "file_upload",
  },
  {
    id: "guarantor_info",
    label: "Información sobre aval",
    helperText: "Se deberá completar un formulario",
    kind: "form",
  },
];

export function RequestAdditionalInfoModal({
  open,
  onClose,
  options = DEFAULT_OPTIONS,
  onSubmit,
}: RequestAdditionalInfoModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
    }
  }, [open]);

  const toggleOption = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit?.(Array.from(selectedIds));
    onClose();
  }, [onSubmit, onClose, selectedIds]);

  const canSubmit = selectedIds.size > 0;

  return (
    <SideModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="Solicitar información adicional"
      description="Selecciona los documentos o datos adicionales que deseas solicitar al cliente.">
      <Stack spacing={1.5} sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}>
        {
          options.map((option) => {
            const selected = selectedIds.has(option.id);

            return (
              <Card key={option.id} selected={selected}>
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="nowrap">
                  <IconCircle selected={selected}>
                    {
                      selected ?
                        <Check size={18} stroke="2" />
                        :
                        option.kind === "file_upload" ?
                          <FileText size={18} stroke="2" />
                          :
                          <ListTodo size={18} stroke="2" />

                    }
                  </IconCircle>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">{option.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{option.helperText}</Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => toggleOption(option.id)}
                >
                  {selected ? "Quitar" : "Seleccionar"}
                </Button>
              </Card>
            );
          })
        }
      </Stack>

      <FooterActions>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!canSubmit}
          onClick={handleSubmit}>
          Solicitar
        </Button>
      </FooterActions>
    </SideModal>
  );
}
