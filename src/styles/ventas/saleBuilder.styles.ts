import { Button, OutlinedInput, Stack } from "@mui/material";
import { alpha, styled, type SxProps, type Theme } from "@mui/material/styles";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";

/** Outlined fields in the sale flow: same radius, height and border. */
export const saleInputSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root, &.MuiOutlinedInput-root": {
    borderRadius: 1,
    backgroundColor: "background.paper",
    minHeight: 40,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "divider",
    },
    "&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "text.secondary",
    },
    "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
      borderWidth: 1,
    },
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: 40,
    boxSizing: "border-box",
  },
};

/** Click targets that should read as the same field (fecha de entrega). */
export const saleFieldTriggerSx: SxProps<Theme> = {
  minHeight: 40,
  boxSizing: "border-box",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  px: 1.75,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  cursor: "pointer",
  bgcolor: "background.paper",
  fontSize: "0.875rem",
  fontWeight: 400,
  "&:hover": {
    borderColor: "text.secondary",
  },
};

export const PageShell = styled('div', {
  shouldForwardProp: (prop) => prop !== "contained",
})<{ contained?: boolean }>(({ theme, contained }) => ({
  minHeight: "100%",
  width: "100%",
  maxWidth: "100%",
  backgroundColor: theme.palette.background.default,
  boxSizing: "border-box",
  ...(contained
    ? {
      display: "flex",
      flexDirection: "column",
      flex: "1 1 0%",
      minHeight: 0,
      overflow: "hidden",
    }
    : {}),
}));

export const PageHeader = styled('div')(({ theme }) => ({
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

export const SearchHeader = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 3),
  flexShrink: 0,
  position: "sticky",
  top: 0,
  zIndex: 3,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.app.border}`,
  [theme.breakpoints.up(SALES_POS_BREAKPOINT)]: {
    padding: theme.spacing(0, 0, 2),
    backgroundColor: theme.palette.background.default,
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

export const SearchInputWrap = styled('div')({
  flex: 1,
  minWidth: 0,
});

export const PageContent = styled('div')(({ theme }) => ({
  flex: "1 1 0%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
}));

export const MainGrid = styled('div')(({ theme }) => ({
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

export const CheckoutGrid = styled('div')(({ theme }) => ({
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

export const Card = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
}));

export const GrayCard = styled('div')(({ theme }) => ({
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

export const EmptyCartBox = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.lowerGray,
  borderRadius: 12,
  padding: theme.spacing(5, 2),
  textAlign: "center",
}));

export const CartItemCard = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

export const CartItemThumb = styled('div')(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 8,
  objectFit: "cover",
  flexShrink: 0,
  backgroundColor: theme.palette.background.lowerGray,
}));

export const PriceSummaryRow = styled('div')(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(1.5),
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

export const PriceField = styled('div')({
  minWidth: 0,
});

export const TotalBar = styled('div')(({ theme }) => ({
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
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.app.border
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
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.app.border
    }`,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.app.background.content,
  },
}));

export const ProductDetailLayout = styled('div')(({ theme }) => ({
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

export const ProductGallery = styled('div')(({ theme }) => ({
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

export const ProductDetailPanel = styled('div')({
  flex: 1,
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
});

export const InventorySourceCard = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(1.75, 2),
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
}));

export const InventorySourceRow = styled('div')(({ theme }) => ({
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

export const InventorySourceMeta = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flex: "1 1 auto",
  minWidth: 0,
  flexWrap: "wrap",
}));

export const InventorySourceActions = styled('div')(({ theme }) => ({
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

export const CaptureCard = styled('div')(({ theme }) => ({
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

export const PaymentIconBadge = styled('div')(({ theme }) => ({
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
  borderRadius: theme.shape.borderRadius,
  "&:not(.Mui-disabled)": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.app.border,
  },
  "&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
  {
    borderColor: theme.palette.text.secondary,
  },
  "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: 1,
  },
  "&.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.error.main,
  },
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

export const PaymentErrorBanner = styled('div')(({ theme }) => ({
  backgroundColor: alpha(theme.palette.error.main, 0.08),
  color: theme.palette.error.main,
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.5,
}));

export const ChangeRow = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.mediumGray,
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const TouchButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  height: 44,
  maxHeight: 44,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  "& .MuiButton-startIcon": {
    marginLeft: 0,
    marginRight: theme.spacing(1),
  },
}));
