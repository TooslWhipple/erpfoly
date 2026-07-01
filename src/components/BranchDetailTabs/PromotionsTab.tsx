import { useState, useEffect, useCallback } from "react";
import { Stack, Typography, CircularProgress, Button } from "@mui/material";
import { TableCrud } from "@/components";
import type { Column } from "@/components/TableCrud";
import { getPromotions } from "@/services/branchDetail.service";
import type { BranchPromotion } from "@/types/sucursales.types";

interface PromotionsTabProps {
  branchId: number;
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

export function PromotionsTab({ branchId }: PromotionsTabProps) {
  const [promotions, setPromotions] = useState<BranchPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getPromotions(branchId);
      if (result.error) {
        setError(result.error.message);
        setPromotions([]);
        return;
      }
      setPromotions(result.data ?? []);
    } catch (err) {
      console.error("[PromotionsTab] Error fetching:", err);
      setError("No se pudieron cargar las promociones.");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

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
  ];

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={200} spacing={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando promociones...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={fetchPromotions}>
          Reintentar
        </Button>
      </Stack>
    );
  }

  return (
    <TableCrud
      columns={columns}
      rows={promotions}
      rowKey="id"
      emptyMessage="No hay promociones registradas para esta sucursal"
    />
  );
}
