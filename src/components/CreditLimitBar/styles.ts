import { styled } from "@mui/material/styles";
import { Box, Typography, LinearProgress } from "@mui/material";
import { colors } from "@/styles/theme";

export const CreditLimitBarRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 180,
}));

export const CreditLimitBarTitle = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 600,
  color: theme.palette.primary.main,
  lineHeight: 1.3,
}));

export const CreditLimitProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  width: "100%",
  backgroundColor: theme.palette.primary.light,
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.dark,
  },
}));

export const CreditLimitLabelsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(2),
  marginTop: theme.spacing(0.5),
}));

export const CreditLimitLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.primary.main,
  "& strong": {
    fontWeight: 600,
  },
}));
