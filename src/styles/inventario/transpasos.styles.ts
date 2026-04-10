import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import { colors } from "@/styles/theme";

export const QuantityControls = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  overflow: "hidden",
  backgroundColor: colors.background.sidebar,
  maxWidth: 140,
}));

export const QuantityButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 0,
  padding: theme.spacing(1),
  minWidth: 36,
  height: 36,
  "&:hover": {
    backgroundColor: colors.chip.background,
  },
}));

export const QuantityValue = styled("div")(({ theme }) => ({
  minWidth: 40,
  textAlign: "center",
  fontSize: "0.875rem",
  fontWeight: 500,
}));
