import { styled } from "@mui/material/styles";
import { Typography, IconButton } from "@mui/material";

export const FormSection = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const ReadOnlyField = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
  minWidth: 160,
});

export const ReadOnlyLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

export const ReadOnlyValue = styled(Typography)(({ theme }) => ({
  fontSize: "0.9375rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

export const ReadOnlyFieldsRow = styled('div')(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  flexWrap: "wrap",
}));

export const RowActionsCell = styled('div')({
  display: "flex",
  justifyContent: "center",
});

export const RemoveRowButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const AddRowContainer = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  marginTop: theme.spacing(1),
}));

export const ErrorText = styled(Typography)(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.error.main,
}));

export const ReasonFieldsRow = styled('div')(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));
