import { styled } from "@mui/material/styles";

export const CheckboxCellButton = styled("button")<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    minWidth: 0,
    minHeight: 36,
    padding: "6px 8px",
    borderRadius: 8,
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.app.border
      }`,
    backgroundColor: selected
      ? theme.palette.background.lowBlue
      : theme.palette.background.paper,
    color: selected
      ? theme.palette.primary.main
      : theme.palette.text.primary,
    fontWeight: selected ? 600 : 400,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    "&:hover": {
      backgroundColor: selected
        ? theme.palette.background.lowBlue
        : theme.palette.action.hover,
    },
  }),
);
