import { styled } from "@mui/material/styles";
import { Typography, IconButton, TextField } from "@mui/material";
import { theme } from "@/styles/theme";

export const TabsContainer = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const FormCard = styled('div')({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "8px",
  gap: "24px",
  padding: "24px"
});

export const NumberInputContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
}));

export const NumberInputPrefix = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  fontWeight: 400,
  marginRight: theme.spacing(0.5),
}));

export const NumberInputWrapper = styled('div')<{ size?: "small" | "medium" }>(({ theme, size = "medium" }) => ({
  display: "flex",
  alignItems: "center",
  gap: size === "small" ? theme.spacing(0.25) : theme.spacing(0.5),
  borderRadius: 10,
  padding: size === "small" ? theme.spacing(0.5) : theme.spacing(1),
  backgroundColor: "#F5F5F5",
  boxShadow: "none",
}));

export const NumberInputButton = styled(IconButton)<{ inputSize?: "small" | "medium" }>(({ theme, inputSize = "medium" }) => ({
  width: inputSize === "small" ? 28 : 36,
  height: inputSize === "small" ? 28 : 36,
  minWidth: inputSize === "small" ? 28 : 36,
  padding: 0,
  backgroundColor: "#FFFFFF",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "50%",
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "#F9F9F9",
    borderColor: theme.palette.primary.main,
  },
  "&:active": {
    backgroundColor: "#F0F0F0",
  },
  "&:disabled": {
    opacity: 0.4,
    backgroundColor: "#FFFFFF",
    borderColor: theme.palette.app.border,
  },
  transition: "all 0.2s ease",
  "& .MuiSvgIcon-root": {
    fontSize: inputSize === "small" ? "1rem" : "1.25rem",
  },
}));

export const NumberInputField = styled(TextField)<{ inputSize?: "small" | "medium" }>(({ theme, inputSize = "medium" }) => ({
  width: inputSize === "small" ? 60 : 80,
  minWidth: inputSize === "small" ? 60 : 80,
  "& .MuiOutlinedInput-root": {
    height: inputSize === "small" ? 28 : 36,
    backgroundColor: "transparent",
    "& fieldset": {
      border: "none",
    },
    "& input": {
      padding: inputSize === "small" ? theme.spacing(0.25, 0.5) : theme.spacing(0.5, 1),
      textAlign: "center",
      fontSize: inputSize === "small" ? "0.8125rem" : "0.9375rem",
      fontWeight: 700, // Bold number
      color: "#232325",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
}));

export const NumberInputLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  fontWeight: 400,
  margin: theme.spacing(0, 1),
}));

export const NumberInputArrow = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.secondary,
  fontSize: "1.25rem",
  margin: theme.spacing(0, 1),
}));

export const CurrencyInputWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  borderRadius: 10,
  backgroundColor: "#F5F5F5",
  padding: theme.spacing(1),
  boxShadow: "none",
}));

export const StepperUnitLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  fontWeight: 400,
  marginLeft: theme.spacing(0.5),
  whiteSpace: "nowrap",
}));

export const StepperGroupLabel = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: 10,
  backgroundColor: "#F5F5F5",
  padding: theme.spacing(1),
  height: 52,
  boxSizing: "border-box",
  "& .MuiTypography-root": {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
  },
}));

export const CurrencyInputField = styled(TextField)(({ theme }) => ({
  width: 100,
  minWidth: 100,
  "& .MuiOutlinedInput-root": {
    height: 36,
    backgroundColor: "transparent",
    "& fieldset": {
      border: "none",
    },
    "& input": {
      padding: theme.spacing(0.5, 1),
      textAlign: "center",
      fontSize: "0.9375rem",
      fontWeight: 700,
      color: "#232325",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
}));
