import { useMemo } from "react";
import { Stack, Button, Box, InputAdornment } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { FormTextField, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components";
import {
  SettingsGrid,
  SettingsCard,
  SettingsTitle,
  SettingsDescription,
  PromotionsCard,
  PromotionsHeader,
} from "@/styles/catalogos/departamentos-detail.styles";
import type { PromotionListItem } from "@/types/promociones.types";
import { formatDate } from "@/utils/date";
import { CATALOG_PROMOTIONS_UPDATE } from "@/lib/permissions";

export interface DepartmentSettingsTabProps {
  marginDraft: string;
  onMarginDraftChange: (value: string) => void;
  marginFieldError: boolean;
  marginHelperText: string;
  savingMargin: boolean;
  canCreatePromotion?: boolean;
  promotions: PromotionListItem[];
  promotionsLoading: boolean;
  promotionsPage: number;
  promotionsRowsPerPage: number;
  promotionsTotalRows: number;
  onPromotionsPageChange: (page: number) => void;
  onPromotionsRowsPerPageChange: (rowsPerPage: number) => void;
  onNewPromotion: () => void;
  onOpenPromotion: (promotion: PromotionListItem) => void;
}

export function DepartmentSettingsTab({
  marginDraft,
  onMarginDraftChange,
  marginFieldError,
  marginHelperText,
  savingMargin,
  canCreatePromotion = false,
  promotions,
  promotionsLoading,
  promotionsPage,
  promotionsRowsPerPage,
  promotionsTotalRows,
  onPromotionsPageChange,
  onPromotionsRowsPerPageChange,
  onNewPromotion,
  onOpenPromotion,
}: DepartmentSettingsTabProps) {
  const promotionColumns = useMemo<Column<PromotionListItem>[]>(
    () => [
      { id: "name", label: "Nombre", size: "xl" },
      {
        id: "discount_rate",
        label: "Promoción",
        type: "percentage",
        size: "sm",
        align: "left",
      },
      {
        id: "purchase_type_label",
        label: "Tipo",
        size: "md",
        type: "text",
      },
      {
        id: "end_date",
        label: "Finalización",
        type: "text",
        size: "md",
        format: (value) =>
          formatDate(value as string | null | undefined, "dateNumeric", {
            fallback: "Sin fecha fin",
          }),
      },
      {
        id: "branch_summary",
        label: "Sucursales",
        size: "lg",
      },
    ],
    []
  );

  const promotionActions = useMemo<RowAction<PromotionListItem>[]>(
    () => [
      {
        id: "edit",
        label: "Editar",
        icon: <EditIcon fontSize="small" />,
        onClick: onOpenPromotion,
        permission: CATALOG_PROMOTIONS_UPDATE,
      },
    ],
    [onOpenPromotion]
  );

  return (
    <Stack spacing={2}>
      <SettingsGrid
        sx={{
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 520px)" },
        }}
      >
        <SettingsCard>
          <SettingsTitle>Margen de utilidad</SettingsTitle>
          <SettingsDescription>
            Se aplicará para todos los artículos dentro de este departamento. Éste precio
            será tomado como el precio de crédito de los artículos.
          </SettingsDescription>
          <Box sx={{ width: "100%", maxWidth: 220 }}>
            <FormTextField
              placeholder="Ej. 32"
              value={marginDraft}
              onChange={(e) => onMarginDraftChange(e.target.value)}
              error={marginFieldError}
              helperText={marginHelperText}
              disabled={savingMargin}
              slotProps={{
                htmlInput: {
                  inputMode: "decimal",
                  "aria-label": "Margen de utilidad (porcentaje)",
                },
                input: {
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                },
              }}
            />
          </Box>
        </SettingsCard>
      </SettingsGrid>

      <PromotionsCard>
        <PromotionsHeader>
          <SettingsTitle sx={{ fontSize: "1.25rem" }}>Promociones</SettingsTitle>
          {canCreatePromotion ? (
            <Button variant="outlined" onClick={onNewPromotion}>
              Nueva promoción
            </Button>
          ) : null}
        </PromotionsHeader>
        <TableCrud
          columns={promotionColumns}
          rows={promotions}
          actions={promotionActions}
          rowKey="id"
          loading={promotionsLoading}
          page={promotionsPage}
          rowsPerPage={promotionsRowsPerPage}
          totalRows={promotionsTotalRows}
          onPageChange={onPromotionsPageChange}
          onRowsPerPageChange={onPromotionsRowsPerPageChange}
          emptyMessage="No hay promociones para este departamento"
        />
      </PromotionsCard>
    </Stack>
  );
}
