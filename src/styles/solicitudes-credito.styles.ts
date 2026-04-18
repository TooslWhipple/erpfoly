import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { colors } from "@/styles/theme";

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

export const RiskCard = styled("div")(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
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

export const ProductCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "16px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  backgroundColor: colors.background.sidebar,
}));

export const ProductImage = styled("img")(({ theme }) => ({
  width: "64px",
  height: "64px",
  objectFit: "cover",
  borderRadius: "12px",
  flexShrink: 0,
}));

export const SummaryRow = styled("div")<{ withBackground?: boolean }>(({ withBackground = true }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 12px",
  backgroundColor: (withBackground) ? colors.chip.background : "transparent",
  borderRadius: "12px"
}));

/** Read-only credit application review page content shell */
export const RevisionContentWrapper = styled("div")(({ theme }) => ({
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
}));

export const RevisionErrorContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  color: colors.text.secondary,
}));
