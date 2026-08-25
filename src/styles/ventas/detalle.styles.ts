import { Box, Card, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";

export const DetailPageShell = styled(Box)(({ theme }) => ({
  minHeight: "100%",
  width: "100%",
  maxWidth: "100%",
  backgroundColor: theme.palette.background.default,
  boxSizing: "border-box",
}));

/** Matches SaleBuilder PageHeader so /ventas/[id] shares POS chrome spacing. */
export const DetailHeader = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing(1.5),
  flexWrap: "nowrap",
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  [theme.breakpoints.up(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(0, 0, 2),
    backgroundColor: "transparent",
    borderBottom: "none",
  },
  [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(1.5, 2),
    gap: theme.spacing(1),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(3),
  alignItems: "start",
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 380px",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "1fr 1fr",
  },
  [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
}));

export const invoiceDownloadButtonSx = {
  minHeight: 44,
  height: 44,
  maxHeight: 44,
  px: 1.5,
  "& .MuiButton-startIcon": {
    marginLeft: 0,
    marginRight: 1,
  },
} as const;

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
