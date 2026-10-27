import { alpha, styled } from "@mui/material/styles";

export const ModalShell = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
});

export const HeaderArea = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 3, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2, 2, 1.5),
  },
}));

export const HeaderText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  minWidth: 0,
}));

export const HeaderChips = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(0.5),
}));

/** Una columna en móvil y tableta vertical; dos columnas desde `md`. */
export const BodyGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: theme.spacing(3),
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: theme.spacing(2.5, 3),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    alignItems: "start",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2.5),
  },
}));

export const MainColumn = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  minWidth: 0,
}));

export const SideColumn = styled("aside")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  [theme.breakpoints.up("md")]: {
    position: "sticky",
    top: 0,
  },
}));

export const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
}));

export const SectionHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  minHeight: 36,
}));

export const StepBadge = styled("span", {
  shouldForwardProp: (prop) => prop !== "done",
})<{ done?: boolean }>(({ theme, done }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: "50%",
  fontSize: "0.75rem",
  fontWeight: 600,
  flexShrink: 0,
  color: done
    ? theme.palette.primary.contrastText
    : theme.palette.text.secondary,
  backgroundColor: done
    ? theme.palette.primary.main
    : theme.palette.action.selected,
  transition: "background-color 0.2s",
}));

export const SectionTitle = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const LineList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const LineRow = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected" && prop !== "blocked",
})<{ selected?: boolean; blocked?: boolean }>(
  ({ theme, selected, blocked }) => ({
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    gap: theme.spacing(1.5),
    minHeight: 64,
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 12,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.app.border}`,
    backgroundColor: blocked
      ? theme.palette.action.hover
      : selected
        ? alpha(theme.palette.primary.main, 0.06)
        : theme.palette.background.paper,
    cursor: blocked ? "default" : "pointer",
    opacity: blocked ? 0.75 : 1,
    transition: "border-color 0.2s, background-color 0.2s",
    "&:hover": blocked
      ? undefined
      : { borderColor: theme.palette.primary.main },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "auto minmax(0, 1fr)",
    },
  }),
);

export const LineInfo = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.25),
  minWidth: 0,
}));

export const LineControls = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
  [theme.breakpoints.down("sm")]: {
    gridColumn: "2 / -1",
    justifyContent: "space-between",
  },
}));

export const SummaryCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.default,
}));

export const SummaryRow = styled("div", {
  shouldForwardProp: (prop) => prop !== "emphasis",
})<{ emphasis?: boolean }>(({ theme, emphasis }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: theme.spacing(2),
  ...(emphasis
    ? {
        borderTop: `1px solid ${theme.palette.divider}`,
        paddingTop: theme.spacing(1),
        marginTop: theme.spacing(0.25),
      }
    : {}),
}));

export const FooterArea = styled("footer")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2, 3),
  paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(1.5, 2),
    paddingBottom: `calc(${theme.spacing(1.5)} + env(safe-area-inset-bottom))`,
  },
}));

export const FooterHint = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  minWidth: 0,
  color: theme.palette.text.secondary,
}));

export const FooterButtons = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column-reverse",
    "& > *": { width: "100%" },
  },
}));
