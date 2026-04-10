import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const PageContent = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

export const SidebarPanel = styled("div")(({ theme }) => ({
  width: 400,
  flexShrink: 0,
  [theme.breakpoints.down("lg")]: {
    width: "100%",
  },
}));

export const DepartmentsList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));
