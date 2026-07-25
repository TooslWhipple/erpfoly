import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import type { ReceptionStatus } from "@/types/recepcion-mercancias.types";

// Re-export for backward compatibility
export type { ReceptionStatus };

// ============================================================================
// STATUS CHIP COMPONENT
// ============================================================================

const DEFAULT_CHIP_COLORS = { bg: "#e5e7eb", text: "#374151" } as const;

export const StatusChip = styled(Chip)<{ statusType: ReceptionStatus }>(({ statusType }) => {
    const colors: Record<ReceptionStatus, { bg: string; text: string }> = {
        pre_captured: { bg: "#dcfce7", text: "#16a34a" },
        captured: { bg: "#dbeafe", text: "#2563eb" },
        costed: { bg: "#f3e8ff", text: "#9333ea" },
    };
    const style = colors[statusType] ?? DEFAULT_CHIP_COLORS;
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: "13px",
        borderRadius: "6px",
    };
});
