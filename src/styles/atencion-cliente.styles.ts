import { styled } from "@mui/material/styles";
import { Button, TextField, Select, Typography, IconButton } from "@mui/material";


export const SearchPageContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== "pinnedTop",
})<{ pinnedTop?: boolean }>(({ theme, pinnedTop }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: pinnedTop ? "flex-start" : "center",
  minHeight: "calc(100vh - 200px)",
  padding: theme.spacing(pinnedTop ? 2 : 4, 4, 4),
  gap: theme.spacing(3),
}));

export const LogoContainer = styled('div')({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 16,
});

export const LogoText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "compact",
})<{ compact?: boolean }>(({ theme, compact }) => ({
  fontSize: compact ? 22 : 32,
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

export const SearchBarContainer = styled('div')(({ theme }) => ({
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

export const SearchResultsList = styled('div')(({ theme }) => ({
  width: "100%",
  maxWidth: 800,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const SearchResultsHeader = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(0, 0.5),
}));

export const SearchResultCard = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2, 2.5),
  color: theme.palette.text.primary,
  transition: "border-color 120ms ease, background-color 120ms ease",
  "&:hover": {
    backgroundColor: theme.palette.app.background.lowerGray,
    borderColor: theme.palette.primary.light,
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export const SearchResultIcon = styled('div')(({ theme }) => ({
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.app.background.lowerBlue,
  color: theme.palette.primary.main,
}));

export const SearchResultBody = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
  flex: 1,
});

export const SearchResultMeta = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const SearchResultAside = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 4,
  flexShrink: 0,
  color: theme.palette.text.secondary,
}));

export const SearchEmptyState = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(6, 3),
  textAlign: "center",
  backgroundColor: theme.palette.background.paper,
  border: `1px dashed ${theme.palette.app.border}`,
  borderRadius: 16,
  color: theme.palette.text.secondary,
}));

export const ActivityTimeline = styled('div')(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  paddingLeft: theme.spacing(1),
}));

export const ActivityItem = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2),
}));

export const ActivityIcon = styled('div', {
  shouldForwardProp: (prop) => prop !== "tone",
})<{ tone?: "payment" | "status" | "note" }>(({ theme, tone = "status" }) => {
  const tones = {
    payment: theme.palette.app.chip.variants.success,
    status: theme.palette.app.chip.variants.info,
    note: theme.palette.app.chip.variants.infoAlt,
  };
  const { background, color } = tones[tone];
  return {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: background,
    color,
  };
});

export const MenuIconButton = styled(IconButton)(({ theme }) => ({
  width: "32px",
  height: "32px",
  padding: "4px",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "6px",
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper
}));

export const MoreOptionsButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: 8,
}));

export const FinancialSummary = styled('div')(({ theme }) => ({
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


export const PaymentIndicator = styled('div')(({ theme }) => ({
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

export const PaymentDots = styled('div')(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

export const PaymentDot = styled('div', {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ theme, active }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: active
    ? theme.palette.primary.main
    : theme.palette.app.background.lowGray,
}));

export const EmptyState = styled('div')(({ theme }) => ({
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

export const ArticlesList = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const ArticleCard = styled('div')(({ theme }) => ({
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

export const ArticleLeft = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 0,
  flex: 1,
}));

export const ArticleMetaRow = styled('div')(({ theme }) => ({
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

export const ArticleDetails = styled('div')(({ theme }) => ({
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

export const ArticleDetailItem = styled('div')({
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

export const ContentLayout = styled('div')(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "flex-start",
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const MainContent = styled('div')({
  flex: 1,
  minWidth: 0,
  width: "100%",
});

export const SummaryPanel = styled('div')(({ theme }) => ({
  width: "272px",
  flexShrink: 0,
  position: "sticky",
  top: "16px",
  [theme.breakpoints.down("lg")]: {
    width: "100%",
    position: "relative",
    top: 0,
  }
}));

export const SummaryCard = styled('div')(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  gap: "8px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: "16px 8px",
  overflow: "hidden"
}));

export const SummaryTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

export const SummaryTotalRow = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px",
  borderRadius: "8px",
  backgroundColor: theme.palette.app.background.lowGray,
}));

export const ModalMetaRow = styled('div')(({ theme }) => ({
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

export const InfoGrid = styled('div')(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const InfoField = styled('div')(({ theme }) => ({
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

export const ArticleMetaInfo = styled('div')(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

export const EvidenceRow = styled('div')(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
}));

export const EvidenceThumb = styled('div')(({ theme }) => ({
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

export const ModalFooterActions = styled('div')(({ theme }) => ({
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

export const ServiceOrderBadge = styled('div')(({ theme }) => ({
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

export const DetailHeaderActions = styled('div')(({ theme }) => ({
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

export const CostSection = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.app.background.lowerGray,
}));

export const SwitchRow = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
}));

export const RadioGroupResponsive = styled('div')(({ theme }) => ({
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

export const DamagedGoodsCard = styled('div')(({ theme }) => ({
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

export const AlertBox = styled('div', {
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

export const ArticleActionsRow = styled('div')(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(1),
}));
