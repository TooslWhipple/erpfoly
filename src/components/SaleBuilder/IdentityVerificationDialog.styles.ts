import { alpha, styled } from "@mui/material/styles";
import { Box, DialogContent } from "@mui/material";
import { CaptureViewport } from "@/components/NubariumCapturePreview/styles";

export const IdentityDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  overflow: "hidden",
}));

export const CameraStage = styled(CaptureViewport)({
  flex: "0 0 auto",
});

export const CameraOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== "dimmed",
})<{ dimmed?: boolean }>(({ theme, dimmed }) => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: dimmed
    ? alpha(theme.palette.background.default, 0.88)
    : theme.palette.background.default,
  zIndex: 1,
}));

export const CameraOverlayStill = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.28,
  pointerEvents: "none",
});
