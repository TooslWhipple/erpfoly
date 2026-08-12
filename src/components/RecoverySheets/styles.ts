import { styled } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const invoiceLinkButtonSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 14,
  padding: 0,
  minWidth: 0,
  justifyContent: "flex-start",
  color: "primary.main",
  "&:hover": {
    backgroundColor: "transparent",
    textDecoration: "underline",
  },
};

export const statusMenuButtonSx: SxProps<Theme> = (theme) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 999,
  padding: theme.spacing(0.25, 0.75),
  minWidth: 0,
  border: "none",
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
  gap: theme.spacing(0.5),
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    boxShadow: "none",
  },
  [theme.breakpoints.down("sm")]: {
    flex: 1,
    justifyContent: "space-between",
  },
});

export const externalLinkIconButtonSx: SxProps<Theme> = (theme) => ({
  border: "none",
  borderRadius: 1,
  width: 28,
  height: 28,
  flexShrink: 0,
  color: theme.palette.primary.main,
  padding: 0,
  marginTop: 2,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
});

export const optionsIconButtonSx: SxProps<Theme> = (theme) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 1.25,
  width: 32,
  height: 32,
});

export const DetailPageStack = styled(Stack)(({ theme }) => ({
  width: "100%",
  minWidth: 0,
  gap: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    gap: theme.spacing(2.5),
  },
}));

export const DetailToolbarRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const DetailHeaderActions = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "space-between",
  },
}));

export const DetailHeroSection = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  maxWidth: 760,
  width: "100%",
}));

export const DetailBadgeRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(0.75),
  color: theme.palette.primary.main,
}));

export const DetailMetaGrid = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  columnGap: theme.spacing(5),
  rowGap: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    columnGap: 0,
  },
}));

export const DetailMetaItem = styled(Stack)({
  gap: 4,
  minWidth: 100,
});

export const ContentLayout = styled(Stack)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 320px",
  alignItems: "start",
  gap: theme.spacing(3),
  width: "100%",
  minWidth: 0,
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const MainColumn = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  minWidth: 0,
  width: "100%",
}));

export const SideColumn = styled(Stack)(({ theme }) => ({
  minWidth: 0,
  width: "100%",
  position: "sticky",
  top: theme.spacing(2),
  [theme.breakpoints.down("lg")]: {
    position: "relative",
    top: 0,
  },
}));

export const LinkedCard = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2.5),
  gap: theme.spacing(1.75),
  width: "100%",
  minWidth: 0,
  alignItems: "stretch",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
}));

export const LinkedCardBodyRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  minWidth: 0,
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
}));

export const LinkedCardBodyMain = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

export const LinkedCardThumb = styled("div")(({ theme }) => ({
  width: 104,
  height: 78,
  borderRadius: 12,
  overflow: "hidden",
  flexShrink: 0,
  backgroundColor: theme.palette.app.background.lowerBlue,
  border: `1px solid ${theme.palette.app.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.down("sm")]: {
    width: 88,
    height: 66,
  },
}));

export const LinkedCardThumbMuted = styled(LinkedCardThumb)(({ theme }) => ({
  backgroundColor: theme.palette.app.background.lowerGray,
}));

export const LinkedCardContent = styled(Stack)({
  flex: 1,
  minWidth: 0,
  gap: 6,
  paddingTop: 2,
});

export const LinkedCardMetaRow = styled(Stack)({
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
});

export const LinkedCardDateColumn = styled(Stack)(({ theme }) => ({
  alignItems: "flex-end",
  gap: 4,
  flexShrink: 0,
  minWidth: 128,
  textAlign: "right",
  marginLeft: "auto",
  paddingTop: 2,
  [theme.breakpoints.down("sm")]: {
    alignItems: "flex-start",
    textAlign: "left",
    marginLeft: 0,
    width: "100%",
    paddingTop: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.app.border}`,
  },
}));

export const ServiceOrderCommentBox = styled(Stack)(({ theme }) => ({
  width: "100%",
  alignSelf: "stretch",
  minWidth: 0,
  boxSizing: "border-box",
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  backgroundColor: theme.palette.app.background.lowerBlue,
}));

export const DocumentPanel = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  width: "100%",
  minWidth: 0,
  alignItems: "stretch",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
}));

export const DocumentPreview = styled("div")(({ theme }) => ({
  width: "100%",
  height: 240,
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `linear-gradient(180deg, ${theme.palette.app.background.lowerGray} 0%, ${theme.palette.background.paper} 42%)`,
  },
}));

export const DocumentPreviewLines = styled(Stack)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  padding: theme.spacing(2.5, 2),
  gap: theme.spacing(1),
  height: "100%",
}));

export const DocumentPreviewLine = styled("div")(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.app.border,
  width: "100%",
  opacity: 0.65,
}));

export const MapRouteLine = styled("div")(({ theme }) => ({
  width: "72%",
  height: 3,
  borderRadius: 999,
  background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  transform: "rotate(-16deg)",
}));

export const MapThumbBackdrop = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  background: `radial-gradient(circle at 28% 38%, ${theme.palette.primary.light}44 0%, transparent 52%), linear-gradient(135deg, ${theme.palette.app.background.lowerBlue} 0%, ${theme.palette.background.paper} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 6,
}));

export const WarehouseIconBox = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.app.background.lowerGray,
}));

export const SofaThumbBackdrop = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  background: `linear-gradient(180deg, ${theme.palette.app.background.lowerGray} 0%, ${theme.palette.background.paper} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
