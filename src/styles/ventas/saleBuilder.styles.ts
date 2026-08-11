import { Box, Button, OutlinedInput, Stack } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";

export const PageShell = styled(Box)(({ theme }) => ({
  minHeight: "100%",
  width: "100%",
  maxWidth: "100%",
  backgroundColor: theme.palette.background.default,
  boxSizing: "border-box",
}));

export const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  flexWrap: "nowrap",
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  // Desktop: ContentWrapper already pads — avoid a double-inset “floating” bar.
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

export const HeaderActions = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "nowrap",
  flexShrink: 0,
  gap: theme.spacing(1.5),
  [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
    gap: theme.spacing(1),
    "& .MuiButton-root": {
      minHeight: 40,
      whiteSpace: "nowrap",
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    },
  },
}));

export const SearchHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
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
    flexWrap: "nowrap",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    flexWrap: "wrap",
  },
}));

export const SearchInputWrap = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const PageContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
  },
}));

export const MainGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(3),
  alignItems: "start",
  padding: theme.spacing(3),
  // Two columns once there is enough width (tablet landscape without sidebar).
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 320px)",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "minmax(0, 1fr) 360px",
  },
  [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
  "& > *": {
    minWidth: 0,
  },
}));

export const CheckoutGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(3),
  alignItems: "start",
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 340px)",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "minmax(0, 1fr) 380px",
  },
  [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
  "& > *": {
    minWidth: 0,
  },
}));

export const StickySidebar = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  [theme.breakpoints.up(SALES_POS_BREAKPOINT)]: {
    position: "sticky",
    top: theme.spacing(2),
    alignSelf: "start",
  },
}));

export const Card = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
}));

export const GrayCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.background.lowerGray,
  width: "100%",
  minWidth: 0,
}));

export const SidebarCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  gap: theme.spacing(1.5),
}));

export const EmptyCartBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.lowerGray,
  borderRadius: 12,
  padding: theme.spacing(5, 2),
  textAlign: "center",
}));

export const CartItemCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

export const CartItemThumb = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 8,
  objectFit: "cover",
  flexShrink: 0,
  backgroundColor: theme.palette.background.lowerGray,
})) as typeof Box;

export const PriceSummaryRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1.5),
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

export const PriceField = styled(Box)({
  minWidth: 0,
});

export const TotalBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.lowerGray,
  borderRadius: 8,
  padding: theme.spacing(1.25, 1.5),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const PaymentTypeRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  flexWrap: "nowrap",
  gap: theme.spacing(1),
  width: "100%",
}));

export const PaymentTypeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  flex: "1 1 0",
  minWidth: 0,
  minHeight: 40,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  whiteSpace: "nowrap",
  fontSize: 13,
  fontWeight: 600,
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  color: active
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  border: `1px solid ${
    active ? theme.palette.primary.main : theme.palette.app.border
  }`,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.app.background.content,
  },
  "&.Mui-disabled": {
    opacity: 0.6,
  },
}));

export const TermPillsRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  gap: theme.spacing(1),
  overflowX: "auto",
  paddingBottom: theme.spacing(0.5),
  WebkitOverflowScrolling: "touch",
}));

export const TermPill = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  minWidth: 80,
  minHeight: 44,
  borderRadius: theme.shape.borderRadius,
  flexShrink: 0,
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  color: active
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  border: `1px solid ${
    active ? theme.palette.primary.main : theme.palette.app.border
  }`,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.app.background.content,
  },
}));

export const ProductDetailLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  alignItems: "flex-start",
  [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
  // Stack gallery above details when the content column is narrow (tablet POS).
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

export const ProductGallery = styled(Box)(({ theme }) => ({
  flex: "0 0 36%",
  minWidth: 240,
  maxWidth: 400,
  width: "100%",
  [theme.breakpoints.down("md")]: {
    flex: "none",
    minWidth: 0,
    maxWidth: "100%",
  },
}));

export const ProductDetailPanel = styled(Box)({
  flex: 1,
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
});

export const InventorySourceCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(1.75, 2),
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
}));

export const InventorySourceRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  width: "100%",
  minWidth: 0,
  flexWrap: "wrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const InventorySourceMeta = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flex: "1 1 auto",
  minWidth: 0,
  flexWrap: "wrap",
}));

export const InventorySourceActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
  flex: "0 0 auto",
  flexWrap: "wrap",
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    justifyContent: "space-between",
  },
}));

export const CaptureCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.lowGray,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  minHeight: 480,
  [theme.breakpoints.down("md")]: {
    minHeight: "auto",
  },
}));

export const PaymentMethodRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.app.border}`,
  paddingBottom: theme.spacing(1.5),
}));

export const PaymentIconBadge = styled(Box)(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: theme.palette.background.mediumGray,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

export const PaymentAmountInput = styled(OutlinedInput)(({ theme }) => ({
  width: 180,
  maxWidth: "100%",
  backgroundColor: "transparent",
  borderRadius: 12,
  "& .MuiOutlinedInput-input": {
    textAlign: "right",
    fontSize: "1.15rem",
    fontWeight: 400,
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
  },
  "&.Mui-error .MuiOutlinedInput-input": {
    color: theme.palette.error.main,
  },
  [theme.breakpoints.down("sm")]: {
    width: 140,
  },
}));

export const PaymentErrorBanner = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.error.main, 0.08),
  color: theme.palette.error.main,
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.5,
}));

export const ChangeRow = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.mediumGray,
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const TouchButton = styled(Button)({
  minHeight: 44,
});
