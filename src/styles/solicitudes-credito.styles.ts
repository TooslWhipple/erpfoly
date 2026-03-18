import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// Layout - two columns (sidebar + content)
// ============================================================================

export const DetailLayout = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  alignItems: "flex-start",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

export const SidebarColumn = styled("div")(({ theme }) => ({
  width: 260,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

export const ContentColumn = styled("div")(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

// ============================================================================
// Risk card (div-based, no Box/Paper)
// ============================================================================

export const RiskCard = styled("div")(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius:  "16px",
  padding: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px"
}));

export const RiskBar = styled("div")(({ theme }) => ({
  width: 6,
  height: 40,
  borderRadius: 3,
  background: "linear-gradient(to top, #DC2626 0%, #EA580C 35%, #22C55E 100%)",
  flexShrink: 0,
}));

export const RiskScore = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 700,
  color: colors.text.primary,
}));

export const RiskLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 500,
  color: colors.chip.variants.pending.color,
  backgroundColor: colors.chip.variants.pending.background,
  padding: "2px 8px",
  borderRadius: 6,
}));

// ============================================================================
// Content section card (div-based)
// ============================================================================

export const SectionCard = styled("div")(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "16px",
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: theme.spacing(1),
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: colors.text.secondary,
  marginBottom: theme.spacing(2),
}));

// ============================================================================
// Document / biometric row (green check + text + thumbnail)
// ============================================================================

export const VerifiedRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "24px",
  padding: "16px",
  backgroundColor: '#0596690F',
  borderRadius: "8px"
}));

export const VerifiedCheck = styled("div")(({ theme }) => ({
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  backgroundColor: "#05966929",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

export const VerifiedThumb = styled("img")(({ theme }) => ({
  width: 48,
  height: 48,
  objectFit: "cover",
  borderRadius: 6,
  marginLeft: "auto",
}));

// ============================================================================
// Purchase intention product row
// ============================================================================

export const ProductRow = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  border: `1px solid ${colors.border}`,
  borderRadius: theme.shape.borderRadius ?? 8,
  backgroundColor: colors.background.sidebar,
  marginBottom: theme.spacing(2),
}));

export const ProductImage = styled("img")(({ theme }) => ({
  width: 80,
  height: 80,
  objectFit: "cover",
  borderRadius: 6,
  flexShrink: 0,
}));

export const SummaryRow = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1.5, 2),
  backgroundColor: colors.chip.background,
  borderRadius: theme.shape.borderRadius ?? 8,
  marginTop: theme.spacing(1),
}));
