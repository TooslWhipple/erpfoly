import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const ProductCard = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: theme.palette.app.chip.background,
}));

export const ProductThumbnail = styled("div")(({ theme }) => ({
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  flexShrink: 0,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper,
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

export const ValidationBanner = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px",
  borderRadius: "12px",
  backgroundColor: theme.palette.app.sidebar.itemSelected,
}));

export const FooterActions = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginTop: "auto",
  paddingTop: theme.spacing(2),
  width: "100%",
}));
