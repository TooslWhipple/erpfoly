import { useState, useEffect, useMemo, useRef } from "react";
import {
  Stack,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { TableCrud } from "@/components";
import type { Column } from "@/components/TableCrud";
import { getPromotions } from "@/services/branchDetail.service";
import type { BranchPromotion } from "@/types/sucursales.types";
import { formatDateOnly } from "@/utils/date";

interface PromotionsTabProps {
  branchId: number;
}

function getTypeLabel(type: BranchPromotion["type"]): string {
  const labels: Record<BranchPromotion["type"], string> = {
    credit: "Crédito",
    cash: "Contado",
    layaway: "Apartados",
  };
  return labels[type];
}

function formatEndDate(value: unknown): string {
  if (value == null) return "Sin fecha fin";
  return formatDateOnly(value, "dateLong");
}

export function PromotionsTab({ branchId }: PromotionsTabProps) {
  const [promotions, setPromotions] = useState<BranchPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpired, setShowExpired] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const loadedBranchId = useRef<number | null>(null);

  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    const initial = loadedBranchId.current !== branchId;
    setLoading(true);

    void (async () => {
      try {
        const result = await getPromotions(branchId, {
          activeOnly: !showExpired,
        });
        if (cancelled) return;
        if (result.error) {
          setError(result.error.message);
          if (initial) setPromotions([]);
          return;
        }
        setError(null);
        setPromotions(result.data ?? []);
        loadedBranchId.current = branchId;
      } catch (err) {
        if (cancelled) return;
        console.error("[PromotionsTab] Error fetching:", err);
        setError("No se pudieron cargar las promociones.");
        if (initial) setPromotions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [branchId, showExpired, retryToken]);

  const columns = useMemo<Column<BranchPromotion>[]>(() => [
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
      format: (value) => formatDateOnly(value, "dateLong"),
    },
    {
      id: "endDate",
      label: "Fin",
      size: "md",
      format: formatEndDate,
    },
    { id: "departments", label: "Departamentos", size: "md", truncate: true },
    { id: "lines", label: "Líneas", size: "sm" },
    { id: "branches", label: "Sucursales", size: "sm" },
  ], []);

  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showExpired}
            onChange={(event) => {
              setLoading(true);
              setShowExpired(event.target.checked);
            }}
          />
        }
        label="Mostrar promociones expiradas"
      />
      {error && !loading ? (
        <Stack spacing={1} direction="row" alignItems="center">
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={() => setRetryToken((token) => token + 1)}>
            Reintentar
          </Button>
        </Stack>
      ) : null}
      <TableCrud
        columns={columns}
        rows={promotions}
        loading={loading}
        rowKey="id"
        emptyMessage={
          showExpired
            ? "No hay promociones registradas para esta sucursal"
            : "No hay promociones vigentes para esta sucursal"
        }
      />
    </Stack>
  );
}
