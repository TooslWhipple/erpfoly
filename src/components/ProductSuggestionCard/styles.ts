import { styled } from "@mui/material/styles";

export const SuggestionCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: "16px 8px",
    borderRadius: "12px",
    border: `1px solid ${theme.palette.app.border}`,
    backgroundColor: theme.palette.background.paper,
    flex: "1 1 272px",
    gap: "16px",
    minWidth: "272px",
    maxWidth: "272px"
}));

export const ProductImage = styled('img')(({ theme }) => ({
    width: "40px",
    height: "40px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.app.border}`,
    flexShrink: 0,
}));

export const ImagePlaceholder = styled('div')(({ theme }) => ({
    width: "40px",
    height: "40px",
    borderRadius: "4px",
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.app.border}`,
    flexShrink: 0,
}));
