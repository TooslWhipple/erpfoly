import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { theme } from "@/styles/theme";

export const DiscountCard = styled('div')({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  width: "100%",
  minWidth: 0,
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
  flexWrap: "wrap",
  gap: 8,
  minWidth: 0,
  background: "#F4F4F5",
  borderRadius: '12px',
  padding: '20px',
});

export const SectionCard = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: 0,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  padding: "24px",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

export const SectionGrayCard = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: 0,
  backgroundColor: "#F4F4F5",
  borderRadius: "16px",
  padding: "24px",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

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
  minWidth: 0,
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