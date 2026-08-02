import { styled } from "@mui/material/styles";
import { Chip, TextField, Typography } from "@mui/material";

export const LabelRow = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
});

export const Label = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginBottom: 4,
}));

export const SelectedContainer = styled("div")<{ disabled: boolean; error: boolean }>(
  ({ theme, disabled, error }) => ({
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.app.background.sidebar,
    border: `1px solid ${error ? theme.palette.error.main : theme.palette.app.border}`,
    borderRadius: theme.shape.borderRadius,
    minHeight: 56,
    opacity: disabled ? 0.6 : 1,
  }),
);

export const AvailableContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    fontSize: "14px",
    backgroundColor: theme.palette.app.background.sidebar,
  },
}));

export const SelectedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.app.chip.variants.disabled.background,
  borderRadius: 4,
  fontSize: "14px",
  fontWeight: 400,
  color: theme.palette.text.primary,
  height: 36,
}));

export const AvailableChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.app.chip.background,
  border: "none",
  borderRadius: 6,
  fontSize: "0.875rem",
  fontWeight: 400,
  color: theme.palette.text.secondary,
  height: 32,
  cursor: "pointer",
  transition: "all 0.15s ease",
  paddingRight: 8,
  "& .MuiChip-label": {
    paddingLeft: 12,
    paddingRight: 8,
  },
  "& .MuiChip-deleteIcon": {
    color: theme.palette.text.secondary,
    fontSize: 16,
    marginLeft: 4,
    marginRight: 0,
    "&:hover": {
      color: theme.palette.text.secondary,
    },
  },
  "&:hover": {
    backgroundColor: theme.palette.app.chip.background,
    opacity: 0.8,
  },
}));

export const HelperText = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  marginTop: 4,
}));

export const ErrorText = styled(HelperText)(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const EmptyText = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  fontStyle: "italic",
  opacity: 0.7,
}));
