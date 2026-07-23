import { styled } from "@mui/material/styles";
import { Box, Button, LinearProgress, TextField, Typography } from "@mui/material";

export const ModalContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const DescriptionText = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}));

export const StatsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
}));

export const StatRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
});

export const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: "0.9375rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

export const MismatchBanner = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: theme.palette.app.chip.variants.info.background,
}));

export const MismatchText = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  lineHeight: 1.5,
}));

export const ReasonTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
  },
}));

export const ProgressBlock = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

export const ProgressHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const ProgressLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const ProgressPercent = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const PrintProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.app.border,
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

export const ModalActions = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
}));

export const ConfirmButton = styled(Button)({
  minWidth: 160,
  textTransform: "none",
  fontWeight: 500,
});

export const CancelButton = styled(Button)({
  minWidth: 100,
  textTransform: "none",
  fontWeight: 500,
});
