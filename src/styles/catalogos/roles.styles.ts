import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const FormCard = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "16px"
});
