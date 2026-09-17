import { useRouter } from "next/router";
import dayjs from "@/lib/dayjs";
import { Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_PROMOTIONS_UPDATE } from "@/lib/permissions";
import type { ProductPromotionDraft } from "@/types/productos.types";
import { DraftCardRoot } from "./ProductPromotionDraftCard.styledComponents";

function capitalizeMonthToken(token: string): string {
  const t = token.trim();
  if (!t) {
    return t;
  }
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function formatPromotionDraftValidityRange(
  startDate: string,
  endDate: string | null | undefined
): string {
  const start = dayjs(startDate);
  if (!start.isValid()) {
    return "—";
  }
  const formatSegment = (d: ReturnType<typeof dayjs>) =>
    `${d.format("D")} de ${capitalizeMonthToken(d.format("MMM"))}, ${d.format("YYYY")}`;

  if (endDate) {
    const end = dayjs(endDate);
    if (end.isValid()) {
      return `Del ${formatSegment(start)} al ${formatSegment(end)}`;
    }
  }
  return `Del ${formatSegment(start)}`;
}

/** Persisted API id from a hydrated draft (`promo-123`). New drafts use `promo-<timestamp>-…`. */
export function parseLinkedPromotionId(draftId: string): number | undefined {
  const match = /^promo-(\d+)$/.exec(draftId);
  if (!match) {
    return undefined;
  }
  const promotionId = Number(match[1]);
  return Number.isFinite(promotionId) && promotionId >= 1 ? promotionId : undefined;
}

export interface ProductPromotionDraftCardProps {
  draft: ProductPromotionDraft;
  handleEdit: () => void;
  handleDelete: () => void;
  readOnly?: boolean;
}

export function ProductPromotionDraftCard({
  draft,
  handleEdit,
  handleDelete,
  readOnly = false,
}: ProductPromotionDraftCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const {
    name,
    startDate,
    endDate,
  } = draft.payload;

  const rangeLabel = formatPromotionDraftValidityRange(startDate, endDate);
  const affectedCount = draft.payload.productIds?.length ?? 1;
  const isShared = affectedCount > 1;
  const linkedPromotionId = parseLinkedPromotionId(draft.id);
  const canOpenCatalog =
    linkedPromotionId != null && hasPermission(CATALOG_PROMOTIONS_UPDATE);

  const creditTermLabels =
    draft.payload.creditTermOptionLabels?.filter(Boolean) ??
    (draft.payload.creditTermIds?.map((id) => String(id)) ?? []);
  const layawayTermLabels =
    draft.payload.layawayTermOptionLabels?.filter(Boolean) ??
    (draft.payload.layawayTermIds?.map((id) => String(id)) ?? []);

  const handleOpenCatalog = () => {
    if (linkedPromotionId == null) {
      return;
    }
    void router.push(`/catalogos/promociones/${linkedPromotionId}`);
  };

  return (
    <DraftCardRoot>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Stack>
            <Typography variant="subtitle1">{name}</Typography>
            <Typography variant="body2" color="text.secondary">{rangeLabel}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center">
            <Typography variant="h4">{draft.payload.discountRate}<span style={{ color: theme.palette.text.secondary }}>%</span></Typography>
          </Stack>
        </Stack>

        {
          draft.purchaseTypeCode === "CREDITO" &&
          <Grid container spacing={1}>
            <Grid size="auto">
              <Typography variant="body1">Plazos</Typography>
            </Grid>
            <Grid container size="grow" spacing={1}>
              {
                creditTermLabels.map((label, index) => (
                  <Grid size="auto">
                    <Chip key={`credit-${index}-${label}`} size="small" label={label} />
                  </Grid>
                ))
              }
            </Grid>
          </Grid>

        }

        {
          draft.purchaseTypeCode === "APARTADO" && layawayTermLabels.length > 0 ? (
            <Stack spacing={0.75}>
              <Typography variant="body1">
                Plazos
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                {layawayTermLabels.map((label, index) => (
                  <Chip key={`layaway-${index}-${label}`} size="small" label={label} />
                ))}
              </Stack>
            </Stack>
          ) : null
        }

        {!readOnly && isShared ? (
          <Typography variant="body2" color="text.secondary">
            Esta promoción aplica a {affectedCount} productos. Edítela desde el
            catálogo o desvincúlela de este artículo.
          </Typography>
        ) : null}

        {!readOnly ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {!isShared ? (
              <Button variant="text" onClick={handleEdit}>
                Editar
              </Button>
            ) : null}
            {canOpenCatalog ? (
              <Button variant="text" onClick={handleOpenCatalog}>
                Ver en catálogo
              </Button>
            ) : null}
            <Button variant="text" color="error" onClick={handleDelete}>
              Desvincular
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </DraftCardRoot>
  );
}
