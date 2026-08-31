import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";
import type { DiscountRequestStatus } from "@/types/ventas.types";

export const BANNER_STATUS_STYLES: Record<
  DiscountRequestStatus,
  { containerBg: string; badgeBg: string; badgeColor: string }
> = {
  PENDING: {
    containerBg: "#FFF7ED",
    badgeBg: "#FFEDD5",
    badgeColor: "#EA580C",
  },
  APPROVED: {
    containerBg: "#F0FDF4",
    badgeBg: "#DCFCE7",
    badgeColor: "#15803D",
  },
  REJECTED: {
    containerBg: "#FEF2F2",
    badgeBg: "#FECACA",
    badgeColor: "#DC2626",
  },
  INVALIDATED: {
    containerBg: "#F8FAFC",
    badgeBg: "#E2E8F0",
    badgeColor: "#475569",
  },
};

export const BannerContainer = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: DiscountRequestStatus }>(({ theme, status }) => ({
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: BANNER_STATUS_STYLES[status].containerBg,
  borderRadius: 16,
  padding: `${theme.spacing(2.5)} ${theme.spacing(3)}`,
}));

export const StatusBadge = styled("div", {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: DiscountRequestStatus }>(({ status }) => ({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  gap: 8,
  borderRadius: 9999,
  backgroundColor: BANNER_STATUS_STYLES[status].badgeBg,
  color: BANNER_STATUS_STYLES[status].badgeColor,
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
}));
