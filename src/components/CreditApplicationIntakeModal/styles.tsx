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
  "@media (orientation: landscape) and (max-height: 560px)": {
    gap: theme.spacing(1),
  },
}));

export const StepProgressRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  width: "100%",
  minWidth: 0,
  marginBottom: theme.spacing(1),
  "@media (orientation: landscape) and (max-height: 560px)": {
    marginBottom: 0,
  },
}));

export const StepProgress = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  minWidth: 0,
  flex: 1,
}));

export const SdkBootstrapState = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  minHeight: 200,
  height: "min(52dvh, 100%)",
  [theme.breakpoints.up("md")]: {
    minHeight: 280,
    height: "min(58dvh, 560px)",
  },
  "@media (orientation: landscape)": {
    minHeight: 160,
    height: "min(64dvh, 100%)",
  },
  "@media (orientation: landscape) and (max-height: 500px)": {
    minHeight: 140,
    height: "min(72dvh, calc(100dvh - 168px))",
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
  "@media (orientation: landscape) and (max-height: 560px)": {
    height: 180,
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
  "& .MuiButton-root": {
    minHeight: 44,
  },
}));
