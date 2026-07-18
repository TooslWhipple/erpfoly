import { styled } from "@mui/material/styles";
import { Box, Button, TextField, Select, Typography, IconButton } from "@mui/material";

// ============================================================================
// SEARCH PAGE STYLES
// ============================================================================

export const SearchPageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "calc(100vh - 200px)",
  padding: theme.spacing(4),
  gap: theme.spacing(4),
}));

export const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 16,
});

export const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.2,
  "& .foly": {
    color: theme.palette.error.main,
  },
  "& .soft": {
    color: theme.palette.text.primary,
  },
}));

export const VersionText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
  marginLeft: 8,
}));

export const SearchBarContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  width: "100%",
  maxWidth: 800,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.app.border}`,
}));

export const SearchTypeSelect = styled(Select)(({ theme }) => ({
  minWidth: 140,
  backgroundColor: theme.palette.background.paper,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.app.border,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.app.border,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
})) as unknown as typeof Select;

export const SearchInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const SearchButton = styled(Button)({
  minWidth: 120,
  height: 40,
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 8,
});

// ============================================================================
// DETAIL PAGE STYLES
// ============================================================================

export const DetailPageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    gap: theme.spacing(2),
  },
}));

export const TopBar = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing(1.5),
  },
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  flexWrap: "nowrap",
  width: "100%",
  minWidth: 0,
}));

export const TitleSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
  flex: 1,
});

export const InvoiceNumber = styled(Typography)(({ theme }) => ({
  fontSize: 28,
  fontWeight: 700,
  color: theme.palette.text.primary,
  lineHeight: 1.2,
  wordBreak: "break-word",
  [theme.breakpoints.down("sm")]: {
    fontSize: 22,
  },
}));

export const PurchaseDate = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
}));

export const HeaderRightSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "flex-start",
  },
}));

export const MoreOptionsButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: 8,
}));

export const FinancialSummary = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  flexWrap: "wrap",
  alignItems: "flex-end",
  width: "100%",
  [theme.breakpoints.down("md")]: {
    gap: theme.spacing(2),
  },
  [theme.breakpoints.down("sm")]: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "start",
    gap: theme.spacing(2),
  },
}));

export const FinancialItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 120,
  [theme.breakpoints.down("sm")]: {
    minWidth: 0,
  },
}));

export const FinancialLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

export const FinancialValue = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 700,
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    fontSize: 15,
  },
}));

export const PaymentIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: theme.spacing(1),
  marginLeft: "auto",
  [theme.breakpoints.down("sm")]: {
    gridColumn: "1 / -1",
    marginLeft: 0,
    alignItems: "flex-start",
    width: "100%",
  },
}));

export const PaymentDots = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

export const PaymentDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ theme, active }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.app.background.lowGray,
}));

export const PaymentText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
  fontSize: 14,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
}));

export const ArticlesList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const ArticleCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2.5),
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    padding: theme.spacing(2),
  },
}));

export const ArticleLeft = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 0,
  flex: 1,
}));

export const ArticleMetaRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

export const ArticleCode = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const ArticleDescription = styled(Typography)(({ theme }) => ({
  fontSize: 15,
  fontWeight: 600,
  color: theme.palette.text.primary,
  wordBreak: "break-word",
}));

export const ServiceOrderButton = styled(Button)(({ theme }) => ({
  alignSelf: "flex-start",
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  color: theme.palette.warning.dark,
  padding: theme.spacing(0.5, 1),
  minWidth: 0,
  "&:hover": {
    backgroundColor: theme.palette.app.chip.variants.pending.background,
  },
}));

export const ArticleDetails = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(3),
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  [theme.breakpoints.down("sm")]: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(1.5),
  },
}));

export const ArticleDetailItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 88,
});

export const ArticleDetailLabel = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const ArticleDetailValue = styled(Typography)(({ theme }) => ({
  fontSize: 15,
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const ContentLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "flex-start",
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const MainContent = styled(Box)({
  flex: 1,
  minWidth: 0,
  width: "100%",
});

export const SummaryPanel = styled(Box)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  position: "sticky",
  top: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    width: "100%",
    position: "relative",
    top: 0,
  },
}));

export const SummaryCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2.5),
  overflow: "hidden",
}));

export const SummaryTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

export const SummaryRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const SummaryLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.secondary,
}));

export const SummaryValue = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: "right",
}));

export const SummaryTotalRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: theme.spacing(0.5, -2.5, -2.5),
  padding: theme.spacing(1.5, 2.5),
  backgroundColor: theme.palette.app.background.lowerBlue,
}));

export const SummaryTotalLabel = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const SummaryTotalValue = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

// ============================================================================
// CREATE SERVICE ORDER MODAL
// ============================================================================

export const ModalMetaRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  color: theme.palette.text.secondary,
  fontSize: 14,
}));

export const ModalInvoiceLink = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.primary.main,
  cursor: "default",
}));

export const InfoGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const InfoField = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
}));

export const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
}));

export const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

export const ArticleMetaInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

export const EvidenceRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
}));

export const EvidenceThumb = styled(Box)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: 12,
  overflow: "hidden",
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.app.background.lowerGray,
  position: "relative",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
}));

export const EvidenceAddButton = styled("button")(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: 12,
  border: `1px dashed ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  "&:hover": {
    backgroundColor: theme.palette.app.background.lowerGray,
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}));

export const EvidenceRemoveButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 2,
  right: 2,
  width: 22,
  height: 22,
  padding: 0,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const ModalFooterActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
  marginTop: "auto",
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.app.border}`,
}));

// ============================================================================
// SERVICE ORDER DETAIL MODAL
// ============================================================================

export const ServiceOrderBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  fontSize: 13,
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

export const ServiceOrderTitle = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontWeight: 700,
  color: theme.palette.text.primary,
  lineHeight: 1.25,
}));

export const GeneratedByText = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

export const DetailHeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    "& > *": {
      width: "100%",
    },
  },
}));

export const StatusMenuButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 8,
  padding: theme.spacing(0.75, 1.25),
  minWidth: 0,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.app.background.lowerGray,
  },
  [theme.breakpoints.down("sm")]: {
    justifyContent: "space-between",
  },
}));

export const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

export const CostSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.app.background.lowerGray,
}));

export const SwitchRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
}));

export const RadioGroupResponsive = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    "& > *": {
      width: "100%",
    },
  },
}));

export const DamagedGoodsCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.app.background.lowerGray,
  },
}));

export const AlertBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tone",
})<{ tone?: "warning" | "info" }>(({ theme, tone = "info" }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  fontSize: 13,
  lineHeight: 1.45,
  ...(tone === "warning"
    ? {
        backgroundColor: theme.palette.app.chip.variants.pending.background,
        color: theme.palette.app.chip.variants.pending.color,
        border: `1px solid ${theme.palette.warning.light}`,
      }
    : {
        backgroundColor: theme.palette.app.background.lowerBlue,
        color: theme.palette.primary.dark,
        border: `1px solid ${theme.palette.app.border}`,
      }),
}));

export const AlertLinkButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  padding: 0,
  minWidth: 0,
  color: theme.palette.primary.main,
  textDecoration: "underline",
  "&:hover": {
    backgroundColor: "transparent",
    textDecoration: "underline",
  },
}));

export const ArticleActionsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(1),
}));
