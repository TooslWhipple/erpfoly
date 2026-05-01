import { styled } from "@mui/material/styles";
import { Box, Chip, Typography } from "@mui/material";

export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 400,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

export const ChipsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.app.background.sidebar,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: theme.shape.borderRadius,
  minHeight: 56,
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.app.background.sidebar,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 6,
  fontSize: "0.875rem",
  fontWeight: 400,
  color: theme.palette.text.primary,
  height: 32,
  "& .MuiChip-deleteIcon": {
    color: theme.palette.text.secondary,
    fontSize: 16,
    "&:hover": {
      color: theme.palette.text.primary,
    },
  },
}));

export const EmptyChipsText = styled(Box)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  fontStyle: "italic",
  opacity: 0.7,
}));
