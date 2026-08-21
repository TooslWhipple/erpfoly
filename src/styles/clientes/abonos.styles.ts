import { styled } from "@mui/material/styles";
import { Button, OutlinedInput } from "@mui/material";

const StackColumn = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const PageLayout = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(3),
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "1fr 360px",
    alignItems: "start",
  },
}));

export const SidebarColumn = styled(StackColumn)(({ theme }) => ({
  gap: theme.spacing(2),
}));

export const Card = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  padding: "24px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px"
}));

export const InnerCard = styled("div")<{ gap?: string }>(({ theme, gap = "16px" }) => ({
  display: "flex",
  flexDirection: "column",
  gap: gap,
  padding: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  width: "100%",
  minWidth: 0,
}));

export const GrayCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "12px",
  borderRadius: "12px",
  backgroundColor: theme.palette.background.lowerGray,
  width: "100%",
  minWidth: 0,
}));

export const InstallmentsTableWrapper = styled("div")({
  width: "100%",
  overflowX: "auto",
});

export const InstallmentsTable = styled("table")(({ theme }) => ({
  width: "max-content",
  minWidth: "100%",
  borderCollapse: "collapse",
  marginTop: "12px",
  "& th": {
    textAlign: "left",
    padding: theme.spacing(1, 1.5),
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.app.border}`,
  },
  "& td": {
    padding: theme.spacing(1.25, 1.5),
    fontSize: 14,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.app.border}`,
    verticalAlign: "middle",
  },
  "& tr:last-of-type td": {
    borderBottom: "none",
  },
}));

export const AmountInput = styled(OutlinedInput)(({ theme }) => ({
  width: 96,
  "& .MuiOutlinedInput-input": {
    padding: theme.spacing(0.75, 1),
    fontSize: 14,
    textAlign: "right",
  },
}));

export const CaptureCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "560px",
  gap: "24px",
  padding: "24px",
  backgroundColor: theme.palette.background.lowGray,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  [theme.breakpoints.down("md")]: {
    minHeight: "auto",
  },
}));

export const CaptureCardActions = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "auto",
}));

export const CaptureCardChangeRow = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderRadius: "8px",
  backgroundColor: theme.palette.background.mediumGray,
}));

export const CaptureAmountInput = styled(OutlinedInput)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  "& .MuiOutlinedInput-notchedOutline": {
    border: `1px solid ${theme.palette.app.border}`,
  },
  "& .MuiOutlinedInput-input": {
    padding: theme.spacing(1.5),
    fontSize: 32,
    fontWeight: 400,
    textAlign: "center",
    color: theme.palette.text.primary,
  },
}));

export const InstallmentsControl = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.75),
  width: "100%",
  padding: theme.spacing(1.5, 2),
  minHeight: 44,
  borderRadius: 12,
  backgroundColor: theme.palette.app.chip.variants.info.background,
  color: theme.palette.app.chip.variants.info.color,
}));

export const InstallmentsControlDivider = styled("div")(({ theme }) => ({
  height: 1,
  width: "100%",
  backgroundColor: theme.palette.app.chip.variants.info.color,
  opacity: 0.25,
}));

export const PaymentMethodButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  flex: 1,
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1.25),
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.app.border}`,
  "&:hover": {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.app.background.content,
  },
}));

export const SuccessCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2.5),
  maxWidth: 560,
  margin: "0 auto",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
}));

export const SuccessIconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 72,
  height: 72,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
}));

export const ReceiptDetailsCard = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  borderRadius: 12,
  backgroundColor: theme.palette.app.background.content,
  border: `1px solid ${theme.palette.app.border}`,
}));

export {
  ContentCard,
  FinancialSummaryRow,
  PaymentDot,
} from "@/styles/clientes/compra-detalle.styles";
