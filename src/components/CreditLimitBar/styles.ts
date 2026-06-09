import { styled } from "@mui/material/styles";
import { LinearProgress } from "@mui/material";

export const CreditLimitBarRoot = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: "272px",
}));


export const CreditLimitProgress = styled(LinearProgress)(({ theme }) => ({
  height: "16px",
  borderRadius: "32px",
  width: "100%",
  backgroundColor: theme.palette.background.lowGray,
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.dark,
  },
}));