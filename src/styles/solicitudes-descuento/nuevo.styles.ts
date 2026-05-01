import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { theme } from "@/styles/theme";

export const DiscountCard = styled('div')({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  wrap: "nowrap",
  width: "100%",
  backgroundColor: "#FFF7ED",
  border: `1px solid #FFEDD5`,
  borderRadius: "16px",
  padding: "16px 20px",
  gap: "8px"
});

export const TotalCard = styled('div')({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  wrap: "nowrap",
  background: "#F4F4F5",
  borderRadius: '12px',
  padding: '20px',
});

export const SectionCard = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  padding: "24px"
});

export const SectionGrayCard = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  backgroundColor: "#F4F4F5",
  borderRadius: "16px",
  padding: "24px"
});

export const ChangeLink = styled(Typography)({
  fontSize: 13,
  color: theme.palette.text.primary,
  cursor: "pointer",
  fontWeight: 500,
  "&:hover": {
    textDecoration: "underline",
  },
});

export const ItemsList = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 20
});

export const ItemCard = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

export const ItemImage = styled('div')({
  width: 64,
  height: 64,
  backgroundColor: "#E5E7EB",
  borderRadius: 8,
  flexShrink: 0,
});

export const SummaryCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  padding: "20px",
  position: "sticky",
  top: theme.spacing(2),
}));

export const MapPlaceholder = styled('div')({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  color: "#71717A",
  height: "112px",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "6px",
});