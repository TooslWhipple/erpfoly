import { alpha, styled } from "@mui/material/styles";

/** Full-width mint track with a center marker (design: under names, above dates). */
export const RouteProgressTrack = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 4,
  borderRadius: 999,
  backgroundColor: theme.palette.app.chip.variants.success.background,
  overflow: "visible",
}));

export const RouteProgressDot = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.dark,
  boxShadow: `0 0 0 2px ${alpha(theme.palette.success.dark, 0.12)}`,
  transform: "translate(-50%, -50%)",
}));
