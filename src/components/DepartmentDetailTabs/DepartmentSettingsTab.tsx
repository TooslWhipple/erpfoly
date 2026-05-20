import { Stack, Button, Box, InputAdornment } from "@mui/material";
import { FormTextField, TableCrud } from "@/components";
import {
  SettingsGrid,
  SettingsCard,
  SettingsTitle,
  SettingsDescription,
  PromotionsCard,
  PromotionsHeader,
} from "@/styles/catalogos/departamentos-detail.styles";
import {
  departmentSettingsPromotionColumns,
  departmentSettingsPromotionMockRows,
} from "./departmentSettingsTab.mock";

export interface DepartmentSettingsTabProps {
  marginDraft: string;
  onMarginDraftChange: (value: string) => void;
  marginFieldError: boolean;
  marginHelperText: string;
  savingMargin: boolean;
  canCreatePromotion?: boolean;
}

export function DepartmentSettingsTab({
  marginDraft,
  onMarginDraftChange,
  marginFieldError,
  marginHelperText,
  savingMargin,
  canCreatePromotion = false,
}: DepartmentSettingsTabProps) {
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
          {canCreatePromotion && <Button variant="outlined">Nueva promoción</Button>}
        </PromotionsHeader>
        <TableCrud
          columns={departmentSettingsPromotionColumns}
          rows={departmentSettingsPromotionMockRows}
          rowKey="id"
          loading={false}
          emptyMessage="No hay promociones registradas"
        />
      </PromotionsCard>
    </Stack>
  );
}
