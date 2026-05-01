import { styled } from "@mui/material/styles";
import { Box, Chip } from "@mui/material";
import { theme } from "@/styles/theme";

export const ChipGroupContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  alignItems: "center",
});

export const StyledChip = styled(Chip)({
  backgroundColor: theme.palette.app.chip.background,
  color: theme.palette.app.chip.text,
  borderRadius: 6,
  fontWeight: 400,
  fontSize: 13,
  height: 28,
  border: `1px solid ${theme.palette.app.chip.border}`,
  "& .MuiChip-label": {
    padding: "0 10px",
  },
});

export const MoreChip = styled(Chip)({
  backgroundColor: theme.palette.app.chip.background,
  color: theme.palette.app.chip.text,
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  height: 28,
  border: `1px solid ${theme.palette.app.chip.border}`,
  "& .MuiChip-label": {
    padding: "0 8px",
  },
});
