import { styled } from "@mui/material/styles";
import { Box, FormHelperText, Select, Typography } from "@mui/material";

export const FieldWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginBottom: "4px",
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  height: 36,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
    borderWidth: 1,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.text.disabled,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: 1,
  },
  "&.Mui-error .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.error.main,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
    },
  },
  "& .MuiSelect-select": {
    padding: "8px 12px",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
  },
})) as unknown as typeof Select;

export const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  marginLeft: 0,
  marginTop: theme.spacing(0.5),
}));
