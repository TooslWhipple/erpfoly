import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const SignatureSection = styled(Stack)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
}));

export const SignatureLegalText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: "center",
}));
