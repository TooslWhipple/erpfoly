import { styled } from "@mui/material/styles";
import { Chip, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

export type OrderStatus = "pending" | "in_progress" | "received";

export const CardContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  padding: "24px",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}));

export const ProgressBarContainer = styled('div')({
  position: "relative",
  height: 6,
  borderRadius: 3,
  overflow: "hidden",
  marginBottom: 12,
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

export const ContentRow = styled('div')({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
});

export const InfoSection = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
  flex: 1,
});

export const SupplierName = styled(Typography)({
  fontSize: 15,
  fontWeight: 500,
  color: theme.palette.text.primary,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const DateText = styled(Typography)({
  fontSize: 13,
  color: theme.palette.text.secondary,
});

export const ArrowContainer = styled('div')({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9CA3AF",
  flexShrink: 0,
  padding: "0 8px",
});

export const DestinationSection = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: 2,
  minWidth: 0,
  flex: 1,
});

export const DestinationName = styled(Typography)({
  fontSize: 15,
  fontWeight: 500,
  color: theme.palette.text.primary,
});

export const ItemCountText = styled(Typography)({
  fontSize: 14,
  color: theme.palette.text.secondary,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

interface StatusChipProps {
  statusType: OrderStatus;
}

export const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "statusType",
})<StatusChipProps>(({ statusType }) => {
  const statusStyles: Record<OrderStatus, { bg: string; text: string }> = {
    received: { bg: "#dcfce7", text: "#16a34a" },
    in_progress: { bg: "#dbeafe", text: "#2563eb" },
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

export const ListContainer = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const EmptyContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
}));
