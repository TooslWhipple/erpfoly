import { styled } from "@mui/material/styles";
import { Box, Button, Chip, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT
// ============================================================================

export const PageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const MainContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const SidePanel = styled(Box)(({ theme }) => ({
  width: 320,
  flexShrink: 0,
  [theme.breakpoints.down("lg")]: {
    width: "100%",
    order: -1,
  },
}));

// ============================================================================
// HEADER
// ============================================================================

export const HeaderSection = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: "wrap",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const TitleSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: 28,
  fontWeight: 700,
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    fontSize: 24,
  },
}));

export const ActionsSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  height: 40,
  textTransform: "none",
  fontWeight: 500,
}));

// ============================================================================
// DISCOUNT REQUESTED CARD (yellow box)
// ============================================================================

export const DiscountCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FEF4C7",
  border: `1px solid #FDE68A`,
  borderRadius: 8,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1),
}));

export const DiscountCardFooter = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 4,
});

export const PendingBadge = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  color: "#EA580C",
  fontWeight: 500,
});

// ============================================================================
// SECTIONS (Artículos, Tipo de venta, Cliente, Entrega)
// ============================================================================

export const SectionCard = styled(Box)(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
}));

export const SectionTitle = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#232325",
  marginBottom: 12,
});

export const SectionSubtitle = styled(Typography)({
  fontSize: 13,
  color: "#71717A",
  marginBottom: 16,
});

export const SectionHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
});

export const ChangeLink = styled(Typography)({
  fontSize: 13,
  color: colors.sidebar?.textSelected ?? "#2663EB",
  cursor: "pointer",
  fontWeight: 500,
  "&:hover": {
    textDecoration: "underline",
  },
});

// ============================================================================
// CLIENT INFO
// ============================================================================

export const ClientName = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  color: "#232325",
  marginBottom: 4,
});

export const ClientDetail = styled(Typography)({
  fontSize: 14,
  color: "#71717A",
  marginBottom: 2,
});

export const ClientNotice = styled(Box)(({ theme }) => ({
  backgroundColor: colors.chip?.background ?? "#F1F5F9",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(1.5),
  fontSize: 13,
  color: "#71717A",
}));

export const ActiveChip = styled(Chip)({
  backgroundColor: "#DCFCE7",
  color: "#16A34A",
  fontWeight: 500,
  fontSize: 12,
  height: 22,
  "& .MuiChip-label": { paddingLeft: 8, paddingRight: 8 },
});

// ============================================================================
// ARTICLES LIST (item card)
// ============================================================================

export const ItemsList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 20
});

export const ItemCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: 'column',
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

export const ItemImage = styled(Box)({
  width: 64,
  height: 64,
  backgroundColor: "#E5E7EB",
  borderRadius: 8,
  flexShrink: 0,
});

export const ItemInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const ItemCode = styled(Typography)({
  fontSize: 13,
  color: "#71717A",
  marginBottom: 4,
});

export const ItemName = styled(Typography)({
  fontSize: 15,
  fontWeight: 500,
  color: "#232325",
});

export const ItemPriceTable = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  marginTop: theme.spacing(1.5),
  flexWrap: "wrap",
}));

export const PriceColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

export const PriceLabel = styled(Typography)({
  fontSize: 12,
  color: "#71717A",
});

export const PriceValue = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: "#232325",
});

export const DiscountValue = styled(PriceValue)({
  color: "#DC2626",
});

// ============================================================================
// SUMMARY (right panel)
// ============================================================================

export const SummaryCard = styled(Box)(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: theme.spacing(2.5),
  position: "sticky",
  top: theme.spacing(2),
}));

export const SummaryRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
});

export const SummaryLabel = styled(Typography)({
  fontSize: 14,
  color: "#71717A",
});

export const SummaryValue = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#232325",
  textAlign: "right",
});

export const TotalRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${colors.border}`,
  marginTop: theme.spacing(1),
}));

export const TotalLabel = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: "#232325",
});

export const TotalValue = styled(Typography)({
  fontSize: 24,
  fontWeight: 700,
  color: "#232325",
});

export const EngancheRow = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  borderTop: `1px dashed ${colors.border}`,
}));

// ============================================================================
// DELIVERY
// ============================================================================

export const MapPlaceholder = styled(Box)(({ theme }) => ({
  height: 160,
  backgroundColor: "#F4F4F5",
  border: `1px dashed ${colors.border}`,
  borderRadius: 8,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  color: "#71717A",
  fontSize: 14,
  marginTop: 12,
  marginBottom: 16,
  padding: theme.spacing(1.5, 2),
  gap: 8,
}));

export const DeliveryFieldBlock = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "&:last-of-type": {
    marginBottom: 0,
  },
}));

export const DeliveryFieldLabel = styled(Typography)({
  fontSize: 13,
  color: "#71717A",
  marginBottom: 4,
});

export const DeliveryFieldRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
});

export const DeliveryFieldValue = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const DeliveryFieldText = styled(Typography)({
  fontSize: 15,
  fontWeight: 500,
  color: "#232325",
});

export const DeliveryFieldSecondary = styled(Typography)({
  fontSize: 14,
  color: "#71717A",
  marginTop: 2,
});
