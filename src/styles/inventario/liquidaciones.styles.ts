import { styled } from "@mui/material/styles";

export const SidebarPanel = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
  padding: 0,
  [theme.breakpoints.up("md")]: {
    flex: "0 1 400px",
    width: "auto",
    padding: "48px 0",
  },
}));
