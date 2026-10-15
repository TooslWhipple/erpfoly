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
      width: "min(100cqi, calc((100cqb - 36px) * 4 / 3))",
      maxWidth: "100%",
      maxHeight: "calc(100cqb - 36px)",
      height: "auto",
      aspectRatio: "4 / 3",
    },
  },
});

/**
 * IdCapture viewport must stay 4:3 — that is the surface Nubarium actually
 * paints (e.g. canvas3 at 420×315). A taller 3:4 box only adds black letterboxing
 * under the photo. Rotation is handled in JS (autorotate patch), not by the box.
 */
export const IdCaptureViewport = styled("div")({
  boxSizing: "border-box",
  position: "relative",
  width: "min(100%, 560px)",
  maxWidth: "100%",
  aspectRatio: "4 / 3",
  height: "auto",
  flex: "0 1 auto",
  minWidth: 0,
  minHeight: 0,
  marginInline: "auto",
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#000",
  border: "none",
  maxHeight: "min(52dvh, 420px)",
  "@media (orientation: landscape)": {
    width: "min(100%, calc(min(64dvh, 320px) * 4 / 3))",
    maxHeight: "min(64dvh, 320px)",
  },
  "@media (orientation: landscape) and (max-height: 500px)": {
    width: "min(100%, calc(min(72dvh, 260px) * 4 / 3))",
    maxHeight: "min(72dvh, 260px)",
    borderRadius: 12,
  },
  // Fit the remaining ShellBody / step area (header + stepper already consumed).
  "@container (min-height: 1px)": {
    width: "min(100cqi, calc((100cqb - 48px) * 4 / 3), 560px)",
    maxHeight: "min(calc(100cqb - 48px), 420px)",
    aspectRatio: "4 / 3",
    [touchLandscape]: {
      width: "min(100cqi, calc((100cqb - 28px) * 4 / 3))",
      maxHeight: "calc(100cqb - 28px)",
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
