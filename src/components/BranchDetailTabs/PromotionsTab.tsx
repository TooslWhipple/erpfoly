import { useState, useEffect, useCallback } from "react";
import { IconButton, Stack, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { MoreVertical } from "lucide-react";
import { TableCrud, ModalForm } from "@/components";
import type { Column } from "@/components/TableCrud";
import type { FormFieldConfig } from "@/components/Form";
import {
  getPromotions,
  deletePromotion,
  createPromotion,
} from "@/services/branchDetail.service";
import type { BranchPromotion } from "@/types/sucursales.types";

interface PromotionsTabProps {
  branchId: number;
  /** When true, opens the create modal (e.g. parent toolbar). Closing syncs via onCloseNewPromotionModal. */
  openNewPromotionModal?: boolean;
  onCloseNewPromotionModal?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Sin fecha fin";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTypeLabel(type: BranchPromotion["type"]): string {
  const labels: Record<BranchPromotion["type"], string> = {
    credit: "Crédito",
    cash: "Contado",
    layaway: "Apartados",
  };
  return labels[type];
}

export function PromotionsTab({
  branchId,
  openNewPromotionModal = false,
  onCloseNewPromotionModal,
}: PromotionsTabProps) {
  const [promotions, setPromotions] = useState<BranchPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const modalOpen = Boolean(openNewPromotionModal) || internalModalOpen;
  const handleCloseModal = () => {
    setInternalModalOpen(false);
    onCloseNewPromotionModal?.();
  };
  const handleOpenCreateModal = () => {
    setInternalModalOpen(true);
  };

  const fetchPromotions = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const data = await getPromotions(branchId);
      setPromotions(data);
    } catch (err) {
      console.error("[PromotionsTab] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleDelete = async (row: BranchPromotion) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la promoción "${row.name}"?`
    );
    if (!confirmed) return;
    try {
      await deletePromotion(branchId, row.id);
      fetchPromotions();
    } catch (err) {
      console.error("[PromotionsTab] Error deleting:", err);
    }
  };

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await createPromotion(branchId, {
        name: data.name as string,
        margin: Number(data.margin),
        type: data.type as BranchPromotion["type"],
        startDate: data.startDate as string,
        endDate: (data.endDate as string) || null,
        departments: data.departments as string,
        lines: data.lines as string,
        branches: data.branches as string,
      });
      handleCloseModal();
      fetchPromotions();
    } catch (err) {
      console.error("[PromotionsTab] Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<BranchPromotion>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      idPadding: 2,
    },
    { id: "name", label: "Nombre", size: "lg" },
    {
      id: "margin",
      label: "Margen",
      size: "sm",
      format: (value) => `${value}%`,
    },
    {
      id: "type",
      label: "Tipo",
      size: "sm",
      format: (value) => getTypeLabel(value as BranchPromotion["type"]),
    },
    {
      id: "startDate",
      label: "Inicio",
      size: "md",
      format: (value) => formatDate(value as string),
    },
    {
      id: "endDate",
      label: "Fin",
      size: "md",
      format: (value) => formatDate(value as string | null),
    },
    { id: "departments", label: "Departamentos", size: "md", truncate: true },
    { id: "lines", label: "Líneas", size: "sm" },
    { id: "branches", label: "Sucursales", size: "sm" },
    {
      id: "actions",
      label: "",
      size: "xs",
      format: (_, row) => (
        <IconButton
          size="small"
          onClick={() => handleDelete(row)}
          sx={{ color: "text.secondary" }}
          aria-label="Más opciones"
        >
          <MoreVertical size={18} />
        </IconButton>
      ),
    },
  ];

  const formFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "Nombre de la promoción",
      type: "text",
      placeholder: "Ej. Promoción de verano",
      validation: { required: true, minLength: 3 },
      xs: 12,
    },
    {
      name: "margin",
      label: "Margen (%)",
      type: "number",
      placeholder: "Ej. 25",
      validation: { required: true, min: 1, max: 100 },
      xs: 12,
      sm: 6,
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      options: [
        { value: "credit", label: "Crédito" },
        { value: "cash", label: "Contado" },
        { value: "layaway", label: "Apartados" },
      ],
      validation: { required: true },
      xs: 12,
      sm: 6,
    },
    {
      name: "startDate",
      label: "Fecha de inicio",
      type: "date",
      validation: { required: true },
      xs: 12,
      sm: 6,
    },
    {
      name: "endDate",
      label: "Fecha de fin",
      type: "date",
      helperText: "Dejar vacío para sin fecha de fin",
      xs: 12,
      sm: 6,
    },
    {
      name: "departments",
      label: "Departamentos",
      type: "text",
      placeholder: "Ej. Todos, Línea blanca",
      defaultValue: "Todos",
      xs: 12,
      sm: 6,
    },
    {
      name: "lines",
      label: "Líneas",
      type: "text",
      placeholder: "Ej. Todos, 7 Líneas",
      defaultValue: "Todos",
      xs: 12,
      sm: 6,
    },
  ];

  return (
    <>
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
          >
            Nueva promoción
          </Button>
        </Stack>
        <TableCrud
          columns={columns}
          rows={promotions}
          loading={loading}
          rowKey="id"
          emptyMessage="No hay promociones registradas para esta sucursal"
        />
      </Stack>

      <ModalForm
        open={modalOpen}
        onClose={handleCloseModal}
        title="Nueva promoción"
        description="Configura una nueva promoción para esta sucursal."
        fields={formFields}
        onConfirm={handleSave}
        loading={saving}
        confirmLabel="Guardar"
        cancelLabel="Cancelar"
        maxWidth="sm"
      />
    </>
  );
}
