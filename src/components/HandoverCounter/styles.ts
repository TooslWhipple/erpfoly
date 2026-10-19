import { Box } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const SectionCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

export const LineCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "highlighted" && prop !== "muted",
})<{ highlighted?: boolean; muted?: boolean }>(({ theme, highlighted, muted }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  border: `1px solid ${highlighted ? theme.palette.success.main : theme.palette.divider}`,
  backgroundColor: highlighted
    ? alpha(theme.palette.success.main, 0.14)
    : theme.palette.background.paper,
  opacity: muted ? 0.65 : 1,
  transition: "background-color 200ms ease, border-color 200ms ease",
}));

export const FeedbackBanner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  fontWeight: 600,
  color: theme.palette.error.contrastText,
  backgroundColor: theme.palette.error.main,
}));
