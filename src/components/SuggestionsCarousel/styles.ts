import { styled } from "@mui/material/styles";

export const CarouselRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const CarouselControls = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const CarouselTrack = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  overflowX: "hidden",
  scrollBehavior: "smooth",
}));
