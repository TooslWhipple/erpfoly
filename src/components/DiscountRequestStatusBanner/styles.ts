import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const BannerContainer = styled(Stack)(({ theme }) => ({
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: "#FFF7ED",
  borderRadius: 16,
  padding: `${theme.spacing(2.5)} ${theme.spacing(3)}`,
}));

export const StatusBadge = styled("div")({
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  gap: 8,
  borderRadius: 9999,
  backgroundColor: "#FFEDD5",
  color: "#EA580C",
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
});
