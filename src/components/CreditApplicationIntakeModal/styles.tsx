import { styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

export const StepContainer = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(3),
}));

export const StepContent = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  gap: theme.spacing(2),
}));

export const StepProgress = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

export const SdkBootstrapState = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  minHeight: 360,
  height: "50vh",
  [theme.breakpoints.up("md")]: {
    minHeight: 480,
    height: "clamp(420px, 55vh, 520px)",
  },
}));

export const SignatureSection = styled(Stack)(({ theme }) => ({
  width: "100%",
  gap: theme.spacing(2),
}));

export const SignatureCanvasWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  borderRadius: 16,
  overflow: "hidden",
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
}));

export const SignatureCanvas = styled("canvas", {
  shouldForwardProp: (prop) => prop !== "disabled",
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
  width: "100%",
  height: 240,
  display: "block",
  touchAction: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  backgroundColor: theme.palette.background.paper,
  cursor: disabled ? "not-allowed" : "crosshair",
  [theme.breakpoints.up("sm")]: {
    height: 280,
  },
  [theme.breakpoints.up("md")]: {
    height: 320,
  },
}));

export const SignatureLegalText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: "center",
}));

export const FooterActions = styled("div")(({ theme }) => ({
  flexShrink: 0,
  paddingTop: theme.spacing(1),
  position: "relative",
  zIndex: 2,
  width: "100%",
}));
