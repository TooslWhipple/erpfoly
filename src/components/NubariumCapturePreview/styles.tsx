import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

const touchLandscape = "@media (orientation: landscape) and (pointer: coarse)";

export const CaptureStepRoot = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  width: "100%",
  height: "100%",
  gap: theme.spacing(1.5),
  alignItems: "stretch",
  containerType: "size",
  "@media (orientation: landscape) and (max-height: 560px)": {
    gap: theme.spacing(1),
  },
  [touchLandscape]: {
    gap: theme.spacing(1),
    justifyContent: "center",
  },
}));

export const CaptureViewport = styled("div")({
  boxSizing: "border-box",
  position: "relative",
  width: "min(100%, calc(min(68dvh, 560px) * 4 / 3))",
  maxWidth: "100%",
  aspectRatio: "4 / 3",
  height: "auto",
  flex: "0 0 auto",
  minWidth: 0,
  marginInline: "auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#000",
  border: "none",
  "@media (orientation: landscape)": {
    width: "min(100%, calc(min(72dvh, 480px) * 4 / 3))",
  },
  "@media (orientation: landscape) and (max-height: 500px)": {
    width: "min(100%, calc(min(78dvh, 360px) * 4 / 3))",
    borderRadius: 12,
  },
  maxHeight: "min(68dvh, 560px)",
  "@container (min-height: 1px)": {
    [touchLandscape]: {
      // Height-driven (Safari-safe) but use the full step area; cap by width×3/4.
      width: "auto",
      height: "min(100cqb - 36px, 100cqi * 3 / 4)",
      maxWidth: "min(100cqi, 100%)",
      maxHeight: "none",
      aspectRatio: "4 / 3",
    },
  },
});

/**
 * IdCapture viewport must stay 4:3 — that is the surface Nubarium actually
 * paints (e.g. canvas3 at 420×315). Rotation is handled in JS, not by the box.
 *
 * Fullscreen + iPad landscape: Safari keeps `width` when `max-height` clamps
 * `aspect-ratio`, so a width-driven box becomes wider than the canvas and shows
 * black bands. Drive that case by height and let width follow 4:3.
 */
export const IdCaptureViewport = styled("div")({
  boxSizing: "border-box",
  position: "relative",
  width: "min(100%, 560px)",
  maxWidth: "100%",
  aspectRatio: "4 / 3",
  height: "auto",
  flex: "0 1 auto",
  alignSelf: "center",
  minWidth: 0,
  minHeight: 0,
  marginInline: "auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#000",
  border: "none",
  maxHeight: "min(52dvh, 420px)",
  "@media (orientation: landscape) and (pointer: fine)": {
    width: "min(100%, calc(min(64dvh, 320px) * 4 / 3))",
    maxHeight: "min(64dvh, 320px)",
  },
  // Fallback before container queries; kept modest so it cannot overflow the modal.
  [touchLandscape]: {
    width: "auto",
    height: "min(55dvh, calc((100vw - 48px) * 3 / 4))",
    maxWidth: "min(100%, calc(100vw - 48px))",
    maxHeight: "none",
    aspectRatio: "4 / 3",
    borderRadius: 12,
  },
  "@container (min-height: 1px)": {
    // Portrait / desktop: width-driven, locked to remaining step area.
    width: "min(100cqi, calc((100cqb - 48px) * 4 / 3), 560px)",
    maxHeight: "min(calc(100cqb - 48px), 420px)",
    aspectRatio: "4 / 3",
    [touchLandscape]: {
      width: "auto",
      // Fill the step area (leave room for the hint row); cap so width stays ≤ 100cqi.
      height: "min(100cqb - 48px, 100cqi * 3 / 4)",
      maxWidth: "min(100cqi, 100%)",
      maxHeight: "none",
      aspectRatio: "4 / 3",
    },
  },
});

export const CaptureHost = styled("div")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  // Absolute fill so the SDK tree cannot leave a taller empty black band.
  "& [id$='-body'], & [id$='-media'], & .NUBSDK_FC_MEDIA_CONTAINER, & .NUBSDK_FC_SLIDES": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    maxHeight: "none",
  },
  "& video, & .NUBSDK_FC_MEDIA_VIDEO": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "none",
    maxHeight: "none",
    objectFit: "cover",
    padding: 0,
    margin: 0,
  },
  // Full-frame SDK overlays track the video box; the yellow guide keeps attribute size.
  "& canvas.NUBSDK_FC_CANVAS": {
    maxWidth: "none",
    maxHeight: "none",
  },
  "& canvas.NUBSDK_FC_CANVAS-SSH": {
    display: "none",
  },
  "& .NUBSDK_FC_CANVAS_MESSAGE": {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    width: "100%",
    zIndex: 20,
    pointerEvents: "none",
    boxSizing: "border-box",
  },
  "& iframe": {
    width: "100%",
    height: "100%",
  },
});

export const PreviewRoot = styled(Stack)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
}));

export const PreviewGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  "@media (orientation: landscape)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: theme.spacing(1.5),
  },
  [touchLandscape]: {
    gap: theme.spacing(1),
  },
}));

export const PreviewItem = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const PreviewLabel = styled(Typography)(({ theme }) => ({
  textAlign: "left",
  color: theme.palette.text.secondary,
  fontSize: 13,
}));

export const PreviewImageFrame = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "4 / 3",
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: theme.palette.app.background.lowerGray,
  border: `1px solid ${theme.palette.app.border}`,
  "@media (orientation: landscape) and (max-height: 560px)": {
    aspectRatio: "16 / 9",
  },
  [touchLandscape]: {
    aspectRatio: "16 / 9",
    maxHeight: "min(28dvh, 220px)",
  },
}));

export const PreviewImage = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
});

export const CaptureErrorState = styled(Stack)(({ theme }) => ({
  width: "100%",
  flexShrink: 0,
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.error.light}`,
}));
