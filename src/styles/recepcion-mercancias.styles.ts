import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import type { ReceptionStatus } from "@/types/recepcion-mercancias.types";

// Re-export for backward compatibility
export type { ReceptionStatus };

// ============================================================================
// STATUS CHIP COMPONENT
// ============================================================================

export const StatusChip = styled(Chip)<{ statusType: ReceptionStatus }>(({ statusType }) => {
    const colors: Record<ReceptionStatus, { bg: string; text: string }> = {
        pre_captured: { bg: "#dcfce7", text: "#16a34a" },
        captured: { bg: "#dbeafe", text: "#2563eb" },
        costed: { bg: "#f3e8ff", text: "#9333ea" },
    };
    const style = colors[statusType];
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: "13px",
        borderRadius: "6px",
    };
});
