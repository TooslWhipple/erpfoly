import { styled } from "@mui/material/styles";
import { Box, TextField, Typography } from "@mui/material";

export const FieldWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    height: 36,
    "& fieldset": {
      borderColor: theme.palette.divider,
      borderWidth: 1,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.text.disabled,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
    "&.Mui-error fieldset": {
      borderColor: theme.palette.error.main,
    },
    "&.Mui-disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: "8px 12px",
    fontSize: "0.875rem",
    height: "auto",
    "&::placeholder": {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    marginTop: theme.spacing(0.5),
  },
  "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
    height: "auto",
    padding: 0,
  },
}));
