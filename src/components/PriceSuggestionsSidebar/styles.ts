import { styled } from "@mui/material/styles";

export const SidebarIcon = styled("div")(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: 6,
  backgroundColor: theme.palette.app.chip.variants.infoAlt.background,
  color: theme.palette.app.chip.variants.infoAlt.color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
