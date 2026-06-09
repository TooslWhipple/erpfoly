import { styled } from "@mui/material/styles";
import { Box, Button, Typography } from "@mui/material";
import { theme } from "@/styles/theme";

// ============================================================================
// CARD
// ============================================================================

export const CardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: "16px"
}));

export const ProductImage = styled('img')({
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  objectFit: "cover",
  backgroundColor: "#F3F4F6",
  flexShrink: 0,
});

export const ImagePlaceholder = styled('div')({
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  backgroundColor: "#F3F4F6",
  flexShrink: 0,
});

export const PriceListContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 0,
});

export const PriceListItem = styled(Box)({
  display: "flex",
  alignItems: "stretch",
  gap: 0,
});

export const TimelineColumn = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: 24,
  flexShrink: 0,
  paddingTop: 6,
  paddingBottom: 2,
}));

export const TimelineDot = styled(Box)<{ active?: boolean }>(({ theme, active }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: active ? theme.palette.primary.main : theme.palette.app.border,
  flexShrink: 0,
  zIndex: 1,
}));

export const TimelineLine = styled(Box)({
  width: 2,
  flex: 1,
  minHeight: 12,
  backgroundColor: theme.palette.app.border,
  marginTop: 6,
  marginBottom: 2,
});

export const PriceRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlighted",
})<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  padding: "8px",
  borderRadius: "12px",
  backgroundColor: highlighted ? theme.palette.app.sidebar.itemSelected : "transparent",
  flex: 1,
  minWidth: 0,
  marginLeft: theme.spacing(1.5),
}));

export const PriceRowContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});

export const PriceAmount = styled(Typography)<{ active?: boolean }>(({ theme, active }) => ({
  fontSize: 18,
  fontWeight: 700,
  color: active !== false ? theme.palette.text.primary : theme.palette.text.secondary,
}));

export const PriceChange = styled(Box)<{ active?: boolean }>(({ theme, active }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  fontWeight: 700,
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
}));

export const ApplyButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  textTransform: "none",
  fontWeight: 600,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
}));
