import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

export type DamageStatus = "pending" | "in_progress" | "completed" | "cancelled";

export const INVENTORY_COLORS = {
    green: "#16a34a",
    greenBorder: "#86efac",
    yellow: "#ca8a04",
    yellowBorder: "#fde047",
    red: "#dc2626",
    redBorder: "#fca5a5",
    /** Cero / neutro — no usar verde de “disponible”. */
    zero: "#71717A",
};

/**
 * Color de cantidad de inventario según signo.
 * Negativos siempre en rojo; cero en gris; positivos usan `positiveColor`.
 */
export function inventoryQuantityColor(
    value: number,
    positiveColor: string,
): string {
    if (value < 0) return INVENTORY_COLORS.red;
    if (value === 0) return INVENTORY_COLORS.zero;
    return positiveColor;
}

export const StatusText = styled("span")<{ status: DamageStatus }>(({ status }) => {
    const statusColors: Record<DamageStatus, string> = {
        pending: "#ea580c",
        in_progress: "#2563eb",
        completed: "#16a34a",
        cancelled: "#71717A",
    };
    return {
        color: statusColors[status],
        fontWeight: 500,
    };
});

export const TimeCell = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 6,
});

export const WarningIconStyled = styled(WarningIcon)({
    color: "#ca8a04",
    fontSize: 18,
});
