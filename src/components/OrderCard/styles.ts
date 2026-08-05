import { styled } from "@mui/material/styles";
import { Chip, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

export type OrderStatus = "pending" | "scheduled" | "in_progress" | "received";

export const Card = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: "16px 24px",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}));

export const ProgressBarContainer = styled('div')({
  position: "relative",
  height: "8px",
  borderRadius: "12px",
  overflow: "hidden",
  backgroundColor: "#e5e7eb",
});

interface ProgressBarFillProps {
  fillColor: string;
  progress: number;
}

export const ProgressBarFill = styled('div', {
  shouldForwardProp: (prop) => prop !== "fillColor" && prop !== "progress",
})<ProgressBarFillProps>(({ fillColor, progress }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${progress}%`,
  backgroundColor: fillColor,
  borderRadius: 3,
  transition: "width 0.3s ease",
}));

interface StatusChipProps {
  statusType: OrderStatus;
}

export const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "statusType",
})<StatusChipProps>(({ statusType }) => {
  const statusStyles: Record<OrderStatus, { bg: string; text: string }> = {
    received: { bg: "#dcfce7", text: "#16a34a" },
    in_progress: { bg: "#dbeafe", text: "#2563eb" },
    scheduled: { bg: "#ede9fe", text: "#7c3aed" },
    pending: { bg: "#ffedd5", text: "#ea580c" },
  };
  const style = statusStyles[statusType];
  return {
    backgroundColor: style.bg,
    color: style.text,
    fontWeight: 500,
    fontSize: 13,
    borderRadius: 6,
    height: 28,
  };
});

export const EmptyContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}));
