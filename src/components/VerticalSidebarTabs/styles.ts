import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const TabsList = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: "200px",
  justifyContent: "flex-start",
}));

export const TabButton = styled("button")<{ selected: boolean }>(({ theme, selected }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "100%",
  minHeight: "36px",
  maxHeight: "36px",
  padding: "16px 8px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  color: (selected) ? colors.sidebar.textSelected : colors.text.primary,
  backgroundColor: (selected) ? colors.sidebar.itemSelected : "transparent",
  transition: "background-color 0.2s ease, color 0.2s ease, font-weight 0.2s ease",
  textAlign: "left",
  "&:hover": {
    backgroundColor: selected ? colors.sidebar.itemSelected : colors.chip.background,
  }
}));
