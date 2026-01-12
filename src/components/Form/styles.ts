import { styled } from "@mui/material/styles";
import { Box, Typography, Button } from "@mui/material";

export const FormContainer = styled("form")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const FormHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const FormDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

export const FormContent = styled(Box)({
  flex: 1,
  width: "100%",
});

export const FormActions = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(3),
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
  "&:hover": {
    borderColor: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const ConfirmButton = styled(Button)(({ theme }) => ({
  minWidth: 100,
  backgroundColor: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));
