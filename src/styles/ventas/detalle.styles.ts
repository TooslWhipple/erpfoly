import { Box, Card, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

export const DetailPageShell = styled(Box)(({ theme }) => ({
  minHeight: "100%",
  backgroundColor: theme.palette.background.default,
  paddingBottom: theme.spacing(3),
}));

export const DetailHeader = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 0),
  flexWrap: "wrap",
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(3),
  alignItems: "start",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 380px",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "1fr 1fr",
  },
  "& > *": {
    minWidth: 0,
  },
}));

export const DetailCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.app.border}`,
  boxShadow: "none",
  backgroundColor: theme.palette.background.paper,
}));

export const SummaryCard = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.lowerGray,
  padding: theme.spacing(2.5),
}));

export const BannerBox = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

export const InvoiceActionsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
}));

export const DatePickerBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  padding: theme.spacing(1, 1.5),
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  minWidth: 0,
  maxWidth: "100%",
}));
