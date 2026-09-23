import { alpha, styled } from "@mui/material/styles";
import { Stack, Typography } from "@mui/material";

const touchLandscape = "@media (orientation: landscape) and (pointer: coarse)";

export const ShellBody = styled(Stack)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  gap: theme.spacing(2),
  containerType: "size",
  [touchLandscape]: {
    overflow: "hidden",
    gap: theme.spacing(1),
  },
}));

export const HeaderBlock = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  flexShrink: 0,
  [touchLandscape]: {
    gap: theme.spacing(1),
  },
}));

export const HeaderText = styled("div")({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});

export const HeaderSide = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
}));

export const Eyebrow = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 13,
  lineHeight: 1.4,
  marginBottom: theme.spacing(0.75),
  [touchLandscape]: {
    marginBottom: theme.spacing(0.25),
    fontSize: 12,
  },
}));

export const StepTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.35rem",
  fontWeight: 700,
  lineHeight: 1.25,
  color: theme.palette.text.primary,
  [touchLandscape]: {
    fontSize: "1.05rem",
  },
}));

export const StepSubtitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: 14,
  lineHeight: 1.45,
  [touchLandscape]: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 1.3,
  },
}));

export const StepperRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  width: "100%",
  [touchLandscape]: {
    gap: theme.spacing(0.75),
  },
}));

export const TrackRow = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  width: "100%",
}));

export const TrackSegment = styled("div", {
  shouldForwardProp: (prop) => prop !== "filled",
})<{ filled?: boolean }>(({ theme, filled }) => ({
  flex: 1,
  height: 4,
  borderRadius: 999,
  backgroundColor: filled ? theme.palette.primary.main : theme.palette.app.background.lowGray,
}));

export const StepsRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
}));

export const StepItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  minWidth: 0,
  flex: 1,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(0.5),
  },
}));

export const StepBadge = styled("div", {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: "complete" | "active" | "upcoming" }>(({ theme, status }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  fontSize: 13,
  fontWeight: 700,
  ...(status === "complete" && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  }),
  ...(status === "active" && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
  }),
  ...(status === "upcoming" && {
    backgroundColor: theme.palette.app.background.lowerGray,
    color: theme.palette.text.secondary,
  }),
}));

export const StepLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "status",
})<{ status: "complete" | "active" | "upcoming" }>(({ theme, status }) => ({
  fontSize: 14,
  fontWeight: status === "upcoming" ? 500 : 600,
  lineHeight: 1.3,
  color: status === "upcoming" ? theme.palette.text.secondary : theme.palette.text.primary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  [theme.breakpoints.down("sm")]: {
    fontSize: 12,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
    lineHeight: 1.2,
  },
  [touchLandscape]: {
    fontSize: 12,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
    lineHeight: 1.2,
  },
}));

export const SuccessBanner = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.success.main, 0.08),
  border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const SuccessBannerText = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.25),
  minWidth: 0,
}));

export const SuccessIcon = styled("div")(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
}));

export const SuccessTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 15,
  lineHeight: 1.3,
  color: theme.palette.success.dark,
}));

export const SuccessSubtitle = styled(Typography)(({ theme }) => ({
  marginTop: 2,
  fontSize: 13,
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
}));

export const HintRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  flexShrink: 0,
  [touchLandscape]: {
    gap: theme.spacing(0.75),
    "& .MuiTypography-root": {
      fontSize: 12,
      lineHeight: 1.3,
    },
  },
}));

export const FooterRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  [touchLandscape]: {
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
}));

export const FooterActions = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
}));

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
