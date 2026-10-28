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

/**
 * Unified 4:3 capture viewport for IdCapture and FaceCapture.
 * Sized via container queries against CaptureStepRoot so portrait and
 * landscape tablets fill the available area without black bands.
 */
export const CaptureViewport = styled("div")({
  boxSizing: "border-box",
  position: "relative",
  // Fallback before container queries. Width is derived from the same
  // max-height cap so the visor stays 4:3 when the tablet modal is short.
  width: "min(100%, 720px, calc(min(68dvh, 540px) * 4 / 3))",
  maxWidth: "100%",
  height: "auto",
  maxHeight: "min(68dvh, 540px)",
  aspectRatio: "4 / 3",
  flex: "0 1 auto",
  alignSelf: "center",
  minWidth: 0,
  minHeight: 0,
  marginInline: "auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#000",
  border: "none",
  "@container (min-height: 1px)": {
    height: "auto",
    width: "min(100cqi, 720px, calc(min(calc(100cqb - 48px), 540px) * 4 / 3))",
    maxHeight: "min(calc(100cqb - 48px), 540px)",
    aspectRatio: "4 / 3",
  },
  // The SDK replaces the host className, so these rules stay on the viewport.
  "& .NUBSDK_container, & [id$='-body'], & [id$='-media'], & .NUBSDK_FC_MEDIA_CONTAINER, & .NUBSDK_FC_SLIDES": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    margin: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  },
  "& video": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    margin: 0,
    padding: 0,
  },
});

/** @deprecated Use CaptureViewport — kept as alias for existing imports. */
export const IdCaptureViewport = CaptureViewport;

export const CaptureHost = styled("div")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  // Keep the SDK tree inside the 4:3 visor. `max-height: 100vh` from the SDK
  // stylesheet otherwise sizes the video (and the yellow guide) to the tablet screen.
  "& .NUBSDK_container, & [id$='-body'], & [id$='-media'], & .NUBSDK_FC_MEDIA_CONTAINER, & .NUBSDK_FC_SLIDES": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    margin: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  },
  "& video, & .NUBSDK_FC_MEDIA_VIDEO": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    padding: 0,
    margin: 0,
    boxSizing: "border-box",
  },
  "& canvas.NUBSDK_FC_CANVAS, & img.NUBSDK_FC_CANVAS_IMAGE": {
    position: "absolute",
    boxSizing: "border-box",
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
