import { styled } from "@mui/material/styles";
import { Box, Typography, Button } from "@mui/material";

export const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexDirection: "row",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  paddingRight: 56,
  [theme.breakpoints.down("md")]: {
    paddingRight: 48,
  },
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing(1.5),
  },
}));

export const TitleContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  "& .MuiTypography-h2": {
    [theme.breakpoints.down("md")]: {
      fontSize: 24,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 20,
    },
  },
}));

export const Description = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));

export const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  flexShrink: 0,
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    "& .MuiButton-root": {
      width: "100%",
      justifyContent: "center",
    },
  },
}));
